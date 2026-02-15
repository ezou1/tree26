"use client"

import {
  Shield,
  Target,
  X,
  Atom,
  Loader2,
  FlaskConical,
  Beaker,
  Hash,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MoleculeViewer } from "@/components/molecule-viewer"
import type { Drug } from "@/lib/mock-data"

/** Extract PubChem CID from source field like "pubchem_cid_2244" */
function extractCid(source: string | null): number | null {
  if (!source) return null
  const match = source.match(/pubchem_cid_(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

function FdaStatusDisplay({ drug }: { drug: Drug }) {
  const categoryConfig: Record<
    Drug["fdaCategory"],
    { label: string; color: string; bgColor: string }
  > = {
    approved: {
      label: "FDA Approved",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    "phase-3": {
      label: "Phase 3 Trials",
      color: "text-sky-400",
      bgColor: "bg-sky-500/10 border-sky-500/20",
    },
    "phase-2": {
      label: "Phase 2 Trials",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    "phase-1": {
      label: "Phase 1 Trials",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10 border-orange-500/20",
    },
    preclinical: {
      label: "Preclinical",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50 border-muted-foreground/20",
    },
  }

  const c = categoryConfig[drug.fdaCategory]

  return (
    <div className={`rounded-lg border p-3 ${c.bgColor}`}>
      <div className="flex items-center gap-2">
        <Shield className={`h-4 w-4 ${c.color}`} />
        <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {drug.fdaStatus}
      </p>
    </div>
  )
}

function ConfidenceGauge({ value }: { value: number }) {
  // Value is 0-1 from docking score
  const pct = Math.round(value * 100)
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference
  const color =
    pct >= 85
      ? "stroke-emerald-400"
      : pct >= 70
        ? "stroke-sky-400"
        : "stroke-amber-400"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            className="stroke-secondary"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            className={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-foreground">
            {value.toFixed(2)}
          </span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Docking Score
      </span>
    </div>
  )
}

function DrugResultContent({ drug }: { drug: Drug }) {
  const cid = extractCid(drug.source)

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 3D Molecular Structure */}
      {(cid || drug.smiles) && (
        <>
          <MoleculeViewer cid={cid} smiles={drug.smiles} height={200} />
          <Separator className="bg-border" />
        </>
      )}

      {/* Confidence + FDA row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-4">
          {drug.confidenceScore !== null ? (
            <ConfidenceGauge value={drug.confidenceScore} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <Atom className="h-8 w-8" />
              <span className="text-[10px] uppercase tracking-wider">
                Not docked
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <FdaStatusDisplay drug={drug} />
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Mechanism of Action */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Beaker className="h-3 w-3 text-primary" />
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mechanism of Action
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-secondary-foreground">
          {drug.mechanism}
        </p>
      </div>

      <Separator className="bg-border" />

      {/* Target Proteins */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-3 w-3 text-primary" />
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Target Proteins
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {drug.targetProteins.map((target) => (
            <code
              key={target}
              className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-xs text-primary"
            >
              {target}
            </code>
          ))}
        </div>
      </div>

      {drug.proteinTarget && (
        <>
          <Separator className="bg-border" />
          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Docked Against
            </h3>
            <code className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-foreground">
              {drug.proteinTarget}
            </code>
          </div>
        </>
      )}

      {/* Source + Round info */}
      {(drug.source || drug.round > 0) && (
        <>
          <Separator className="bg-border" />
          <div className="flex flex-wrap items-center gap-2">
            {drug.source && (
              <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Source
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground">{drug.source}</p>
              </div>
            )}
            {drug.round > 0 && (
              <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Docking Round
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-foreground">
                  Round {drug.round}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {drug.category && (
        <>
          <Separator className="bg-border" />
          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </h3>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-xs text-primary"
            >
              {drug.category}
            </Badge>
          </div>
        </>
      )}
    </div>
  )
}

interface DrugDetailPanelProps {
  drug: Drug | null
  onClose: () => void
  simulationRunningDrug: Drug | null
}

export function DrugDetailPanel({
  drug,
  onClose,
  simulationRunningDrug,
}: DrugDetailPanelProps) {
  // State 1: Simulation running, no previous completed result yet
  if (simulationRunningDrug && !drug) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {simulationRunningDrug.name}
            </h2>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-card">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Running DiffDock...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Molecular docking simulation for{" "}
              {simulationRunningDrug.name}
            </p>
          </div>
          <div className="flex w-full max-w-[200px] flex-col gap-2">
            {[
              "Preparing ligand",
              "Submitting to RunPod",
              "Docking in progress",
              "Scoring poses",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i < 2 ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                ) : i === 2 ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                )}
                <span
                  className={`text-[11px] ${i <= 2 ? "text-foreground" : "text-muted-foreground/40"}`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // State 2: Simulation running for another drug, showing previous result
  if (simulationRunningDrug && drug) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-xs text-primary">
            Now docking {simulationRunningDrug.name}...
          </span>
        </div>
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Last completed result
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              {drug.name}
            </h2>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <DrugResultContent drug={drug} />
        </ScrollArea>
      </div>
    )
  }

  // State 3: No drug selected
  if (!drug) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border">
          <Atom className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No drug selected
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Click on a candidate drug from the table to view detailed analysis
          </p>
        </div>
      </div>
    )
  }

  // State 4: Normal view
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{drug.name}</h2>
          {drug.proteinTarget && (
            <p className="text-xs text-muted-foreground">
              Docked against {drug.proteinTarget}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close drug detail"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <DrugResultContent drug={drug} />
      </ScrollArea>
    </div>
  )
}
