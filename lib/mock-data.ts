// Display types — used by frontend components
// These map to the real pipeline data from API routes

export interface Protein {
  id: string
  name: string
  gene: string
  pdbId: string | null
  role: string
  confidence: number
  pathwayInvolvement: string
}

export interface Drug {
  id: string
  name: string
  mechanism: string
  fdaStatus: string
  fdaCategory: "approved" | "phase-3" | "phase-2" | "phase-1" | "preclinical"
  targetProteins: string[]
  category: string
  smiles: string | null
  source: string | null
  confidenceScore: number | null
  proteinTarget: string | null
  round: number
  trialStatusForTargets?: string
}

export interface LiteratureReview {
  query: string
  papersAnalyzed: number
  reviewMd: string
}
