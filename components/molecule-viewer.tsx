"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface MoleculeViewerProps {
  /** PubChem CID — used to fetch 3D conformer SDF */
  cid?: number | null
  /** Fallback: SMILES string (renders 2D if no CID) */
  smiles?: string | null
  /** Height in pixels */
  height?: number
}

export function MoleculeViewer({
  cid,
  smiles,
  height = 200,
}: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!cid && !smiles) {
      setLoading(false)
      setError("No structure data")
      return
    }

    let cancelled = false

    async function init() {
      try {
        // Dynamic import — 3Dmol needs window/document
        // @ts-expect-error — no type declarations for 3dmol
        const $3Dmol = await import("3dmol/build/3Dmol-min.js")

        if (cancelled || !containerRef.current) return

        // Clear previous viewer
        containerRef.current.innerHTML = ""

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "transparent",
          antialias: true,
        })
        viewerRef.current = viewer

        if (cid) {
          // Fetch 3D conformer SDF from PubChem
          const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
          const res = await fetch(sdfUrl, {
            signal: AbortSignal.timeout(15000),
          })

          if (!res.ok) throw new Error(`PubChem SDF: ${res.status}`)
          const sdf = await res.text()

          if (cancelled) return

          viewer.addModel(sdf, "sdf")
        } else if (smiles) {
          // Use SMILES — 3Dmol can parse it but quality is lower
          viewer.addModel(smiles, "smi")
        }

        viewer.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.25 } })
        viewer.zoomTo()
        viewer.spin("y", 0.5)
        viewer.render()

        if (!cancelled) {
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false)
          setError(err instanceof Error ? err.message : "Failed to load")
        }
      }
    }

    init()

    return () => {
      cancelled = true
      viewerRef.current = null
    }
  }, [cid, smiles])

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">
              Loading 3D structure...
            </span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <span className="text-[10px] text-muted-foreground/50">
            {error}
          </span>
        </div>
      )}

      <div className="absolute bottom-1 right-1">
        <span className="rounded bg-background/70 px-1.5 py-0.5 text-[9px] text-muted-foreground/40">
          3D
        </span>
      </div>
    </div>
  )
}
