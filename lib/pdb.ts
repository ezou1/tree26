// RCSB PDB API client — ported from agent2.py

const PDB_SEARCH_URL = "https://search.rcsb.org/rcsbsearch/v2/query"
const PDB_DATA_URL = "https://data.rcsb.org/rest/v1/core/entry"
const PDB_DOWNLOAD_URL = "https://files.rcsb.org/download"

export interface PdbCandidate {
  pdbId: string
  score: number
  title?: string
  resolution?: number
  hasLigands?: boolean
}

/**
 * Search RCSB PDB for protein structures.
 * Port of agent2.py:search_pdb()
 */
export async function searchPdb(
  proteinName: string,
  maxResults: number = 10
): Promise<PdbCandidate[]> {
  const query = {
    query: {
      type: "group",
      logical_operator: "and",
      nodes: [
        {
          type: "terminal",
          service: "full_text",
          parameters: { value: proteinName },
        },
        {
          type: "terminal",
          service: "text",
          parameters: {
            attribute:
              "rcsb_entity_source_organism.ncbi_scientific_name",
            operator: "exact_match",
            value: "Homo sapiens",
          },
        },
        {
          type: "terminal",
          service: "text",
          parameters: {
            attribute: "exptl.method",
            operator: "exact_match",
            value: "X-RAY DIFFRACTION",
          },
        },
        {
          type: "terminal",
          service: "text",
          parameters: {
            attribute: "rcsb_entry_info.resolution_combined",
            operator: "less",
            value: 3.0,
          },
        },
      ],
    },
    return_type: "entry",
    request_options: {
      sort: [
        {
          sort_by: "rcsb_entry_info.resolution_combined",
          direction: "asc",
        },
      ],
      results_content_type: ["experimental"],
      paginate: { start: 0, rows: maxResults },
    },
  }

  try {
    const res = await fetch(PDB_SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) return []

    const data = await res.json()
    const results = data?.result_set || []

    return results.map(
      (r: { identifier: string; score: number }) => ({
        pdbId: r.identifier,
        score: r.score,
      })
    )
  } catch {
    return []
  }
}

/**
 * Get PDB entry metadata (resolution, ligand info).
 */
export async function getPdbMetadata(
  pdbId: string
): Promise<{ resolution?: number; hasLigands: boolean; title: string }> {
  try {
    const res = await fetch(`${PDB_DATA_URL}/${pdbId}`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { hasLigands: false, title: "" }

    const data = await res.json()
    const resolution =
      data?.rcsb_entry_info?.resolution_combined?.[0] ?? undefined
    const title = data?.struct?.title ?? ""
    // Check for non-polymer entities (ligands)
    const hasLigands =
      (data?.rcsb_entry_info?.nonpolymer_entity_count ?? 0) > 0

    return { resolution, hasLigands, title }
  } catch {
    return { hasLigands: false, title: "" }
  }
}

/**
 * Pick the best PDB structure: prefer those with ligands, then best resolution.
 * Port of agent2.py:pick_best_structure()
 */
export async function pickBestStructure(
  candidates: PdbCandidate[]
): Promise<PdbCandidate | null> {
  if (candidates.length === 0) return null

  // Enrich with metadata (check first 5 candidates)
  const enriched: PdbCandidate[] = []
  for (const c of candidates.slice(0, 5)) {
    const meta = await getPdbMetadata(c.pdbId)
    enriched.push({
      ...c,
      resolution: meta.resolution,
      hasLigands: meta.hasLigands,
      title: meta.title,
    })
  }

  // Sort: ligands first, then by resolution (lower is better)
  enriched.sort((a, b) => {
    if (a.hasLigands && !b.hasLigands) return -1
    if (!a.hasLigands && b.hasLigands) return 1
    return (a.resolution ?? 999) - (b.resolution ?? 999)
  })

  return enriched[0]
}

/**
 * Download PDB file and return as base64 string (no disk write).
 * Port of agent2.py:download_pdb() — adapted for serverless.
 */
export async function downloadPdb(pdbId: string): Promise<string | null> {
  const upperPdbId = pdbId.toUpperCase()

  // Try .pdb format first, then .cif
  for (const ext of ["pdb", "cif"]) {
    try {
      const url = `${PDB_DOWNLOAD_URL}/${upperPdbId}.${ext}`
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) })
      if (!res.ok) continue

      const buffer = await res.arrayBuffer()
      // Convert to base64
      const bytes = new Uint8Array(buffer)
      let binary = ""
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    } catch {
      continue
    }
  }

  return null
}
