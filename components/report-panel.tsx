"use client"

import { useRef, useState } from "react"
import { X, Download, FileText, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ReportPanelProps {
  paperMd: string
  onClose: () => void
}

export function ReportPanel({ paperMd, onClose }: ReportPanelProps) {
  const articleRef = useRef<HTMLElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!articleRef.current || exporting) return
    setExporting(true)

    try {
      const html2pdf = (await import("html2pdf.js")).default

      // Clone article into a white-background wrapper for PDF
      const clone = articleRef.current.cloneNode(true) as HTMLElement
      const wrapper = document.createElement("div")
      wrapper.style.cssText =
        "background:#fff;color:#111;padding:24px;font-family:system-ui,sans-serif;"
      // Force all text in clone to dark colors for PDF
      clone.style.color = "#111"
      clone.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.color = ""
        htmlEl.style.borderColor = ""
      })
      wrapper.appendChild(clone)
      document.body.appendChild(wrapper)

      const opts = {
        margin: [12, 12, 12, 12],
        filename: "drug_discovery_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await html2pdf().set(opts as any).from(wrapper).save()
      document.body.removeChild(wrapper)
    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setExporting(false)
    }
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
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            {exporting ? "Exporting..." : "Export PDF"}
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
        <div className="p-6">
          <article
            ref={articleRef}
            className="prose prose-sm prose-invert max-w-none text-secondary-foreground prose-headings:text-foreground prose-h1:text-xl prose-h1:font-bold prose-h1:border-b prose-h1:border-border prose-h1:pb-2 prose-h2:text-lg prose-h2:font-semibold prose-h3:text-base prose-h3:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-table:text-sm prose-th:bg-secondary prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-hr:border-border"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {paperMd}
            </ReactMarkdown>
          </article>
        </div>
      </ScrollArea>
    </div>
  )
}
