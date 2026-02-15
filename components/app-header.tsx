"use client"

import { FlaskConical } from "lucide-react"

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <FlaskConical className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          RepoRx
        </span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          AI Drug Repurposing Engine
        </span>
      </div>

    </header>
  )
}
