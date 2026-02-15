import { NextResponse } from "next/server"
import { queryPerplexity } from "@/lib/perplexity"

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { reviewMd, resultsMd } = (await req.json()) as {
      reviewMd: string
      resultsMd: string
    }

    if (!reviewMd || !resultsMd) {
      return NextResponse.json(
        { error: "reviewMd and resultsMd are required" },
        { status: 400 }
      )
    }

    // Generate abstract
    const abstract = await queryPerplexity(
      "You are a scientific writer. Write a concise abstract (200-300 words, single paragraph) for an academic paper.",
      `Write an abstract combining these two sections:\n\n` +
        `LITERATURE REVIEW:\n${reviewMd.slice(0, 3000)}\n\n` +
        `RESULTS:\n${resultsMd.slice(0, 3000)}\n\n` +
        `Cover: clinical problem, computational approach, key targets, top candidates, conclusions.`
    )

    // Merge introduction
    const introduction = await queryPerplexity(
      "You are a scientific writer. Polish and merge these sections into a cohesive introduction. Preserve all citations.",
      `Merge into a unified Introduction & Background section:\n\n${reviewMd.slice(0, 5000)}`
    )

    // Merge results
    const mergedResults = await queryPerplexity(
      "You are a scientific writer. Polish this results section. Keep ALL tables and numerical data. Preserve citations.",
      `Polish this results section:\n\n${resultsMd}`
    )

    // Generate conclusion
    const conclusion = await queryPerplexity(
      "You are a scientific writer. Write a unified conclusion combining findings from both the literature review and computational results.",
      `Write a conclusion for this paper:\n\nREVIEW:\n${reviewMd.slice(0, 2000)}\n\nRESULTS:\n${resultsMd.slice(0, 2000)}`
    )

    // Assemble final paper
    const paperMd =
      `# Drug Repurposing Analysis\n\n` +
      `## Abstract\n\n${abstract}\n\n` +
      `---\n\n` +
      `## 1. Introduction and Background\n\n${introduction}\n\n` +
      `---\n\n` +
      `## 2. Results\n\n${mergedResults}\n\n` +
      `---\n\n` +
      `## 3. Conclusion\n\n${conclusion}\n`

    return NextResponse.json({ paperMd })
  } catch (error) {
    console.error("Paper API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
