import { NextResponse } from "next/server"
import { queryPerplexity, parseJsonResponse } from "@/lib/perplexity"
import type { DockingResult, ReasoningDecision } from "@/lib/types"

export const maxDuration = 60

const MAX_EXPANSION_ROUNDS = 2

export async function POST(req: Request) {
  try {
    const {
      cancerType,
      dockingResults,
      round,
      hypotheses = [],
      expansionHistory = [],
    } = (await req.json()) as {
      cancerType: string
      dockingResults: DockingResult[]
      round: number
      hypotheses?: string[]
      expansionHistory?: { round: number; action: string; rationale: string }[]
    }

    if (!cancerType || !dockingResults?.length) {
      return NextResponse.json(
        { error: "cancerType and dockingResults are required" },
        { status: 400 }
      )
    }

    // Build top 30 summary
    const topResults = [...dockingResults]
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 30)
      .map((r) => ({
        name: r.name,
        score: Math.round(r.confidenceScore * 10000) / 10000,
        mechanism: (r.mechanism || "").slice(0, 100),
        fda_status: (r.fdaStatus || "").slice(0, 60),
        protein: r.proteinTarget || "",
        source: r.source || "",
        round: r.round || 1,
      }))

    const system =
      "You are a computational pharmacology researcher analyzing molecular " +
      "docking results for drug repurposing. You must return ONLY valid JSON.\n\n" +
      "Analyze the top docking hits and look for patterns:\n" +
      "- Are drugs from the same therapeutic class clustering as top hits?\n" +
      "  (e.g., multiple statins, multiple SSRIs, multiple kinase inhibitors)\n" +
      "- Do top-scoring compounds share structural features?\n" +
      "- Are there unexplored drug classes that might work?\n\n" +
      "Return a JSON object with:\n" +
      '  "action": one of "expand_3d_similar", "expand_class", or "proceed"\n' +
      '  "rationale": your analysis of the patterns (2-3 sentences)\n' +
      '  "hypothesis": a specific scientific hypothesis (1 sentence)\n' +
      '  "seed_cids": [list of CID numbers] (if action is expand_3d_similar)\n' +
      '  "drug_class": "class name" (if action is expand_class)\n' +
      '  "drug_names": ["drug1", "drug2", ...] (if action is expand_class)\n\n' +
      "Rules:\n" +
      `- This is round ${round}. Max rounds: ${MAX_EXPANSION_ROUNDS + 1}.\n` +
      `- If round >= ${MAX_EXPANSION_ROUNDS + 1}, you MUST choose "proceed".\n` +
      '- Only choose "expand" if you see a clear pattern worth investigating.\n' +
      "- If expanding, be specific about which CIDs or drug names to test."

    const user =
      `Cancer type: ${cancerType}\n` +
      `Round: ${round}\n` +
      `Previous hypotheses: ${JSON.stringify(hypotheses)}\n` +
      `Previous expansions: ${JSON.stringify(expansionHistory)}\n\n` +
      `Top 30 docking results (sorted by confidence score):\n` +
      `${JSON.stringify(topResults, null, 2)}\n\n` +
      `Analyze these results and return your decision as JSON.`

    const raw = await queryPerplexity(system, user)
    const parsed = parseJsonResponse(raw) as Record<string, unknown>

    const decision: ReasoningDecision = {
      action: "proceed",
      rationale: (parsed.rationale as string) || "",
      hypothesis: (parsed.hypothesis as string) || "",
    }

    // Validate action
    const action = parsed.action as string
    if (["expand_3d_similar", "expand_class", "proceed"].includes(action)) {
      decision.action = action as ReasoningDecision["action"]
    }

    // Force proceed if max rounds reached
    if (round >= MAX_EXPANSION_ROUNDS + 1) {
      decision.action = "proceed"
      decision.rationale += " (Max rounds reached, proceeding to synthesis.)"
    }

    if (decision.action === "expand_3d_similar") {
      decision.seedCids = (parsed.seed_cids as number[]) || []
    }
    if (decision.action === "expand_class") {
      decision.drugClass = (parsed.drug_class as string) || ""
      decision.drugNames = (parsed.drug_names as string[]) || []
    }

    return NextResponse.json(decision)
  } catch (error) {
    console.error("Analyze API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
