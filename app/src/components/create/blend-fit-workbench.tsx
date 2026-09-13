"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzeSection, decodeIngredient, type DecodedIngredient } from "@/lib/audio/blend-audio-client"
import { keyName, type SectionAnalysis } from "@/lib/audio/blend-analysis"
import { assessBlend, type BlendFit } from "@/lib/audio/blend-fit"
import { cn } from "@/lib/utils"

type Role = "lead" | "backing"
type Ingredient = DecodedIngredient & { url: string; origin: "file" | "demo" }
type Selection = { start: string; duration: string; bpm: string }
const EMPTY_SELECTION: Selection = { start: "0", duration: "20", bpm: "" }
const labels = { lead: "Vocal / lead", backing: "Instrumental / backing" }
const inputClass = "mt-2 min-h-11 w-full min-w-0 border border-foreground/40 bg-background px-3 text-base focus:outline-2 focus:outline-primary"
const stateLabels = { supportive: "Useful starting point", caution: "Check by ear", risk: "Issue found", unknown: "Unverified" }

export function BlendFitWorkbench({ catalog }: { catalog?: { leftId: string; rightId: string } }) {
  const [ingredients, setIngredients] = useState<Record<Role, Ingredient | null>>({ lead: null, backing: null })
  const [sections, setSections] = useState<Record<Role, Selection>>({ lead: { ...EMPTY_SELECTION }, backing: { ...EMPTY_SELECTION } })
  const [target, setTarget] = useState("120")
  const [loading, setLoading] = useState<Record<Role, boolean>>({ lead: false, backing: false })
  const [running, setRunning] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ fit: BlendFit; lead: SectionAnalysis; backing: SectionAnalysis } | null>(null)
  const controllers = useRef<Partial<Record<Role | "analysis" | "demo", AbortController>>>({})
  const urls = useRef<Partial<Record<Role, string>>>({})

  useEffect(() => {
    const currentControllers = controllers.current, currentUrls = urls.current
    return () => {
      Object.values(currentControllers).forEach((controller) => controller?.abort())
      Object.values(currentUrls).forEach((url) => { if (url) URL.revokeObjectURL(url) })
    }
  }, [])

  function invalidate() {
    controllers.current.analysis?.abort()
    setRunning(false); setResult(null); setError(null)
  }

  async function loadFile(role: Role, file: File | undefined) {
    if (!file) return
    invalidate()
    controllers.current.demo?.abort(); setDemoLoading(false)
    controllers.current[role]?.abort()
    const controller = new AbortController()
    controllers.current[role] = controller
    if (urls.current[role]) URL.revokeObjectURL(urls.current[role]!)
    delete urls.current[role]
    setIngredients((prev) => ({ ...prev, [role]: null }))
    setLoading((prev) => ({ ...prev, [role]: true }))
    try {
      const decoded = await decodeIngredient(file, controller.signal)
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(file)
      urls.current[role] = url
      setIngredients((prev) => ({ ...prev, [role]: { ...decoded, url, origin: "file" } }))
      setSections((prev) => ({ ...prev, [role]: { start: "0", duration: String(Math.min(20, Math.floor(decoded.buffer.duration * 100) / 100)), bpm: "" } }))
    } catch (err) {
      if (!controller.signal.aborted) setError(`${labels[role]}: ${err instanceof Error ? err.message : "Could not read audio."}`)
    } finally {
      if (!controller.signal.aborted) setLoading((prev) => ({ ...prev, [role]: false }))
    }
  }

  async function loadDemo() {
    invalidate()
    Object.values(controllers.current).forEach((controller) => controller?.abort())
    const controller = new AbortController()
    controllers.current.demo = controller
    setLoading({ lead: false, backing: false }); setDemoLoading(true)
    try {
      const [{ renderGreenIngredient }, { getGreenTrack, GREEN_CATALOG }] = await Promise.all([
        import("@/lib/audio/green-demo-engine"), import("@/lib/catalog/green-catalog"),
      ])
      controller.signal.throwIfAborted()
      const left = getGreenTrack(catalog?.leftId) ?? GREEN_CATALOG[0]
      const right = getGreenTrack(catalog?.rightId) ?? GREEN_CATALOG[1]
      const files = [
        new File([renderGreenIngredient(left, "lead")], `${left.title} — synthesized lead.wav`, { type: "audio/wav" }),
        new File([renderGreenIngredient(right, "backing")], `${right.title} — synthesized backing.wav`, { type: "audio/wav" }),
      ]
      // Sequential decode keeps peak memory lower on phones.
      const lead = await decodeIngredient(files[0], controller.signal)
      const backing = await decodeIngredient(files[1], controller.signal)
      controller.signal.throwIfAborted()
      for (const role of ["lead", "backing"] as const) if (urls.current[role]) URL.revokeObjectURL(urls.current[role]!)
      const leadUrl = URL.createObjectURL(files[0]), backingUrl = URL.createObjectURL(files[1])
      urls.current.lead = leadUrl; urls.current.backing = backingUrl
      setIngredients({ lead: { ...lead, url: leadUrl, origin: "demo" }, backing: { ...backing, url: backingUrl, origin: "demo" } })
      setSections({ lead: { start: "0", duration: "12", bpm: "" }, backing: { start: "0", duration: "12", bpm: "" } })
      setTarget(String(Math.round((left.bpm + right.bpm) / 2)))
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Demo ingredients could not load.")
    } finally {
      if (!controller.signal.aborted) setDemoLoading(false)
    }
  }

  function updateSection(role: Role, name: keyof Selection, value: string) {
    invalidate()
    setSections((prev) => ({ ...prev, [role]: { ...prev[role], [name]: value } }))
  }

  async function runCheck() {
    if (!ingredients.lead || !ingredients.backing) return
    invalidate()
    const controller = new AbortController()
    controllers.current.analysis = controller
    setRunning(true)
    try {
      const config = { targetBpm: Number(target), leadBpm: sections.lead.bpm.trim() ? Number(sections.lead.bpm) : undefined, backingBpm: sections.backing.bpm.trim() ? Number(sections.backing.bpm) : undefined }
      for (const value of [config.targetBpm, config.leadBpm, config.backingBpm]) if (value !== undefined && (!Number.isFinite(value) || value < 40 || value > 240)) throw new Error("Tempo must be between 40 and 240 BPM.")
      for (const section of Object.values(sections)) if (!section.start.trim() || !section.duration.trim()) throw new Error("Enter the start and length of each section.")
      const lead = await analyzeSection(ingredients.lead.buffer, Number(sections.lead.start), Number(sections.lead.duration), controller.signal)
      const backing = await analyzeSection(ingredients.backing.buffer, Number(sections.backing.start), Number(sections.backing.duration), controller.signal)
      if (!controller.signal.aborted) setResult({ fit: assessBlend(lead, backing, config), lead, backing })
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not check this pair.")
    } finally {
      if (!controller.signal.aborted) setRunning(false)
    }
  }

  // Keep local filenames, selections and results out of PostHog autocapture and replay.
  return <section aria-label="Blend Fit" className="ph-no-capture border border-foreground bg-card" data-testid="blend-fit-workbench">
    <div className="grid gap-5 border-b border-foreground p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
      <div><p className="signal-label">Before you make the mix</p><h2 className="display-type mt-2 text-4xl sm:text-5xl">BLEND FIT</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed">Find a promising starting point. Check a vocal or lead against an instrumental, then let your ears decide.</p></div>
      <Button variant="outline" disabled={demoLoading} onClick={() => void loadDemo()}>{demoLoading ? <Loader2 className="animate-spin" /> : null}{catalog ? "Load this demo pair" : "Try demo ingredients"}</Button>
    </div>
    <p className="border-b border-foreground/20 bg-secondary/25 px-5 py-3 text-sm sm:px-7">Files stay on this device. Choose 8–30 seconds from each ingredient. This check does not separate or render a mashup.</p>
    <div className="grid md:grid-cols-2">{(["lead", "backing"] as const).map((role) => <IngredientPicker key={role} role={role} ingredient={ingredients[role]} section={sections[role]} loading={loading[role]} disabled={demoLoading} onFile={(file) => void loadFile(role, file)} onSection={(name, value) => updateSection(role, name, value)} />)}</div>
    <div className="border-t border-foreground p-5 sm:p-7">
      <div className="flex flex-wrap items-end gap-4">
        <label className="w-40 text-sm font-semibold" htmlFor="blend-target">Target tempo / BPM<input id="blend-target" className={inputClass} type="number" min="40" max="240" step="0.1" value={target} onChange={(e) => { invalidate(); setTarget(e.target.value) }} /></label>
        <Button className="min-h-11" disabled={!ingredients.lead || !ingredients.backing || loading.lead || loading.backing || demoLoading || running} onClick={() => void runCheck()}>{running ? <><Loader2 className="animate-spin" />Checking sections…</> : <>Check Blend Fit<ArrowRight /></>}</Button>
        {running ? <Button variant="ghost" onClick={invalidate}>Cancel check</Button> : null}
      </div>
      <details className="mt-5 border-t border-foreground/20 pt-4">
        <summary className="cursor-pointer text-sm font-semibold">Producer details — source tempo overrides</summary>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">If you have verified a tempo in your DAW, enter it here. It is labeled as your input. Leave blank to use the measured pulse; half/double tempo still needs confirmation.</p>
        <div className="mt-3 grid max-w-xl gap-4 sm:grid-cols-2">{(["lead", "backing"] as const).map((role) => <label className="text-sm" key={role}>{labels[role]} BPM<input aria-label={`${role} source BPM`} type="number" min="40" max="240" step="0.1" placeholder="Use measured pulse" className={inputClass} value={sections[role].bpm} onChange={(e) => updateSection(role, "bpm", e.target.value)} /></label>)}</div>
      </details>
      {error ? <p role="alert" className="mt-5 border border-destructive p-4 text-sm text-destructive">{error}</p> : null}
      <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 text-sm">{running ? "Measuring the selected audio on your device…" : result ? `Check complete: ${result.fit.status}.` : "Choose your ingredients and check this combination. You can experiment with any result."}</div>
    </div>
    {result ? <div data-testid="blend-fit-result" className="border-t border-foreground">
      <div className={cn("p-5 sm:p-7", result.fit.status === "Promising" ? "bg-secondary" : "bg-muted")}>
        <p className="signal-label">Guidance from these sections</p><h3 className="display-type mt-2 text-3xl sm:text-4xl">{result.fit.status}</h3><p className="mt-3 max-w-3xl leading-relaxed">{result.fit.summary}</p>
        <p className="mt-3 text-sm">Lead {sections.lead.start}–{Number(sections.lead.start) + Number(sections.lead.duration)}s · Backing {sections.backing.start}–{Number(sections.backing.start) + Number(sections.backing.duration)}s · {result.fit.targetBpm} BPM · Original pitch</p>
      </div>
      <div className="divide-y divide-foreground/20 px-5 sm:px-7">{result.fit.factors.map((factor) => <div key={factor.id} className="grid gap-3 py-5 md:grid-cols-[13rem_1fr]">
        <div><h4 className="font-semibold">{factor.title}</h4><span className={cn("mt-2 inline-block border px-2 py-1 text-xs", factor.state === "risk" ? "border-destructive text-destructive" : "border-foreground/30")}>{stateLabels[factor.state]}</span></div>
        <div><p className="text-sm leading-relaxed">{factor.detail}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{factor.action}</p></div>
      </div>)}</div>
      <details className="border-t border-foreground/20 p-5 sm:px-7">
        <summary className="cursor-pointer text-sm font-semibold">Measurement details & limits</summary>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">{(["lead", "backing"] as const).map((role) => <div key={role}><p className="font-semibold">{labels[role]}</p><p>Measured pulse: {result[role].tempo.bpm?.toFixed(1) ?? "Uncertain"}{result[role].tempo.bpm ? " BPM" : ""}</p><p>Key estimate: {keyName(result[role].tonal.key)}</p><p className="mt-2 text-muted-foreground">{result[role].tempo.reason} {result[role].tonal.reason}</p></div>)}</div>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">Early signal heuristics, not a probability of a good song. Analysis uses the louder channel of each section; it does not check stereo mix quality, chord alignment, isolated vocal pitch or the finished render. These labels still need validation against blind listener ratings.</p>
      </details>
    </div> : null}
  </section>
}

function IngredientPicker({ role, ingredient, section, loading, disabled, onFile, onSection }: {
  role: Role; ingredient: Ingredient | null; section: Selection; loading: boolean; disabled: boolean
  onFile: (file: File | undefined) => void; onSection: (name: keyof Selection, value: string) => void
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  function changeSection(name: keyof Selection, value: string) { audioRef.current?.pause(); onSection(name, value) }
  return <div className={cn("min-w-0 p-5 sm:p-7", role === "lead" && "border-b border-foreground/20 md:border-b-0 md:border-r")}>
    <h3 className="text-xl font-semibold">{labels[role]}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{role === "lead" ? "Use an isolated vocal or melodic lead." : "Use drums, bass and music with the vocal removed."}</p>
    <label className="mt-5 block text-sm font-semibold">{role === "lead" ? "Lead audio file" : "Backing audio file"}<input className="mt-2 block w-full min-w-0 border border-foreground/30 bg-background p-2 text-sm file:mr-3 file:min-h-9 file:border-0 file:bg-secondary file:px-3" type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" disabled={disabled} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = "" }} /></label>
    {loading ? <p role="status" className="mt-4 text-sm">Reading audio on this device…</p> : null}
    {ingredient ? <>
      <p className="mt-4 break-words text-sm font-semibold">{ingredient.file.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{ingredient.origin === "demo" ? "Synthesized demo ingredient" : "Your local audio"} · {ingredient.buffer.duration.toFixed(1)} seconds</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm">Start / seconds<input aria-label={`${role} section start`} type="number" min="0" step="0.1" className={inputClass} value={section.start} onChange={(e) => changeSection("start", e.target.value)} /></label>
        <label className="text-sm">Length / seconds<input aria-label={`${role} section length`} type="number" min="8" max="30" step="0.1" className={inputClass} value={section.duration} onChange={(e) => changeSection("duration", e.target.value)} /></label>
      </div>
      <audio ref={audioRef} key={ingredient.url} controls preload="metadata" src={ingredient.url} aria-label={`Listen to ${role} section`} className="mt-4 h-11 w-full" onPlay={(e) => {
        const audio = e.currentTarget, start = Number(section.start), end = start + Number(section.duration)
        document.querySelectorAll("audio").forEach((other) => { if (other !== audio) other.pause() })
        if (Number.isFinite(start) && start >= 0 && start < ingredient.buffer.duration && (audio.currentTime < start || audio.currentTime >= end)) audio.currentTime = start
      }} onTimeUpdate={(e) => { if (e.currentTarget.currentTime >= Number(section.start) + Number(section.duration)) e.currentTarget.pause() }} />
      <p className="mt-2 text-xs text-muted-foreground">Listen to the selected section at its original speed and pitch.</p>
    </> : <p className="mt-4 text-xs text-muted-foreground">WAV or MP3 recommended · Up to 25 MB and 10 minutes</p>}
  </div>
}
