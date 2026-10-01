"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleStop,
  Copy,
  Loader2,
  LockKeyhole,
  Pause,
  Play,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react"
import { GREEN_ARRANGEMENT_IDS } from "@mashups/contracts"

import { GreenShareExport } from "@/components/create/green-share-export"
import { useGreenProjectDraft } from "@/components/create/use-green-project-draft"
import { restoreDraftAudio, type GreenLocalDraft } from "@/lib/green-room/local-draft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { trackGreenEvent } from "@/lib/analytics/green-room"
import {
  renderGreenMashup,
  renderGreenTrackPreview,
  type GreenMashupRender,
  type GreenMashupStyle,
} from "@/lib/audio/green-demo-engine"
import {
  assessGreenPair,
  getGreenPairAlternatives,
  getGreenTrack,
  GREEN_CATALOG,
  type GreenCatalogTrack,
} from "@/lib/catalog/green-catalog"

const styles: readonly GreenMashupStyle[] = GREEN_ARRANGEMENT_IDS
const BlendFitWorkbench = dynamic(() => import("./blend-fit-workbench").then((module) => module.BlendFitWorkbench))

export function GreenMashupStudio({ initialDraft, initialNotice }: { initialDraft: GreenLocalDraft; initialNotice: string | null }) {
  const [leftId, setLeftId] = useState(initialDraft.input.sources.leftId)
  const [rightId, setRightId] = useState(initialDraft.input.sources.rightId)
  const [intensity, setIntensity] = useState(initialDraft.input.intensity)
  const [renders, setRenders] = useState<GreenMashupRender[]>([])
  const [selectedStyle, setSelectedStyle] = useState<GreenMashupStyle | null>(initialDraft.input.selectedArrangement)
  const [restored, setRestored] = useState(false)
  const [renderingStyle, setRenderingStyle] = useState<GreenMashupStyle | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [interruptedId, setInterruptedId] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [showBlendFit, setShowBlendFit] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlsRef = useRef(new Set<string>())
  const viewedRef = useRef(false)
  const generationRef = useRef(0)
  const project = useGreenProjectDraft(initialDraft, { leftId, rightId, intensity, selectedArrangement: selectedStyle }, renders, restored)

  const left = getGreenTrack(leftId) ?? GREEN_CATALOG[0]
  const right = getGreenTrack(rightId) ?? GREEN_CATALOG[1]
  const assessment = useMemo(() => assessGreenPair(left, right), [left, right])
  const alternatives = useMemo(() => getGreenPairAlternatives(left, right), [left, right])

  useEffect(() => {
    let cancelled = false
    void restoreDraftAudio(initialDraft).then((recovered) => {
      if (cancelled) { for (const render of recovered) URL.revokeObjectURL(render.audioUrl); return }
      for (const render of recovered) objectUrlsRef.current.add(render.audioUrl)
      setRenders(recovered)
      setRestored(true)
      if (recovered.length < initialDraft.renders.length) setError("Some cached audio could not be recovered. Generate the versions again from your saved recipe.")
    }).catch(() => {
      if (!cancelled) setError("Audio recovery failed. Your stored draft has not been overwritten; reopen it from My saved mashups.")
    })
    return () => { cancelled = true }
  }, [initialDraft])

  useEffect(() => {
    if (viewedRef.current) return
    viewedRef.current = true
    trackGreenEvent("create_viewed", { catalog: "mashups_originals", left_id: left.id, right_id: right.id })
  }, [left.id, right.id])

  useEffect(() => {
    if (!assessment.compatible) trackGreenEvent("preflight_rejected", { left_id: left.id, right_id: right.id, reason: assessment.reasons[0] ?? "quality_gate" })
  }, [assessment.compatible, assessment.reasons, left.id, right.id])

  useEffect(() => () => {
    generationRef.current += 1
    audioRef.current?.pause()
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current
      if (document.visibilityState !== "hidden" || !audio || audio.paused || !previewingId) return
      audio.pause()
      setInterruptedId(previewingId)
      setPreviewingId(null)
      trackGreenEvent("audio_interrupted", { playback_id: previewingId, reason: "visibility" })
    }
    const handlePageHide = () => audioRef.current?.pause()
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)
    return () => { document.removeEventListener("visibilitychange", handleVisibility); window.removeEventListener("pagehide", handlePageHide) }
  }, [previewingId])

  function stopAudio() {
    audioRef.current?.pause()
    audioRef.current = null
    setPreviewingId(null)
    setInterruptedId(null)
  }

  async function playUrl(id: string, url: string) {
    if (previewingId === id) {
      stopAudio()
      return
    }
    stopAudio()
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPreviewingId(null)
    await audio.play()
    setPreviewingId(id)
  }

  async function resumeInterruptedAudio() {
    const audio = audioRef.current
    if (!audio || !interruptedId) return
    try {
      await audio.play()
      setPreviewingId(interruptedId)
      trackGreenEvent("audio_recovered", { playback_id: interruptedId })
      setInterruptedId(null)
    } catch {
      setError("Playback was interrupted by the device. Tap the source or candidate again.")
      setInterruptedId(null)
    }
  }

  async function previewTrack(track: GreenCatalogTrack) {
    setError(null)
    trackGreenEvent("source_previewed", { track_id: track.id, source_type: track.rights.sourceType })
    try {
      const cached = previewUrls[track.id]
      if (cached) {
        await playUrl(`track-${track.id}`, cached)
        return
      }
      setPreviewingId(`loading-${track.id}`)
      const preview = await renderGreenTrackPreview(track)
      objectUrlsRef.current.add(preview.audioUrl)
      setPreviewUrls((current) => ({ ...current, [track.id]: preview.audioUrl }))
      await playUrl(`track-${track.id}`, preview.audioUrl)
    } catch {
      stopAudio()
      setError("This browser could not render the preview. Try the latest Safari, Chrome, or Edge.")
    }
  }

  function resetRenders() {
    generationRef.current += 1
    setRenderingStyle(null)
    stopAudio()
    for (const render of renders) {
      URL.revokeObjectURL(render.audioUrl)
      objectUrlsRef.current.delete(render.audioUrl)
    }
    setRenders([])
    setSelectedStyle(null)
  }

  function chooseTrack(deck: "left" | "right", id: string) {
    if (deck === "left") {
      setLeftId(id)
      if (id === rightId) setRightId(leftId)
    } else {
      setRightId(id)
      if (id === leftId) setLeftId(rightId)
    }
    resetRenders()
    trackGreenEvent("pair_selected", { deck, track_id: id })
  }

  async function generateVersions() {
    if (!assessment.compatible || !restored) return
    resetRenders()
    const generation = generationRef.current
    const previouslyKept = selectedStyle
    setError(null)
    trackGreenEvent("render_started", { left_id: left.id, right_id: right.id, compatibility_score: assessment.score })
    const nextRenders: GreenMashupRender[] = []
    try {
      for (const style of styles) {
        setRenderingStyle(style)
        const render = await renderGreenMashup(left, right, style, intensity)
        if (generation !== generationRef.current) { URL.revokeObjectURL(render.audioUrl); return }
        nextRenders.push(render)
        objectUrlsRef.current.add(render.audioUrl)
        setRenders([...nextRenders])
      }
      setSelectedStyle(previouslyKept ?? nextRenders[0]?.style ?? null)
      trackGreenEvent("render_completed", { left_id: left.id, right_id: right.id, candidate_count: nextRenders.length })
    } catch {
      if (generation !== generationRef.current) return
      for (const render of nextRenders) {
        URL.revokeObjectURL(render.audioUrl)
        objectUrlsRef.current.delete(render.audioUrl)
      }
      setRenders([])
      setError("The local render failed. Close other audio apps and try again.")
    } finally {
      if (generation === generationRef.current) setRenderingStyle(null)
    }
  }

  function swapTracks() {
    setLeftId(rightId)
    setRightId(leftId)
    resetRenders()
  }

  const selectedRender = renders.find((render) => render.style === selectedStyle) ?? null

  return (
    <div className="min-h-screen overflow-hidden pt-[68px]">
      <section className="relative border-b border-foreground">
        <div className="absolute inset-0 -z-10 collision-grid opacity-60" />
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="signal-label">Green room / prototype deck</p>
              <h1 className="display-type mt-5 max-w-5xl text-[clamp(3.4rem,9vw,8.6rem)] leading-[0.78]">
                Pick two.<br /><span className="text-primary">Make the third.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                Choose two cleared Mashups originals. We build three phrase-aligned preview versions locally in your browser.
              </p>
              <div className="mt-5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                <ShieldCheck className="size-4 text-primary" /> No rips. No mystery samples. No upload roulette.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-foreground pb-6">
          <div className="w-full max-w-xl">
            <label htmlFor="project-title" className="mono-label">My mashup name</label>
            <input id="project-title" maxLength={120} value={project.title} onChange={(event) => project.setTitle(event.target.value)} className="mt-2 min-h-12 w-full border border-foreground bg-card px-3 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
            <p role="status" data-testid="device-save-status" className="mt-2 text-sm text-muted-foreground">{project.localStatus}</p>
          </div>
          <Link href="/projects" className="flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">My saved mashups <ArrowRight className="size-4" /></Link>
        </div>
        {initialNotice ? <p className="mb-5 border-l-4 border-primary pl-4 text-sm">{initialNotice}</p> : null}
        <div className="mb-5 grid grid-cols-3 border border-foreground bg-foreground font-mono text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px]">
          <Step active={renders.length === 0} complete={renders.length > 0} number="01" label="Choose sources" />
          <Step active={renders.length > 0 && !selectedRender} complete={Boolean(selectedRender)} number="02" label="Hear versions" />
          <Step active={Boolean(selectedRender)} complete={false} number="03" label="Keep your cut" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_5rem_1fr] lg:items-stretch">
          <SourceDeck label="A / Idea" track={left} value={leftId} otherId={rightId} side="left" playingId={previewingId} onChoose={chooseTrack} onPreview={previewTrack} />

          <button type="button" onClick={swapTracks} className="group grid min-h-14 place-items-center border border-foreground bg-secondary text-secondary-foreground transition-transform hover:-rotate-2 lg:min-h-full" aria-label="Swap source tracks">
            <Repeat2 className="size-6 transition-transform group-hover:rotate-180" />
          </button>

          <SourceDeck label="B / Groove" track={right} value={rightId} otherId={leftId} side="right" playingId={previewingId} onChoose={chooseTrack} onPreview={previewTrack} />
        </div>

        <div className="mt-4 grid border border-foreground bg-card lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-foreground p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mono-label text-muted-foreground">Prototype recipe check</p>
                <p className="mt-2 text-lg font-semibold">{assessment.summary}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Catalog metadata guides this synthesized recipe. It does not measure how two recordings sound together. Use Blend Fit below to check audio ingredients.</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{assessment.tempoDelta} BPM delta</span>
              <span>{assessment.warpPercent}% warp</span>
              <span>{assessment.harmonicFit.replace("-", " ")}</span>
            </div>
            {!assessment.compatible ? <div className="mt-5 border-t border-foreground pt-4"><p className="font-semibold">This prototype recipe is outside its supported settings.</p><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{assessment.reasons.map((reason) => <li key={reason}>- {reason}</li>)}</ul>{alternatives.length ? <div className="mt-4 flex flex-wrap gap-2">{alternatives.map(({ track }) => <Button key={track.id} type="button" size="sm" variant="outline" onClick={() => chooseTrack("right", track.id)}>{track.title}</Button>)}</div> : null}</div> : null}
          </div>

          <div className="grid gap-5 p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="energy" className="mono-label">Room energy</label>
                <span className="display-type text-2xl text-primary">{intensity}</span>
              </div>
              <input id="energy" type="range" min="55" max="100" step="1" value={intensity} onChange={(event) => { setIntensity(Number(event.target.value)); resetRenders() }} className="signal-range mt-3 w-full" />
            </div>
            <div className="border-t border-foreground pt-4">
              <p className="mono-label">Three controlled experiments</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A voice over B, B voice over A, then a no-collision phrase-matched drop swap. The engine never returns three cosmetic crossfades.</p>
            </div>
          </div>
        </div>

        {error ? <div role="alert" className="mt-4 border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">{error}</div> : null}
        {interruptedId ? <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-foreground bg-secondary p-4 text-sm"><span>iOS or Android paused audio while Mashups was in the background.</span><Button size="sm" variant="outline" onClick={() => void resumeInterruptedAudio()}><Play />Resume audio</Button></div> : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-foreground/30 py-4">
          <div><p className="font-semibold">Check your ingredients before creating.</p><p className="mt-1 text-sm text-muted-foreground">Blend Fit measures selected audio and suggests what to listen for.</p></div>
          <Button variant="outline" aria-expanded={showBlendFit} aria-controls="creation-blend-fit" onClick={() => { stopAudio(); setShowBlendFit(!showBlendFit) }}>{showBlendFit ? "Close Blend Fit" : "Open Blend Fit"}</Button>
        </div>
        {showBlendFit ? <div id="creation-blend-fit" className="mt-5"><BlendFitWorkbench key={`${left.id}:${right.id}`} catalog={{ leftId: left.id, rightId: right.id }} /><p className="mt-3 text-sm text-muted-foreground">Blend Fit is optional guidance. The button below generates the selected catalog demo recipe; local files stay in the checker. <Link className="underline underline-offset-4" href="/create/blend-fit">Open the standalone checker</Link></p></div> : null}

        <Button size="lg" className="mt-4 min-h-14 w-full text-base" onClick={() => void generateVersions()} disabled={!restored || !assessment.compatible || renderingStyle !== null} data-testid="generate-mashups">
          {renderingStyle ? <><Loader2 className="animate-spin" /> Rendering three arrangements...</> : <><Sparkles /> Generate three mashups</>}
        </Button>
      </section>

      <section className="border-y border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mono-label text-primary">Version rack</p>
              <h2 className="display-type mt-4 text-5xl leading-[0.86] sm:text-7xl">Three arrangements.<br />No random crossfade.</h2>
            </div>
            <p className="max-w-xl text-background/65 lg:col-span-4 lg:col-start-9">Each version follows the bar grid and has a different structural idea. If the sources do not fit, Mashups refuses the pairing instead of shipping noise.</p>
          </div>

          <div className="mt-9 grid gap-px border border-background/45 bg-background/45 lg:grid-cols-3">
            {styles.map((style, index) => {
              const render = renders.find((item) => item.style === style)
              const isLoading = renderingStyle === style
              const isSelected = selectedStyle === style
              return (
                <article key={style} className={cn("relative min-h-[21rem] bg-foreground p-5 sm:p-6", isSelected && "bg-primary text-primary-foreground")}>
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs">0{index + 1} / 03</span>
                    {isSelected ? <BadgeCheck className="size-5" /> : <Waves className="size-5 text-primary" />}
                  </div>
                  <h3 className="display-type mt-12 text-4xl">{labelForStyle(style)}</h3>
                  <p className={cn("mt-4 min-h-12 text-sm leading-relaxed", isSelected ? "text-primary-foreground/75" : "text-background/60")}>
                    {render?.description ?? descriptionForStyle(style)}
                  </p>
                  {render ? <p className={cn("mt-4 font-mono text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-primary-foreground" : "text-primary")}>Synthesized demo / 16-bar phrase map</p> : null}
                  <div className="mt-7 flex h-16 items-center gap-1" aria-hidden="true">
                    {waveformFor(index).map((height, barIndex) => <span key={barIndex} className={cn("flex-1 bg-background/65", isSelected && "bg-primary-foreground/70")} style={{ height: `${height}%` }} />)}
                  </div>
                  <div className="absolute inset-x-5 bottom-5 flex gap-2 sm:inset-x-6">
                    <Button variant={isSelected ? "secondary" : "outline"} className={cn("flex-1", !isSelected && "border-background/55 bg-transparent text-background hover:bg-background hover:text-foreground")} disabled={!render || isLoading} onClick={() => { if (render) { trackGreenEvent("candidate_played", { style }); void playUrl(`render-${style}`, render.audioUrl) } }}>
                      {isLoading ? <Loader2 className="animate-spin" /> : previewingId === `render-${style}` ? <Pause /> : <Play />} {isLoading ? "Rendering" : previewingId === `render-${style}` ? "Pause" : "Hear it"}
                    </Button>
                    <Button variant={isSelected ? "outline" : "ghost"} className={cn("flex-1", isSelected ? "border-primary-foreground" : "text-background hover:bg-background hover:text-foreground")} disabled={!render} onClick={() => { setSelectedStyle(style); trackGreenEvent("candidate_kept", { style }) }}>{isSelected ? <Check /> : <CircleStop />} {isSelected ? "Kept" : "Keep"}</Button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-8 border border-foreground bg-secondary p-6 shadow-[8px_8px_0_var(--foreground)] sm:p-9 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="mono-label">The handoff</p>
            <h2 className="display-type mt-4 text-5xl leading-[0.86] sm:text-7xl">Keep it. Fork it. Start the chain.</h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">Export a 15- or 30-second vertical video carrying both source passports and permanent Mashups attribution. Standalone audio and stems never leave the Green Room.</p>
            {selectedRender ? <div className="mt-7"><GreenShareExport render={selectedRender} left={left} right={right} /></div> : <p className="mt-7 border border-foreground bg-card p-4 text-sm">Keep one arrangement to unlock the watermarked video renderer.</p>}
          </div>
          <div className="grid gap-3 lg:col-span-5">
            <div className="border border-foreground bg-card p-5">
              <p className="mono-label text-muted-foreground">Pick this up later</p>
              <h3 className="mt-3 text-xl font-semibold">Keep your mix together.</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Save the recipe to your account to open it on another device. Preview audio stays in this browser; clearing browser data removes those local copies.</p>
              <p className="mt-3 text-sm text-muted-foreground">Account saves are private. Public listening links aren’t available yet.</p>
              <p data-testid="account-save-status" className="mt-4 font-semibold">{project.accountCurrent ? "Account recipe is up to date" : "This recipe has changes on this device"}</p>
            </div>
            <Button size="lg" className="min-h-12" disabled={!restored || project.savingAccount || renderingStyle !== null} onClick={() => void project.saveToAccount()} data-testid="save-project">
              {project.savingAccount ? <><Loader2 className="animate-spin" />Saving recipe…</> : <>Save to account <ArrowRight /></>}
            </Button>
            <Button size="lg" variant="outline" className="min-h-12" disabled={!restored || project.savingAccount || renderingStyle !== null} onClick={() => void project.saveNewCopy()}><Copy />Save a new copy</Button>
            {project.accountMessage ? <p role="status" className="border border-foreground bg-card p-4 text-sm">{project.accountMessage}</p> : null}
          </div>
        </div>

        <div className="mt-12 grid gap-px border border-foreground bg-foreground md:grid-cols-3">
          <TrustPoint icon={LockKeyhole} title="Closed source pool" copy="Only Mashups originals and verified contributor tracks enter this deck." />
          <TrustPoint icon={ShieldCheck} title="Permission travels" copy={`${left.rights.passportId} and ${right.rights.passportId} stay attached to every render.`} />
          <TrustPoint icon={ArrowDownToLine} title="Exact scope" copy="Only watermarked 15/30-second videos may leave this prototype; no WAV, MP3, stems, paid media, or DSP distribution." />
        </div>
      </section>
    </div>
  )
}

function SourceDeck({
  label,
  track,
  value,
  otherId,
  side,
  playingId,
  onChoose,
  onPreview,
}: {
  label: string
  track: GreenCatalogTrack
  value: string
  otherId: string
  side: "left" | "right"
  playingId: string | null
  onChoose: (side: "left" | "right", id: string) => void
  onPreview: (track: GreenCatalogTrack) => Promise<void>
}) {
  const isLoading = playingId === `loading-${track.id}`
  const isPlaying = playingId === `track-${track.id}`
  return (
    <article className="relative overflow-hidden border border-foreground bg-card p-5 sm:p-7">
      <div className="absolute right-0 top-0 h-24 w-24 opacity-20 collision-grid" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="mono-label text-primary">{label}</p>
          <select aria-label={`${label} track`} value={value} onChange={(event) => onChoose(side, event.target.value)} className="mt-4 min-h-12 w-full max-w-sm border border-foreground bg-background px-3 font-semibold outline-none focus:ring-2 focus:ring-primary">
            {GREEN_CATALOG.map((option) => <option key={option.id} value={option.id} disabled={option.id === otherId}>{option.title} / {option.bpm} BPM</option>)}
          </select>
        </div>
        <span className="grid size-12 shrink-0 place-items-center border border-foreground font-mono text-[10px] font-bold uppercase" style={{ background: track.color, color: track.ink }}>Green</span>
      </div>

      <div className="mt-9 grid grid-cols-[5.5rem_1fr] gap-5 sm:grid-cols-[7rem_1fr]">
        <button type="button" onClick={() => void onPreview(track)} className="group relative aspect-square overflow-hidden rounded-full border border-foreground" style={{ background: track.color }} aria-label={`${isPlaying ? "Pause" : "Preview"} ${track.title}`}>
          <span className="absolute inset-[12%] rounded-full border border-current opacity-35" />
          <span className="absolute inset-[28%] rounded-full border border-current opacity-45" />
          <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground bg-background text-foreground transition-transform group-hover:scale-110">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
          </span>
        </button>
        <div className="min-w-0 self-center">
          <h2 className="display-type text-[1.65rem] leading-none sm:text-4xl">{track.title}</h2>
          <p className="mt-2 text-sm font-medium">{track.artist}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{track.genre} / {track.bpm} BPM / {track.key}</p>
        </div>
      </div>

      <div className="mt-7 flex h-16 items-center gap-1 border-y border-foreground/35 py-3" aria-hidden="true">
        {track.waveform.map((height, index) => <span key={index} className="flex-1 bg-foreground" style={{ height: `${height}%` }} />)}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5"><BadgeCheck className="size-3.5 text-primary" /> {track.rights.passportId}</span>
        <span>No samples</span>
        <span>Watermarked video only</span>
      </div>
    </article>
  )
}

function Step({ active, complete, number, label }: { active: boolean; complete: boolean; number: string; label: string }) {
  return <div className={cn("flex min-h-12 items-center gap-2 bg-background px-3 text-muted-foreground sm:px-5", active && "bg-secondary text-secondary-foreground", complete && "bg-primary text-primary-foreground")}><span>{complete ? <Check className="size-3" /> : number}</span><span>{label}</span></div>
}

function TrustPoint({ icon: Icon, title, copy }: { icon: typeof ShieldCheck; title: string; copy: string }) {
  return <div className="bg-card p-5"><Icon className="size-5 text-primary" /><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p></div>
}

function labelForStyle(style: GreenMashupStyle) {
  if (style === "vocal-a-over-b") return "A Voice / B Body"
  if (style === "vocal-b-over-a") return "B Voice / A Body"
  return "Drop Swap"
}

function descriptionForStyle(style: GreenMashupStyle) {
  if (style === "vocal-a-over-b") return "A's topline enters after a two-bar runway over B's groove."
  if (style === "vocal-b-over-a") return "B's topline takes the inverse test over A's rhythmic body."
  return "A owns the setup; B lands on bar nine with no overlapping toplines."
}

function waveformFor(index: number) {
  const waves = [
    [25, 44, 62, 38, 76, 52, 88, 64, 92, 58, 81, 46, 96, 67, 84, 54],
    [18, 28, 42, 51, 64, 72, 88, 99, 73, 91, 62, 86, 54, 79, 48, 68],
    [82, 47, 91, 56, 76, 42, 88, 63, 95, 52, 84, 61, 92, 46, 79, 68],
  ]
  return waves[index] ?? waves[0]
}
