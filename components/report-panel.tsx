"use client"

import { X, Download, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReportPanelProps {
  paperMd: string
  onClose: () => void
}

export function ReportPanel({ paperMd, onClose }: ReportPanelProps) {
  const handleExport = () => {
    const blob = new Blob([paperMd], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "final_paper.md"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Report
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Download className="h-3 w-3" />
            Export Report
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close report"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Report content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-secondary-foreground">
            {paperMd}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
