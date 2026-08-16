"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, FlaskConical, Loader2, ShieldX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { arrangementLabel, buildGreenBenchmarkCases, KNOWN_BAD_PAIR_FIXTURES, summarizeGreenBenchmark, type GreenBenchmarkCase } from "@/lib/audio/green-benchmark"
import { renderGreenMashup, type GreenMashupRender } from "@/lib/audio/green-demo-engine"
import { cn } from "@/lib/utils"

const CASES = buildGreenBenchmarkCases()
const SUMMARY = summarizeGreenBenchmark(CASES, "deterministic")

export function GreenAudioLab() {
  const [filter, setFilter] = useState<"all" | "eligible" | "rejected">("eligible")
  const filteredCases = useMemo(() => CASES.filter((entry) => filter === "all" || (filter === "eligible" ? entry.renderEligible : !entry.renderEligible)), [filter])
  const [selectedId, setSelectedId] = useState(CASES.find((entry) => entry.renderEligible)?.id ?? CASES[0].id)
  const selected = CASES.find((entry) => entry.id === selectedId) ?? CASES[0]
  const [render, setRender] = useState<GreenMashupRender | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => () => { if (render) URL.revokeObjectURL(render.audioUrl) }, [render])

  function selectCase(entry: GreenBenchmarkCase) {
    audioRef.current?.pause()
    setRender(null)
    setSelectedId(entry.id)
    setError(null)
  }

  async function audition() {
    if (!selected.renderEligible) return
    setPending(true)
    setError(null)
    try {
      const next = await renderGreenMashup(selected.left, selected.right, selected.arrangement, selected.intensity)
      setRender(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Render failed.")
    } finally {
      setPending(false)
    }
  }

  return <main className="min-h-screen bg-background pb-28 pt-28">
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <Link href="/create" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"><ArrowLeft className="size-4" />Creation deck</Link>
      <header className="mt-7 grid gap-8 border-y border-foreground py-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8"><p className="signal-label">Audio systems / release evidence</p><h1 className="display-type mt-6 text-[clamp(4rem,10vw,9rem)] leading-[0.78]">GOOD IS<br /><span className="text-primary">MEASURABLE.</span></h1></div>
        <div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Every ordered pair. Three structural arrangements. Two energy profiles. Hostile combinations must be refused before they waste a listener&apos;s time.</p><Button className="mt-6" variant="outline" asChild><a href="/reports/audio-quality-benchmark.html" target="_blank"><ExternalLink />Open generated report</a></Button></div>
      </header>

      <div className="grid grid-cols-2 border-x border-b border-foreground md:grid-cols-4">
        <Metric label="Deterministic cases" value={SUMMARY.caseCount} />
        <Metric label="Correct gate rate" value={`${SUMMARY.passRate}%`} signal />
        <Metric label="Eligible renders" value={SUMMARY.renderEligible} />
        <Metric label="Safe rejections" value={SUMMARY.preflightRejected} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-foreground bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mono-label text-muted-foreground">Selected case</p><h2 className="display-type mt-3 text-4xl">{selected.left.title}<br /><span className="text-primary">x {selected.right.title}</span></h2></div><span className={cn("grid size-20 place-items-center border border-foreground display-type text-3xl", selected.renderEligible ? "bg-secondary" : "bg-destructive text-white")}>{selected.shareWorthiness}</span></div>
          <p className="mt-5 font-semibold">{arrangementLabel(selected.arrangement)} / energy {selected.intensity}</p>
          <div className="mt-6 grid grid-cols-2 gap-px border border-foreground bg-foreground sm:grid-cols-5"><Score label="Timing" value={selected.timingScore} /><Score label="Harmony" value={selected.harmonicScore} /><Score label="Phrase" value={selected.phraseScore} /><Score label="Collision" value={selected.collisionScore} /><Score label="Share" value={selected.shareWorthiness} /></div>
          {selected.renderEligible ? <div className="mt-6"><Button className="w-full min-h-12" onClick={() => void audition()} disabled={pending}>{pending ? <><Loader2 className="animate-spin" />Rendering 16 bars</> : <><FlaskConical />Render this case</>}</Button>{render ? <div className="mt-4 border border-foreground bg-secondary p-4"><audio ref={audioRef} className="w-full" controls src={render.audioUrl} /><div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider"><span>Peak {render.metrics.peakDb} dB</span><span>RMS {render.metrics.rmsDb} dB</span><span>Clips {render.metrics.clippedSamples}</span><span>{render.duration.toFixed(1)} sec</span></div></div> : null}</div> : <div className="mt-6 border border-destructive bg-destructive/10 p-4"><p className="flex items-center gap-2 font-semibold text-destructive"><ShieldX className="size-4" />Preflight rejected</p><ul className="mt-3 space-y-2 text-sm">{selected.failureReasons.map((reason) => <li key={reason}>- {reason}</li>)}</ul></div>}
          {error ? <p role="alert" className="mt-4 border border-destructive p-3 text-sm text-destructive">{error}</p> : null}
        </section>

        <section className="border border-foreground bg-secondary">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground p-5"><div><p className="mono-label">72-case matrix</p><p className="mt-2 text-sm text-muted-foreground">Select a row to inspect or render.</p></div><div className="flex border border-foreground">{(["all", "eligible", "rejected"] as const).map((value) => <button key={value} type="button" data-testid={`lab-filter-${value}`} onClick={() => setFilter(value)} className={cn("min-h-10 px-3 font-mono text-[10px] font-bold uppercase", value !== "all" && "border-l border-foreground", filter === value ? "bg-foreground text-background" : "bg-card")}>{value}</button>)}</div></div>
          <div className="max-h-[43rem] overflow-auto">{filteredCases.map((entry) => <button key={entry.id} type="button" data-testid={`lab-case-${entry.id}`} onClick={() => selectCase(entry)} className={cn("grid w-full grid-cols-[1fr_auto] gap-4 border-b border-foreground p-4 text-left [content-visibility:auto] hover:bg-card sm:grid-cols-[1fr_8rem_4rem] sm:items-center", selected.id === entry.id && "bg-card shadow-[inset_5px_0_0_var(--primary)]")}><span><strong className="block">{entry.left.title} x {entry.right.title}</strong><span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{arrangementLabel(entry.arrangement)} / {entry.intensity}</span></span><span className="hidden font-mono text-[10px] uppercase sm:block">{entry.renderEligible ? "Render" : "Reject"}</span><strong className="display-type text-2xl text-primary">{entry.shareWorthiness}</strong></button>)}</div>
        </section>
      </div>

      <section className="mt-8 grid gap-px border border-foreground bg-foreground md:grid-cols-3">{KNOWN_BAD_PAIR_FIXTURES.map((fixture) => <article key={fixture.id} className="bg-card p-5"><ShieldX className="size-5 text-primary" /><p className="mono-label mt-7">Known-bad regression</p><h3 className="mt-3 text-xl font-semibold">{fixture.id.replaceAll("-", " ")}</h3><p className="mt-2 text-sm text-muted-foreground">Must remain rejected for {fixture.expected.toLowerCase()} failure.</p></article>)}</section>
    </section>
  </main>
}

function Metric({ label, value, signal = false }: { label: string; value: string | number; signal?: boolean }) { return <div className={cn("border-r border-foreground p-5 last:border-r-0", signal && "bg-primary text-primary-foreground")}><p className="mono-label">{label}</p><p className="display-type mt-4 text-4xl sm:text-5xl">{value}</p></div> }
function Score({ label, value }: { label: string; value: number }) { return <div className="bg-card p-3 text-center"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="display-type mt-2 text-2xl">{value}</p></div> }
