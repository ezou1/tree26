import { NextResponse } from "next/server"
import { queryPerplexity } from "@/lib/perplexity"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { question, context } = (await req.json()) as {
      question: string
      context: {
        cancerType?: string
        proteins?: string[]
        dockingResults?: {
          name: string
          confidence: number
          protein: string
          mechanism: string
        }[]
        reviewSummary?: string
      }
    }

    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      )
    }

    const system =
      "You are a knowledgeable drug discovery research assistant. " +
      "Answer the user's question concisely based on the provided context " +
      "about their drug discovery pipeline results. " +
      "Use specific drug names, protein targets, and scores when relevant. " +
      "Keep responses focused and under 300 words."

    let contextStr = ""
    if (context.cancerType) {
      contextStr += `Disease: ${context.cancerType}\n`
    }
    if (context.proteins?.length) {
      contextStr += `Protein targets: ${context.proteins.join(", ")}\n`
    }
    if (context.dockingResults?.length) {
      contextStr += `\nTop docking results:\n`
      for (const r of context.dockingResults) {
        contextStr += `- ${r.name}: ${Math.round(r.confidence * 100)}% confidence against ${r.protein} (${r.mechanism})\n`
      }
    }
    if (context.reviewSummary) {
      contextStr += `\nLiterature review excerpt:\n${context.reviewSummary}\n`
    }

    const user = contextStr
      ? `Context:\n${contextStr}\n\nQuestion: ${question}`
      : question

    const answer = await queryPerplexity(system, user)

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
