import { queryPerplexity, parseJsonResponse } from "@/lib/perplexity"
import type { ReviewDrug } from "@/lib/types"

export const maxDuration = 300 // 5 min — lit review makes several Perplexity calls

// ---------- arXiv helpers ----------

interface ArxivPaper {
  title: string
  summary: string
  authors: string[]
  published: string
  arxivId: string
  link: string
}

async function searchArxiv(
  query: string,
  maxResults: number = 15
): Promise<ArxivPaper[]> {
  const params = new URLSearchParams({
    search_query: query,
    start: "0",
    max_results: String(maxResults),
    sortBy: "relevance",
    sortOrder: "descending",
  })

  const res = await fetch(
    `http://export.arxiv.org/api/query?${params.toString()}`,
    { signal: AbortSignal.timeout(30000) }
  )
  if (!res.ok) return []

  const xml = await res.text()
  return parseArxivXml(xml)
}

function parseArxivXml(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]
    const title = extractTag(entry, "title").replace(/\n/g, " ").trim()
    const summary = extractTag(entry, "summary").replace(/\n/g, " ").trim()
    const published = extractTag(entry, "published").slice(0, 10)
    const id = extractTag(entry, "id")
    const arxivId = id.split("/abs/").pop() || id

    const authors: string[] = []
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g
    let authorMatch
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1])
    }

    papers.push({ title, summary, authors, published, arxivId, link: id })
  }
  return papers
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"))
  return match ? match[1].trim() : ""
}

function formatPapersForPrompt(papers: ArxivPaper[]): string {
  return papers
    .map((p, i) => {
      const authors =
        p.authors.slice(0, 3).join(", ") +
        (p.authors.length > 3 ? " et al." : "")
      return (
        `[${i + 1}] ${p.title}\n` +
        `    Authors: ${authors}\n` +
        `    Published: ${p.published}\n` +
        `    arXiv ID: ${p.arxivId}\n` +
        `    Abstract: ${p.summary.slice(0, 500)}...\n`
      )
    })
    .join("\n")
}

// ---------- Query builders ----------

function buildCancerQuery(cancerType: string): string {
  return `all:("${cancerType}" AND (treatment OR therapy OR target OR protein OR pathway OR molecular OR biomarker))`
}

function buildDrugQuery(cancerType: string, proteins: string[]): string {
  const proteinClause = proteins
    .slice(0, 6)
    .map((p) => `"${p}"`)
    .join(" OR ")
  return `all:("${cancerType}" AND (FDA OR "approved drug" OR inhibitor OR therapeutic) AND (${proteinClause}))`
}

function buildRepurposingQuery(proteins: string[]): string {
  const proteinClause = proteins
    .slice(0, 6)
    .map((p) => `"${p}"`)
    .join(" OR ")
  return `all:((${proteinClause}) AND ("drug repurposing" OR "drug repositioning" OR "molecular docking" OR "virtual screening" OR "off-target" OR "binding affinity" OR "structure-activity" OR "polypharmacology"))`
}

// ---------- Protein extraction ----------

async function extractProteinsFromText(text: string): Promise<string[]> {
  const system =
    "You are a biomedical research assistant. " +
    "Extract a concise list of protein targets from the following text. " +
    "Return ONLY a JSON array of short protein names/symbols, " +
    'e.g. ["EGFR", "HER2", "BRAF"]. No explanation.'
  const raw = await queryPerplexity(system, text)

  const match = raw.match(/\[[\s\S]*?\]/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      // fallback
    }
  }
  return raw
    .split(",")
    .map((t) => t.trim().replace(/['"[\]]/g, ""))
    .filter(Boolean)
}

// ---------- Repurposing candidates ----------

async function discoverRepurposingCandidates(
  cancerType: string,
  proteins: string[]
): Promise<string> {
  const system =
    "You are a computational pharmacology expert specialising in drug " +
    "repurposing and polypharmacology. You have access to web search. " +
    "Write a detailed Markdown section for a literature review. " +
    "Be exhaustive: include drugs from cardiology, psychiatry, " +
    "infectious disease, metabolic disorders, autoimmune conditions, " +
    "and any other field. Cite sources where possible."
  const user =
    `The following proteins have been identified as therapeutic targets ` +
    `in **${cancerType}**: ${proteins.join(", ")}.\n\n` +
    `Search broadly across ALL FDA-approved drugs — not just oncology ` +
    `drugs — and identify any that have known or computationally ` +
    `predicted interactions with these proteins. Consider:\n` +
    `- Molecular docking studies showing binding affinity\n` +
    `- Shared binding-site homology with known inhibitors\n` +
    `- Off-target activity reported in pharmacovigilance data\n` +
    `- Structural similarity (Tanimoto ≥ 0.5) to known ligands\n` +
    `- Drug-gene interaction databases (DGIdb, DrugBank, STITCH)\n` +
    `- Repurposing screens or virtual screening hits\n\n` +
    `Write sections in Markdown with at least 10 drugs.`
  return queryPerplexity(system, user)
}

// ---------- Drug-protein map extraction ----------

async function extractDrugProteinMap(
  drugReviewText: string,
  cancerType: string,
  proteins: string[]
): Promise<{ drugs: ReviewDrug[]; cancer_type: string; protein_targets: string[] }> {
  const system =
    "You are a biomedical data-extraction assistant. " +
    'Return ONLY valid JSON with no extra text, no markdown fences. ' +
    'The JSON must be an object with a top-level key "drugs" whose value ' +
    "is an array of objects. Each object has: " +
    '"drug" (string), "proteins" (list of target protein symbols), ' +
    '"mechanism" (string), "fda_status" (string), ' +
    '"category" ("mainstream" or "repurposing_candidate").'
  const user =
    `From the following literature review sections about ${cancerType}, ` +
    `extract EVERY drug mentioned — both mainstream oncology drugs AND ` +
    `repurposing candidates — and which of these proteins each may ` +
    `bind to or react with: ${proteins.join(", ")}.\n\n` +
    `Mark drugs that are commonly used for this cancer as ` +
    `"mainstream". Mark drugs from other therapeutic areas or ` +
    `speculative candidates as "repurposing_candidate".\n\n` +
    `Text:\n${drugReviewText}`
  const raw = await queryPerplexity(system, user)
  let data = parseJsonResponse(raw) as Record<string, unknown>

  if ("_parse_error" in data) {
    const fixSystem =
      "You are a JSON repair assistant. The user will give you malformed " +
      "JSON. Return ONLY the corrected, valid JSON. No explanation."
    const fixedRaw = await queryPerplexity(fixSystem, raw)
    data = parseJsonResponse(fixedRaw) as Record<string, unknown>
  }

  if (!("drugs" in data)) {
    data = { drugs: Array.isArray(data) ? data : [] }
  }

  const rawDrugs = (data.drugs as Record<string, unknown>[]) || []
  const drugs: ReviewDrug[] = rawDrugs.map((d) => ({
    drug: (d.drug as string) || "",
    proteins: (d.proteins as string[]) || [],
    mechanism: (d.mechanism as string) || "",
    fdaStatus: (d.fdaStatus as string) || (d.fda_status as string) || "",
    category: (d.category as string) || "",
  }))

  return {
    drugs,
    cancer_type: cancerType,
    protein_targets: proteins,
  }
}

// ---------- Route handler (SSE streaming) ----------

export async function POST(req: Request) {
  try {
    const { cancerType } = await req.json()
    if (!cancerType) {
      return new Response(
        JSON.stringify({ error: "cancerType is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: object) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        }

        try {
          // Step 1: Search arXiv
          send({ type: "progress", message: "Searching arXiv for relevant papers..." })
          const cancerPapers = await searchArxiv(buildCancerQuery(cancerType))
          const cancerPapersText = formatPapersForPrompt(cancerPapers)
          send({ type: "progress", message: `Found ${cancerPapers.length} papers on arXiv` })

          // Step 2: Generate literature review via Perplexity
          send({ type: "progress", message: "Generating literature review with Perplexity..." })
          const systemReview =
            "You are an expert oncology researcher. Write a detailed, scholarly " +
            "literature review in Markdown format. Use inline citations like " +
            "[1], [2], etc., referencing the papers provided."
          const userReview =
            `Using the following arXiv papers, write a comprehensive literature ` +
            `review about **${cancerType}**.\n\n` +
            `Include:\n` +
            `1. Introduction (epidemiology, significance)\n` +
            `2. Molecular and genetic landscape\n` +
            `3. **Key protein targets** for treatment\n` +
            `4. Current therapeutic strategies\n` +
            `5. References\n\n` +
            `Papers:\n${cancerPapersText}`
          const firstReview = await queryPerplexity(systemReview, userReview)

          // Step 3: Extract protein targets
          send({ type: "progress", message: "Extracting protein targets..." })
          let proteins = await extractProteinsFromText(firstReview)
          if (proteins.length === 0) {
            proteins = ["EGFR", "p53", "KRAS"]
          }

          // Emit proteins immediately so frontend can populate
          send({ type: "proteins", proteins })

          // Step 4: Search arXiv for drug papers
          send({ type: "progress", message: "Searching for drug interaction papers..." })
          const drugPapers = await searchArxiv(
            buildDrugQuery(cancerType, proteins)
          )
          const repurposePapers = await searchArxiv(
            buildRepurposingQuery(proteins)
          )

          // Dedup
          const seenIds = new Set(drugPapers.map((p) => p.arxivId))
          for (const rp of repurposePapers) {
            if (!seenIds.has(rp.arxivId)) {
              drugPapers.push(rp)
              seenIds.add(rp.arxivId)
            }
          }

          send({ type: "progress", message: `Found ${drugPapers.length} drug-related papers` })

          const drugPapersText = drugPapers.length
            ? formatPapersForPrompt(drugPapers)
            : "(No papers found.)"

          // Step 5: Generate drug analysis
          send({ type: "progress", message: "Analyzing FDA-approved drugs and candidates..." })
          const systemDrugs =
            "You are an expert pharmacology researcher. Write a detailed Markdown " +
            "section about FDA-approved drugs and repurposing candidates. " +
            "Be precise about drug names, mechanisms, and protein interactions."
          const userDrugs =
            `Continue the review on **${cancerType}**.\n\n` +
            `Protein targets: ${proteins.join(", ")}.\n\n` +
            `Write sections on:\n` +
            `1. FDA-Approved Drugs and Candidate Compounds per target\n` +
            `2. Drug-Protein Interaction Summary Table\n` +
            `3. Conclusion and Future Directions\n\n` +
            `Papers:\n${drugPapersText}`
          const drugReview = await queryPerplexity(systemDrugs, userDrugs)

          // Step 6: Repurposing candidates
          send({ type: "progress", message: "Discovering repurposing candidates across therapeutic areas..." })
          const repurposingReview = await discoverRepurposingCandidates(
            cancerType,
            proteins
          )

          // Step 7: Assemble review markdown
          const reviewMd =
            `# Literature Review: ${cancerType}\n\n` +
            `---\n\n${firstReview}\n\n---\n\n${drugReview}\n\n---\n\n${repurposingReview}\n\n`

          // Emit review text
          send({
            type: "review",
            reviewMd,
            papersAnalyzed: cancerPapers.length + drugPapers.length,
          })

          // Step 8: Extract drug-protein map
          send({ type: "progress", message: "Extracting drug-protein interaction map..." })
          const combined = drugReview + "\n\n" + repurposingReview
          const drugMap = await extractDrugProteinMap(combined, cancerType, proteins)

          // Emit drugs
          send({ type: "drugs", drugs: drugMap.drugs })

          // Final complete event
          send({
            type: "complete",
            proteins,
            drugs: drugMap.drugs,
            reviewMd,
            papersAnalyzed: cancerPapers.length + drugPapers.length,
          })
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          })
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
