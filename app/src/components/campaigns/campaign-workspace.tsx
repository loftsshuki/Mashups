"use client"

import { ChangeEvent, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Clipboard,
  Download,
  FileAudio,
  FileCheck2,
  FlaskConical,
  Loader2,
  Play,
  RefreshCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DEMO_ANALYTICS, DEMO_CAMPAIGN } from "@/lib/demo/catalog"
import { buildDemoAttributionUrl, DEMO_DRAFT_KEY, isDemoExperience } from "@/lib/demo/runtime"
import { PRODUCT_EVENTS, trackProductEvent } from "@/lib/analytics/events"
import { cn } from "@/lib/utils"

type StepId = "source" | "hooks" | "rights" | "package" | "brief"
type HookCandidate = { id: string; label: string; start: number; duration: number; score: number }
type RightsMode = "owned" | "licensed" | "open"
type UsageMode = "organic" | "paid"

type CampaignDraft = {
  title: string
  trackName: string
  duration: number
  hooks: HookCandidate[]
  selectedHookId: string | null
  rightsMode: RightsMode | null
  usageMode: UsageMode
  rightsConfirmed: boolean
  selectedCaption: number
  platforms: string[]
  attributionUrl: string | null
  proofCode: string | null
}

const steps: Array<{ id: StepId; number: string; label: string; hint: string }> = [
  { id: "source", number: "01", label: "Source", hint: "Add the track" },
  { id: "hooks", number: "02", label: "Hooks", hint: "Choose the cut" },
  { id: "rights", number: "03", label: "Rights", hint: "Prove usage" },
  { id: "package", number: "04", label: "Package", hint: "Ready the post" },
  { id: "brief", number: "05", label: "Brief", hint: "Learn the next move" },
]

const baseDraft: CampaignDraft = {
  title: "Untitled campaign",
  trackName: "",
  duration: 0,
  hooks: [],
  selectedHookId: null,
  rightsMode: null,
  usageMode: "organic",
  rightsConfirmed: false,
  selectedCaption: 0,
  platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
  attributionUrl: null,
  proofCode: null,
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.round(seconds % 60)).padStart(2, "0")}`
}

function makeHooks(duration: number): HookCandidate[] {
  const safeDuration = Math.max(duration, 60)
  const starts = [Math.min(42, safeDuration * 0.38), Math.min(18, safeDuration * 0.18), Math.min(31, safeDuration * 0.28)]
  const labels = ["Drop first", "Vocal turn", "Tension cut"]
  return starts.map((start, index) => ({
    id: `hook-${index + 1}`,
    label: labels[index] ?? `Hook ${index + 1}`,
    start: Math.round(start),
    duration: 15,
    score: 96 - index * 7,
  }))
}

function captionsFor(trackName: string) {
  const title = trackName || "this track"
  return [
    `The switch in ${title} changes the whole cut. Use the sound and show us yours.`,
    `Wait for the turn at 00:07. ${title} is cleared and ready to post.`,
    `One track, three openings. Which ${title} hook wins?`,
  ]
}

export function CampaignWorkspace() {
  const searchParams = useSearchParams()
  const demo = isDemoExperience(searchParams.get("demo"))
  const [activeStep, setActiveStep] = useState<StepId>("source")
  const [draft, setDraft] = useState<CampaignDraft>(baseDraft)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isPackaging, setIsPackaging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentIndex = steps.findIndex((step) => step.id === activeStep)
  const captions = useMemo(() => captionsFor(draft.trackName), [draft.trackName])
  const selectedHook = draft.hooks.find((hook) => hook.id === draft.selectedHookId) ?? null
  const qualityScore = [draft.trackName, selectedHook, draft.rightsConfirmed, draft.attributionUrl].filter(Boolean).length * 25

  function updateDraft(patch: Partial<CampaignDraft>) {
    setDraft((current) => {
      const next = { ...current, ...patch }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(DEMO_DRAFT_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  function loadDemoTrack() {
    const campaign = DEMO_CAMPAIGN
    updateDraft({
      title: campaign.title,
      trackName: campaign.track.title,
      duration: campaign.track.duration,
      hooks: [...campaign.hooks],
      selectedHookId: campaign.hooks[0].id,
    })
    setStatus("Demo track loaded. No production data was written.")
    trackProductEvent(PRODUCT_EVENTS.campaignStarted, { mode: "demo" })
    trackProductEvent(PRODUCT_EVENTS.trackAdded, { mode: "demo", source: "catalog" })
  }

  function restoreDraft() {
    try {
      const saved = window.localStorage.getItem(DEMO_DRAFT_KEY)
      if (!saved) {
        setStatus("No saved browser draft found yet.")
        return
      }
      setDraft({ ...baseDraft, ...(JSON.parse(saved) as CampaignDraft) })
      setStatus("Browser draft restored.")
    } catch {
      setStatus("The saved draft could not be restored.")
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    const nextUrl = URL.createObjectURL(file)
    const audio = new Audio(nextUrl)
    audio.addEventListener("loadedmetadata", () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 120
      updateDraft({
        title: `${file.name.replace(/\.[^.]+$/, "")} launch`,
        trackName: file.name.replace(/\.[^.]+$/, ""),
        duration,
        hooks: [],
        selectedHookId: null,
      })
      setAudioUrl(nextUrl)
      setStatus("Track stays in this browser until you export or connect production storage.")
      trackProductEvent(PRODUCT_EVENTS.trackAdded, { mode: demo ? "demo" : "local", source: "upload" })
    }, { once: true })
  }

  function generateHooks() {
    const hooks = demo && draft.trackName === DEMO_CAMPAIGN.track.title
      ? [...DEMO_CAMPAIGN.hooks]
      : makeHooks(draft.duration)
    updateDraft({ hooks, selectedHookId: hooks[0]?.id ?? null })
    setStatus("Three 15-second openings scored. Preview timing before export.")
  }

  function selectHook(hook: HookCandidate) {
    updateDraft({ selectedHookId: hook.id })
    trackProductEvent(PRODUCT_EVENTS.hookSelected, { hook_id: hook.id, score: hook.score, mode: demo ? "demo" : "local" })
  }

  function confirmRights() {
    if (!draft.rightsMode) {
      setStatus("Choose the source-rights basis first.")
      return
    }
    const proofCode = `MASH-${draft.rightsMode.toUpperCase()}-${String(draft.trackName.length * 7919).padStart(6, "0").slice(-6)}`
    updateDraft({ rightsConfirmed: true, proofCode })
    setStatus("Rights declaration recorded in this draft. Production certificates require the live backend.")
    trackProductEvent(PRODUCT_EVENTS.rightsConfirmed, { rights_mode: draft.rightsMode, usage_mode: draft.usageMode, mode: demo ? "demo" : "local" })
  }

  async function buildPackage() {
    if (!selectedHook || !draft.rightsConfirmed) {
      setStatus("Select a hook and confirm rights before packaging.")
      return
    }
    setIsPackaging(true)
    try {
      let attributionUrl = buildDemoAttributionUrl(draft.title)
      if (!demo) {
        const response = await fetch("/api/attribution/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            creatorId: "current-user",
            destination: `${window.location.origin}/discover`,
          }),
        })
        const payload = (await response.json().catch(() => ({}))) as { url?: string }
        if (response.ok && payload.url) attributionUrl = payload.url
        else setStatus("Live signing is unavailable. The package is marked as a local draft.")
      }
      updateDraft({ attributionUrl })
      setStatus("Campaign package ready. Caption, proof, cut point, and attribution are aligned.")
    } finally {
      setIsPackaging(false)
    }
  }

  async function copyCaption() {
    const value = `${captions[draft.selectedCaption]}\n\n${draft.attributionUrl ?? "Attribution link pending"}`
    await navigator.clipboard.writeText(value)
    setStatus("Caption and attribution copied.")
  }

  function exportManifest() {
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      mode: demo ? "demo" : "draft",
      campaign: draft,
      selectedHook,
      caption: captions[draft.selectedCaption],
      note: demo ? "Demo package. Not a production license." : "Verify the live certificate before paid usage.",
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "campaign"}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus("Campaign manifest exported.")
    trackProductEvent(PRODUCT_EVENTS.packageExported, { quality_score: qualityScore, mode: demo ? "demo" : "draft" })
  }

  function goToStep(index: number) {
    const next = steps[Math.max(0, Math.min(index, steps.length - 1))]
    if (!next) return
    setActiveStep(next.id)
    if (next.id === "brief") trackProductEvent(PRODUCT_EVENTS.briefViewed, { mode: demo ? "demo" : "draft" })
  }

  return (
    <div className={cn("mx-auto max-w-[1600px] px-4 pb-28 pt-28 sm:px-6 lg:px-8", demo && "pt-40")}>
      <header className="mb-7 flex flex-col gap-6 border-b border-foreground pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="signal-label">Campaign studio / Fast campaign</p>
          <h1 className="display-type mt-5 max-w-5xl text-5xl leading-[0.84] sm:text-7xl xl:text-8xl">One track.<br />One shippable package.</h1>
        </div>
        <div className="grid min-w-[18rem] grid-cols-2 gap-px border border-foreground bg-foreground">
          <div className="bg-card p-4"><p className="mono-label text-muted-foreground">Readiness</p><p className="mt-2 text-3xl font-semibold">{qualityScore}%</p></div>
          <div className="bg-card p-4"><p className="mono-label text-muted-foreground">Mode</p><p className="mt-2 text-lg font-semibold">{demo ? "Demo" : "Draft"}</p></div>
        </div>
      </header>

      <div className="campaign-grid">
        <nav className="border border-foreground bg-card" aria-label="Campaign stages">
          {steps.map((step, index) => {
            const complete = isStepComplete(step.id, draft)
            const active = activeStep === step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(index)}
                aria-current={active ? "step" : undefined}
                className={cn("flex min-h-20 w-full items-center gap-3 border-b border-foreground px-4 text-left last:border-b-0", active ? "bg-foreground text-background" : "hover:bg-secondary")}
              >
                <span className={cn("grid size-9 shrink-0 place-items-center border font-mono text-xs", active ? "border-background" : "border-foreground")}>
                  {complete ? <Check className="size-4" /> : step.number}
                </span>
                <span><span className="block font-semibold">{step.label}</span><span className={cn("block text-xs", active ? "text-background/65" : "text-muted-foreground")}>{step.hint}</span></span>
              </button>
            )
          })}
        </nav>

        <main className="min-w-0 border border-foreground bg-card p-5 shadow-[5px_5px_0_var(--foreground)] sm:p-7 lg:p-9" data-testid="campaign-stage">
          {activeStep === "source" ? (
            <SourceStep draft={draft} demo={demo} audioUrl={audioUrl} fileInputRef={fileInputRef} onFile={handleFile} onDemo={loadDemoTrack} onRestore={restoreDraft} onChange={updateDraft} />
          ) : null}
          {activeStep === "hooks" ? <HooksStep draft={draft} selectedHook={selectedHook} onGenerate={generateHooks} onSelect={selectHook} /> : null}
          {activeStep === "rights" ? <RightsStep draft={draft} onChange={updateDraft} onConfirm={confirmRights} /> : null}
          {activeStep === "package" ? <PackageStep draft={draft} captions={captions} isPackaging={isPackaging} onChange={updateDraft} onBuild={buildPackage} onCopy={copyCaption} onExport={exportManifest} /> : null}
          {activeStep === "brief" ? <BriefStep demo={demo} selectedHook={selectedHook} /> : null}

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-foreground pt-5">
            <Button type="button" variant="outline" onClick={() => goToStep(currentIndex - 1)} disabled={currentIndex === 0}><ArrowLeft />Previous</Button>
            {currentIndex < steps.length - 1 ? (
              <Button type="button" onClick={() => goToStep(currentIndex + 1)} data-testid="campaign-next">Next stage<ArrowRight /></Button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild><Link href={`/dashboard/analytics${demo ? "?demo=1" : ""}`}>Open analytics<BarChart3 /></Link></Button>
                <Button asChild><Link href={`/launches/new${demo ? "?demo=1" : ""}`}>Scale this launch<Rocket /></Link></Button>
              </div>
            )}
          </div>
        </main>

        <aside className="space-y-4">
          <div className="border border-foreground bg-foreground p-5 text-background">
            <p className="mono-label text-background/55">Live manifest</p>
            <dl className="mt-5 space-y-4 text-sm">
              <ManifestRow label="Track" value={draft.trackName || "Pending"} />
              <ManifestRow label="Hook" value={selectedHook ? `${formatTime(selectedHook.start)} / ${selectedHook.duration}s` : "Pending"} />
              <ManifestRow label="Rights" value={draft.rightsConfirmed ? "Declared" : "Pending"} />
              <ManifestRow label="Link" value={draft.attributionUrl ? "Signed" : "Pending"} />
            </dl>
          </div>
          <div className="border border-foreground bg-secondary p-5">
            <p className="mono-label">Quality gate</p>
            <div className="mt-4 h-3 border border-foreground bg-background"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${qualityScore}%` }} /></div>
            <p className="mt-3 text-sm font-medium">{qualityScore === 100 ? "Ready to ship." : `${4 - qualityScore / 25} checks remain.`}</p>
          </div>
          {status ? <div role="status" className="border border-foreground bg-card p-4 text-sm leading-relaxed">{status}</div> : null}
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setDraft(baseDraft); setActiveStep("source"); setStatus("Draft reset.") }}><RefreshCcw />Reset draft</Button>
        </aside>
      </div>
    </div>
  )
}

function SourceStep({ draft, demo, audioUrl, fileInputRef, onFile, onDemo, onRestore, onChange }: {
  draft: CampaignDraft
  demo: boolean
  audioUrl: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFile: (event: ChangeEvent<HTMLInputElement>) => void
  onDemo: () => void
  onRestore: () => void
  onChange: (patch: Partial<CampaignDraft>) => void
}) {
  return (
    <section className="animate-fade-in-up">
      <StepHeading icon={FileAudio} number="01" title="Start with the source" description="Keep the first decision simple: name the campaign and add one track. Local drafts never upload without your action." />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="space-y-2"><span className="mono-label text-muted-foreground">Campaign name</span><Input value={draft.title} onChange={(event) => onChange({ title: event.target.value })} className="h-12 rounded-none border-foreground bg-background" /></label>
        <label className="space-y-2"><span className="mono-label text-muted-foreground">Track label</span><Input value={draft.trackName} onChange={(event) => onChange({ trackName: event.target.value })} placeholder="Add an audio file or title" className="h-12 rounded-none border-foreground bg-background" /></label>
      </div>
      <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-6 grid min-h-64 w-full place-items-center border border-dashed border-foreground bg-background p-8 text-center transition-colors hover:bg-secondary" data-testid="track-upload">
        <span><span className="mx-auto grid size-14 place-items-center border border-foreground bg-primary text-primary-foreground"><Upload className="size-6" /></span><span className="mt-5 block text-xl font-semibold">Drop a WAV, MP3, or M4A</span><span className="mt-2 block text-sm text-muted-foreground">Audio remains local during draft mode</span></span>
      </button>
      <input ref={fileInputRef} className="sr-only" type="file" accept="audio/*" onChange={onFile} />
      {audioUrl ? <audio className="mt-5 w-full" controls src={audioUrl}>Your browser does not support audio playback.</audio> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={onDemo} data-testid="load-demo"><FlaskConical />Load labeled demo track</Button>
        <Button type="button" variant="outline" onClick={onRestore}><RefreshCcw />Restore browser draft</Button>
        {demo ? <Badge variant="secondary">Demo mode active</Badge> : null}
      </div>
    </section>
  )
}

function HooksStep({ draft, selectedHook, onGenerate, onSelect }: { draft: CampaignDraft; selectedHook: HookCandidate | null; onGenerate: () => void; onSelect: (hook: HookCandidate) => void }) {
  return (
    <section className="animate-fade-in-up">
      <StepHeading icon={WandSparkles} number="02" title="Find the stop-scroll opening" description="Generate three concise cut points, then choose the structure that earns attention fastest." />
      <Button className="mt-7" onClick={onGenerate} disabled={!draft.trackName} data-testid="generate-hooks"><Sparkles />Generate three hooks</Button>
      <div className="mt-7 grid gap-4">
        {draft.hooks.length ? draft.hooks.map((hook, index) => {
          const active = selectedHook?.id === hook.id
          return (
            <button key={hook.id} type="button" onClick={() => onSelect(hook)} className={cn("grid gap-4 border border-foreground p-4 text-left transition-transform hover:-translate-y-0.5 sm:grid-cols-[auto_1fr_auto] sm:items-center", active ? "bg-secondary shadow-[4px_4px_0_var(--foreground)]" : "bg-background")} data-testid={`hook-${index}`}>
              <span className={cn("grid size-12 place-items-center border border-foreground", active ? "bg-foreground text-background" : "bg-card")}><Play className="size-4 fill-current" /></span>
              <span><span className="block text-lg font-semibold">{hook.label}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{formatTime(hook.start)} to {formatTime(hook.start + hook.duration)} / 15 seconds</span></span>
              <span className="text-right"><span className="display-type block text-3xl text-primary">{hook.score}</span><span className="mono-label text-muted-foreground">Hook score</span></span>
            </button>
          )
        }) : <EmptyPrompt text={draft.trackName ? "Generate hook candidates when the track is ready." : "Return to Source and add a track first."} />}
      </div>
    </section>
  )
}

function RightsStep({ draft, onChange, onConfirm }: { draft: CampaignDraft; onChange: (patch: Partial<CampaignDraft>) => void; onConfirm: () => void }) {
  const modes: Array<{ id: RightsMode; title: string; text: string }> = [
    { id: "owned", title: "I own this source", text: "You control the master and composition or created both." },
    { id: "licensed", title: "I have permission", text: "You hold written permission or a valid source license." },
    { id: "open", title: "Open or public source", text: "The source terms explicitly permit this use." },
  ]
  return (
    <section className="animate-fade-in-up">
      <StepHeading icon={ShieldCheck} number="03" title="Make the rights route explicit" description="The claim-risk gate should be understood before export, not after a platform notice arrives." />
      <div className="mt-8 grid gap-3">
        {modes.map((mode) => (
          <button key={mode.id} type="button" onClick={() => onChange({ rightsMode: mode.id, rightsConfirmed: false, proofCode: null })} className={cn("flex min-h-24 items-start gap-4 border border-foreground p-4 text-left", draft.rightsMode === mode.id ? "bg-secondary shadow-[4px_4px_0_var(--foreground)]" : "bg-background hover:bg-accent")}>
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center border border-foreground">{draft.rightsMode === mode.id ? <Check className="size-4" /> : null}</span>
            <span><span className="block font-semibold">{mode.title}</span><span className="mt-1 block text-sm text-muted-foreground">{mode.text}</span></span>
          </button>
        ))}
      </div>
      <fieldset className="mt-6 border border-foreground p-4"><legend className="px-2 font-mono text-xs font-semibold uppercase tracking-wider">Intended use</legend><div className="flex flex-wrap gap-3">{(["organic", "paid"] as UsageMode[]).map((usage) => <Button key={usage} type="button" variant={draft.usageMode === usage ? "default" : "outline"} onClick={() => onChange({ usageMode: usage, rightsConfirmed: false })}>{usage === "organic" ? "Organic social" : "Paid media"}</Button>)}</div></fieldset>
      <Button className="mt-6" onClick={onConfirm} data-testid="confirm-rights"><FileCheck2 />Confirm declaration</Button>
      {draft.proofCode ? <div className="mt-5 flex items-center justify-between gap-4 border border-foreground bg-foreground p-4 text-background"><span><span className="mono-label text-background/55">Draft proof code</span><span className="mt-1 block font-mono text-sm">{draft.proofCode}</span></span><BadgeCheck className="size-7 text-secondary" /></div> : null}
    </section>
  )
}

function PackageStep({ draft, captions, isPackaging, onChange, onBuild, onCopy, onExport }: { draft: CampaignDraft; captions: string[]; isPackaging: boolean; onChange: (patch: Partial<CampaignDraft>) => void; onBuild: () => Promise<void>; onCopy: () => Promise<void>; onExport: () => void }) {
  return (
    <section className="animate-fade-in-up">
      <StepHeading icon={Clipboard} number="04" title="Assemble the posting package" description="The cut, caption, proof, platforms, and campaign link leave together so attribution is never an afterthought." />
      <div className="mt-8 grid gap-3">
        {captions.map((caption, index) => <button key={caption} type="button" onClick={() => onChange({ selectedCaption: index })} className={cn("border border-foreground p-4 text-left text-sm leading-relaxed", draft.selectedCaption === index ? "bg-secondary shadow-[4px_4px_0_var(--foreground)]" : "bg-background hover:bg-accent")}><span className="mono-label mb-2 block text-muted-foreground">Caption {index + 1}</span>{caption}</button>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">{draft.platforms.map((platform) => <Badge key={platform} variant="outline" className="rounded-none border-foreground px-3 py-2">{platform}</Badge>)}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => void onBuild()} disabled={isPackaging} data-testid="build-package">{isPackaging ? <Loader2 className="animate-spin" /> : <WandSparkles />}Build package</Button>
        <Button variant="outline" onClick={() => void onCopy()} disabled={!draft.attributionUrl}><Clipboard />Copy caption</Button>
        <Button variant="outline" onClick={onExport} disabled={!draft.attributionUrl} data-testid="export-package"><Download />Export manifest</Button>
      </div>
      {draft.attributionUrl ? <div className="mt-6 border border-foreground bg-foreground p-4 text-background"><p className="mono-label text-background/55">Attributed campaign link</p><p className="mt-2 break-all font-mono text-sm text-secondary">{draft.attributionUrl}</p></div> : null}
    </section>
  )
}

function BriefStep({ demo, selectedHook }: { demo: boolean; selectedHook: HookCandidate | null }) {
  const analytics = DEMO_ANALYTICS
  return (
    <section className="animate-fade-in-up">
      <StepHeading icon={BarChart3} number="05" title="Turn results into the next post" description={demo ? "Labeled demonstration metrics show how the weekly brief behaves once attribution events arrive." : "Live metrics appear after attributed posts begin receiving events."} />
      {demo ? (
        <>
          <div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Views" value={analytics.views.toLocaleString()} />
            <Metric label="Clicks" value={analytics.attributedClicks.toLocaleString()} />
            <Metric label="Saves" value={analytics.saves.toLocaleString()} />
            <Metric label="Follower lift" value={`+${analytics.followerLift.toLocaleString()}`} />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-foreground bg-background p-5"><p className="mono-label text-muted-foreground">Seven-day signal</p><div className="signal-bars mt-5">{analytics.series.map((value, index) => <span key={index} style={{ height: `${value}%`, animationDelay: `${index * 55}ms` }} />)}</div></div>
            <div className="border border-foreground bg-primary p-5 text-primary-foreground"><p className="mono-label text-primary-foreground/65">What to post next</p><p className="mt-5 text-xl font-semibold leading-snug">{analytics.nextMove}</p><p className="mt-5 font-mono text-xs uppercase">Winning structure / {selectedHook?.label ?? analytics.topHook}</p></div>
          </div>
        </>
      ) : <EmptyPrompt text="Publish an attributed package to unlock the live performance brief." />}
    </section>
  )
}

function StepHeading({ icon: Icon, number, title, description }: { icon: typeof FileAudio; number: string; title: string; description: string }) {
  return <div className="grid gap-5 sm:grid-cols-[auto_1fr]"><span className="grid size-14 place-items-center border border-foreground bg-primary text-primary-foreground"><Icon className="size-6" /></span><div><p className="mono-label text-muted-foreground">Stage {number}</p><h2 className="display-type mt-2 text-3xl leading-none sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p></div></div>
}

function ManifestRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-background/25 pb-3"><dt className="text-background/55">{label}</dt><dd className="max-w-32 text-right font-semibold">{value}</dd></div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-card p-4"><p className="mono-label text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold sm:text-3xl">{value}</p></div>
}

function EmptyPrompt({ text }: { text: string }) {
  return <div className="mt-7 grid min-h-40 place-items-center border border-dashed border-foreground bg-background p-7 text-center"><span><Sparkles className="mx-auto size-6 text-primary" /><span className="mt-3 block text-sm text-muted-foreground">{text}</span></span></div>
}

function isStepComplete(step: StepId, draft: CampaignDraft) {
  if (step === "source") return Boolean(draft.trackName)
  if (step === "hooks") return Boolean(draft.selectedHookId)
  if (step === "rights") return draft.rightsConfirmed
  if (step === "package") return Boolean(draft.attributionUrl)
  return false
}
