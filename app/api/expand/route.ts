import { NextResponse } from "next/server"
import { queryPerplexity, parseJsonResponse } from "@/lib/perplexity"
import { lookupSmiles, search3dSimilar } from "@/lib/pubchem"
import type { ReasoningDecision, DockingTarget, DockingResult, Ligand } from "@/lib/types"
import { shortenDrugName } from "@/lib/types"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const {
      decision,
      proteins,
      existingTargets,
      allDockingResults = [],
    } = (await req.json()) as {
      decision: ReasoningDecision
      proteins: string[]
      existingTargets: DockingTarget[]
      allDockingResults?: DockingResult[]
    }

    if (!decision || !proteins?.length) {
      return NextResponse.json(
        { error: "decision and proteins are required" },
        { status: 400 }
      )
    }

    const newLigandsByProtein: Record<string, Ligand[]> = {}

    if (decision.action === "expand_3d_similar") {
      let seedCids = decision.seedCids || []

      // Fallback: extract CIDs from top docking results
      if (seedCids.length === 0 && allDockingResults.length > 0) {
        const sorted = [...allDockingResults].sort(
          (a, b) => b.confidenceScore - a.confidenceScore
        )
        for (const r of sorted) {
          const src = r.source || ""
          if (src.startsWith("pubchem_cid_")) {
            const cid = parseInt(src.split("_").pop() || "", 10)
            if (!isNaN(cid)) seedCids.push(cid)
          }
          if (seedCids.length >= 5) break
        }
      }

      // Search all seed CIDs in parallel
      const similarResults = await Promise.allSettled(
        seedCids.map((cid) => search3dSimilar(cid, 20))
      )

      for (let i = 0; i < seedCids.length; i++) {
        const r = similarResults[i]
        if (r.status !== "fulfilled") continue
        const cid = seedCids[i]
        for (const c of r.value) {
          if (!c.smiles) continue
          const lig: Ligand = {
            name: shortenDrugName(c.iupacName, c.cid),
            smiles: c.smiles,
            mechanism: `3D-similar to CID ${cid} (ST≥0.80, CT≥0.50)`,
            fdaStatus: "Unknown — requires verification",
            source: `pubchem_3dsim_cid_${c.cid}_from_${cid}`,
          }
          for (const protein of proteins) {
            if (!newLigandsByProtein[protein]) newLigandsByProtein[protein] = []
            newLigandsByProtein[protein].push(lig)
          }
        }
      }
    } else if (decision.action === "expand_class") {
      let drugNames = decision.drugNames || []

      // If no drug names provided, ask Perplexity
      if (drugNames.length === 0 && decision.drugClass) {
        const system =
          "You are a pharmacology expert. Return ONLY a JSON array of drug names."
        const user =
          `List 10 FDA-approved drugs in the class "${decision.drugClass}" ` +
          `that might bind to these proteins: ${proteins.join(", ")}. ` +
          `Return ONLY a JSON array of drug name strings.`
        const raw = await queryPerplexity(system, user)
        const parsed = parseJsonResponse(raw)
        if (Array.isArray(parsed)) {
          drugNames = parsed.map(String)
        } else if (parsed.drugs && Array.isArray(parsed.drugs)) {
          drugNames = (parsed.drugs as string[]).map(String)
        }
      }

      // Look up SMILES for all drugs in parallel
      const lookupResults = await Promise.allSettled(
        drugNames.map(async (drugName) => {
          const result = await lookupSmiles(drugName)
          return { drugName, result }
        })
      )

      for (const r of lookupResults) {
        if (r.status !== "fulfilled") continue
        const { drugName, result } = r.value
        if (!result?.smiles) continue

        const lig: Ligand = {
          name: drugName,
          smiles: result.smiles,
          mechanism: `Class expansion: ${decision.drugClass || "unknown"}`,
          fdaStatus: "FDA-approved — requires indication verification",
          source: `pubchem_cid_${result.cid}`,
        }
        for (const protein of proteins) {
          if (!newLigandsByProtein[protein]) newLigandsByProtein[protein] = []
          newLigandsByProtein[protein].push(lig)
        }
      }
    }

    // Build new targets for docking (only with new ligands, reusing PDB data)
    const newTargets: DockingTarget[] = []

    for (const protein of proteins) {
      const newLigands = newLigandsByProtein[protein] || []
      if (newLigands.length === 0) continue

      // Deduplicate against existing ligands
      const existing = existingTargets.find((t) => t.protein === protein)
      const existingSmiles = new Set(
        (existing?.ligands || []).map((l) => l.smiles)
      )
      const uniqueLigands = newLigands.filter(
        (l) => !existingSmiles.has(l.smiles)
      )

      if (uniqueLigands.length === 0) continue

      newTargets.push({
        protein,
        pdbId: existing?.pdbId || null,
        pdbContentB64: existing?.pdbContentB64 || null,
        ligands: uniqueLigands,
      })
    }

    return NextResponse.json({ newTargets })
  } catch (error) {
    console.error("Expand API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
