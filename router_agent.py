"""
Router Agent that orchestrates the TypeScript API pipeline.

User -> Router Agent -> Next.js APIs:
  /api/review -> /api/structures -> /api/dock -> /api/report -> /api/paper

The user's message text is treated as the cancerType.
Final response sent back to user is the generated paper markdown.
"""

import asyncio
import json
import os
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, List, Optional
from uuid import uuid4

import requests
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    ResourceContent,
    TextContent,
    chat_protocol_spec,
)

router = Agent(
    name="router",
    seed="router-agent-drug-discovery",
    port=8005,
    mailbox=True,
)

chat_proto = Protocol(spec=chat_protocol_spec)

API_BASE = os.getenv("TS_API_BASE", "http://localhost:3000").rstrip("/")
MAX_CHAT_CHARS = int(os.getenv("MAX_CHAT_CHARS", "3500"))
SEND_RETRIES = int(os.getenv("SEND_RETRIES", "3"))
SEND_RETRY_DELAY_SECONDS = float(os.getenv("SEND_RETRY_DELAY_SECONDS", "1.0"))
SEND_PACING_SECONDS = float(os.getenv("SEND_PACING_SECONDS", "0.5"))
LAST_PAPER_BY_SENDER: Dict[str, str] = {}


def create_text_chat(text: str) -> ChatMessage:
    """Build a ChatMessage containing a single text payload."""
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=[TextContent(text=text, type="text")],
    )


async def send_text_with_retry(ctx: Context, recipient: str, text: str) -> None:
    """Send chat text with retries and slight pacing for mailbox reliability."""
    last_exc: Optional[Exception] = None
    for attempt in range(1, SEND_RETRIES + 1):
        try:
            await ctx.send(recipient, create_text_chat(text))
            # Gentle pacing helps avoid mailbox/UI drops under bursty sends.
            await asyncio.sleep(SEND_PACING_SECONDS)
            return
        except Exception as exc:  # pragma: no cover - defensive runtime path
            last_exc = exc
            ctx.logger.warning(
                f"Send attempt {attempt}/{SEND_RETRIES} failed: {exc}"
            )
            if attempt < SEND_RETRIES:
                await asyncio.sleep(SEND_RETRY_DELAY_SECONDS * attempt)
    raise RuntimeError(f"Failed to send message after retries: {last_exc}")


def extract_text(msg: ChatMessage) -> str:
    """Extract first text segment from a ChatMessage (if present)."""
    for item in msg.content:
        if isinstance(item, TextContent):
            return item.text
    return ""


def post_json(path: str, payload: Dict[str, Any], timeout_seconds: int) -> Dict[str, Any]:
    """POST JSON and return parsed JSON body."""
    response = requests.post(
        f"{API_BASE}{path}",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=(20, timeout_seconds),
    )
    response.raise_for_status()
    return response.json()


def collect_sse_events(
    path: str, payload: Dict[str, Any], timeout_seconds: int
) -> List[Dict[str, Any]]:
    """Read server-sent events and return parsed JSON `data:` payloads."""
    events: List[Dict[str, Any]] = []
    data_lines: List[str] = []

    with requests.post(
        f"{API_BASE}{path}",
        json=payload,
        headers={"Content-Type": "application/json"},
        stream=True,
        timeout=(20, timeout_seconds),
    ) as response:
        response.raise_for_status()
        for raw_line in response.iter_lines(decode_unicode=True):
            line = raw_line or ""
            if line.startswith("data:"):
                data_lines.append(line[len("data:") :].lstrip())
                continue

            if line == "" and data_lines:
                raw_json = "\n".join(data_lines)
                data_lines = []
                try:
                    events.append(json.loads(raw_json))
                except json.JSONDecodeError:
                    continue

    if data_lines:
        raw_json = "\n".join(data_lines)
        try:
            events.append(json.loads(raw_json))
        except json.JSONDecodeError:
            pass

    return events


def split_text_for_chat(text: str, max_chars: int) -> List[str]:
    """Split long text into chat-safe chunks while preferring newline boundaries."""
    if len(text) <= max_chars:
        return [text]

    chunks: List[str] = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + max_chars, n)
        if end < n:
            split_at = text.rfind("\n", start, end)
            if split_at > start + int(max_chars * 0.6):
                end = split_at + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end

    return chunks


async def send_long_text(ctx: Context, recipient: str, text: str) -> None:
    """Send full paper in a single chat message."""
    ctx.logger.info(
        "Sending final paper to user "
        f"(chars={len(text)}, mode=single_message)"
    )

    await send_text_with_retry(ctx, recipient, text)
    await send_text_with_retry(ctx, recipient, "Done: paper delivery complete.")
    ctx.logger.info("Sent full paper and delivery completion marker")


async def run_pipeline(ctx: Context, cancer_type: str) -> Dict[str, Any]:
    """
    Run full TS API pipeline and return generated paper and intermediate artifacts.
    """
    return await run_pipeline_with_updates(ctx, cancer_type, None)


async def run_pipeline_with_updates(
    ctx: Context,
    cancer_type: str,
    progress_cb: Optional[Callable[[str], Awaitable[None]]],
) -> Dict[str, Any]:
    """Run pipeline, optionally emitting user-facing progress updates."""
    async def emit(message: str) -> None:
        if progress_cb is not None:
            await progress_cb(message)

    ctx.logger.info(f"Pipeline start for cancerType='{cancer_type}'")

    # 1) Literature review (SSE)
    ctx.logger.info("Stage 1/5 START: /api/review")
    await emit("Stage 1/5: Starting literature review...")
    review_events = await asyncio.to_thread(
        collect_sse_events,
        "/api/review",
        {"cancerType": cancer_type},
        300,
    )
    proteins: List[str] = []
    drugs: List[Dict[str, Any]] = []
    review_md = ""
    for event in review_events:
        event_type = event.get("type")
        if event_type == "error":
            raise RuntimeError(f"Review API error: {event.get('message', 'unknown error')}")
        if event_type == "proteins":
            proteins = event.get("proteins") or proteins
        elif event_type == "drugs":
            drugs = event.get("drugs") or drugs
        elif event_type in {"review", "complete"} and event.get("reviewMd"):
            review_md = event["reviewMd"]

    if not proteins:
        raise RuntimeError("Review API returned no proteins")
    if not drugs:
        raise RuntimeError("Review API returned no drugs")
    if not review_md:
        raise RuntimeError("Review API returned empty reviewMd")
    ctx.logger.info(
        "Stage 1/5 DONE: /api/review "
        f"(events={len(review_events)}, proteins={len(proteins)}, drugs={len(drugs)}, "
        f"review_chars={len(review_md)})"
    )
    await emit(
        f"Stage 1/5 complete: {len(proteins)} proteins and {len(drugs)} drugs identified."
    )

    # 2) Structures (SSE)
    ctx.logger.info("Stage 2/5 START: /api/structures")
    await emit("Stage 2/5: Fetching protein structures and ligand SMILES...")
    structures_events = await asyncio.to_thread(
        collect_sse_events,
        "/api/structures",
        {"proteins": proteins, "drugs": drugs},
        240,
    )
    targets: List[Dict[str, Any]] = []
    for event in structures_events:
        event_type = event.get("type")
        if event_type == "error":
            raise RuntimeError(
                f"Structures API error: {event.get('message', 'unknown error')}"
            )
        if event_type == "complete":
            targets = event.get("targets") or targets
        elif event_type == "target":
            target = event.get("target")
            if target:
                targets.append(target)

    if not targets:
        raise RuntimeError("Structures API returned no targets")
    ctx.logger.info(
        "Stage 2/5 DONE: /api/structures "
        f"(events={len(structures_events)}, targets={len(targets)})"
    )
    await emit(f"Stage 2/5 complete: {len(targets)} docking targets prepared.")

    # 3) Docking (SSE)
    ctx.logger.info("Stage 3/5 START: /api/dock")
    await emit("Stage 3/5: Running docking jobs...")
    dock_events = await asyncio.to_thread(
        collect_sse_events,
        "/api/dock",
        {"targets": targets, "round": 1},
        1200,
    )
    all_results: List[Dict[str, Any]] = []
    for event in dock_events:
        event_type = event.get("type")
        if event_type == "complete":
            all_results = event.get("allResults") or all_results

    if not all_results:
        raise RuntimeError("Dock API returned no docking results")
    ctx.logger.info(
        "Stage 3/5 DONE: /api/dock "
        f"(events={len(dock_events)}, docking_results={len(all_results)})"
    )
    await emit(f"Stage 3/5 complete: {len(all_results)} docking results generated.")

    # 4) Report (JSON)
    ctx.logger.info("Stage 4/5 START: /api/report")
    await emit("Stage 4/5: Generating results report...")
    report_data = await asyncio.to_thread(
        post_json,
        "/api/report",
        {"cancerType": cancer_type, "allResults": all_results, "targets": targets},
        240,
    )
    results_md = report_data.get("resultsMd", "")
    if not results_md:
        raise RuntimeError("Report API returned empty resultsMd")
    ctx.logger.info(
        "Stage 4/5 DONE: /api/report "
        f"(results_chars={len(results_md)})"
    )
    await emit("Stage 4/5 complete: results report assembled.")

    # 5) Paper (JSON)
    ctx.logger.info("Stage 5/5 START: /api/paper")
    await emit("Stage 5/5: Assembling final paper...")
    paper_data = await asyncio.to_thread(
        post_json,
        "/api/paper",
        {"reviewMd": review_md, "resultsMd": results_md},
        360,
    )
    paper_md = paper_data.get("paperMd", "")
    if not paper_md:
        raise RuntimeError("Paper API returned empty paperMd")
    ctx.logger.info(
        "Stage 5/5 DONE: /api/paper "
        f"(paper_chars={len(paper_md)})"
    )
    await emit("Stage 5/5 complete: final paper ready for delivery.")

    return {
        "paperMd": paper_md,
        "reviewMd": review_md,
        "resultsMd": results_md,
        "proteins": proteins,
        "targets_count": len(targets),
        "results_count": len(all_results),
    }


@router.on_event("startup")
async def startup(ctx: Context):
    """Log startup metadata and initialize counters."""
    ctx.logger.info("Starting Router Agent")
    ctx.logger.info(f"Router address: {router.address}")
    ctx.logger.info(f"TS API base: {API_BASE}")
    ctx.logger.info("Expected pipeline: /api/review -> /api/structures -> /api/dock -> /api/report -> /api/paper")

    ctx.storage.set("total_requests", 0)
    ctx.storage.set("completed_requests", 0)
    ctx.storage.set("failed_requests", 0)


@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    User message handler for ASI/Agentverse chat.
    Message text is interpreted as cancerType.
    """
    try:
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

        cancer_type = extract_text(msg).strip()
        normalized = cancer_type.lower()
        if normalized in {"paper", "/paper", "resend paper", "show paper"}:
            cached_paper = LAST_PAPER_BY_SENDER.get(sender, "")
            if not cached_paper:
                await send_text_with_retry(
                    ctx,
                    sender,
                    "No cached paper found yet for this chat. Run a cancer-type query first.",
                )
                return

            await send_text_with_retry(
                ctx,
                sender,
                "Re-sending your latest generated paper from cache...",
            )
            await send_long_text(ctx, sender, cached_paper)
            return

        if not cancer_type:
            await send_text_with_retry(
                ctx,
                sender,
                "Please send a cancer type as plain text (example: 'triple negative breast cancer').",
            )
            return

        total = ctx.storage.get("total_requests") or 0
        ctx.storage.set("total_requests", total + 1)
        ctx.logger.info(f"New request from {sender[:12]}... cancerType='{cancer_type}'")

        await send_text_with_retry(
            ctx,
            sender,
            (
                f"Starting pipeline for cancer type: {cancer_type}\n"
                "Running review, structures, docking, report, and paper assembly..."
            ),
        )

        async def send_progress_update(update: str) -> None:
            try:
                await send_text_with_retry(ctx, sender, update)
            except Exception as send_err:
                ctx.logger.warning(f"Failed to send progress update: {send_err}")

        result = await run_pipeline_with_updates(ctx, cancer_type, send_progress_update)

        completed = ctx.storage.get("completed_requests") or 0
        ctx.storage.set("completed_requests", completed + 1)

        final_paper = result["paperMd"]
        LAST_PAPER_BY_SENDER[sender] = final_paper
        ctx.logger.info("----- FINAL PAPER START -----")
        ctx.logger.info(final_paper)
        ctx.logger.info("----- FINAL PAPER END -----")
        await send_long_text(ctx, sender, final_paper)
        ctx.logger.info(
            "Completed pipeline: "
            f"proteins={len(result['proteins'])}, "
            f"targets={result['targets_count']}, "
            f"docking_results={result['results_count']}"
        )
    except Exception as exc:
        failed = ctx.storage.get("failed_requests") or 0
        ctx.storage.set("failed_requests", failed + 1)
        ctx.logger.error(f"Router error: {exc}")
        await send_text_with_retry(
            ctx,
            sender,
            (
                "Pipeline failed while calling TS APIs.\n"
                f"Error: {exc}\n"
                f"TS_API_BASE={API_BASE}"
            ),
        )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Optional debug hook for delivery acknowledgements."""
    ctx.logger.debug(f"Message acknowledged by {sender}")


router.include(chat_proto, publish_manifest=True)


if __name__ == "__main__":
    print("Starting Router Agent")
    print(f"Router address: {router.address}")
    print(f"TS API base: {API_BASE}")
    print("Pipeline: /api/review -> /api/structures -> /api/dock -> /api/report -> /api/paper")
    print("Router is running on port 8005 and published to ASI mailbox.")
    router.run()