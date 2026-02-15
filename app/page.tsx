"use client"

import { useState, useCallback, useRef } from "react"
import { AppHeader } from "@/components/app-header"
import { ResearchPanel } from "@/components/research-panel"
import { DataPanel, type SimulationStatus } from "@/components/data-panel"
import { DrugDetailPanel } from "@/components/drug-detail-panel"
import { ReportPanel } from "@/components/report-panel"
import type { Drug, Protein } from "@/lib/mock-data"
import type {
  ReviewDrug,
  DockingTarget,
  DockingResult,
  ReasoningDecision,
  ChatMessage,
  ChatAction,
} from "@/lib/types"
import { parseFdaCategory } from "@/lib/types"

type AppPhase =
  | "idle"
  | "reviewing"
  | "fetching-structures"
  | "review-ready"
  | "simulating"
  | "reasoning"
  | "expanding"
  | "reporting"
  | "generating-paper"
  | "done"

function ResizeHandle({
  onResize,
  side = "right",
}: {
  onResize: (deltaX: number) => void
  side?: "right" | "left"
}) {
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    lastX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const delta = e.clientX - lastX.current
      lastX.current = e.clientX
      onResize(delta)
    },
    [onResize]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="group relative z-10 flex w-0 cursor-col-resize items-center justify-center"
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${side} panel`}
    >
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      <div className="absolute inset-y-0 w-px bg-border transition-colors group-hover:bg-primary/60 group-active:bg-primary" />
      <div className="absolute flex flex-col gap-1 rounded-full bg-card px-0.5 py-2 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
      </div>
    </div>
  )
}

// Merge duplicate drugs by name — combine target proteins, keep best score
function mergeDuplicateDrugs(drugs: Drug[]): Drug[] {
  const map = new Map<string, Drug>()
  for (const d of drugs) {
    const key = d.name.toLowerCase()
    const existing = map.get(key)
    if (existing) {
      // Merge target proteins
      const allTargets = new Set([
        ...existing.targetProteins,
        ...d.targetProteins,
      ])
      existing.targetProteins = [...allTargets]
      // Keep best confidence score
      if (
        d.confidenceScore !== null &&
        (existing.confidenceScore === null ||
          d.confidenceScore > existing.confidenceScore)
      ) {
        existing.confidenceScore = d.confidenceScore
      }
      // Merge proteinTarget display
      if (d.proteinTarget && !existing.proteinTarget?.includes(d.proteinTarget)) {
        existing.proteinTarget = existing.proteinTarget
          ? `${existing.proteinTarget}, ${d.proteinTarget}`
          : d.proteinTarget
      }
    } else {
      map.set(key, { ...d })
    }
  }
  return [...map.values()]
}

// Convert ReviewDrug from API to frontend Drug type
function reviewDrugToDisplay(drug: ReviewDrug, index: number): Drug {
  return {
    id: `drug-${index}`,
    name: drug.drug || "Unknown",
    mechanism: drug.mechanism || "",
    fdaStatus: drug.fdaStatus || "Unknown",
    fdaCategory: parseFdaCategory(drug.fdaStatus),
    targetProteins: drug.proteins || [],
    category: drug.category || "",
    smiles: null,
    source: null,
    confidenceScore: null,
    proteinTarget: null,
    round: 0,
    trialStatusForTargets: drug.trialStatusForTargets,
  }
}

// Convert DockingResult to frontend Drug type
function dockingResultToDisplay(result: DockingResult, index: number): Drug {
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
    proteinTarget: result.proteinTarget,
    round: result.round,
  }
}

/** Helper to read an SSE stream and dispatch events via callback */
async function readSSEStream(
  response: Response,
  onEvent: (event: Record<string, unknown>) => void
) {
  if (!response.body) throw new Error("No response body")
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      try {
        const event = JSON.parse(line.slice(6))
        onEvent(event)
      } catch {
        // skip unparseable
      }
    }
  }
}

// --- Chat helpers ---

function makeMsg(
  role: ChatMessage["role"],
  content: string,
  actions?: ChatAction[]
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    actions,
  }
}

const WELCOME_MESSAGE = makeMsg(
  "assistant",
  "Welcome to the Drug Discovery Pipeline. Enter a disease or condition below, or choose an example to begin.",
  [
    {
      id: "example-1",
      label: "Systemic Lupus Erythematosus (SLE)",
      value: "query:Systemic Lupus Erythematosus (SLE)",
      variant: "outline",
    },
    {
      id: "example-2",
      label: "Alzheimer's Disease",
      value: "query:Alzheimer's Disease",
      variant: "outline",
    },
    {
      id: "example-3",
      label: "Pancreatic Ductal Adenocarcinoma",
      value: "query:Pancreatic Ductal Adenocarcinoma",
      variant: "outline",
    },
  ]
)

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("idle")
  const [query, setQuery] = useState("")
  const [leftPanelWidth, setLeftPanelWidth] = useState(340)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)
  const [statusMessage, setStatusMessage] = useState("")

  // Pipeline data
  const [proteins, setProteins] = useState<Protein[] | null>(null)
  const [drugs, setDrugs] = useState<Drug[] | null>(null)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [simulationRunningDrug, setSimulationRunningDrug] =
    useState<Drug | null>(null)
  const [drugSimStatuses, setDrugSimStatuses] = useState<
    Record<string, SimulationStatus>
  >({})

  // Pipeline state (for reasoning loop)
  const [proteinNames, setProteinNames] = useState<string[]>([])
  const [targets, setTargets] = useState<DockingTarget[]>([])
  const [allDockingResults, setAllDockingResults] = useState<DockingResult[]>(
    []
  )
  const [round, setRound] = useState(1)
  const [hypotheses, setHypotheses] = useState<string[]>([])
  const [expansionHistory, setExpansionHistory] = useState<
    { round: number; action: string; rationale: string }[]
  >([])
  const [reviewMd, setReviewMd] = useState("")
  const [resultsMd, setResultsMd] = useState("")
  const [paperMd, setPaperMd] = useState("")
  const [reportGenerating, setReportGenerating] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ])

  // Drug selection state
  const [selectedDrugIds, setSelectedDrugIds] = useState<Set<string>>(
    new Set()
  )

  const simulatingRef = useRef(false)
  const pendingDecisionRef = useRef<ReasoningDecision | null>(null)

  // Refs for latest values in async SSE handlers (avoids stale closures)
  const drugsRef = useRef(drugs)
  drugsRef.current = drugs
  const selectedDrugIdsRef = useRef(selectedDrugIds)
  selectedDrugIdsRef.current = selectedDrugIds

  // Chat helper: append message
  const addMessage = useCallback(
    (
      role: ChatMessage["role"],
      content: string,
      actions?: ChatAction[]
    ) => {
      setChatMessages((prev) => [...prev, makeMsg(role, content, actions)])
    },
    []
  )

  const handleLeftResize = useCallback((delta: number) => {
    setLeftPanelWidth((prev) => Math.min(600, Math.max(240, prev + delta)))
  }, [])

  const handleRightResize = useCallback((delta: number) => {
    setRightPanelWidth((prev) => Math.min(600, Math.max(280, prev - delta)))
  }, [])

  // Drug selection handlers
  const handleToggleDrugSelection = useCallback((drugId: string) => {
    setSelectedDrugIds((prev) => {
      const next = new Set(prev)
      if (next.has(drugId)) next.delete(drugId)
      else next.add(drugId)
      return next
    })
  }, [])

  const handleSelectAllDrugs = useCallback(() => {
    setSelectedDrugIds((prev) => {
      if (!drugs) return prev
      return new Set(drugs.map((d) => d.id))
    })
  }, [drugs])

  const handleDeselectAllDrugs = useCallback(() => {
    setSelectedDrugIds(new Set())
  }, [])

  // ---------- Step 1: Literature Review (SSE) ----------
  const handleSubmitQuery = useCallback(
    async (userQuery: string) => {
      setQuery(userQuery)
      setPhase("reviewing")
      setStatusMessage("Starting literature review...")

      // Chat: user message
      addMessage("user", userQuery)
      addMessage(
        "assistant",
        `Starting analysis for "${userQuery}"...\nI'll search arXiv, generate a literature review, and identify drug candidates.`
      )

      let reviewProteins: string[] = []
      let reviewDrugs: ReviewDrug[] = []
      let finalReviewMd = ""
      let papersAnalyzed = 0

      try {
        // --- Review SSE stream ---
        const reviewRes = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cancerType: userQuery }),
        })

        if (!reviewRes.ok)
          throw new Error(`Review API error: ${reviewRes.status}`)

        await readSSEStream(reviewRes, (event) => {
          if (event.type === "progress") {
            setStatusMessage(event.message as string)
          } else if (event.type === "proteins") {
            reviewProteins = event.proteins as string[]
            const displayProteins: Protein[] = reviewProteins.map(
              (name: string, i: number) => ({
                id: `p-${i}`,
                name,
                gene: name,
                pdbId: null,
                role: "Identified target",
                confidence: 90 - i * 5,
                pathwayInvolvement: "",
              })
            )
            setProteins(displayProteins)
            setProteinNames(reviewProteins)
            addMessage(
              "system",
              `Found ${reviewProteins.length} protein targets: ${reviewProteins.join(", ")}`
            )
          } else if (event.type === "review") {
            finalReviewMd = event.reviewMd as string
            papersAnalyzed = (event.papersAnalyzed as number) || 0
            setReviewMd(finalReviewMd)
          } else if (event.type === "drugs") {
            reviewDrugs = event.drugs as ReviewDrug[]
            const displayDrugs = mergeDuplicateDrugs(reviewDrugs.map(reviewDrugToDisplay))
            setDrugs(displayDrugs)
            // Auto-select all drugs
            setSelectedDrugIds(new Set(displayDrugs.map((d) => d.id)))
            addMessage(
              "system",
              `Identified ${reviewDrugs.length} candidate drugs from literature review.`
            )
          } else if (event.type === "error") {
            throw new Error(event.message as string)
          }
        })

        // --- Structures SSE stream ---
        setPhase("fetching-structures")
        setStatusMessage("Fetching protein structures from PDB...")

        const structRes = await fetch("/api/structures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proteins: reviewProteins,
            drugs: reviewDrugs,
          }),
        })

        if (!structRes.ok)
          throw new Error(`Structures API error: ${structRes.status}`)

        const collectedTargets: DockingTarget[] = []

        await readSSEStream(structRes, (event) => {
          if (event.type === "progress") {
            setStatusMessage(event.message as string)
          } else if (event.type === "target") {
            const target = event.target as DockingTarget
            collectedTargets.push(target)

            setProteins((prev) => {
              if (!prev) return prev
              return prev.map((p) =>
                p.name === target.protein
                  ? { ...p, pdbId: target.pdbId }
                  : p
              )
            })
          } else if (event.type === "complete") {
            const finalTargets =
              (event.targets as DockingTarget[]) || collectedTargets
            setTargets(finalTargets)
          } else if (event.type === "error") {
            console.error("Structures error:", event.message)
          }
        })

        // Fallback if complete event didn't fire properly
        if (collectedTargets.length > 0) {
          setTargets((prev) => (prev.length > 0 ? prev : collectedTargets))
        }

        // Rebuild drug table to only include drugs that have SMILES in targets,
        // and enrich with SMILES/source from the ligand data for 3D viewing
        const finalTargets = collectedTargets
        const ligandLookup = new Map<string, { smiles: string; source: string }>()
        for (const t of finalTargets) {
          for (const l of t.ligands) {
            if (l.smiles && !ligandLookup.has(l.name.toLowerCase())) {
              ligandLookup.set(l.name.toLowerCase(), {
                smiles: l.smiles,
                source: l.source,
              })
            }
          }
        }

        const dockableDrugs = mergeDuplicateDrugs(
          reviewDrugs
            .filter((d) => ligandLookup.has((d.drug || "").toLowerCase()))
            .map((d, i) => {
              const display = reviewDrugToDisplay(d, i)
              const ligData = ligandLookup.get((d.drug || "").toLowerCase())
              if (ligData) {
                display.smiles = ligData.smiles
                display.source = ligData.source
              }
              return display
            })
        )
        const undockableCount = reviewDrugs.length - dockableDrugs.length

        setDrugs(dockableDrugs)
        setSelectedDrugIds(new Set(dockableDrugs.map((d) => d.id)))

        setPhase("review-ready")
        setStatusMessage("")

        // Chat: analysis complete — ask user how to proceed
        const undockableNote = undockableCount > 0
          ? `\n\n${undockableCount} drug${undockableCount === 1 ? " was" : "s were"} excluded because PubChem couldn't resolve their molecular structure.`
          : ""
        addMessage(
          "assistant",
          `Analysis complete! I analyzed ${papersAnalyzed} papers and found ${reviewProteins.length} protein targets with ${dockableDrugs.length} dockable candidates.${undockableNote}\n\nAll dockable drugs are selected. You can deselect any from the table, then choose how to proceed.`,
          [
            {
              id: "dock-all",
              label: `Dock all ${dockableDrugs.length} candidates`,
              value: "dock-all",
              variant: "primary",
            },
            {
              id: "select-drugs",
              label: "Let me select specific drugs first",
              value: "select-drugs",
              variant: "outline",
            },
          ]
        )
      } catch (error) {
        console.error("Pipeline error:", error)
        const errMsg =
          error instanceof Error ? error.message : "Unknown error"
        setStatusMessage(`Error: ${errMsg}`)
        addMessage("assistant", `An error occurred: ${errMsg}`)
        setPhase("idle")
      }
    },
    [addMessage]
  )

  // ---------- Step 2: Docking ----------
  const skipReasoningRef = useRef(false)
  const handleStartSimulation = useCallback(async () => {
    // Use refs for the latest values (avoids stale closure from dock-all race)
    const currentDrugs = drugsRef.current
    const currentSelectedIds = selectedDrugIdsRef.current

    if (simulatingRef.current || !currentDrugs || targets.length === 0) return
    simulatingRef.current = true
    setPhase("simulating")
    setSelectedDrug(null)

    // Filter targets to only include selected drug ligands
    const selectedNames = new Set(
      currentDrugs
        .filter((d) => currentSelectedIds.has(d.id))
        .map((d) => d.name.toLowerCase())
    )

    const filteredTargets = targets
      .map((t) => ({
        ...t,
        ligands: t.ligands.filter((l) =>
          selectedNames.has(l.name.toLowerCase())
        ),
      }))
      .filter((t) => t.ligands.length > 0)

    // Only dock what the user selected — never fall back to all targets
    if (filteredTargets.length === 0) {
      addMessage(
        "assistant",
        "None of the selected drugs matched available ligands. Please check your selection and try again."
      )
      simulatingRef.current = false
      setPhase("review-ready")
      return
    }
    const dockTargets = filteredTargets

    // Initialize all selected drug statuses to "waiting"
    const initialStatuses: Record<string, SimulationStatus> = {}
    for (const drug of currentDrugs) {
      if (currentSelectedIds.has(drug.id)) {
        initialStatuses[drug.id] = "waiting"
      }
    }
    setDrugSimStatuses(initialStatuses)

    addMessage(
      "assistant",
      `Starting DiffDock molecular docking for ${currentSelectedIds.size} drug${currentSelectedIds.size === 1 ? "" : "s"} across ${dockTargets.length} protein target${dockTargets.length === 1 ? "" : "s"}...`
    )

    try {
      const res = await fetch("/api/dock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets: dockTargets, round }),
      })

      if (!res.ok) throw new Error(`Dock API error: ${res.status}`)

      let completedResults: DockingResult[] = []

      await readSSEStream(res, (event) => {
        if (event.type === "progress") {
          setStatusMessage(event.message as string)
          // Track currently-docking drug (use ref for latest drugs list)
          const currentDrugName = event.currentDrug as string | null
          const latestDrugs = drugsRef.current
          if (currentDrugName && latestDrugs) {
            const match = latestDrugs.find(
              (d) => d.name.toLowerCase() === currentDrugName.toLowerCase()
            )
            if (match) {
              setSimulationRunningDrug(match)
              setDrugSimStatuses((prev) => ({
                ...prev,
                [match.id]: "running",
              }))
            }
          }
        } else if (event.type === "target_complete") {
          const targetResults = event.results as DockingResult[]
          completedResults = [...completedResults, ...targetResults]

          const latestDrugs = drugsRef.current
          setDrugSimStatuses((prev) => {
            const next = { ...prev }
            for (const r of targetResults) {
              const matchingDrug = latestDrugs?.find(
                (d) => d.name.toLowerCase() === r.name.toLowerCase()
              )
              if (matchingDrug) {
                next[matchingDrug.id] = "complete"
              }
            }
            return next
          })
        } else if (event.type === "complete") {
          completedResults = event.allResults as DockingResult[]
        } else if (event.type === "error") {
          const msg = event.message as string
          if (msg.includes("No valid ligands") || msg.includes("skipping")) {
            console.warn("Docking skipped:", msg)
          } else {
            console.error("Docking error:", msg)
          }
        }
      })

      // Update state with all results
      const newAllResults = [...allDockingResults, ...completedResults]
      setAllDockingResults(newAllResults)

      // Mark all drugs as complete
      setDrugSimStatuses((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          next[key] = "complete"
        }
        return next
      })
      setSimulationRunningDrug(null)

      // Create display drugs from ALL accumulated docking results (sorted by score)
      const sortedResults = [...newAllResults].sort(
        (a, b) => b.confidenceScore - a.confidenceScore
      )
      const dockedDrugs = mergeDuplicateDrugs(sortedResults.map(dockingResultToDisplay))
      setDrugs(dockedDrugs)

      // Auto-select top 5 drugs for potential expansion
      setSelectedDrugIds(
        new Set(dockedDrugs.slice(0, 5).map((d) => d.id))
      )

      // Reinitialize sim statuses for all docked drugs
      const newStatuses: Record<string, SimulationStatus> = {}
      for (const d of dockedDrugs) {
        newStatuses[d.id] = "complete"
      }
      setDrugSimStatuses(newStatuses)

      // Chat: docking results summary
      const top3 = sortedResults.slice(0, 3)
      if (top3.length > 0) {
        const summaryLines = top3.map(
          (r, i) =>
            `${i + 1}. ${r.name} — ${Math.round(r.confidenceScore * 100)}% confidence (${r.proteinTarget})`
        )
        addMessage(
          "assistant",
          `Docking complete! ${completedResults.length} results.\n\nTop hits:\n${summaryLines.join("\n")}\n\nClick any drug in the table for 3D visualization.`,
          [
            {
              id: "search-similar",
              label: "Search similar compounds for top hits",
              value: "search-similar",
              variant: "primary",
            },
            {
              id: "generate-report",
              label: "Generate full report",
              value: "generate-report",
              variant: "outline",
            },
          ]
        )
      }

      // ---------- Step 3: Reasoning Analysis (skip if user-initiated re-dock) ----------
      if (skipReasoningRef.current) {
        skipReasoningRef.current = false
        setPhase("done")
        setStatusMessage("")
        simulatingRef.current = false
        return
      }

      setPhase("reasoning")
      setStatusMessage("AI is analyzing docking patterns...")

      try {
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cancerType: query,
            dockingResults: newAllResults,
            round,
            hypotheses,
            expansionHistory,
          }),
        })

        if (analyzeRes.ok) {
          const decisionData = (await analyzeRes.json()) as ReasoningDecision
          setHypotheses((prev) => [...prev, decisionData.hypothesis])
          setExpansionHistory((prev) => [
            ...prev,
            {
              round,
              action: decisionData.action,
              rationale: decisionData.rationale,
            },
          ])

          if (decisionData.action !== "proceed" && round <= 2) {
            // Store pending decision for user confirmation
            pendingDecisionRef.current = decisionData

            const actionLabel = decisionData.action === "expand_3d_similar"
              ? "Search for structurally similar compounds"
              : decisionData.action === "expand_class"
                ? "Expand to related drug classes"
                : decisionData.action

            addMessage(
              "assistant",
              `**AI Analysis:** ${decisionData.rationale}\n\n**Suggestion:** ${actionLabel}`,
              [
                {
                  id: "approve-expansion",
                  label: `Yes, ${actionLabel.toLowerCase()}`,
                  value: "approve-expansion",
                  variant: "primary",
                },
                {
                  id: "skip-expansion",
                  label: "No, I'm done",
                  value: "skip-expansion",
                  variant: "outline",
                },
              ]
            )

            setPhase("done")
            setStatusMessage("")
            simulatingRef.current = false
            return
          }
        }
      } catch (err) {
        console.error("Analysis error:", err)
      }

      setPhase("done")
      setStatusMessage("")

      addMessage(
        "assistant",
        "Pipeline complete! You can click any drug in the table for details, ask me questions about the results, or generate a full report.",
      )
    } catch (error) {
      console.error("Simulation error:", error)
      const errMsg =
        error instanceof Error ? error.message : "Unknown error"
      setStatusMessage(`Error: ${errMsg}`)
      addMessage("assistant", `An error occurred during docking: ${errMsg}`)
      setPhase("done")
    } finally {
      simulatingRef.current = false
    }
  }, [
    targets,
    round,
    query,
    hypotheses,
    expansionHistory,
    proteinNames,
    allDockingResults,
    addMessage,
  ])

  // Handle expand similar — find similar compounds and show them for selection (no auto-dock)
  const handleExpandSimilar = useCallback(async () => {
    if (allDockingResults.length === 0) return

    setPhase("expanding")
    setStatusMessage("Searching for structurally similar compounds...")

    try {
      // Get CIDs from selected drugs first, then fall back to top results
      const seedCids: number[] = []
      const currentDrugs = drugsRef.current
      const currentSelectedIds = selectedDrugIdsRef.current
      const selectedNames = currentDrugs
        ? new Set(
            currentDrugs
              .filter((d) => currentSelectedIds.has(d.id))
              .map((d) => d.name.toLowerCase())
          )
        : new Set<string>()

      // Prefer selected drugs' CIDs
      for (const r of allDockingResults) {
        if (selectedNames.size > 0 && !selectedNames.has(r.name.toLowerCase())) continue
        const src = r.source || ""
        if (src.startsWith("pubchem_cid_")) {
          const cid = parseInt(src.split("_").pop() || "", 10)
          if (!isNaN(cid) && !seedCids.includes(cid)) seedCids.push(cid)
        }
        if (seedCids.length >= 5) break
      }

      // Fallback: if no selected drugs had CIDs, use top results
      if (seedCids.length === 0) {
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

      addMessage(
        "assistant",
        `Searching for 3D-similar compounds using ${seedCids.length} seed molecules...`
      )

      const expandDecision: ReasoningDecision = {
        action: "expand_3d_similar",
        rationale: "User requested search for similar compounds",
        hypothesis: "Structurally similar compounds may bind targets",
        seedCids,
      }

      const expandRes = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: expandDecision,
          proteins: proteinNames,
          existingTargets: targets,
          allDockingResults,
        }),
      })

      if (expandRes.ok) {
        const expandData = await expandRes.json()
        const newTargets = expandData.newTargets as DockingTarget[]

        if (newTargets.length > 0) {
          // Build drug entries, tracking which proteins each ligand was found for
          const ligandProteinMap = new Map<string, Set<string>>()
          const ligandData = new Map<string, { lig: typeof newTargets[0]["ligands"][0] }>()

          for (const target of newTargets) {
            for (const lig of target.ligands) {
              const key = lig.name.toLowerCase()
              if (!ligandProteinMap.has(key)) {
                ligandProteinMap.set(key, new Set())
                ligandData.set(key, { lig })
              }
              ligandProteinMap.get(key)!.add(target.protein)
            }
          }

          const newDrugEntries: Drug[] = []
          const latestDrugs = drugsRef.current
          let ligandIndex = latestDrugs?.length ?? 0

          for (const [key, proteins] of ligandProteinMap) {
            const { lig } = ligandData.get(key)!
            newDrugEntries.push({
              id: `expand-${ligandIndex++}`,
              name: lig.name,
              mechanism: lig.mechanism,
              fdaStatus: lig.fdaStatus,
              fdaCategory: parseFdaCategory(lig.fdaStatus),
              targetProteins: [...proteins],
              category: "repurposing_candidate",
              smiles: lig.smiles,
              source: lig.source,
              confidenceScore: null,
              proteinTarget: null,
              round: round + 1,
            })
          }

          // Merge new targets with existing targets
          setTargets((prev) => {
            const merged = [...prev]
            for (const nt of newTargets) {
              const existing = merged.find((t) => t.protein === nt.protein)
              if (existing) {
                // Append new ligands to existing target
                const existingSmiles = new Set(existing.ligands.map((l) => l.smiles))
                const uniqueNew = nt.ligands.filter((l) => !existingSmiles.has(l.smiles))
                existing.ligands = [...existing.ligands, ...uniqueNew]
              } else {
                merged.push(nt)
              }
            }
            return merged
          })

          // Add new drugs to the table (keep existing docked results + add new undocked, dedup)
          const currentDrugsList = latestDrugs || []
          const mergedDrugs = mergeDuplicateDrugs([...currentDrugsList, ...newDrugEntries])
          setDrugs(mergedDrugs)

          // Auto-select the new drugs
          setSelectedDrugIds((prev) => {
            const next = new Set(prev)
            for (const d of newDrugEntries) next.add(d.id)
            return next
          })

          // Reset sim statuses for new drugs (keep existing ones as complete)
          setDrugSimStatuses((prev) => {
            const next = { ...prev }
            for (const d of newDrugEntries) {
              next[d.id] = "idle"
            }
            return next
          })

          addMessage(
            "assistant",
            `Found ${newDrugEntries.length} similar compounds! They've been added to the table and auto-selected. Review them and click "Run DiffDock" when ready.`,
            [
              {
                id: "dock-selected",
                label: `Dock ${newDrugEntries.length} new compounds`,
                value: "dock-selected",
                variant: "primary",
              },
              {
                id: "select-expand",
                label: "Let me select which to dock",
                value: "select-drugs",
                variant: "outline",
              },
            ]
          )

          // Set phase to review-ready so checkboxes + Run DiffDock button appear
          setPhase("review-ready")
          setStatusMessage("")
        } else {
          addMessage(
            "assistant",
            "No new similar compounds found beyond what we already have."
          )
          setPhase("done")
          setStatusMessage("")
        }
      } else {
        setPhase("done")
        setStatusMessage("")
      }
    } catch (error) {
      console.error("Expand error:", error)
      addMessage(
        "assistant",
        `Error searching similar compounds: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      setPhase("done")
      setStatusMessage("")
    }
  }, [
    allDockingResults,
    proteinNames,
    targets,
    round,
    addMessage,
  ])

  // Handle user-approved AI expansion (from reasoning loop)
  const handleApproveExpansion = useCallback(async () => {
    const decision = pendingDecisionRef.current
    if (!decision) return
    pendingDecisionRef.current = null

    setPhase("expanding")
    setStatusMessage(`Expanding search: ${decision.action}...`)
    addMessage("system", `Expanding search: ${decision.action}`)

    try {
      const expandRes = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          proteins: proteinNames,
          existingTargets: targets,
          allDockingResults,
        }),
      })

      if (!expandRes.ok) {
        addMessage("assistant", "Expansion failed. You can still generate a report or search similar compounds manually.")
        setPhase("done")
        setStatusMessage("")
        return
      }

      const expandData = await expandRes.json()
      const newTargets = expandData.newTargets as DockingTarget[]

      if (newTargets.length === 0) {
        addMessage("assistant", "No new compounds found from expansion. You can search similar compounds manually or generate a report.")
        setPhase("done")
        setStatusMessage("")
        return
      }

      setRound((prev) => prev + 1)

      // Build drug entries from expansion results
      const ligandProteinMap = new Map<string, Set<string>>()
      const ligandData = new Map<string, { lig: typeof newTargets[0]["ligands"][0] }>()

      for (const target of newTargets) {
        for (const lig of target.ligands) {
          const key = lig.name.toLowerCase()
          if (!ligandProteinMap.has(key)) {
            ligandProteinMap.set(key, new Set())
            ligandData.set(key, { lig })
          }
          ligandProteinMap.get(key)!.add(target.protein)
        }
      }

      const newDrugEntries: Drug[] = []
      const latestDrugs = drugsRef.current
      let ligandIndex = latestDrugs?.length ?? 0

      for (const [key, proteins] of ligandProteinMap) {
        const { lig } = ligandData.get(key)!
        newDrugEntries.push({
          id: `expand-${ligandIndex++}`,
          name: lig.name,
          mechanism: lig.mechanism,
          fdaStatus: lig.fdaStatus,
          fdaCategory: parseFdaCategory(lig.fdaStatus),
          targetProteins: [...proteins],
          category: "repurposing_candidate",
          smiles: lig.smiles,
          source: lig.source,
          confidenceScore: null,
          proteinTarget: null,
          round: round + 1,
        })
      }

      // Merge targets
      setTargets((prev) => {
        const merged = [...prev]
        for (const nt of newTargets) {
          const existing = merged.find((t) => t.protein === nt.protein)
          if (existing) {
            const existingSmiles = new Set(existing.ligands.map((l) => l.smiles))
            const uniqueNew = nt.ligands.filter((l) => !existingSmiles.has(l.smiles))
            existing.ligands = [...existing.ligands, ...uniqueNew]
          } else {
            merged.push(nt)
          }
        }
        return merged
      })

      // Add to drug table
      const currentDrugsList = latestDrugs || []
      const mergedDrugs = mergeDuplicateDrugs([...currentDrugsList, ...newDrugEntries])
      setDrugs(mergedDrugs)

      // Auto-select new drugs
      setSelectedDrugIds((prev) => {
        const next = new Set(prev)
        for (const d of newDrugEntries) next.add(d.id)
        return next
      })

      setDrugSimStatuses((prev) => {
        const next = { ...prev }
        for (const d of newDrugEntries) next[d.id] = "idle"
        return next
      })

      addMessage(
        "assistant",
        `Found ${newDrugEntries.length} new compounds from AI expansion! They've been added to the table. Dock them or generate a report.`,
        [
          {
            id: "dock-expanded",
            label: `Dock ${newDrugEntries.length} new compounds`,
            value: "dock-selected",
            variant: "primary",
          },
          {
            id: "skip-dock",
            label: "Skip docking, generate report",
            value: "generate-report",
            variant: "outline",
          },
        ]
      )

      setPhase("review-ready")
      setStatusMessage("")
    } catch (error) {
      console.error("Expansion error:", error)
      addMessage("assistant", `Expansion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setPhase("done")
      setStatusMessage("")
    }
  }, [allDockingResults, proteinNames, targets, round, addMessage])

  // ---------- Report Generation (on-demand) ----------
  const handleGenerateReport = useCallback(async () => {
    if (reportGenerating || allDockingResults.length === 0) return
    setReportGenerating(true)
    setStatusMessage("Generating results report...")
    addMessage("system", "Generating full report and paper...")

    try {
      // Step 1: Generate results report
      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancerType: query,
          allResults: allDockingResults,
          targets,
        }),
      })

      let newResultsMd = ""
      if (reportRes.ok) {
        const reportData = await reportRes.json()
        newResultsMd = reportData.resultsMd
        setResultsMd(newResultsMd)
      }

      // Step 2: Generate final paper
      setStatusMessage("Assembling final paper...")
      const paperRes = await fetch("/api/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewMd, resultsMd: newResultsMd }),
      })

      if (paperRes.ok) {
        const paperData = await paperRes.json()
        if (paperData.paperMd) {
          setPaperMd(paperData.paperMd)
          setStatusMessage("")
          addMessage(
            "assistant",
            "Report generated! Click \"View Report\" below the table to read it.",
          )
        } else {
          setStatusMessage("")
          addMessage("assistant", "Report generated but paper assembly returned empty. The results report is still available.")
        }
      } else {
        setStatusMessage("")
        addMessage("assistant", "Report generated but paper assembly failed. Try again.")
      }
    } catch (error) {
      console.error("Report generation error:", error)
      const errMsg = error instanceof Error ? error.message : "Unknown error"
      setStatusMessage(`Error: ${errMsg}`)
      addMessage("assistant", `Error generating report: ${errMsg}`)
    } finally {
      setReportGenerating(false)
    }
  }, [reportGenerating, allDockingResults, query, targets, reviewMd, addMessage])

  // ---------- Chat Action Handler ----------
  const handleActionClick = useCallback(
    (action: ChatAction) => {
      const val = action.value

      if (val.startsWith("query:")) {
        // Example query clicked
        const q = val.slice(6)
        handleSubmitQuery(q)
      } else if (val === "dock-all") {
        // Select all drugs and start docking
        const currentDrugs = drugsRef.current
        if (currentDrugs) {
          const allIds = new Set(currentDrugs.map((d) => d.id))
          setSelectedDrugIds(allIds)
          // Update ref immediately so handleStartSimulation sees the new value
          selectedDrugIdsRef.current = allIds
        }
        addMessage("user", "Dock all candidates")
        handleStartSimulation()
      } else if (val === "dock-selected") {
        // Dock only the currently selected drugs (after expansion) — skip reasoning
        addMessage("user", "Dock selected compounds")
        skipReasoningRef.current = true
        handleStartSimulation()
      } else if (val === "select-drugs") {
        addMessage("user", "I'll select drugs manually")
        addMessage(
          "assistant",
          "Use the checkboxes in the drug table to select which candidates to dock, then click the \"Run DiffDock\" button when ready."
        )
      } else if (val === "search-similar") {
        addMessage("user", "Search similar compounds")
        addMessage(
          "assistant",
          "Searching for structurally similar compounds to the top hits..."
        )
        // Trigger expand flow with 3D similarity
        handleExpandSimilar()
      } else if (val === "approve-expansion") {
        addMessage("user", "Yes, expand the search")
        handleApproveExpansion()
      } else if (val === "skip-expansion") {
        addMessage("user", "No, I'm done")
        pendingDecisionRef.current = null
        addMessage(
          "assistant",
          "No problem! You can search similar compounds, generate a report, or ask questions about the results.",
          [
            {
              id: "search-similar",
              label: "Search similar compounds",
              value: "search-similar",
              variant: "primary",
            },
            {
              id: "generate-report",
              label: "Generate full report",
              value: "generate-report",
              variant: "outline",
            },
          ]
        )
      } else if (val === "generate-report") {
        addMessage("user", "Generate report")
        handleGenerateReport()
      }
    },
    [handleSubmitQuery, handleStartSimulation, handleExpandSimilar, handleApproveExpansion, handleGenerateReport, addMessage]
  )

  // Handle free-text chat messages (post-docking Q&A)
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (phase === "idle") {
        // Treat as a query
        handleSubmitQuery(message)
        return
      }

      addMessage("user", message)

      // If post-docking, call chat API
      if (
        phase === "done" ||
        phase === "review-ready" ||
        phase === "reporting" ||
        phase === "generating-paper"
      ) {
        try {
          const context = {
            cancerType: query,
            proteins: proteinNames,
            dockingResults: allDockingResults.slice(0, 10).map((r) => ({
              name: r.name,
              confidence: r.confidenceScore,
              protein: r.proteinTarget,
              mechanism: r.mechanism,
            })),
            reviewSummary: reviewMd.slice(0, 2000),
          }

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: message, context }),
          })

          if (res.ok) {
            const data = await res.json()
            addMessage("assistant", data.answer)
          } else {
            addMessage(
              "assistant",
              "Sorry, I couldn't process that question. Try asking something else."
            )
          }
        } catch {
          addMessage(
            "assistant",
            "Sorry, I couldn't process that question. Try asking something else."
          )
        }
      }
    },
    [
      phase,
      query,
      proteinNames,
      allDockingResults,
      reviewMd,
      handleSubmitQuery,
      addMessage,
    ]
  )

  // Determine simulation phase for DataPanel
  const simulationPhase: "idle" | "ready" | "running" | "complete" =
    phase === "simulating" || phase === "reasoning" || phase === "expanding"
      ? "running"
      : phase === "done" ||
          phase === "reporting" ||
          phase === "generating-paper"
        ? "complete"
        : phase === "review-ready"
          ? "ready"
          : "idle"

  const isLoading = phase === "reviewing" || phase === "fetching-structures"

  // Chat input enabled when idle or done
  const chatInputEnabled =
    phase === "idle" ||
    phase === "done" ||
    phase === "review-ready"

  const chatInputPlaceholder =
    phase === "idle"
      ? "Describe a disease or condition to analyze..."
      : phase === "done"
        ? "Ask about results..."
        : phase === "review-ready"
          ? "Ask about the review, or click an action above..."
          : "Processing..."

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader />
      {statusMessage && (
        <div className="border-b border-primary/20 bg-primary/5 px-6 py-1.5">
          <p className="text-xs text-primary">{statusMessage}</p>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        {/* Left Panel */}
        <aside
          className="flex shrink-0 flex-col bg-card"
          style={{ width: leftPanelWidth }}
        >
          <ResearchPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onActionClick={handleActionClick}
            isInputEnabled={chatInputEnabled}
            inputPlaceholder={chatInputPlaceholder}
          />
        </aside>

        <ResizeHandle onResize={handleLeftResize} side="right" />

        {/* Middle Panel */}
        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <DataPanel
            isLoading={isLoading}
            proteins={proteins}
            drugs={drugs}
            selectedDrugId={selectedDrug?.id ?? null}
            onSelectDrug={setSelectedDrug}
            simulationPhase={simulationPhase}
            drugSimStatuses={drugSimStatuses}
            onStartSimulation={handleStartSimulation}
            onSearchSimilar={handleExpandSimilar}
            selectedDrugIds={selectedDrugIds}
            onToggleDrugSelection={handleToggleDrugSelection}
            onSelectAllDrugs={handleSelectAllDrugs}
            onDeselectAllDrugs={handleDeselectAllDrugs}
            onGenerateReport={handleGenerateReport}
            onViewReport={() => { setShowReportPanel(true); setSelectedDrug(null) }}
            reportGenerating={reportGenerating}
            hasReport={!!paperMd}
          />
        </main>

        <ResizeHandle onResize={handleRightResize} side="left" />

        {/* Right Panel */}
        <aside
          className="flex shrink-0 flex-col bg-card"
          style={{ width: rightPanelWidth }}
        >
          {showReportPanel && paperMd ? (
            <ReportPanel
              paperMd={paperMd}
              onClose={() => setShowReportPanel(false)}
            />
          ) : (
            <DrugDetailPanel
              drug={selectedDrug}
              onClose={() => setSelectedDrug(null)}
              simulationRunningDrug={simulationRunningDrug}
            />
          )}
        </aside>
      </div>
    </div>
  )
}
