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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null)
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
    setLoading(true)
    setError(null)

    async function init() {
      try {
        // @ts-expect-error — no type declarations for 3dmol
        const $3Dmol = await import("3dmol/build/3Dmol-min.js")

        if (cancelled || !containerRef.current) return

        // Clear previous viewer
        containerRef.current.innerHTML = ""

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "0xffffff",
          backgroundAlpha: 0,
          antialias: true,
        })
        viewerRef.current = viewer

        if (cid) {
          // Try 3D conformer first, fall back to 2D SDF if unavailable
          let sdf: string | null = null
          const sdf3dUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
          const res3d = await fetch(sdf3dUrl, {
            signal: AbortSignal.timeout(15000),
          })
          if (res3d.ok) {
            sdf = await res3d.text()
          } else {
            // 3D not available — fetch 2D structure instead
            const sdf2dUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`
            const res2d = await fetch(sdf2dUrl, {
              signal: AbortSignal.timeout(15000),
            })
            if (res2d.ok) {
              sdf = await res2d.text()
            }
          }

          if (cancelled) return

          if (sdf) {
            viewer.addModel(sdf, "sdf")
          } else if (smiles) {
            viewer.addModel(smiles, "smi")
          } else {
            throw new Error("No structure available")
          }
        } else if (smiles) {
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
      // Properly dispose the 3Dmol viewer to prevent memory leaks
      if (viewerRef.current) {
        try {
          viewerRef.current.removeAllModels()
          viewerRef.current.clear()
          // Release WebGL context to free GPU memory
          const canvas = containerRef.current?.querySelector("canvas")
          if (canvas) {
            const gl =
              canvas.getContext("webgl") || canvas.getContext("webgl2")
            if (gl) {
              const ext = gl.getExtension("WEBGL_lose_context")
              if (ext) ext.loseContext()
            }
          }
        } catch {
          // ignore cleanup errors
        }
        viewerRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
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
