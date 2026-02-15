// Pipeline types — shared between API routes and frontend

export interface ReviewDrug {
  drug: string
  proteins: string[]
  mechanism: string
  fdaStatus: string
  category: string
}

export interface Ligand {
  name: string
  smiles: string
  mechanism: string
  fdaStatus: string
  source: string
}

export interface DockingTarget {
  protein: string
  pdbId: string | null
  pdbContentB64: string | null
  ligands: Ligand[]
}

export interface DockingResult {
  name: string
  confidenceScore: number
  confidenceRaw: number
  mechanism: string
  fdaStatus: string
  source: string
  proteinTarget: string
  pdbId: string
  round: number
  allPoses?: unknown[]
}

export interface ReasoningDecision {
  action: "expand_3d_similar" | "expand_class" | "proceed"
  rationale: string
  hypothesis: string
  seedCids?: number[]
  drugClass?: string
  drugNames?: string[]
}

// Frontend display types (adapted from pipeline types)
export interface DisplayProtein {
  id: string
  name: string
  gene: string
  pdbId: string | null
  role: string
  pathwayInvolvement: string
}

export interface DisplayDrug {
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
  confidenceRaw: number | null
  proteinTarget: string | null
  round: number
}

// SSE event types for docking streaming
export interface DockSSEProgress {
  type: "progress"
  protein: string
  drugIndex: number
  drugTotal: number
  message: string
}

export interface DockSSETargetComplete {
  type: "target_complete"
  protein: string
  results: DockingResult[]
}

export interface DockSSEComplete {
  type: "complete"
  allResults: DockingResult[]
}

export interface DockSSEError {
  type: "error"
  message: string
}

export type DockSSEEvent =
  | DockSSEProgress
  | DockSSETargetComplete
  | DockSSEComplete
  | DockSSEError

// Helper: parse FDA status string into display category
export function parseFdaCategory(
  status: string | undefined | null
): DisplayDrug["fdaCategory"] {
  if (!status) return "preclinical"
  const s = status.toLowerCase()
  if (s.includes("approved") || s.includes("fda")) return "approved"
  if (s.includes("phase 3") || s.includes("phase-3") || s.includes("phase3"))
    return "phase-3"
  if (s.includes("phase 2") || s.includes("phase-2") || s.includes("phase2"))
    return "phase-2"
  if (
    s.includes("phase 1") ||
    s.includes("phase-1") ||
    s.includes("phase1") ||
    s.includes("early")
  )
    return "phase-1"
  return "preclinical"
}

// Helper: convert ReviewDrug to DisplayDrug (before docking)
export function reviewDrugToDisplay(
  drug: ReviewDrug,
  index: number
): DisplayDrug {
  return {
    id: `drug-${index}`,
    name: drug.drug,
    mechanism: drug.mechanism,
    fdaStatus: drug.fdaStatus,
    fdaCategory: parseFdaCategory(drug.fdaStatus),
    targetProteins: drug.proteins,
    category: drug.category,
    smiles: null,
    source: null,
    confidenceScore: null,
    confidenceRaw: null,
    proteinTarget: null,
    round: 0,
  }
}

// Helper: convert DockingResult to DisplayDrug (after docking)
export function dockingResultToDisplay(
  result: DockingResult,
  index: number
): DisplayDrug {
  return {
    id: `docked-${index}`,
    name: result.name,
    mechanism: result.mechanism,
    fdaStatus: result.fdaStatus,
    fdaCategory: parseFdaCategory(result.fdaStatus),
    targetProteins: [result.proteinTarget],
    category: "",
    smiles: null,
    source: result.source,
    confidenceScore: result.confidenceScore,
    confidenceRaw: result.confidenceRaw,
    proteinTarget: result.proteinTarget,
    round: result.round,
  }
}
