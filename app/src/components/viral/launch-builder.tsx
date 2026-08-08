"use client"

import { FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, CircleDollarSign, FlaskConical, Loader2, Radio, Rocket, Sparkles, Users, WandSparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PRODUCT_EVENTS, trackProductEvent } from "@/lib/analytics/events"

const stages = ["Track", "Genomes", "Network", "Incentives", "Ignition"] as const
const nicheOptions = ["Dance", "Nightlife", "Fashion", "Fitness", "Gaming", "Comedy"]

type Draft = {
  title: string
  artistName: string
  trackTitle: string
  objective: string
  startsAt: string
  releaseAt: string
  bountyDollars: number
  testCreators: number
  scaleCreators: number
  niches: string[]
  artistReactionCount: number
  spotifyUrl: string
  appleUrl: string
  youtubeUrl: string
}

const initialDraft: Draft = {
  title: "Midnight Velocity / Breakout",
  artistName: "Nia Vale",
  trackTitle: "Midnight Velocity",
  objective: "Find the most repeatable 15-second structure, then activate matched creator squads in a 72-hour wave.",
  startsAt: "2026-08-08T16:00",
  releaseAt: "2026-08-09T00:00",
  bountyDollars: 2500,
  testCreators: 20,
  scaleCreators: 100,
  niches: ["Nightlife", "Fashion", "Dance"],
  artistReactionCount: 5,
  spotifyUrl: "https://open.spotify.com/",
  appleUrl: "https://music.apple.com/",
  youtubeUrl: "https://music.youtube.com/",
}

export function LaunchBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const demo = searchParams.get("demo") === "1"
  const [stage, setStage] = useState(0)
  const [draft, setDraft] = useState(initialDraft)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const projectedCreators = draft.scaleCreators * 5 + draft.testCreators + draft.scaleCreators
  const projectedPackages = projectedCreators * 3
  const readiness = [draft.trackTitle, draft.artistName, draft.niches.length, draft.bountyDollars >= 0, draft.artistReactionCount].filter(Boolean).length * 20

  function patch(value: Partial<Draft>) { setDraft((current) => ({ ...current, ...value })) }
  function toggleNiche(niche: string) {
    patch({ niches: draft.niches.includes(niche) ? draft.niches.filter((item) => item !== niche) : draft.niches.length < 3 ? [...draft.niches, niche] : draft.niches })
  }

  async function ignite(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setStatus(null)
    try {
      const response = await fetch(`/api/viral/launches${demo ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          artistName: draft.artistName,
          trackTitle: draft.trackTitle,
          objective: draft.objective,
          startsAt: new Date(draft.startsAt).toISOString(),
          releaseAt: draft.releaseAt ? new Date(draft.releaseAt).toISOString() : null,
          bountyCents: Math.round(draft.bountyDollars * 100),
          testCreators: draft.testCreators,
          scaleCreators: draft.scaleCreators,
          niches: draft.niches,
          artistReactionCount: draft.artistReactionCount,
          saveDestinations: [
            { platform: "spotify", url: draft.spotifyUrl },
            { platform: "apple", url: draft.appleUrl },
            { platform: "youtube", url: draft.youtubeUrl },
          ].filter((destination) => destination.url),
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as { error?: string; launch?: { slug?: string } }
      if (!response.ok) { setStatus(payload.error ?? "Unable to create the launch."); return }
      const slug = payload.launch?.slug ?? "midnight-velocity"
      trackProductEvent(PRODUCT_EVENTS.viralLaunchCreated, { mode: demo ? "demo" : "live", test_creators: draft.testCreators, scale_creators: draft.scaleCreators, bounty_cents: Math.round(draft.bountyDollars * 100) })
      router.push(`/launches/${slug}${demo ? "?demo=1" : ""}`)
    } catch { setStatus("The launch request could not reach the server.") }
    finally { setPending(false) }
  }

  return (
    <form onSubmit={ignite} className="mx-auto max-w-[1600px] px-4 pb-28 pt-28 sm:px-6 lg:px-8">
      <header className="grid gap-7 border-b border-foreground pb-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8"><p className="signal-label">Launch protocol / Builder</p><h1 className="display-type mt-6 text-6xl leading-[0.82] sm:text-8xl">Test small.<br /><span className="text-primary">Break wide.</span></h1></div>
        <div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Configure the creative test, creator network, incentives, unlocks, and artist obligations as one launch contract.</p><div className="mt-6 h-3 border border-foreground bg-card"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${readiness}%` }} /></div><p className="mono-label mt-2">Readiness / {readiness}%</p></div>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[13rem_1fr_18rem]">
        <nav aria-label="Launch builder stages" className="h-fit border border-foreground bg-card">
          {stages.map((label, index) => <button type="button" key={label} onClick={() => setStage(index)} className={cn("flex w-full items-center gap-3 border-b border-foreground p-4 text-left last:border-b-0", stage === index ? "bg-secondary" : "hover:bg-accent")}><span className="font-mono text-xs">0{index + 1}</span><span className="font-semibold">{label}</span>{stage > index ? <Check className="ml-auto size-4" /> : null}</button>)}
        </nav>

        <main className="min-h-[36rem] border border-foreground bg-card p-5 sm:p-8">
          {stage === 0 ? <TrackStage draft={draft} patch={patch} /> : null}
          {stage === 1 ? <GenomeStage draft={draft} toggleNiche={toggleNiche} /> : null}
          {stage === 2 ? <NetworkStage draft={draft} patch={patch} projectedCreators={projectedCreators} projectedPackages={projectedPackages} /> : null}
          {stage === 3 ? <IncentiveStage draft={draft} patch={patch} /> : null}
          {stage === 4 ? <IgnitionStage draft={draft} projectedCreators={projectedCreators} /> : null}
          <div className="mt-10 flex items-center justify-between border-t border-foreground pt-5"><Button type="button" variant="outline" disabled={stage === 0} onClick={() => setStage((value) => Math.max(0, value - 1))}><ArrowLeft />Previous</Button>{stage < stages.length - 1 ? <Button type="button" onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))}>Next stage<ArrowRight /></Button> : <Button type="submit" disabled={pending || !draft.niches.length}>{pending ? <><Loader2 className="animate-spin" />Igniting</> : <>Ignite launch<Rocket /></>}</Button>}</div>
          {status ? <p role="alert" className="mt-5 border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{status}</p> : null}
        </main>

        <aside className="h-fit space-y-4">
          <div className="border border-foreground bg-foreground p-5 text-background"><p className="mono-label text-background/55">Protocol manifest</p><dl className="mt-6 space-y-4 text-sm"><Manifest label="Track" value={draft.trackTitle} /><Manifest label="Genomes" value={String(draft.niches.length)} /><Manifest label="Test cohort" value={String(draft.testCreators)} /><Manifest label="Scale cohort" value={String(draft.scaleCreators)} /><Manifest label="Bounty" value={`$${draft.bountyDollars.toLocaleString()}`} /><Manifest label="Artist reactions" value={String(draft.artistReactionCount)} /></dl></div>
          <div className="border border-foreground bg-primary p-5 text-primary-foreground"><Radio className="size-6" /><p className="mono-label mt-8 text-primary-foreground/65">Projected network</p><p className="display-type mt-3 text-5xl">{projectedCreators.toLocaleString()}</p><p className="mt-2 text-sm">creator assignments across three native platforms</p></div>
        </aside>
      </div>
    </form>
  )
}

function TrackStage({ draft, patch }: { draft: Draft; patch: (value: Partial<Draft>) => void }) { return <section><StageHeading icon={FlaskConical} number="01" title="Set the mission" text="One track, one measurable objective, one tightly controlled launch window." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Launch name"><Input value={draft.title} onChange={(event) => patch({ title: event.target.value })} /></Field><Field label="Artist"><Input value={draft.artistName} onChange={(event) => patch({ artistName: event.target.value })} /></Field><Field label="Track"><Input value={draft.trackTitle} onChange={(event) => patch({ trackTitle: event.target.value })} /></Field><Field label="Launch start"><Input type="datetime-local" value={draft.startsAt} onChange={(event) => patch({ startsAt: event.target.value })} /></Field><Field label="Release / pre-save switch"><Input type="datetime-local" value={draft.releaseAt} onChange={(event) => patch({ releaseAt: event.target.value })} /></Field><label className="space-y-2 sm:col-span-2"><span className="mono-label text-muted-foreground">Objective</span><textarea className="min-h-28 w-full border border-foreground bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={draft.objective} onChange={(event) => patch({ objective: event.target.value })} /></label><Field label="Spotify save URL"><Input type="url" value={draft.spotifyUrl} onChange={(event) => patch({ spotifyUrl: event.target.value })} /></Field><Field label="Apple Music URL"><Input type="url" value={draft.appleUrl} onChange={(event) => patch({ appleUrl: event.target.value })} /></Field><Field label="YouTube Music URL"><Input type="url" value={draft.youtubeUrl} onChange={(event) => patch({ youtubeUrl: event.target.value })} /></Field></div></section> }
function GenomeStage({ draft, toggleNiche }: { draft: Draft; toggleNiche: (niche: string) => void }) { return <section><StageHeading icon={WandSparkles} number="02" title="Seed three genomes" text="Select creator identities. Mashups creates a distinct, forkable format for each instead of cloning one generic post." /><div className="mt-8 flex flex-wrap gap-3">{nicheOptions.map((niche) => <Button key={niche} type="button" variant={draft.niches.includes(niche) ? "default" : "outline"} onClick={() => toggleNiche(niche)}>{draft.niches.includes(niche) ? <Check /> : <Sparkles />}{niche}</Button>)}</div><div className="mt-8 divide-y divide-foreground border-y border-foreground">{draft.niches.map((niche, index) => <div key={niche} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center"><span className="display-type text-3xl text-primary">0{index + 1}</span><div><p className="font-semibold">{["Stop-Scroll Confession", "One-Beat Reveal", "Pass-The-Drop Chain"][index]}</p><p className="mt-1 text-sm text-muted-foreground">{niche} / {index === 0 ? "TikTok" : index === 1 ? "Instagram Reels" : "YouTube Shorts"}</p></div><span className="mono-label">15 sec</span></div>)}</div></section> }
function NetworkStage({ draft, patch, projectedCreators, projectedPackages }: { draft: Draft; patch: (value: Partial<Draft>) => void; projectedCreators: number; projectedPackages: number }) { return <section><StageHeading icon={Users} number="03" title="Stage the creator wave" text="A small test proves the format. A matched scale cohort confirms it. The blast multiplies only the winner." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Signal test creators"><Input type="number" min={5} max={500} value={draft.testCreators} onChange={(event) => patch({ testCreators: Number(event.target.value) })} /></Field><Field label="Scale creators"><Input type="number" min={20} max={10000} value={draft.scaleCreators} onChange={(event) => patch({ scaleCreators: Number(event.target.value) })} /></Field></div><div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3"><BuilderMetric label="Wave 01" value={draft.testCreators} note="Test" /><BuilderMetric label="Wave 02" value={draft.scaleCreators} note="Scale" /><BuilderMetric label="Wave 03" value={projectedCreators - draft.testCreators - draft.scaleCreators} note="Blast" /></div><p className="mt-5 font-mono text-xs text-muted-foreground">{projectedPackages.toLocaleString()} differentiated TikTok, Reels, and Shorts packages generated at full activation.</p></section> }
function IncentiveStage({ draft, patch }: { draft: Draft; patch: (value: Partial<Draft>) => void }) { return <section><StageHeading icon={CircleDollarSign} number="04" title="Put pressure on outcomes" text="Reward incremental lift, qualified posts, saves, and useful descendants. Raw views do not settle the pool." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Outcome pool / USD"><Input type="number" min={0} value={draft.bountyDollars} onChange={(event) => patch({ bountyDollars: Number(event.target.value) })} /></Field><Field label="Guaranteed artist reactions"><Input type="number" min={1} max={100} value={draft.artistReactionCount} onChange={(event) => patch({ artistReactionCount: Number(event.target.value) })} /></Field></div><div className="mt-8 border border-foreground bg-secondary p-5"><p className="mono-label">Community unlock contract</p><ul className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><li><strong className="block">500 forks</strong><span className="text-muted-foreground">Official stems</span></li><li><strong className="block">5,000 saves</strong><span className="text-muted-foreground">Double bounty</span></li><li><strong className="block">100 posts</strong><span className="text-muted-foreground">Artist live room</span></li></ul></div></section> }
function IgnitionStage({ draft, projectedCreators }: { draft: Draft; projectedCreators: number }) { return <section><StageHeading icon={Rocket} number="05" title="Lock the protocol" text="Ignition writes the complete launch network, public participation surface, payout rules, and artist obligations." /><div className="mt-8 border-y border-foreground"><Review label="Track" value={`${draft.artistName} / ${draft.trackTitle}`} /><Review label="Creative test" value={`${draft.niches.length} genomes across ${draft.niches.join(", ")}`} /><Review label="Creator network" value={`${projectedCreators.toLocaleString()} projected assignments`} /><Review label="Incentive" value={`$${draft.bountyDollars.toLocaleString()} qualified outcome pool`} /><Review label="Artist contract" value={`${draft.artistReactionCount} reactions, 3 reposts, 1 live room`} /></div><p className="mt-6 flex gap-3 text-sm leading-relaxed text-muted-foreground"><Check className="mt-0.5 size-5 shrink-0 text-primary" />Every export stays clean and platform-native. Attribution lives in signed links, lineage, sound identity, and the campaign manifest rather than a baked-in watermark.</p></section> }
function StageHeading({ icon: Icon, number, title, text }: { icon: typeof Rocket; number: string; title: string; text: string }) { return <div className="grid gap-4 sm:grid-cols-[3.5rem_1fr]"><span className="grid size-14 place-items-center border border-foreground bg-primary text-primary-foreground"><Icon className="size-6" /></span><div><p className="mono-label text-muted-foreground">Stage {number}</p><h2 className="display-type mt-2 text-4xl leading-none">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text}</p></div></div> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2"><span className="mono-label text-muted-foreground">{label}</span>{children}</label> }
function Manifest({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b border-background/25 pb-3"><dt className="text-background/55">{label}</dt><dd className="max-w-32 text-right font-semibold">{value}</dd></div> }
function BuilderMetric({ label, value, note }: { label: string; value: number; note: string }) { return <div className="bg-card p-5"><p className="mono-label text-muted-foreground">{label}</p><p className="mt-4 text-4xl font-semibold">{value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }
function Review({ label, value }: { label: string; value: string }) { return <div className="grid gap-2 border-b border-foreground py-5 last:border-b-0 sm:grid-cols-[11rem_1fr]"><p className="mono-label text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div> }
