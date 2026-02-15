"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  FileText,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Send,
  Brain,
  Download,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LiteratureReview } from "@/lib/mock-data"
import type { ReasoningDecision } from "@/lib/types"

interface ResearchPanelProps {
  phase: string
  query: string
  isLoading: boolean
  literatureReview: LiteratureReview | null
  onSubmitQuery: (query: string) => void
  decision?: ReasoningDecision | null
  reportMd?: string
  paperMd?: string
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-secondary/60 ${className ?? ""}`}
    />
  )
}

const exampleQueries = [
  "Systemic Lupus Erythematosus (SLE)",
  "Alzheimer's Disease",
  "Pancreatic Ductal Adenocarcinoma",
]

export function ResearchPanel({
  phase,
  query,
  isLoading,
  literatureReview,
  onSubmitQuery,
  decision,
  reportMd,
  paperMd,
}: ResearchPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase === "idle" && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [phase])

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSubmitQuery(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Extract key findings from the review markdown (first few paragraphs)
  const keyFindings: string[] = []
  if (literatureReview?.reviewMd) {
    const lines = literatureReview.reviewMd.split("\n")
    let inContent = false
    for (const line of lines) {
      if (line.startsWith("#")) {
        inContent = true
        continue
      }
      if (inContent && line.trim().length > 50 && keyFindings.length < 4) {
        keyFindings.push(line.trim().slice(0, 200))
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Prompt Section */}
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Research Query
          </h2>
        </div>

        {phase === "idle" ? (
          <div className="flex flex-col gap-3">
            <div className="group relative rounded-lg border border-border bg-secondary/50 transition-colors focus-within:border-primary/50 focus-within:bg-secondary/70">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a disease or condition to analyze..."
                rows={3}
                className="w-full resize-none bg-transparent p-3 pb-10 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/40">
                  Press Enter to analyze
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
                  aria-label="Submit query"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Examples
              </span>
              {exampleQueries.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    setInputValue(eq)
                    textareaRef.current?.focus()
                  }}
                  className="rounded-md border border-border bg-secondary/30 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {query}
            </p>
          </div>
        )}
      </div>

      {/* Idle empty state */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border">
            <BookOpen className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground/50">
              Literature review will appear here
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/30">
              Enter a disease or condition to begin
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !literatureReview && (
        <div className="flex flex-1 flex-col">
          <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
            <div className="flex flex-col items-center bg-card py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Scanning Papers
              </span>
            </div>
            <div className="flex flex-col items-center bg-card py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Extracting Findings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border p-4 pb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Literature Review Summary
            </h2>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-[10px] font-medium text-primary">
                  Analyzing literature...
                </span>
              </div>
              <div className="flex flex-col gap-2 pl-5">
                <SkeletonPulse className="h-3 w-full" />
                <SkeletonPulse className="h-3 w-4/5" />
                <SkeletonPulse className="h-3 w-3/5" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-secondary/20 p-3 opacity-40"
              >
                <div className="flex flex-col gap-2 pl-5">
                  <SkeletonPulse className="h-3 w-full" />
                  <SkeletonPulse className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loaded State */}
      {literatureReview && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
            <div className="flex flex-col items-center bg-card py-3">
              <span className="font-mono text-lg font-bold text-foreground">
                {literatureReview.papersAnalyzed.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Papers Analyzed
              </span>
            </div>
            <div className="flex flex-col items-center bg-card py-3">
              <span className="font-mono text-lg font-bold text-primary">
                {keyFindings.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Key Findings
              </span>
            </div>
          </div>

          {/* Literature Review */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border p-4 pb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Literature Review Summary
              </h2>
            </div>
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="flex flex-col gap-3 p-4">
                {keyFindings.map((finding, index) => (
                  <div
                    key={index}
                    className="group rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/30 hover:bg-secondary/50"
                  >
                    <div className="mb-1.5 flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                        Finding {index + 1}
                      </span>
                    </div>
                    <p className="pl-5 text-xs leading-relaxed text-secondary-foreground">
                      {finding}
                    </p>
                  </div>
                ))}

                {/* Reasoning Decision */}
                {decision && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                        AI Reasoning
                      </span>
                    </div>
                    <p className="pl-5 text-xs leading-relaxed text-secondary-foreground">
                      <strong>Decision:</strong> {decision.action}
                    </p>
                    <p className="mt-1 pl-5 text-xs leading-relaxed text-muted-foreground">
                      {decision.rationale}
                    </p>
                    {decision.hypothesis && (
                      <p className="mt-1 pl-5 text-xs italic leading-relaxed text-muted-foreground">
                        Hypothesis: {decision.hypothesis}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-2 border-t border-border p-3">
            {reportMd && (
              <button
                type="button"
                onClick={() => handleDownload(reportMd, "results.md")}
                className="flex w-full items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-3 w-3" />
                  Download results report
                </span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            {paperMd && (
              <button
                type="button"
                onClick={() => handleDownload(paperMd, "final_paper.md")}
                className="flex w-full items-center justify-between rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/20"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Download final paper
                </span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            {!reportMd && !paperMd && (
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Export full review
                </span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
