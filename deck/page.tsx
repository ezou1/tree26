"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Dna,
  Pill,
  Clock,
  Zap,
  Search,
  BarChart3,
  Target,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Microscope,
} from "lucide-react"

const TOTAL_SLIDES = 7

export default function DeckPage() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return
      if (index < 0 || index >= TOTAL_SLIDES) return
      setIsAnimating(true)
      setCurrent(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [isAnimating]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goTo(current + 1)
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goTo(current - 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [current, goTo])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        <Slide01Title />
        <Slide02Metformin />
        <Slide03Problem />
        <Slide04Invisible />
        <Slide05SearchSpace />
        <Slide06NewTools />
        <Slide09Platform />
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-card"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          disabled={current === TOTAL_SLIDES - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-card"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-7 right-8 z-20 font-mono text-xs text-muted-foreground">
        {current + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  )
}

/* ─── Shared slide wrapper ─── */
function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-screen w-screen flex-none items-center justify-center overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/* ─── 1. Title — "The Drug That Was Already There" ─── */
function Slide01Title() {
  return (
    <Slide className="items-start justify-start">
      <div className="flex h-full w-full flex-col px-12 py-10 lg:px-16 lg:py-12">
        {/* Top-left brand */}
        <p className="text-base text-secondary-foreground lg:text-lg">
          {"RepoRx \u2014 AI Driven Drug Repurposing"}
        </p>

        {/* Main headline — pushed down, subtitle follows closely */}
        <div className="mt-auto mb-24">
          <h1 className="mb-8 text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[1.05] tracking-tight text-foreground">
            The Drug That Was
            <br />
            <span className="text-primary">Already There</span>
          </h1>

          {/* Subtitle with teal left border */}
          <div className="border-l-[3px] border-primary py-1 pl-5">
            <p className="max-w-2xl text-base italic leading-relaxed text-secondary-foreground lg:text-lg">
              A potential cancer treatment sat in medicine cabinets since the
              1950s{" \u2014 "}and no one knew about it until 2005. We{"'"}re
              making sure that never happens again.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ─── 2. Metformin Case Study ─── */
function Slide02Metformin() {
  return (
    <Slide>
      <div className="flex w-full max-w-6xl items-center gap-16 px-16">
        {/* Left — Image */}
        <div className="relative flex-none">
          <div className="relative h-[420px] w-[360px] overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/deck-metformin.jpg"
              alt="Metformin pill"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="font-mono text-sm text-primary">Case Study</p>
              <p className="text-2xl font-bold text-foreground">Metformin</p>
            </div>
          </div>
        </div>

        {/* Right — Timeline */}
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              A Hidden Cure
            </p>
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground">
              50 years hiding in plain sight.
            </h2>
          </div>

          <div className="flex flex-col gap-0">
            {/* Timeline items */}
            {[
              {
                year: "1950s",
                text: "Metformin approved for diabetes. Used by millions to lower blood sugar.",
                icon: Pill,
                muted: false,
              },
              {
                year: "1978",
                text: "A single report noticed metformin was linked to reduced tumor size. The study was largely ignored.",
                icon: EyeOff,
                muted: true,
              },
              {
                year: "2005",
                text: "Anti-tumor properties finally confirmed through proper studies. Clinical trials begin for cancer treatment.",
                icon: Eye,
                muted: false,
              },
            ].map((item, i) => (
              <div key={item.year} className="flex gap-4">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border ${item.muted
                      ? "border-destructive/30 bg-destructive/10"
                      : "border-primary/30 bg-primary/10"
                      }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${item.muted ? "text-destructive" : "text-primary"}`}
                    />
                  </div>
                  {i < 2 && (
                    <div className="h-12 w-px bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6 pt-1.5">
                  <p className="mb-1 font-mono text-lg font-bold text-foreground">
                    {item.year}
                  </p>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ─── 3. Problem — Cost & Time ─── */
function Slide03Problem() {
  return (
    <Slide>
      <div className="flex max-w-5xl flex-col gap-12 px-16">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            The Problem
          </p>
          <h2 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground">
            Developing new drugs is
            <br />
            <span className="text-destructive"> incredibly costly and time-consuming.</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              stat: "$2.6B",
              label: "Average cost to bring a single new drug to market",
              icon: AlertTriangle,
            },
            {
              stat: "10-15 yrs",
              label: "Typical development timeline from lab bench to patient bedside",
              icon: Clock,
            },
            {
              stat: "90%",
              label: "Of drugs entering clinical trials will ultimately fail",
              icon: BarChart3,
            },
          ].map((item) => (
            <div
              key={item.stat}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-8 transition-colors hover:border-destructive/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <item.icon className="h-5 w-5 text-destructive" />
              </div>
              <p className="font-mono text-5xl font-bold text-foreground">
                {item.stat}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <p className="max-w-3xl text-lg leading-relaxed text-secondary-foreground">
          Meanwhile, potentially effective FDA-approved drugs for other conditions
          remain <span className="font-semibold text-foreground">completely underexplored</span> for
          repurposing.
        </p>
      </div>
    </Slide>
  )
}

/* ─── 4. "INVISIBLE" — Dramatic statement ─── */
function Slide04Invisible() {
  return (
    <Slide>
      <div className="flex max-w-4xl flex-col items-center px-16 text-center">
        <p className="mb-6 text-lg leading-relaxed text-secondary-foreground">
          We{"'"}re solving a part of the drug pipeline that is currently
        </p>
        <h2 className="mb-8 font-mono text-[120px] font-bold leading-none tracking-widest text-foreground">
          INVISIBLE
        </h2>
        <div className="mx-auto h-px w-32 bg-primary" />
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          The connections between existing drugs and new therapeutic applications exist in
          the literature — buried across millions of papers that no human research team
          can fully review.
        </p>
      </div>
    </Slide>
  )
}

/* ─── 5. Search Space is Too Large ─── */
function Slide05SearchSpace() {
  return (
    <Slide>
      {/* Background — ocean of papers */}
      <div className="absolute inset-0">
        <Image
          src="/images/deck-research-ocean.jpg"
          alt="Vast ocean of research papers"
          fill
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40" />
      </div>

      <div className="relative z-10 flex max-w-5xl flex-col gap-12 px-16">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            The Challenge
          </p>
          <h2 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground">
            The search space is simply
            <br />
            <span className="text-primary">too large.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-secondary-foreground">
            Researchers need help navigating the ever-expanding medical literature.
          </p>
        </div>

        <div className="grid max-w-3xl grid-cols-3 gap-6">
          {[
            { stat: "36M+", label: "Papers in PubMed alone" },
            { stat: "1.5M", label: "New papers published per year" },
            { stat: "4,000+", label: "FDA-approved drugs to evaluate" },
          ].map((item) => (
            <div
              key={item.stat}
              className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur"
            >
              <p className="font-mono text-3xl font-bold text-primary">
                {item.stat}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ─── 6. New Simulation Tools ─── */
function Slide06NewTools() {
  return (
    <Slide>
      <div className="absolute inset-0">
        <Image
          src="/images/deck-simulation.jpg"
          alt="Molecular docking simulation"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-background/50" />
      </div>

      <div className="relative z-10 flex max-w-5xl flex-col gap-10 px-16">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            The Opportunity
          </p>
          <h2 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground">
            New simulation tools have
            <br />
            changed <span className="text-primary">everything.</span>
          </h2>
          {/* <p className="mt-6 max-w-2xl text-lg leading-relaxed text-secondary-foreground">
            Recent breakthroughs in AI and computational biology have made it possible to
            simulate drug-protein interactions at scale — what once took months in a wet lab
            can now be modeled computationally in minutes.
          </p> */}
        </div>

        <div className="grid max-w-4xl">
          {[
            {
              icon: Dna,
              title: "Computational Drug Docking",
              desc: "Molecular simulation tools can predict how a drug will bind to a protein target, scoring affinity and stability without a physical lab.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-xl border border-border bg-card/80 p-6 backdrop-blur"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  )
}


/* ─── 9. Platform ─── */
function Slide09Platform() {
  return (
    <Slide>
      <div className="flex max-w-5xl flex-col items-center gap-8 px-16 text-center">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            The Platform
          </p>
          <h2 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground">
            Built for researchers.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-secondary-foreground">
            A three-panel workspace: literature on the left, data in the center,
            drug details on the right — everything in context, nothing lost.
          </p>
        </div>

        {/* Platform mockup */}
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="ml-4 flex items-center gap-2">
              <FlaskConical className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">
                RepoRx — Drug Repurposing Workspace
              </span>
            </div>
          </div>
          {/* Panels */}
          <div className="flex h-72">
            {/* Left panel */}
            <div className="flex w-[32%] flex-col gap-2 border-r border-border p-4">
              <div className="mb-1 rounded-md border border-border bg-secondary px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Research Query</p>
                <p className="text-[11px] font-medium text-foreground">
                  Systemic Lupus Erythematosus
                </p>
              </div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Literature Review
              </div>
              <div className="h-2 w-3/4 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-5/6 rounded bg-muted" />
              <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-4/5 rounded bg-muted" />
              <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
            </div>
            {/* Middle panel */}
            <div className="flex w-[36%] flex-col gap-2 border-r border-border p-4">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Target Proteins
              </div>
              {[
                { name: "JAK1", w: 72 },
                { name: "JAK2", w: 64 },
                { name: "COX-2", w: 58 },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-10 font-mono text-[9px] text-muted-foreground">{p.name}</span>
                  <div className="flex-1 rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full bg-primary/40"
                      style={{ width: `${p.w}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Candidate Drugs
              </div>
              {["Tofacitinib", "Baricitinib", "Celecoxib"].map((d, i) => (
                <div
                  key={d}
                  className={`flex items-center justify-between rounded-md px-2 py-1 text-[10px] ${i === 0
                    ? "border border-primary/20 bg-primary/5 text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  <span>{d}</span>
                  <CheckCircle2 className={`h-3 w-3 ${i === 0 ? "text-primary" : "text-muted-foreground/30"}`} />
                </div>
              ))}
              <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 text-center text-[10px] font-medium text-primary">
                Run Simulation
              </div>
            </div>
            {/* Right panel */}
            <div className="flex w-[32%] flex-col p-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Drug Detail — Tofacitinib
              </div>
              <div className="mb-3 h-20 rounded-lg bg-secondary" />
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary/20" />
                <div className="h-2 w-20 rounded bg-muted" />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] text-muted-foreground">Confidence</div>
                  <div className="font-mono text-[11px] font-bold text-primary">87%</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] text-muted-foreground">FDA Status</div>
                  <div className="text-[11px] font-semibold text-foreground">Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  )
}
