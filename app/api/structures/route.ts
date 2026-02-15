import { searchPdb, pickBestStructure, downloadPdb } from "@/lib/pdb"
import { lookupSmiles } from "@/lib/pubchem"
import type { ReviewDrug, DockingTarget, Ligand } from "@/lib/types"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { proteins, drugs } = (await req.json()) as {
      proteins: string[]
      drugs: ReviewDrug[]
    }

    if (!proteins?.length) {
      return new Response(
        JSON.stringify({ error: "proteins array is required" }),
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

        const targets: DockingTarget[] = []

        try {
          send({
            type: "progress",
            message: `Processing ${proteins.length} protein targets in parallel...`,
          })

          // Process all proteins in parallel
          const proteinPromises = proteins.map(async (protein, pi) => {
            // --- PDB search + SMILES lookups run concurrently ---
            const pdbPromise = (async () => {
              send({
                type: "progress",
                message: `Searching PDB for ${protein}... (${pi + 1}/${proteins.length})`,
              })

              let candidates = await searchPdb(protein)
              if (candidates.length === 0) {
                const gene = protein.split(/\s+/)[0]
                if (gene !== protein) {
                  candidates = await searchPdb(gene)
                }
              }

              let pdbId: string | null = null
              let pdbContentB64: string | null = null

              if (candidates.length > 0) {
                const best = await pickBestStructure(candidates)
                if (best) {
                  pdbId = best.pdbId
                  send({
                    type: "progress",
                    message: `Downloading PDB structure ${best.pdbId} for ${protein}...`,
                  })
                  pdbContentB64 = await downloadPdb(best.pdbId)
                }
              }

              return { pdbId, pdbContentB64 }
            })()

            const smilesPromise = (async () => {
              const ligands: Ligand[] = []
              const proteinLower = protein.toLowerCase()

              const matchedDrugs = drugs.filter((d) =>
                (d.proteins || []).some((p) => {
                  const pl = p.toLowerCase()
                  return pl.includes(proteinLower) || proteinLower.includes(pl)
                })
              )
              const drugsForProtein = matchedDrugs.length > 0 ? matchedDrugs : drugs

              send({
                type: "progress",
                message: `Looking up SMILES for ${drugsForProtein.length} drugs targeting ${protein}...`,
              })

              // Look up all drugs concurrently (PubChem has internal delays)
              const lookupResults = await Promise.allSettled(
                drugsForProtein.map(async (drugInfo) => {
                  const result = await lookupSmiles(drugInfo.drug)
                  return { drugInfo, result }
                })
              )

              for (const r of lookupResults) {
                if (r.status !== "fulfilled") continue
                const { drugInfo, result } = r.value
                const smiles = result?.smiles || ""
                if (smiles) {
                  console.log(`[structures] ✓ ${drugInfo.drug} → CID ${result?.cid}`)
                } else {
                  console.log(`[structures] ✗ ${drugInfo.drug} — no SMILES found`)
                }

                ligands.push({
                  name: drugInfo.drug,
                  smiles,
                  mechanism: drugInfo.mechanism || "",
                  fdaStatus: drugInfo.fdaStatus || "Unknown",
                  source: result ? `pubchem_cid_${result.cid}` : "no_smiles",
                })
              }

              return ligands
            })()

            // Run PDB and SMILES lookups concurrently
            const [pdbResult, drugLigands] = await Promise.all([pdbPromise, smilesPromise])

            // Keep only drugs with valid SMILES
            const validLigands = drugLigands.filter((l) => l.smiles)

            console.log(`[structures] ${protein}: ${validLigands.length} valid ligands (PDB: ${pdbResult.pdbId || "none"})`)

            const target: DockingTarget = {
              protein,
              pdbId: pdbResult.pdbId,
              pdbContentB64: pdbResult.pdbContentB64,
              ligands: validLigands,
            }

            // Emit this target immediately
            send({
              type: "target",
              target,
              index: pi,
              total: proteins.length,
            })

            return target
          })

          const results = await Promise.allSettled(proteinPromises)
          for (const r of results) {
            if (r.status === "fulfilled") {
              targets.push(r.value)
            }
          }

          send({
            type: "complete",
            targets,
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
