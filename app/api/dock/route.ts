import { submitJob, waitForJob, safeLigandName, chunkList } from "@/lib/runpod"
import type { DockingTarget, DockingResult } from "@/lib/types"

export const maxDuration = 600 // 10 min for docking

export async function POST(req: Request) {
  try {
    const { targets, round = 1 } = (await req.json()) as {
      targets: DockingTarget[]
      round?: number
    }

    if (!targets?.length) {
      return new Response(
        JSON.stringify({ error: "targets array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // SSE streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: object) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        }

        const allResults: DockingResult[] = []

        try {
          for (const target of targets) {
            const { protein, pdbId, pdbContentB64, ligands } = target

            if (!pdbContentB64) {
              send({
                type: "error",
                message: `No PDB data for ${protein}, skipping`,
              })
              continue
            }

            const dockLigands = ligands.filter((l) => l.smiles)
            if (dockLigands.length === 0) {
              send({
                type: "error",
                message: `No valid ligands for ${protein}, skipping`,
              })
              continue
            }

            send({
              type: "progress",
              protein,
              drugIndex: 0,
              drugTotal: dockLigands.length,
              message: `Starting docking for ${protein} (${dockLigands.length} ligands)`,
            })

            // Build safe ligand names with mapping back to originals
            const safeToOriginal: Record<string, (typeof dockLigands)[number]> = {}
            const safeLigands = dockLigands.map((lig, i) => {
              const safeName = safeLigandName(lig.name, i)
              safeToOriginal[safeName] = lig
              return { name: safeName, smiles: lig.smiles }
            })

            // Send 1 ligand per chunk for speed (parallel small jobs)
            const chunks = chunkList(safeLigands, 1)

            // Submit all chunks
            const jobIds: string[] = []
            for (let i = 0; i < chunks.length; i++) {
              try {
                const jobId = await submitJob(pdbContentB64, chunks[i])
                jobIds.push(jobId)
                send({
                  type: "progress",
                  protein,
                  drugIndex: i * 10,
                  drugTotal: dockLigands.length,
                  message: `Submitted chunk ${i + 1}/${chunks.length} for ${protein}`,
                })
              } catch (err) {
                send({
                  type: "error",
                  message: `Failed to submit chunk ${i + 1} for ${protein}: ${err instanceof Error ? err.message : "unknown"}`,
                })
              }
            }

            // Wait for all jobs
            const targetResults: DockingResult[] = []
            for (let i = 0; i < jobIds.length; i++) {
              try {
                const chunkResults = await waitForJob(jobIds[i])

                for (const r of chunkResults) {
                  const orig = safeToOriginal[r.name]
                  const result: DockingResult = {
                    name: orig?.name || r.name,
                    confidenceScore: r.confidence_score,
                    confidenceRaw: r.confidence_raw,
                    mechanism: orig?.mechanism || "",
                    fdaStatus: orig?.fdaStatus || "",
                    source: orig?.source || "",
                    proteinTarget: protein,
                    pdbId: pdbId || "",
                    round,
                    allPoses: r.all_poses,
                  }
                  targetResults.push(result)
                }

                send({
                  type: "progress",
                  protein,
                  drugIndex: Math.min((i + 1) * 10, dockLigands.length),
                  drugTotal: dockLigands.length,
                  message: `Chunk ${i + 1}/${jobIds.length} complete for ${protein}`,
                })
              } catch (err) {
                send({
                  type: "error",
                  message: `Chunk ${i + 1} failed for ${protein}: ${err instanceof Error ? err.message : "unknown"}`,
                })
              }
            }

            // Sort by confidence
            targetResults.sort(
              (a, b) => b.confidenceScore - a.confidenceScore
            )
            allResults.push(...targetResults)

            send({
              type: "target_complete",
              protein,
              results: targetResults,
            })
          }

          // Sort all results
          allResults.sort(
            (a, b) => b.confidenceScore - a.confidenceScore
          )

          send({ type: "complete", allResults })
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
