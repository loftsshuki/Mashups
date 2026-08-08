"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  GitBranch,
  GitFork,
  Headphones,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  Music2,
  Radio,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Trophy,
  Users,
  Vote,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calculateUnlockProgress, launchShareCaption, type TemplateGenome, type ViralEventType, type ViralLaunch, type ViralPlatform } from "@/lib/viral/types"
import { cn } from "@/lib/utils"
import { PRODUCT_EVENTS, trackProductEvent } from "@/lib/analytics/events"

type OptimisticSignals = { saves: number; shares: number; forks: number }

function anonymousKey() {
  const storageKey = "mashups:viral-anonymous-key"
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing
  const next = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(storageKey, next)
  return next
}

export function LaunchRoom({ launch, demo }: { launch: ViralLaunch; demo: boolean }) {
  const [selectedGenomeId, setSelectedGenomeId] = useState(launch.genomes[0]?.id ?? "")
  const [signals, setSignals] = useState<OptimisticSignals>({ saves: launch.totalSaves, shares: launch.totalShares, forks: launch.totalForks })
  const [status, setStatus] = useState<string | null>(null)
  const [forking, setForking] = useState(false)
  const [forkName, setForkName] = useState("My city after dark")
  const [forkNiche, setForkNiche] = useState("Nightlife")
  const [forkPlatform, setForkPlatform] = useState<ViralPlatform>("tiktok")
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const selectedGenome = launch.genomes.find((genome) => genome.id === selectedGenomeId) ?? launch.genomes[0]

  const recordEvent = useCallback(async (eventType: ViralEventType, options: { genomeId?: string; platform?: string; metadata?: Record<string, string | number | boolean | null> } = {}) => {
    try {
      await fetch(`/api/viral/launches/${launch.slug}/events${demo ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, genomeId: options.genomeId ?? null, platform: options.platform ?? null, anonymousKey: anonymousKey(), metadata: options.metadata ?? {} }),
      })
    } catch { /* Participation analytics never blocks the native action. */ }
  }, [demo, launch.slug])

  useEffect(() => {
    const sessionKey = `mashups:viral-view:${launch.slug}`
    if (window.sessionStorage.getItem(sessionKey)) return
    window.sessionStorage.setItem(sessionKey, "1")
    void recordEvent("page_view")
  }, [launch.slug, recordEvent])

  async function shareLaunch() {
    if (!selectedGenome) return
    const text = launchShareCaption(launch, selectedGenome)
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: launch.title, text, url })
      else { await navigator.clipboard.writeText(`${text}\n${url}`); setStatus("Launch link copied. Send it to the creator who should go next.") }
      setSignals((current) => ({ ...current, shares: current.shares + 1 }))
      trackProductEvent(PRODUCT_EVENTS.viralLaunchShared, { launch_slug: launch.slug, genome_id: selectedGenome.id, mode: demo ? "demo" : "live" })
      void recordEvent("share_intent", { genomeId: selectedGenome.id })
    } catch { /* The native share sheet was dismissed. */ }
  }

  async function forkGenome(event: FormEvent) {
    event.preventDefault()
    if (!selectedGenome) return
    setForking(true)
    setStatus(null)
    try {
      const response = await fetch(`/api/viral/launches/${launch.slug}/fork${demo ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentGenomeId: selectedGenome.id, name: forkName, niche: forkNiche, platform: forkPlatform }),
      })
      const payload = (await response.json().catch(() => ({}))) as { error?: string; next?: string }
      if (!response.ok) {
        setStatus(response.status === 401 ? "Sign in to save your branch. Your selected genome is ready when you return." : payload.error ?? "The fork could not be created.")
        return
      }
      setSignals((current) => ({ ...current, forks: current.forks + 1 }))
      trackProductEvent(PRODUCT_EVENTS.viralTemplateForked, { launch_slug: launch.slug, genome_id: selectedGenome.id, platform: forkPlatform, mode: demo ? "demo" : "live" })
      setStatus(`Branch created from ${selectedGenome.name}. Your native posting package is ready.`)
      void recordEvent("template_start", { genomeId: selectedGenome.id, platform: forkPlatform, metadata: { forkName, niche: forkNiche } })
    } finally { setForking(false) }
  }

  async function joinSquad(squadId: string, squadName: string) {
    setPendingAction(`squad:${squadId}`)
    try {
      const response = await fetch(`/api/viral/launches/${launch.slug}/squads/${squadId}/join${demo ? "?demo=1" : ""}`, { method: "POST" })
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      setStatus(response.ok ? `You joined ${squadName}. The next raid brief will appear in your workspace.` : payload.error ?? "Unable to join this squad.")
      if (response.ok) trackProductEvent(PRODUCT_EVENTS.viralSquadJoined, { launch_slug: launch.slug, squad_id: squadId, mode: demo ? "demo" : "live" })
    } finally { setPendingAction(null) }
  }

  async function predictWinner(genome: TemplateGenome) {
    setPendingAction(`vote:${genome.id}`)
    try {
      const response = await fetch(`/api/growth/predict${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ launchSlug: launch.slug, genomeId: genome.id, confidence: 75 }) })
      const payload = await response.json().catch(() => ({})) as { error?: string }
      setStatus(response.ok ? `${genome.name} is now your breakout call. Accurate early calls build your A&R score.` : payload.error ?? "The breakout call could not be recorded.")
      void recordEvent("vote", { genomeId: genome.id, metadata: { confidence: 75 } })
    } finally {
      setPendingAction(null)
    }
  }

  async function registerSave(platform: string, destinationUrl: string) {
    if (platform === "spotify") {
      setPendingAction("save:spotify")
      const response = await fetch(`/api/growth/save${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ launchSlug: launch.slug, spotifyUri: destinationUrl, anonymousKey: anonymousKey() }) })
      const payload = await response.json().catch(() => ({})) as { error?: string; connectUrl?: string }
      if (!response.ok) {
        setStatus(payload.connectUrl ? "Connect Spotify from Growth OS, then return to save this track." : payload.error ?? "Spotify save failed.")
        setPendingAction(null)
        return
      }
      setStatus("Saved to your Spotify library. The launch received verified music intent.")
      setPendingAction(null)
    }
    setSignals((current) => ({ ...current, saves: current.saves + 1 }))
    trackProductEvent(PRODUCT_EVENTS.viralMusicSaveClicked, { launch_slug: launch.slug, platform, mode: demo ? "demo" : "live" })
    if (platform !== "spotify") void recordEvent("save_click", { platform })
  }

  return (
    <div className="pb-28 pt-20">
      <div className="border-y border-foreground bg-secondary py-2">
        <p className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] sm:px-6 lg:px-8"><span className="flex items-center gap-2"><Radio className="size-3 fill-current text-primary" />{launch.phase} / creator raid in motion</span><span>{launch.creatorKFactor.toFixed(2)} creator K</span><span className="hidden sm:inline">{money(launch.bountyCents)} outcome pool</span></p>
      </div>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="grid gap-9 border-b border-foreground py-10 lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3"><p className="signal-label">Open launch / {launch.artistName}</p>{launch.isPreRelease ? <Badge className="rounded-none"><LockKeyhole />Pre-release lab</Badge> : null}{demo ? <Badge variant="secondary" className="rounded-none">Demo campaign</Badge> : null}</div>
            <h1 className="display-type mt-6 max-w-6xl text-6xl leading-[0.8] sm:text-8xl xl:text-[8.2rem]">{launch.trackTitle}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{launch.objective}</p>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <div className="border border-foreground bg-foreground p-5 text-background shadow-[7px_7px_0_var(--primary)]">
              <div className="flex items-center justify-between"><span className="mono-label text-background/55">The source</span><Headphones className="size-5 text-secondary" /></div>
              <p className="mt-8 text-2xl font-semibold">{launch.artistName}</p><p className="mt-1 text-sm text-background/60">Official campaign audio</p>
              {launch.trackAudioUrl ? <audio controls preload="metadata" className="mt-6 w-full" src={launch.trackAudioUrl}>Your browser does not support audio playback.</audio> : <p className="mt-6 border border-background/25 p-3 text-sm">Audio unlocks at release.</p>}
            </div>
          </div>
        </header>

        <div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-4">
          <PublicMetric icon={GitFork} label="Branches" value={signals.forks} note="Formats reproducing" />
          <PublicMetric icon={Save} label="Music saves" value={signals.saves} note="Listening intent" accent />
          <PublicMetric icon={Send} label="Shares" value={signals.shares} note="Private momentum" />
          <PublicMetric icon={Trophy} label="Qualified posts" value={launch.qualifiedPosts} note="Signal over vanity" />
        </div>

        <section className="grid gap-8 border-b border-foreground py-10 xl:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="mono-label text-muted-foreground">01 / Choose the format</p>
            <h2 className="display-type mt-3 text-5xl leading-none sm:text-6xl">Fork the<br />winning idea.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Do not copy the creator. Reuse the proven timing and structure, then make the story unmistakably yours.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" onClick={() => document.getElementById("fork-lab")?.scrollIntoView({ behavior: "smooth" })}>Make your version<GitFork /></Button>
              <Button type="button" variant="outline" onClick={() => void shareLaunch()}>Send to a creator<Share2 /></Button>
            </div>
          </div>

          <div className="border-y border-foreground">
            {launch.genomes.map((genome, index) => {
              const active = genome.id === selectedGenome?.id
              return <button type="button" key={genome.id} onClick={() => setSelectedGenomeId(genome.id)} className={cn("grid w-full gap-4 border-b border-foreground p-5 text-left last:border-b-0 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center", active ? "bg-secondary" : "bg-card hover:bg-accent")}><span className={cn("grid size-12 place-items-center border border-foreground font-mono text-xs", active ? "bg-foreground text-background" : "bg-background")}>0{index + 1}</span><span><span className="flex flex-wrap items-center gap-2"><strong className="text-xl">{genome.name}</strong><Badge variant="outline" className="rounded-none">{genome.niche}</Badge></span><span className="mt-2 block text-sm text-muted-foreground">{genome.pattern} / {genome.shotCount} shots / {genome.hookDurationSec}s</span></span><span className="text-right"><strong className="display-type block text-4xl text-primary">{genome.viralScore}</strong><span className="mono-label text-muted-foreground">Viral signal</span></span></button>
            })}
          </div>
        </section>

        {selectedGenome ? <section id="fork-lab" className="grid scroll-mt-24 gap-8 border-b border-foreground py-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mono-label text-muted-foreground">02 / Template genome</p><h2 className="display-type mt-3 text-5xl leading-none">{selectedGenome.name}</h2></div><Badge variant="secondary" className="rounded-none px-4 py-2"><ShieldCheck />Rights-routed source</Badge></div>
            <div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3"><GenomeFact label="Hook" value={`${selectedGenome.hookStartSec}s -> ${selectedGenome.hookStartSec + selectedGenome.hookDurationSec}s`} /><GenomeFact label="Opening" value={selectedGenome.openingFrame} /><GenomeFact label="Structure" value={selectedGenome.pattern} /></div>
            <div className="mt-6 border border-foreground bg-card p-5"><p className="mono-label text-muted-foreground">Text rhythm</p><div className="mt-5 flex flex-wrap items-center gap-2">{selectedGenome.textBeats.map((beat, index) => <span key={beat} className="contents"><span className="border border-foreground bg-background px-3 py-2 text-sm font-semibold">{beat}</span>{index < selectedGenome.textBeats.length - 1 ? <ChevronRight className="size-4" /> : null}</span>)}</div></div>
            <PlatformPackage genome={selectedGenome} />
          </div>

          <aside className="min-w-0 lg:col-span-5">
            <form onSubmit={forkGenome} className="border border-foreground bg-primary p-6 text-primary-foreground shadow-[7px_7px_0_var(--foreground)]">
              <GitBranch className="size-7" /><p className="mono-label mt-9 text-primary-foreground/65">Your branch</p><h3 className="display-type mt-3 text-4xl leading-none">Keep the timing.<br />Change the story.</h3>
              <label className="mt-7 block space-y-2"><span className="mono-label text-primary-foreground/65">Branch name</span><Input value={forkName} onChange={(event) => setForkName(event.target.value)} className="border-primary-foreground bg-primary-foreground text-foreground" /></label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="mono-label text-primary-foreground/65">Niche / city</span><Input value={forkNiche} onChange={(event) => setForkNiche(event.target.value)} className="border-primary-foreground bg-primary-foreground text-foreground" /></label><label className="space-y-2"><span className="mono-label text-primary-foreground/65">Platform</span><select value={forkPlatform} onChange={(event) => setForkPlatform(event.target.value as ViralPlatform)} className="h-9 w-full border border-primary-foreground bg-primary-foreground px-3 text-sm text-foreground outline-none"><option value="tiktok">TikTok</option><option value="instagram">Reels</option><option value="youtube">Shorts</option></select></label></div>
              <Button type="submit" variant="secondary" className="mt-7 w-full" disabled={forking}>{forking ? <><Loader2 className="animate-spin" />Building branch</> : <>Build native package<ArrowUpRight /></>}</Button>
              <p className="mt-4 text-xs leading-relaxed text-primary-foreground/70">Clean export. Signed attribution. Native sound instructions. No promotional watermark.</p>
            </form>
          </aside>
        </section> : null}

        <section className="grid gap-10 border-b border-foreground py-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <p className="mono-label text-muted-foreground">03 / Remix lineage</p><h2 className="display-type mt-3 text-5xl leading-none">Every branch<br />feeds the root.</h2>
            <div className="mt-8 overflow-x-auto pb-4">
              <div className="min-w-[38rem]">
                <div className="mx-auto w-52 border border-foreground bg-foreground p-4 text-center text-background"><Music2 className="mx-auto size-5 text-secondary" /><p className="mt-2 font-semibold">{launch.trackTitle}</p><p className="mono-label mt-1 text-background/50">Official root</p></div>
                <ArrowDown className="mx-auto my-3 size-5" />
                <div className="grid grid-cols-3 gap-4">{launch.genomes.map((genome, index) => <div key={genome.id} className={cn("border border-foreground p-4 text-center", index === 0 ? "bg-secondary" : "bg-card")}><GitFork className="mx-auto size-4" /><p className="mt-2 font-semibold">{genome.name}</p><p className="mono-label mt-2 text-muted-foreground">{genome.forkCount} descendants</p></div>)}</div>
              </div>
            </div>
          </div>
          <div className="min-w-0 scroll-mt-28 lg:col-span-5">
            <div className="flex items-end justify-between gap-4"><div><p className="mono-label text-muted-foreground">Fan A&R</p><h2 className="display-type mt-3 text-4xl leading-none">Call it early.</h2></div><Vote className="size-7 text-primary" /></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Predict the breakout format before the blast. Accurate calls build your discovery reputation.</p>
            <div className="mt-6 border-y border-foreground">{launch.genomes.map((genome) => <div key={genome.id} className="flex items-center justify-between gap-4 border-b border-foreground py-4 last:border-b-0"><div><p className="font-semibold">{genome.name}</p><p className="mt-1 text-xs text-muted-foreground">{genome.qualifiedActivations} qualified uses</p></div><Button type="button" size="sm" variant="outline" disabled={pendingAction === `vote:${genome.id}`} onClick={() => void predictWinner(genome)}>{pendingAction === `vote:${genome.id}` ? <Loader2 className="animate-spin" /> : <Crown />}Call winner</Button></div>)}</div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-foreground py-10 lg:grid-cols-12">
          <div className="lg:col-span-7"><p className="mono-label text-muted-foreground">04 / Creator squads</p><h2 className="display-type mt-3 text-5xl leading-none">Your crew is<br />the retention loop.</h2><div className="mt-7 border border-foreground bg-card">{launch.squads.map((squad) => <article key={squad.id} className="grid gap-4 border-b border-foreground p-5 last:border-b-0 sm:grid-cols-[3rem_1fr_auto] sm:items-center"><span className="display-type text-3xl text-primary">0{squad.rank}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{squad.name}</h3><Badge variant="outline" className="rounded-none">{squad.identity}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{squad.memberCount} creators / {squad.qualifiedPosts} qualified posts / captain {squad.captain}</p></div><Button type="button" size="sm" onClick={() => void joinSquad(squad.id, squad.name)} disabled={pendingAction === `squad:${squad.id}`}>{pendingAction === `squad:${squad.id}` ? <Loader2 className="animate-spin" /> : <Users />}Join</Button></article>)}</div></div>
          <aside className="lg:col-span-5"><p className="mono-label text-muted-foreground">Raid schedule</p><div className="mt-6 border-l border-foreground pl-6">{launch.raids.map((raid) => <div key={raid.id} className="relative pb-8 last:pb-0"><span className={cn("absolute -left-[1.85rem] top-0 size-3 border border-foreground", raid.status === "active" ? "bg-primary" : raid.status === "complete" ? "bg-secondary" : "bg-card")} /><div className="flex items-center gap-3"><p className="font-semibold">{raid.name}</p><Badge variant="outline" className="rounded-none">{raid.status}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{raid.activatedCreators} of {raid.targetCreators} creators activated</p></div>)}</div></aside>
        </section>

        <section className="grid gap-10 border-b border-foreground py-10 lg:grid-cols-12">
          <div className="lg:col-span-8"><p className="mono-label text-muted-foreground">05 / Community pressure</p><h2 className="display-type mt-3 text-5xl leading-none">Move one number.<br />Unlock the next layer.</h2><div className="mt-7 grid gap-5 sm:grid-cols-3">{launch.unlocks.map((unlock) => { const progress = calculateUnlockProgress(unlock); return <article key={unlock.id} className={cn("border border-foreground p-5", unlock.unlocked ? "bg-secondary" : "bg-card")}><div className="flex items-center justify-between">{unlock.unlocked ? <CheckCircle2 className="size-5" /> : <Zap className="size-5 text-primary" />}<span className="mono-label">{progress}%</span></div><h3 className="display-type mt-8 text-3xl leading-none">{unlock.title}</h3><p className="mt-4 min-h-16 text-sm leading-relaxed text-muted-foreground">{unlock.reward}</p><div className="mt-5 h-2 border border-foreground bg-background"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div><p className="mt-2 font-mono text-xs">{unlock.current.toLocaleString()} / {unlock.target.toLocaleString()} {unlock.action}</p></article> })}</div></div>
          <aside className="lg:col-span-4"><div className="border border-foreground bg-foreground p-6 text-background shadow-[7px_7px_0_var(--primary)]"><HeartHandshake className="size-7 text-secondary" /><p className="mono-label mt-10 text-background/55">Artist promise</p><h2 className="display-type mt-3 text-4xl leading-none">Recognition is part of the deal.</h2><div className="mt-7">{launch.artistCommitments.map((commitment) => <div key={commitment.id} className="flex justify-between gap-4 border-t border-background/25 py-4"><span>{commitment.label}</span><strong>{commitment.completed} / {commitment.target}</strong></div>)}</div></div></aside>
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7"><p className="signal-label">Turn discovery into listening</p><h2 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">Save the track.<br /><span className="text-primary">Then spread it.</span></h2></div>
          <div className="lg:col-span-5"><p className="text-lg leading-relaxed text-muted-foreground">Every campaign action should lead somewhere real: a music save, a creator fork, a squad relationship, or the next attributed post.</p><div className="mt-7 flex flex-wrap gap-3">{launch.saveDestinations.map((destination) => destination.platform === "spotify" ? <Button key={destination.platform} type="button" disabled={pendingAction === "save:spotify"} onClick={() => void registerSave(destination.platform, destination.url)}>{pendingAction === "save:spotify" ? <Loader2 className="animate-spin" /> : <Save />}{saveLabel(destination.platform)}</Button> : <Button key={destination.platform} asChild variant="outline"><a href={destination.url} target="_blank" rel="noreferrer" onClick={() => void registerSave(destination.platform, destination.url)}><Save />{saveLabel(destination.platform)}</a></Button>)}<Button type="button" variant="secondary" onClick={() => void shareLaunch()}><Share2 />Share launch</Button></div></div>
        </section>

        {status ? <div role="status" className="pointer-events-none sticky bottom-4 z-30 mx-auto flex max-w-3xl items-start gap-3 border border-foreground bg-secondary p-4 shadow-[6px_6px_0_var(--foreground)]"><Check className="mt-0.5 size-5 shrink-0" /><p className="text-sm font-semibold leading-relaxed">{status}</p><button type="button" className="pointer-events-auto ml-auto font-mono text-xs underline" onClick={() => setStatus(null)}>Close</button></div> : null}
      </section>
    </div>
  )
}

function PlatformPackage({ genome }: { genome: TemplateGenome }) {
  const [platform, setPlatform] = useState<ViralPlatform>(genome.platform)
  const packages = useMemo(() => ({
    tiktok: { duration: 15, window: "8:40 PM local", comment: "Who should take the next branch?", caption: "I said I was staying in. The drop disagreed." },
    instagram: { duration: 15, window: "7:15 PM local", comment: "Send this to the friend who changes the plan.", caption: "The before lasted one beat. Then everything changed." },
    youtube: { duration: 18, window: "6:30 PM local", comment: "Use this template and keep the chain moving.", caption: "One creator enters on every kick. Your turn." },
  }), [])
  const item = packages[platform]
  async function copyPackage() { await navigator.clipboard.writeText(`${item.caption}\n\nFirst comment: ${item.comment}`) }
  return <div className="mt-6 border border-foreground bg-foreground p-5 text-background"><div className="flex flex-wrap items-center justify-between gap-3"><p className="mono-label text-background/55">Native posting package</p><div className="flex gap-1">{(["tiktok", "instagram", "youtube"] as ViralPlatform[]).map((itemPlatform) => <button type="button" key={itemPlatform} onClick={() => setPlatform(itemPlatform)} className={cn("border border-background/40 px-2 py-1 font-mono text-[0.6rem] uppercase", platform === itemPlatform && "bg-secondary text-foreground")}>{itemPlatform}</button>)}</div></div><div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto]"><div><p className="text-lg font-semibold">{item.caption}</p><p className="mt-3 text-sm text-background/60">First comment / {item.comment}</p></div><div className="font-mono text-xs text-background/70"><p>{item.duration}s clean master</p><p className="mt-2">Post near {item.window}</p></div></div><Button type="button" variant="secondary" size="sm" className="mt-5" onClick={() => void copyPackage()}><Copy />Copy package</Button></div>
}

function PublicMetric({ icon: Icon, label, value, note, accent = false }: { icon: typeof GitFork; label: string; value: number; note: string; accent?: boolean }) { return <div className={accent ? "bg-secondary p-5" : "bg-card p-5"}><Icon className="size-5" /><p className="mono-label mt-7 text-muted-foreground">{label}</p><p className="mt-2 text-4xl font-semibold">{value.toLocaleString()}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p></div> }
function GenomeFact({ label, value }: { label: string; value: string }) { return <div className="bg-card p-5"><p className="mono-label text-muted-foreground">{label}</p><p className="mt-4 text-sm font-semibold leading-relaxed">{value}</p></div> }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
function saveLabel(platform: string) { return platform === "spotify" ? "Save on Spotify" : platform === "apple" ? "Save on Apple" : "Open on YouTube" }
