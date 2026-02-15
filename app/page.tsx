"use client"

import { useState, useCallback, useRef } from "react"
import { AppHeader } from "@/components/app-header"
import { ResearchPanel } from "@/components/research-panel"
import { DataPanel, type SimulationStatus } from "@/components/data-panel"
import { DrugDetailPanel } from "@/components/drug-detail-panel"
import {
  mockProteins,
  mockDrugs,
  literatureReviewSummary,
  type Drug,
  type Protein,
} from "@/lib/mock-data"

type AppPhase = "idle" | "analyzing" | "review-ready" | "simulating" | "done"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ResizeHandle({
  onResize,
  side = "right",
}: {
  onResize: (deltaX: number) => void
  side?: "right" | "left"
}) {
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      dragging.current = true
      lastX.current = e.clientX
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    []
  )

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
      {/* Wider hit area */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      {/* Visible line */}
      <div className="absolute inset-y-0 w-px bg-border transition-colors group-hover:bg-primary/60 group-active:bg-primary" />
      {/* Drag indicator dots */}
      <div className="absolute flex flex-col gap-1 rounded-full bg-card px-0.5 py-2 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
      </div>
    </div>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("idle")
  const [query, setQuery] = useState("")
  const [leftPanelWidth, setLeftPanelWidth] = useState(340)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)

  // Data states - progressively populated
  const [literatureReview, setLiteratureReview] = useState<
    typeof literatureReviewSummary | null
  >(null)
  const [proteins, setProteins] = useState<Protein[] | null>(null)
  const [drugs, setDrugs] = useState<Drug[] | null>(null)

  // Drug detail state
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [simulationRunningDrug, setSimulationRunningDrug] =
    useState<Drug | null>(null)

  // Simulation statuses per drug
  const [drugSimStatuses, setDrugSimStatuses] = useState<
    Record<string, SimulationStatus>
  >({})

  const simulatingRef = useRef(false)

  const handleLeftResize = useCallback((delta: number) => {
    setLeftPanelWidth((prev) => Math.min(600, Math.max(240, prev + delta)))
  }, [])

  // For right panel, dragging left (negative delta) should increase width
  const handleRightResize = useCallback((delta: number) => {
    setRightPanelWidth((prev) => Math.min(600, Math.max(280, prev - delta)))
  }, [])

  const handleSubmitQuery = useCallback(async (userQuery: string) => {
    setQuery(userQuery)
    setPhase("analyzing")

    // Simulate literature review loading (~2.5s)
    await sleep(2500)
    setLiteratureReview({
      ...literatureReviewSummary,
      query: userQuery,
    })

    // Simulate protein identification (~1.5s after lit review)
    await sleep(1500)
    setProteins(mockProteins)

    // Simulate drug identification (~1.5s after proteins)
    await sleep(1500)
    setDrugs(mockDrugs)

    setPhase("review-ready")
  }, [])

  const handleStartSimulation = useCallback(async () => {
    if (simulatingRef.current || !drugs) return
    simulatingRef.current = true
    setPhase("simulating")

    // Initialize all drug statuses to "waiting"
    const initialStatuses: Record<string, SimulationStatus> = {}
    for (const drug of drugs) {
      initialStatuses[drug.id] = "waiting"
    }
    setDrugSimStatuses(initialStatuses)
    setSelectedDrug(null)

    // Run simulations sequentially
    for (let i = 0; i < drugs.length; i++) {
      const drug = drugs[i]

      // Set current drug to "running"
      setDrugSimStatuses((prev) => ({ ...prev, [drug.id]: "running" }))
      setSimulationRunningDrug(drug)

      // For the first drug, no previous results exist yet
      if (i === 0) {
        setSelectedDrug(null)
      }

      // Simulate processing time (2-3.5s per drug)
      await sleep(2000 + Math.random() * 1500)

      // Mark complete, clear running state, and show this drug's result
      setDrugSimStatuses((prev) => ({ ...prev, [drug.id]: "complete" }))
      setSimulationRunningDrug(null)
      setSelectedDrug(drug)
    }

    setPhase("done")
    simulatingRef.current = false
  }, [drugs])

  // Determine simulation phase for DataPanel
  const simulationPhase: "idle" | "ready" | "running" | "complete" =
    phase === "simulating"
      ? "running"
      : phase === "done"
        ? "complete"
        : phase === "review-ready"
          ? "ready"
          : "idle"

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        {/* Left Panel - Research Query & Literature Review */}
        <aside
          className="flex shrink-0 flex-col bg-card"
          style={{ width: leftPanelWidth }}
        >
          <ResearchPanel
            phase={phase}
            query={query}
            isLoading={phase === "analyzing"}
            literatureReview={literatureReview}
            onSubmitQuery={handleSubmitQuery}
          />
        </aside>

        {/* Left Resize Handle */}
        <ResizeHandle onResize={handleLeftResize} side="right" />

        {/* Middle Panel - Proteins & Drugs Tables */}
        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <DataPanel
            isLoading={phase === "analyzing"}
            proteins={proteins}
            drugs={drugs}
            selectedDrugId={selectedDrug?.id ?? null}
            onSelectDrug={setSelectedDrug}
            simulationPhase={simulationPhase}
            drugSimStatuses={drugSimStatuses}
            onStartSimulation={handleStartSimulation}
          />
        </main>

        {/* Right Resize Handle */}
        <ResizeHandle onResize={handleRightResize} side="left" />

        {/* Right Panel - Drug Details */}
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
