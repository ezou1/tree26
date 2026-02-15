"use client"

import {
  Microscope,
  Pill,
  ArrowUpRight,
  TrendingUp,
  Play,
  Loader2,
  CheckCircle2,
  Clock,
  FlaskConical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Protein, Drug } from "@/lib/mock-data"

export type SimulationStatus = "idle" | "running" | "complete" | "waiting"

function ConfidenceBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[10px] text-muted-foreground/40">—</span>

  // Value is 0-1 from docking, display as percentage
  const pct = Math.round(value * 100)
  const color =
    pct >= 85 ? "bg-primary" : pct >= 70 ? "bg-chart-2" : "bg-chart-3"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function FdaStatusBadge({ status }: { status: Drug["fdaCategory"] }) {
  const config: Record<
    Drug["fdaCategory"],
    { label: string; className: string }
  > = {
    approved: {
      label: "FDA Approved",
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    "phase-3": {
      label: "Phase 3",
      className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    },
    "phase-2": {
      label: "Phase 2",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    },
    "phase-1": {
      label: "Phase 1",
      className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    },
    preclinical: {
      label: "Preclinical",
      className:
        "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
    },
  }
  const c = config[status]

  return (
    <Badge variant="outline" className={`text-[10px] ${c.className}`}>
      {c.label}
    </Badge>
  )
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-secondary/60 ${className ?? ""}`}
    />
  )
}

function DrugSimStatusIcon({
  status,
}: {
  status: SimulationStatus
}) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    case "running":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
    case "waiting":
      return <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
    default:
      return null
  }
}

interface DataPanelProps {
  isLoading: boolean
  proteins: Protein[] | null
  drugs: Drug[] | null
  selectedDrugId: string | null
  onSelectDrug: (drug: Drug) => void
  simulationPhase: "idle" | "ready" | "running" | "complete"
  drugSimStatuses: Record<string, SimulationStatus>
  onStartSimulation: () => void
}

export function DataPanel({
  isLoading,
  proteins,
  drugs,
  selectedDrugId,
  onSelectDrug,
  simulationPhase,
  drugSimStatuses,
  onStartSimulation,
}: DataPanelProps) {
  const showProteins = proteins && proteins.length > 0
  const showDrugs = drugs && drugs.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Proteins Table */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between border-b border-border p-4 pb-3">
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Proteins
            </h2>
          </div>
          {showProteins && (
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-[10px] text-primary"
            >
              {proteins.length} identified
            </Badge>
          )}
        </div>

        {isLoading && !showProteins ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                Identifying target proteins...
              </span>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <SkeletonPulse className="h-8 w-40" />
                <SkeletonPulse className="h-5 w-12" />
                <SkeletonPulse className="h-5 w-32 flex-1" />
                <SkeletonPulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : showProteins ? (
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Protein
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Gene
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    PDB ID
                  </TableHead>
                  <TableHead className="h-8 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proteins.map((protein) => (
                  <TableRow
                    key={protein.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="py-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {protein.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {protein.role}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-primary">
                        {protein.gene}
                      </code>
                    </TableCell>
                    <TableCell className="py-2">
                      {protein.pdbId ? (
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {protein.pdbId}
                        </code>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all ${
                              protein.confidence >= 85
                                ? "bg-primary"
                                : protein.confidence >= 70
                                  ? "bg-chart-2"
                                  : "bg-chart-3"
                            }`}
                            style={{ width: `${protein.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {protein.confidence}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/50">
            Waiting for analysis to begin...
          </div>
        )}
      </div>

      {/* Drugs Table */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border p-4 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Candidate Drugs
            </h2>
          </div>
          {showDrugs && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">
                {drugs.some((d) => d.confidenceScore !== null)
                  ? "Ranked by docking score"
                  : "From literature review"}
              </span>
            </div>
          )}
        </div>

        {isLoading && !showDrugs ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                Identifying candidate drugs...
              </span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <SkeletonPulse className="h-8 w-28" />
                <SkeletonPulse className="h-5 w-36" />
                <SkeletonPulse className="h-4 w-16" />
                <SkeletonPulse className="h-5 w-20" />
                <SkeletonPulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : showDrugs ? (
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {(simulationPhase === "running" ||
                    simulationPhase === "complete") && (
                    <TableHead className="h-8 w-10 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="sr-only">Simulation Status</span>
                    </TableHead>
                  )}
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Drug
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mechanism
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Targets
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-8 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Score
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugs.map((drug) => {
                  const simStatus = drugSimStatuses[drug.id] ?? "idle"
                  const isClickable =
                    simulationPhase === "complete" ||
                    simStatus === "complete"
                  const isRunning = simStatus === "running"

                  return (
                    <TableRow
                      key={drug.id}
                      className={`border-border transition-colors ${
                        isRunning
                          ? "bg-primary/5"
                          : selectedDrugId === drug.id
                            ? "bg-primary/5 hover:bg-primary/10"
                            : isClickable
                              ? "cursor-pointer hover:bg-secondary/50"
                              : ""
                      }`}
                      onClick={() => isClickable && onSelectDrug(drug)}
                      role={isClickable ? "button" : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (
                          isClickable &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault()
                          onSelectDrug(drug)
                        }
                      }}
                    >
                      {(simulationPhase === "running" ||
                        simulationPhase === "complete") && (
                        <TableCell className="w-10 py-2.5 text-center">
                          <DrugSimStatusIcon status={simStatus} />
                        </TableCell>
                      )}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium ${isRunning ? "text-primary" : "text-foreground"}`}
                          >
                            {drug.name}
                          </span>
                          {drug.round > 1 && (
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-[9px] text-primary"
                            >
                              R{drug.round}
                            </Badge>
                          )}
                          {isClickable && (
                            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] py-2.5 text-xs text-secondary-foreground">
                        <span className="line-clamp-1">{drug.mechanism}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {drug.targetProteins.map((target) => (
                            <code
                              key={target}
                              className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px] text-primary"
                            >
                              {target}
                            </code>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <FdaStatusBadge status={drug.fdaCategory} />
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <ConfidenceBar value={drug.confidenceScore} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/50">
            Waiting for analysis to begin...
          </div>
        )}

        {/* Simulation Button */}
        {simulationPhase === "ready" && (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={onStartSimulation}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Play className="h-4 w-4" />
              Run DiffDock Simulation
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Runs molecular docking on RunPod GPU for each candidate
            </p>
          </div>
        )}

        {/* Simulation Progress */}
        {simulationPhase === "running" && drugs && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Pipeline running
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {
                      Object.values(drugSimStatuses).filter(
                        (s) => s === "complete"
                      ).length
                    }
                    /{drugs.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${
                        (Object.values(drugSimStatuses).filter(
                          (s) => s === "complete"
                        ).length /
                          drugs.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Complete */}
        {simulationPhase === "complete" && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                Pipeline complete
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                Click any drug for details
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
