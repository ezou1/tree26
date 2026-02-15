// PubChem API client — ported from agent2.py

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
const PUBCHEM_DELAY = 250 // ms between requests

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface PubChemCompound {
  cid: number
  smiles: string
  iupacName: string
  molecularFormula: string
}

/** Try a single PubChem name lookup. */
async function tryLookup(name: string): Promise<PubChemCompound | null> {
  const encoded = encodeURIComponent(name.trim())
  const url = `${PUBCHEM_BASE}/compound/name/${encoded}/property/IsomericSMILES,CanonicalSMILES,IUPACName,MolecularFormula/JSON`
  console.log(`[pubchem] tryLookup "${name}" → ${url}`)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    console.log(`[pubchem] tryLookup "${name}" → HTTP ${res.status}`)
    if (!res.ok) return null
    const data = await res.json()
    const props = data?.PropertyTable?.Properties?.[0]
    console.log(`[pubchem] tryLookup "${name}" → keys: ${props ? Object.keys(props).join(", ") : "none"}`)
    // PubChem returns SMILES under varying keys depending on the request
    const smiles =
      props?.CanonicalSMILES ||
      props?.IsomericSMILES ||
      props?.ConnectivitySMILES ||
      props?.SMILES ||
      ""
    if (!smiles) {
      console.log(`[pubchem] tryLookup "${name}" → no SMILES in props`)
      return null
    }
    console.log(`[pubchem] tryLookup "${name}" → CID ${props.CID}, SMILES ${smiles.slice(0, 40)}...`)
    return {
      cid: props.CID,
      smiles,
      iupacName: props.IUPACName || "",
      molecularFormula: props.MolecularFormula || "",
    }
  } catch (err) {
    console.log(`[pubchem] tryLookup "${name}" → ERROR: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

/**
 * Look up SMILES for a drug by name.
 * Tries multiple name variants (strip parenthetical, code names, etc.)
 */
export async function lookupSmiles(
  drugName: string
): Promise<PubChemCompound | null> {
  if (!drugName) return null

  // Handle CID_xxx names — look up by CID directly
  const cidMatch = drugName.match(/^CID_(\d+)$/)
  if (cidMatch) {
    const cid = cidMatch[1]
    try {
      const url = `${PUBCHEM_BASE}/compound/cid/${cid}/property/IsomericSMILES,CanonicalSMILES,IUPACName,MolecularFormula/JSON`
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) return null
      const data = await res.json()
      const props = data?.PropertyTable?.Properties?.[0]
      if (!props) return null
      const smiles =
        props?.CanonicalSMILES ||
        props?.IsomericSMILES ||
        props?.ConnectivitySMILES ||
        props?.SMILES ||
        ""
      if (!smiles) return null
      return {
        cid: props.CID,
        smiles,
        iupacName: props.IUPACName || "",
        molecularFormula: props.MolecularFormula || "",
      }
    } catch {
      return null
    }
  }

  // Build candidate name variants
  const variants: string[] = [drugName]

  // Strip parenthetical: "Sotorasib (AMG 510)" → "Sotorasib"
  const noParens = drugName.replace(/\s*\(.*?\)\s*/g, "").trim()
  if (noParens && noParens !== drugName) variants.push(noParens)

  // Extract parenthetical content: "Sotorasib (AMG 510)" → "AMG 510"
  const parenMatch = drugName.match(/\(([^)]+)\)/)
  if (parenMatch) variants.push(parenMatch[1].trim())

  // Strip trailing descriptors: "Erlotinib hydrochloride" → "Erlotinib"
  const firstWord = drugName.split(/[\s,;(/-]+/)[0]
  if (firstWord && firstWord.length > 3 && !variants.includes(firstWord))
    variants.push(firstWord)

  // Try each variant
  for (const name of variants) {
    const result = await tryLookup(name)
    if (result) return result
    await delay(PUBCHEM_DELAY)
  }

  return null
}

/**
 * Search for bioactive compounds targeting a protein.
 * Port of agent2.py:search_compounds_for_target()
 */
export async function searchCompoundsForTarget(
  proteinName: string,
  maxCompounds: number = 50
): Promise<PubChemCompound[]> {
  const geneSymbol = proteinName.split(/\s+/)[0]
  let cids: number[] = []

  // Try bioassay target search
  try {
    const bioassayUrl = `${PUBCHEM_BASE}/assay/target/genesymbol/${encodeURIComponent(geneSymbol)}/cids/JSON?cids_type=active`
    const res = await fetch(bioassayUrl, { signal: AbortSignal.timeout(30000) })
    if (res.ok) {
      const data = await res.json()
      const info = data?.InformationList?.Information
      if (info) {
        for (const entry of info) {
          if (entry.CID) cids.push(...entry.CID)
        }
      }
    }
  } catch {
    // continue to fallback
  }

  // Fallback: gene symbol search
  if (cids.length === 0) {
    try {
      await delay(PUBCHEM_DELAY)
      const geneUrl = `${PUBCHEM_BASE}/gene/symbol/${encodeURIComponent(geneSymbol)}/cids/JSON?cids_type=pharmacologically_active`
      const res = await fetch(geneUrl, { signal: AbortSignal.timeout(30000) })
      if (res.ok) {
        const data = await res.json()
        const info = data?.InformationList?.Information
        if (info) {
          for (const entry of info) {
            if (entry.CID) cids.push(...entry.CID)
          }
        }
      }
    } catch {
      // no results
    }
  }

  // Deduplicate and limit
  cids = [...new Set(cids)].slice(0, maxCompounds)
  if (cids.length === 0) return []

  // Fetch compound properties in batches of 100
  const compounds: PubChemCompound[] = []
  for (let i = 0; i < cids.length; i += 100) {
    const batch = cids.slice(i, i + 100)
    const cidStr = batch.join(",")
    await delay(PUBCHEM_DELAY)

    try {
      const url = `${PUBCHEM_BASE}/compound/cid/${cidStr}/property/IsomericSMILES,CanonicalSMILES,IUPACName,MolecularFormula/JSON`
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!res.ok) continue

      const data = await res.json()
      const props = data?.PropertyTable?.Properties
      if (props) {
        for (const p of props) {
          compounds.push({
            cid: p.CID,
            smiles: p.CanonicalSMILES || p.IsomericSMILES || p.ConnectivitySMILES || p.SMILES || "",
            iupacName: p.IUPACName || "",
            molecularFormula: p.MolecularFormula || "",
          })
        }
      }
    } catch {
      continue
    }
  }

  return compounds
}

/**
 * Search for 3D-similar compounds.
 * Port of agent2.py:search_3d_similar()
 */
export async function search3dSimilar(
  cid: number,
  maxResults: number = 20
): Promise<PubChemCompound[]> {
  // Get similar CIDs
  const searchUrl = `${PUBCHEM_BASE}/compound/fastsimilarity_3d/cid/${cid}/cids/JSON`
  let similarCids: number[] = []

  try {
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(60000) })
    if (!res.ok) return []

    const data = await res.json()
    similarCids = (data?.IdentifierList?.CID || []).slice(0, maxResults)
  } catch {
    return []
  }

  if (similarCids.length === 0) return []

  // Fetch properties
  await delay(PUBCHEM_DELAY)
  const cidStr = similarCids.join(",")
  try {
    const url = `${PUBCHEM_BASE}/compound/cid/${cidStr}/property/IsomericSMILES,CanonicalSMILES,IUPACName,MolecularFormula/JSON`
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!res.ok) return []

    const data = await res.json()
    const props = data?.PropertyTable?.Properties
    if (!props) return []

    return props.map(
      (p: Record<string, unknown>) => ({
        cid: p.CID as number,
        smiles: (p.CanonicalSMILES || p.IsomericSMILES || p.ConnectivitySMILES || p.SMILES || "") as string,
        iupacName: (p.IUPACName || "") as string,
        molecularFormula: p.MolecularFormula || "",
      })
    )
  } catch {
    return []
  }
}
