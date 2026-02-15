"use client"

import { useState, useCallback, useRef } from "react"
import { AppHeader } from "@/components/app-header"
import { ResearchPanel } from "@/components/research-panel"
import { DataPanel, type SimulationStatus } from "@/components/data-panel"
import { DrugDetailPanel } from "@/components/drug-detail-panel"
import type { Drug, Protein, LiteratureReview } from "@/lib/mock-data"
import type {
  ReviewDrug,
  DockingTarget,
  DockingResult,
  ReasoningDecision,
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

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("idle")
  const [query, setQuery] = useState("")
  const [leftPanelWidth, setLeftPanelWidth] = useState(340)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)
  const [statusMessage, setStatusMessage] = useState("")

  // Pipeline data
  const [literatureReview, setLiteratureReview] =
    useState<LiteratureReview | null>(null)
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
  const [decision, setDecision] = useState<ReasoningDecision | null>(null)
  const [reviewMd, setReviewMd] = useState("")
  const [resultsMd, setResultsMd] = useState("")
  const [paperMd, setPaperMd] = useState("")

  const simulatingRef = useRef(false)

  const handleLeftResize = useCallback((delta: number) => {
    setLeftPanelWidth((prev) => Math.min(600, Math.max(240, prev + delta)))
  }, [])

  const handleRightResize = useCallback((delta: number) => {
    setRightPanelWidth((prev) => Math.min(600, Math.max(280, prev - delta)))
  }, [])

  // ---------- Step 1: Literature Review (SSE) ----------
  const handleSubmitQuery = useCallback(async (userQuery: string) => {
    setQuery(userQuery)
    setPhase("reviewing")
    setStatusMessage("Starting literature review...")

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

      if (!reviewRes.ok) throw new Error(`Review API error: ${reviewRes.status}`)

      await readSSEStream(reviewRes, (event) => {
        if (event.type === "progress") {
          setStatusMessage(event.message as string)
        } else if (event.type === "proteins") {
          // Proteins discovered — populate table immediately
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
        } else if (event.type === "review") {
          // Literature review text ready
          finalReviewMd = event.reviewMd as string
          papersAnalyzed = (event.papersAnalyzed as number) || 0
          setLiteratureReview({
            query: userQuery,
            papersAnalyzed,
            reviewMd: finalReviewMd,
          })
          setReviewMd(finalReviewMd)
        } else if (event.type === "drugs") {
          // Drugs extracted — populate table
          reviewDrugs = event.drugs as ReviewDrug[]
          const displayDrugs = reviewDrugs.map(reviewDrugToDisplay)
          setDrugs(displayDrugs)
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
          // A single protein target is ready — update its PDB ID in the table
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
          // All targets ready
          const finalTargets = (event.targets as DockingTarget[]) || collectedTargets
          setTargets(finalTargets)
        } else if (event.type === "error") {
          console.error("Structures error:", event.message)
        }
      })

      // Fallback if complete event didn't fire properly
      if (collectedTargets.length > 0) {
        setTargets((prev) => prev.length > 0 ? prev : collectedTargets)
      }

      setPhase("review-ready")
      setStatusMessage("")
    } catch (error) {
      console.error("Pipeline error:", error)
      setStatusMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      setPhase("idle")
    }
  }, [])

  // ---------- Step 2: Docking ----------
  const handleStartSimulation = useCallback(async () => {
    if (simulatingRef.current || !drugs || targets.length === 0) return
    simulatingRef.current = true
    setPhase("simulating")
    setSelectedDrug(null)

    // Initialize all drug statuses to "waiting"
    const initialStatuses: Record<string, SimulationStatus> = {}
    for (const drug of drugs) {
      initialStatuses[drug.id] = "waiting"
    }
    setDrugSimStatuses(initialStatuses)

    try {
      const res = await fetch("/api/dock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets, round }),
      })

      if (!res.ok) throw new Error(`Dock API error: ${res.status}`)

      let completedResults: DockingResult[] = []

      await readSSEStream(res, (event) => {
        if (event.type === "progress") {
          setStatusMessage(event.message as string)
        } else if (event.type === "target_complete") {
          const targetResults = event.results as DockingResult[]
          completedResults = [...completedResults, ...targetResults]

          setDrugSimStatuses((prev) => {
            const next = { ...prev }
            for (const r of targetResults) {
              const matchingDrug = drugs.find(
                (d) =>
                  d.name.toLowerCase() === r.name.toLowerCase()
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
          console.error("Docking error:", event.message)
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

      // Create display drugs from docking results (sorted by score)
      const sortedResults = [...completedResults].sort(
        (a, b) => b.confidenceScore - a.confidenceScore
      )
      const dockedDrugs = sortedResults.map(dockingResultToDisplay)
      setDrugs(dockedDrugs)

      // Reinitialize sim statuses for new drugs
      const newStatuses: Record<string, SimulationStatus> = {}
      for (const d of dockedDrugs) {
        newStatuses[d.id] = "complete"
      }
      setDrugSimStatuses(newStatuses)

      // ---------- Step 3: Reasoning Loop ----------
      setPhase("reasoning")
      setStatusMessage("AI is analyzing docking patterns...")

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

      if (!analyzeRes.ok)
        throw new Error(`Analyze API error: ${analyzeRes.status}`)
      const decisionData = (await analyzeRes.json()) as ReasoningDecision
      setDecision(decisionData)
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
        // Expansion round
        setPhase("expanding")
        setStatusMessage(
          `Expanding search: ${decisionData.action} — ${decisionData.rationale}`
        )

        const expandRes = await fetch("/api/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: decisionData,
            proteins: proteinNames,
            existingTargets: targets,
            allDockingResults: newAllResults,
          }),
        })

        if (expandRes.ok) {
          const expandData = await expandRes.json()
          const newTargets = expandData.newTargets as DockingTarget[]

          if (newTargets.length > 0) {
            setRound((prev) => prev + 1)

            // Dock the new targets
            setPhase("simulating")
            setStatusMessage("Docking expanded compounds...")

            const dockRes2 = await fetch("/api/dock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                targets: newTargets,
                round: round + 1,
              }),
            })

            if (dockRes2.ok && dockRes2.body) {
              let expansionResults: DockingResult[] = []

              await readSSEStream(dockRes2, (event) => {
                if (event.type === "progress")
                  setStatusMessage(event.message as string)
                if (event.type === "complete")
                  expansionResults = event.allResults as DockingResult[]
              })

              // Merge all results
              const mergedResults = [...newAllResults, ...expansionResults]
              setAllDockingResults(mergedResults)

              const mergedSorted = [...mergedResults].sort(
                (a, b) => b.confidenceScore - a.confidenceScore
              )
              const mergedDrugs = mergedSorted.map(dockingResultToDisplay)
              setDrugs(mergedDrugs)

              const mergedStatuses: Record<string, SimulationStatus> = {}
              for (const d of mergedDrugs) mergedStatuses[d.id] = "complete"
              setDrugSimStatuses(mergedStatuses)
            }
          }
        }
      }

      // ---------- Step 4: Report Generation ----------
      setPhase("reporting")
      setStatusMessage("Generating results report...")

      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancerType: query,
          allResults: allDockingResults.length > 0 ? allDockingResults : completedResults,
          targets,
        }),
      })

      if (reportRes.ok) {
        const reportData = await reportRes.json()
        setResultsMd(reportData.resultsMd)
      }

      // ---------- Step 5: Paper Generation ----------
      setPhase("generating-paper")
      setStatusMessage("Assembling final paper...")

      const paperRes = await fetch("/api/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewMd, resultsMd }),
      })

      if (paperRes.ok) {
        const paperData = await paperRes.json()
        setPaperMd(paperData.paperMd)
      }

      setPhase("done")
      setStatusMessage("")
    } catch (error) {
      console.error("Simulation error:", error)
      setStatusMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      setPhase("done")
    } finally {
      simulatingRef.current = false
    }
  }, [
    drugs,
    targets,
    round,
    query,
    hypotheses,
    expansionHistory,
    proteinNames,
    allDockingResults,
    reviewMd,
    resultsMd,
  ])

  // Determine simulation phase for DataPanel
  const simulationPhase: "idle" | "ready" | "running" | "complete" =
    phase === "simulating" || phase === "reasoning" || phase === "expanding"
      ? "running"
      : phase === "done" || phase === "reporting" || phase === "generating-paper"
        ? "complete"
        : phase === "review-ready"
          ? "ready"
          : "idle"

  const isLoading =
    phase === "reviewing" || phase === "fetching-structures"

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
            phase={phase}
            query={query}
            isLoading={isLoading}
            literatureReview={literatureReview}
            onSubmitQuery={handleSubmitQuery}
            decision={decision}
            reportMd={resultsMd}
            paperMd={paperMd}
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
          />
        </main>

        <ResizeHandle onResize={handleRightResize} side="left" />

        {/* Right Panel */}
        <aside
          className="flex shrink-0 flex-col bg-card"
          style={{ width: rightPanelWidth }}
        >
          <DrugDetailPanel
            drug={selectedDrug}
            onClose={() => setSelectedDrug(null)}
            simulationRunningDrug={simulationRunningDrug}
          />
        </aside>
      </div>
    </div>
  )
}
