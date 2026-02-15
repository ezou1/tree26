import { searchPdb, pickBestStructure, downloadPdb } from "@/lib/pdb"
import { lookupSmiles, searchCompoundsForTarget } from "@/lib/pubchem"
import type { ReviewDrug, DockingTarget, Ligand } from "@/lib/types"

export const maxDuration = 120

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
          for (let pi = 0; pi < proteins.length; pi++) {
            const protein = proteins[pi]

            // Search PDB
            send({
              type: "progress",
              message: `Searching PDB for ${protein} structure... (${pi + 1}/${proteins.length})`,
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

            // Look up SMILES for known drugs
            const ligands: Ligand[] = []
            const existingSmiles = new Set<string>()
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

            for (let di = 0; di < drugsForProtein.length; di++) {
              const drugInfo = drugsForProtein[di]
              await delay(250)

              send({
                type: "progress",
                message: `Looking up ${drugInfo.drug}... (${di + 1}/${drugsForProtein.length} for ${protein})`,
              })

              const result = await lookupSmiles(drugInfo.drug)

              const smiles = result?.smiles || ""
              if (smiles) {
                existingSmiles.add(smiles)
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

            // Discover bioactive compounds from PubChem
            send({
              type: "progress",
              message: `Searching PubChem bioassays for ${protein}...`,
            })
            const extra = await searchCompoundsForTarget(protein, 50)
            console.log(`[structures] ${protein}: ${extra.length} bioactive compounds from PubChem`)
            for (const c of extra) {
              if (c.smiles && !existingSmiles.has(c.smiles)) {
                ligands.push({
                  name: c.iupacName || `CID_${c.cid}`,
                  smiles: c.smiles,
                  mechanism: "Bioactive — PubChem target search",
                  fdaStatus: "Unknown — requires verification",
                  source: `pubchem_cid_${c.cid}`,
                })
                existingSmiles.add(c.smiles)
              }
            }

            // Drop empty SMILES and limit to 5 ligands total for speed
            const validLigands = ligands.filter((l) => l.smiles).slice(0, 5)

            console.log(`[structures] ${protein}: ${validLigands.length} valid ligands (PDB: ${pdbId || "none"})`)

            const target: DockingTarget = {
              protein,
              pdbId,
              pdbContentB64,
              ligands: validLigands,
            }
            targets.push(target)

            // Emit this target immediately so frontend can update
            send({
              type: "target",
              target,
              index: pi,
              total: proteins.length,
            })
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
