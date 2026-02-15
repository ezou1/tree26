"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface MoleculeViewerProps {
  /** PubChem Compound ID — used to fetch the 3-D SDF from PubChem. */
  pubchemCid: number
  /** Drug name shown during loading / error states. */
  drugName: string
  className?: string
}

/**
 * Renders an interactive 3-D molecular structure using 3Dmol.js.
 *
 * The component fetches the SDF conformer from PubChem's REST API and
 * renders it with a stick model + translucent surface.
 */
export function MoleculeViewer({
  pubchemCid,
  drugName,
  className = "",
}: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  )

  useEffect(() => {
    let cancelled = false

    async function init() {
      setStatus("loading")

      // Dynamically import 3Dmol (it accesses `window`, so must be client-only)
      const $3Dmol = await import("3dmol")

      if (cancelled || !containerRef.current) return

      // Tear down any previous viewer
      if (viewerRef.current) {
        try {
          viewerRef.current.clear()
        } catch {
          /* noop */
        }
        viewerRef.current = null
        containerRef.current.innerHTML = ""
      }

      // Fetch SDF from PubChem
      const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemCid}/SDF?record_type=3d`

      let sdfData: string
      try {
        const resp = await fetch(sdfUrl)
        if (!resp.ok) throw new Error(`PubChem returned ${resp.status}`)
        sdfData = await resp.text()
      } catch (err) {
        if (!cancelled) setStatus("error")
        return
      }

      if (cancelled || !containerRef.current) return

      // Create viewer
      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: "0x1a1a2e",
      })

      viewer.addModel(sdfData, "sdf")
      viewer.setStyle({}, { stick: { radius: 0.12 } })
      viewer.addSurface($3Dmol.SurfaceType.VDW, {
        opacity: 0.15,
        color: "white",
      })
      viewer.zoomTo()
      viewer.spin("y", 0.4)
      viewer.render()

      viewerRef.current = viewer
      if (!cancelled) setStatus("ready")
    }

    init()

    return () => {
      cancelled = true
      if (viewerRef.current) {
        try {
          viewerRef.current.clear()
        } catch {
          /* noop */
        }
        viewerRef.current = null
      }
    }
  }, [pubchemCid])

  // Resize handler — 3Dmol needs an explicit resize call
  useEffect(() => {
    function handleResize() {
      if (viewerRef.current) {
        viewerRef.current.resize()
        viewerRef.current.render()
      }
    }

    window.addEventListener("resize", handleResize)

    // Also observe the container itself (for panel resizing)
    let ro: ResizeObserver | null = null
    if (containerRef.current) {
      ro = new ResizeObserver(handleResize)
      ro.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      ro?.disconnect()
    }
  }, [status])

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border ${className}`}
    >
      {/* 3Dmol render target */}
      <div
        ref={containerRef}
        className="aspect-[16/9] w-full"
        style={{ position: "relative" }}
      />

      {/* Overlay label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-8 pointer-events-none">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Molecular Structure of {drugName}
        </span>
      </div>

      {/* Loading spinner */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">
            Loading 3D structure…
          </span>
        </div>
      )}

      {/* Error fallback */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
          <span className="text-xs text-muted-foreground">
            3D structure unavailable
          </span>
        </div>
      )}
    </div>
  )
}
