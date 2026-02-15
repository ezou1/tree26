import { NextResponse } from "next/server"
import { queryPerplexity } from "@/lib/perplexity"
import type { DockingResult, DockingTarget } from "@/lib/types"

export const maxDuration = 180

function classifyCompound(
  fdaStatus: string,
  cancerType: string
): "cancer_purposed" | "repurposing" | "novel" {
  const s = fdaStatus.toLowerCase()
  const cancer = cancerType.toLowerCase()
  if (s.includes("approved") && s.includes(cancer.split(/\s+/)[0])) {
    return "cancer_purposed"
  }
  if (s.includes("approved") || s.includes("fda")) {
    return "repurposing"
  }
  return "novel"
}

export async function POST(req: Request) {
  try {
    const { cancerType, allResults, targets } = (await req.json()) as {
      cancerType: string
      allResults: DockingResult[]
      targets: DockingTarget[]
    }

    if (!cancerType || !allResults?.length) {
      return NextResponse.json(
        { error: "cancerType and allResults are required" },
        { status: 400 }
      )
    }

    // Build overview per target
    const resultsByProtein: Record<string, DockingResult[]> = {}
    for (const r of allResults) {
      const prot = r.proteinTarget || "unknown"
      if (!resultsByProtein[prot]) resultsByProtein[prot] = []
      resultsByProtein[prot].push(r)
    }

    // Sort each target's results
    for (const prot of Object.keys(resultsByProtein)) {
      resultsByProtein[prot].sort(
        (a, b) => b.confidenceScore - a.confidenceScore
      )
    }

    // Classify compounds
    const classified: Record<string, DockingResult[]> = {
      cancer_purposed: [],
      repurposing: [],
      novel: [],
    }
    for (const r of allResults) {
      const cat = classifyCompound(r.fdaStatus, cancerType)
      classified[cat].push(r)
    }

    // Build overview text
    let overviewText = `## Docking Overview\n\n`
    overviewText += `- Cancer type: ${cancerType}\n`
    overviewText += `- Total compounds docked: ${allResults.length}\n`
    overviewText += `- Protein targets: ${targets.map((t) => t.protein).join(", ")}\n\n`

    for (const target of targets) {
      const results = resultsByProtein[target.protein] || []
      overviewText += `### ${target.protein} (PDB: ${target.pdbId || "N/A"})\n\n`
      overviewText += `| Rank | Drug | Score | FDA Status | Mechanism |\n`
      overviewText += `|------|------|-------|------------|------------|\n`
      for (const [i, r] of results.slice(0, 15).entries()) {
        overviewText += `| ${i + 1} | ${r.name} | ${r.confidenceScore.toFixed(4)} | ${r.fdaStatus} | ${r.mechanism.slice(0, 60)} |\n`
      }
      overviewText += "\n"
    }

    const classifiedText =
      `Cancer-purposed drugs: ${classified.cancer_purposed.length}\n` +
      `Repurposing candidates: ${classified.repurposing.length}\n` +
      `Novel/research compounds: ${classified.novel.length}`

    // Generate methodology via Perplexity
    const methodologyPrompt =
      `Write a detailed methodology section for a drug repurposing paper about ${cancerType}. ` +
      `The study used:\n` +
      `- DiffDock (diffusion-based molecular docking model) on RunPod serverless GPU\n` +
      `- 10 poses per ligand-protein pair\n` +
      `- Protein structures from RCSB PDB\n` +
      `- Ligands from PubChem + curated databases\n` +
      `- Perplexity AI for literature analysis and reasoning\n\n` +
      `Overview:\n${overviewText}`
    const methodology = await queryPerplexity(
      "You are a scientific writer. Write a detailed methodology section in Markdown.",
      methodologyPrompt
    )

    // Generate results via Perplexity
    const resultsPrompt =
      `Write a detailed results section for a drug repurposing paper about ${cancerType}.\n\n` +
      `Docking results:\n${overviewText}\n\n` +
      `Classification:\n${classifiedText}\n\n` +
      `Focus on:\n` +
      `1. Overview of docking runs\n` +
      `2. Drug repurposing leaderboard (ALL FDA drugs not approved for this cancer)\n` +
      `3. Novel/research compounds\n` +
      `4. Cross-target comparison\n` +
      `5. Score distribution analysis`
    const results = await queryPerplexity(
      "You are a scientific writer. Write a detailed results section in Markdown with tables.",
      resultsPrompt
    )

    // Generate conclusion via Perplexity
    const conclusionPrompt =
      `Write a conclusion for a drug repurposing paper about ${cancerType}.\n\n` +
      `Results:\n${overviewText}\n\n` +
      `Classification:\n${classifiedText}\n\n` +
      `Cover: key findings, top repurposing candidates, clinical implications, limitations, future directions.`
    const conclusion = await queryPerplexity(
      "You are a scientific writer. Write a conclusion section in Markdown.",
      conclusionPrompt
    )

    const resultsMd =
      `# Results: Drug Repurposing Analysis for ${cancerType}\n\n` +
      `## Methodology\n\n${methodology}\n\n` +
      `## Results\n\n${results}\n\n` +
      `## Conclusion\n\n${conclusion}\n`

    return NextResponse.json({ resultsMd })
  } catch (error) {
    console.error("Report API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
