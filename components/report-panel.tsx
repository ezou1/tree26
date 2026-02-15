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
      // Dynamic import — html2pdf.js is client-only
      const html2pdf = (await import("html2pdf.js")).default
      const opts = {
        margin: [12, 12, 12, 12],
        filename: "drug_discovery_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await html2pdf()
        .set(opts as any)
        .from(articleRef.current)
        .save()
    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
            className="prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-h1:text-xl prose-h1:font-bold prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2 prose-h2:text-lg prose-h2:font-semibold prose-h3:text-base prose-h3:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-table:text-sm prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-hr:border-gray-200"
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
