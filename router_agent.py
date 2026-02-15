"""
Simple Router Agent for a 3-agent pipeline.

This agent:
- Receives requests from users via ASI One
- Calls agent 1, 2, and 3 in sequence
- Calls agent1, which is a Perplexity agent that does a literature review, and identifies protein targets
- Calls agent2, which is a RCSB PDB and PubChem agent that identifies drugs that target the protein targets
- Calls agent3, which is a DiffDock agent that does a docking study to identify the best drug for the protein target
- Receives responses from agent 3
- Sends final response back to user on ASI One

Simple 3-agent architecture:
    User → Router Agent → Agent1 (Perplexity) → agent2 (RCSB PDB and PubChem) → agent3 (DiffDock) → User
Deterministic routing, no LLM for routing
"""

from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Deque, Dict, Tuple
from uuid import uuid4

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    ResourceContent,
    TextContent,
    chat_protocol_spec,
)

# -----------------------------------------------------------------------------
# Agent + protocol setup
# -----------------------------------------------------------------------------
# Router agent exposed via mailbox so it is visible on ASI One.
router = Agent(
    name="router",
    seed="router-agent-drug-discovery",
    port=8005,
    mailbox=True,
)

# Chat protocol from uagents-core so we can receive/send ASI chat messages.
chat_proto = Protocol(spec=chat_protocol_spec)

# -----------------------------------------------------------------------------
# Sub-agent configuration
# -----------------------------------------------------------------------------
# Update these addresses to your deployed specialized agents.
AGENT1_PERPLEXITY_ADDRESS = "agent1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AGENT2_PUBCHEM_ADDRESS = "agent1qyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
AGENT3_DIFFDOCK_ADDRESS = "agent1qzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"

# IMPORTANT: If you add more sub-agents, update this tuple by appending
# ("agent_name", "agent_address") in execution order.
# Example:
#   ("agent4", AGENT4_ADDRESS),
AGENT_CHAIN: Tuple[Tuple[str, str], ...] = (
    ("agent1", AGENT1_PERPLEXITY_ADDRESS),
    ("agent2", AGENT2_PUBCHEM_ADDRESS),
    ("agent3", AGENT3_DIFFDOCK_ADDRESS),
)
# Fast membership check for "is this sender one of our sub-agents?"
CHAIN_ADDRESSES = {address for _, address in AGENT_CHAIN}

# -----------------------------------------------------------------------------
# In-memory request tracking
# -----------------------------------------------------------------------------
# Request state:
# - pending_requests tracks all active workflows by request_id
# - agent_queues maps each agent address -> ordered request IDs sent to that agent
pending_requests: Dict[str, Dict] = {}
agent_queues: Dict[str, Deque[str]] = defaultdict(deque)


def create_text_chat(text: str) -> ChatMessage:
    """Build a ChatMessage containing a single text payload."""
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=[TextContent(text=text, type="text")],
    )


def extract_text(msg: ChatMessage) -> str:
    """Extract first text segment from a ChatMessage (if present)."""
    for item in msg.content:
        if isinstance(item, TextContent):
            return item.text
    return ""


async def forward_to_current_step(ctx: Context, request_id: str, msg: ChatMessage) -> None:
    """
    Forward the current message to the next agent in the configured chain.
    The same message object is passed step-by-step through the pipeline.
    """
    state = pending_requests.get(request_id)
    if state is None:
        return

    step_index = state["step_index"]
    if step_index >= len(AGENT_CHAIN):
        return

    step_name, step_address = AGENT_CHAIN[step_index]
    # Queue request id per destination agent so responses can be matched in order.
    agent_queues[step_address].append(request_id)
    ctx.logger.info(f"Routing request {request_id[:8]} -> {step_name} ({step_address[:12]}...)")
    await ctx.send(step_address, msg)


@router.on_event("startup")
async def startup(ctx: Context):
    """Log router/chain info and initialize basic counters."""
    ctx.logger.info("Starting Router Agent")
    ctx.logger.info(f"Router address: {router.address}")
    for step_name, address in AGENT_CHAIN:
        ctx.logger.info(f"{step_name} address: {address}")

    ctx.storage.set("total_requests", 0)
    ctx.storage.set("completed_requests", 0)
    ctx.storage.set("failed_requests", 0)


@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Main router entrypoint.
    - If sender is a known sub-agent: treat as pipeline response.
    - Otherwise: treat as a new user request from ASI chat.
    """
    # Case 1: response from one of the specialized agents.
    if sender in CHAIN_ADDRESSES:
        queue = agent_queues.get(sender)
        if not queue:
            ctx.logger.warning(f"Received agent response from {sender[:12]}... with no queued request")
            return

        request_id = queue.popleft()
        state = pending_requests.get(request_id)
        if state is None:
            ctx.logger.warning(f"Received response for unknown request_id={request_id}")
            return

        step_index = state["step_index"]
        if step_index >= len(AGENT_CHAIN):
            ctx.logger.warning(f"Request {request_id[:8]} already completed")
            return

        step_name, _ = AGENT_CHAIN[step_index]
        preview = extract_text(msg)[:120]
        ctx.logger.info(f"Received {step_name} response for request {request_id[:8]}: {preview}")
        state["history"].append({"step": step_name, "preview": preview})
        # Advance state machine to next stage in AGENT_CHAIN.
        state["step_index"] += 1

        # More stages remaining -> forward this response to next agent.
        if state["step_index"] < len(AGENT_CHAIN):
            await forward_to_current_step(ctx, request_id, msg)
            return

        # Final stage done -> return agent3 (or last stage) output to user.
        original_sender = state["original_sender"]
        final_text = extract_text(msg) or "Pipeline finished, but agent3 returned no text output."
        await ctx.send(original_sender, create_text_chat(final_text))

        completed = ctx.storage.get("completed_requests") or 0
        ctx.storage.set("completed_requests", completed + 1)
        del pending_requests[request_id]
        ctx.logger.info(f"Completed request {request_id[:8]}")
        return

    # Case 2: message from end user (ASI chat).
    try:
        # Accept text/image payloads; ignore truly empty messages.
        has_payload = any(
            isinstance(item, (TextContent, ResourceContent)) for item in msg.content
        )
        if not has_payload:
            ctx.logger.warning("Ignoring empty user message")
            return

        await ctx.send(
            sender,
            ChatAcknowledgement(
                timestamp=datetime.now(timezone.utc),
                acknowledged_msg_id=msg.msg_id,
            ),
        )

        request_id = str(uuid4())
        # Each user message starts a new workflow at step 0 (agent1).
        pending_requests[request_id] = {
            "original_sender": sender,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "step_index": 0,
            "history": [],
        }

        total = ctx.storage.get("total_requests") or 0
        ctx.storage.set("total_requests", total + 1)
        ctx.logger.info(f"New request {request_id[:8]} from {sender[:12]}...")

        await forward_to_current_step(ctx, request_id, msg)
    except Exception as exc:
        failed = ctx.storage.get("failed_requests") or 0
        ctx.storage.set("failed_requests", failed + 1)
        ctx.logger.error(f"Router error: {exc}")
        await ctx.send(sender, create_text_chat(f"Router error: {exc}"))


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Optional debug hook for delivery acknowledgements."""
    ctx.logger.debug(f"Message acknowledged by {sender}")


# Publish protocol manifest so this router is discoverable/interoperable on ASI.
router.include(chat_proto, publish_manifest=True)


if __name__ == "__main__":
    # Local run helper logs which addresses are configured.
    print("Starting Router Agent")
    print(f"Router address: {router.address}")
    print("Pipeline order:")
    for idx, (name, address) in enumerate(AGENT_CHAIN, start=1):
        print(f"  {idx}. {name}: {address}")
    print("Make sure all three agent addresses are set before running.")
    print("Router is running on port 8005 and published to ASI mailbox.")
    router.run()