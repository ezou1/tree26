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
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { literatureReviewSummary as LitReviewType } from "@/lib/mock-data"

type LiteratureReview = typeof LitReviewType

interface ResearchPanelProps {
  phase: "idle" | "analyzing" | "review-ready" | "simulating" | "done"
  query: string
  isLoading: boolean
  literatureReview: LiteratureReview | null
  onSubmitQuery: (query: string) => void
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
          /* Editable input state */
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
          /* Locked query display */
          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {query}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-xs text-primary"
              >
                Autoimmune
              </Badge>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-xs text-primary"
              >
                Inflammatory
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Idle empty state for literature section */}
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
          {/* Stats bar skeleton */}
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

          {/* Skeleton findings */}
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
                {literatureReview.keyFindings.length}
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
                {literatureReview.keyFindings.map(
                  (finding: string, index: number) => (
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
                  )
                )}

                {/* Methodology */}
                <div className="mt-1 rounded-lg border border-dashed border-border p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Methodology
                    </span>
                  </div>
                  <p className="pl-5 text-xs leading-relaxed text-muted-foreground">
                    {literatureReview.methodology}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Bottom action */}
          <div className="border-t border-border p-3">
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
          </div>
        </>
      )}
    </div>
  )
}
