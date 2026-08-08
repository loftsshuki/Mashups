import Link from "next/link"
import {
  ArrowUpRight,
  AudioLines,
  BadgeDollarSign,
  Check,
  Clock3,
  Radio,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { calculateUnlockProgress, type ViralLaunch } from "@/lib/viral/types"

export function LaunchCommandCenter({ launches, demo }: { launches: ViralLaunch[]; demo: boolean }) {
  const launch = launches[0]
  if (!launch) return <EmptyCommandCenter />
  const winner = launch.genomes[0]

  return (
    <div className="pb-28 pt-28">
      <div className="overflow-hidden border-y border-foreground bg-foreground py-2 text-background">
        <div className="ticker-track gap-10 whitespace-nowrap font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
          {[0, 1].map((loop) => (
            <span key={loop} className="flex gap-10" aria-hidden={loop === 1}>
              <span>Signal test complete</span><span className="text-secondary">Creator K / {launch.creatorKFactor.toFixed(2)}</span><span>{launch.qualifiedPosts} qualified posts</span><span className="text-secondary">{launch.totalSaves.toLocaleString()} music saves</span><span>{launch.totalForks} live branches</span><span className="text-secondary">Global blast active</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="grid gap-8 border-b border-foreground py-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <p className="signal-label">Viral command / {launch.phase}</p>
              {demo ? <Badge variant="secondary" className="rounded-none">Labeled demo</Badge> : null}
            </div>
            <h1 className="display-type mt-6 max-w-5xl text-6xl leading-[0.82] sm:text-8xl xl:text-[7.6rem]">
              Manufacture<br /><span className="text-primary">the moment.</span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-muted-foreground">One launch surface controls the test, the winning creative genome, the creator wave, community rewards, and artist follow-through.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild><Link href={`/launches/${launch.slug}${demo ? "?demo=1" : ""}`}>Open public launch<ArrowUpRight /></Link></Button>
              <Button variant="outline" asChild><Link href={`/launches/new${demo ? "?demo=1" : ""}`}>New protocol<Rocket /></Link></Button>
            </div>
          </div>
        </header>

        <div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Creator K" value={launch.creatorKFactor.toFixed(2)} note="Target > 1.00" accent />
          <Metric label="Activated" value={launch.creatorsActivated.toLocaleString()} note="Creators in motion" />
          <Metric label="Qualified" value={launch.qualifiedPosts.toLocaleString()} note="Rights + signal passed" />
          <Metric label="Saves" value={launch.totalSaves.toLocaleString()} note="Music intent" />
          <Metric label="Bounty" value={money(launch.bountyCents)} note="Outcome pool" />
        </div>

        <section className="grid gap-7 border-b border-foreground py-9 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <SectionHeading eyebrow="01 / Test then blast" title="Raid control" description="Scale only after a creative structure earns the right signals." />
            <div className="mt-7 border-y border-foreground">
              {launch.raids.map((raid, index) => {
                const progress = Math.min(100, Math.round((raid.activatedCreators / raid.targetCreators) * 100))
                return (
                  <article key={raid.id} className="grid gap-4 border-b border-foreground py-5 last:border-b-0 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center">
                    <span className="display-type text-4xl text-muted-foreground">0{index + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-semibold">{raid.name}</h3><Badge variant={raid.status === "active" ? "default" : "outline"} className="rounded-none">{raid.status}</Badge></div>
                      <div className="mt-3 h-2 border border-foreground bg-background"><div className={raid.status === "active" ? "h-full bg-primary" : "h-full bg-secondary"} style={{ width: `${progress}%` }} /></div>
                    </div>
                    <p className="font-mono text-sm"><strong>{raid.activatedCreators}</strong> / {raid.targetCreators}</p>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="relative overflow-hidden border border-foreground bg-primary p-6 text-primary-foreground shadow-[7px_7px_0_var(--foreground)]">
            <AudioLines className="absolute -right-8 -top-7 size-40 opacity-15" />
            <p className="mono-label text-primary-foreground/65">Winning genome</p>
            <p className="display-type mt-12 text-5xl leading-[0.88]">{winner?.name ?? "Awaiting signal"}</p>
            {winner ? <><p className="mt-5 max-w-sm leading-relaxed">{winner.pattern}. Built for {winner.niche.toLowerCase()} creators on {platformLabel(winner.platform)}.</p><div className="mt-8 grid grid-cols-3 gap-px border border-primary-foreground bg-primary-foreground text-foreground"><Signal label="Score" value={String(winner.viralScore)} /><Signal label="Forks" value={String(winner.forkCount)} /><Signal label="Share" value={`${(winner.shareRate * 100).toFixed(1)}%`} /></div></> : null}
          </aside>
        </section>

        <section className="grid gap-10 border-b border-foreground py-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="02 / Creative genome" title="Structures that reproduce" description="Rank the format, not merely the audio. Every branch preserves lineage and attribution." />
            <div className="mt-7">
              {launch.genomes.map((genome, index) => (
                <article key={genome.id} className="group grid gap-4 border-t border-foreground py-5 first:border-t-0 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
                  <span className="grid size-12 place-items-center border border-foreground bg-card font-mono text-sm group-first:bg-secondary">0{index + 1}</span>
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">{genome.name}</h3><Badge variant="outline" className="rounded-none">{genome.niche}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{genome.openingFrame} {genome.pattern}.</p></div>
                  <div className="flex items-center gap-6 text-right"><span><strong className="display-type block text-3xl text-primary">{genome.viralScore}</strong><small className="mono-label text-muted-foreground">Signal</small></span><span><strong className="block text-lg">{genome.forkCount}</strong><small className="mono-label text-muted-foreground">Forks</small></span></div>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <SectionHeading eyebrow="03 / Squad pressure" title="Teams beat accounts" description="Shared goals turn publishing into a social obligation." />
            <div className="mt-7 border border-foreground bg-card">
              {launch.squads.map((squad) => (
                <div key={squad.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-foreground p-4 last:border-b-0">
                  <span className="display-type text-3xl text-primary">{String(squad.rank).padStart(2, "0")}</span>
                  <div><p className="font-semibold">{squad.name}</p><p className="mt-1 text-xs text-muted-foreground">{squad.identity} / {squad.memberCount} members</p></div>
                  <p className="font-mono text-sm font-semibold">{squad.score}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-10 py-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="04 / Collective pressure" title="Community unlocks" description="Give the entire network a reason to move the same number." />
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {launch.unlocks.map((unlock) => {
                const progress = calculateUnlockProgress(unlock)
                return <article key={unlock.id} className={unlock.unlocked ? "border border-foreground bg-secondary p-5" : "border border-foreground bg-card p-5"}><div className="flex items-center justify-between"><span className="mono-label">{unlock.action}</span>{unlock.unlocked ? <Check className="size-5" /> : <Zap className="size-5 text-primary" />}</div><p className="display-type mt-9 text-3xl leading-none">{unlock.title}</p><p className="mt-4 min-h-16 text-sm leading-relaxed text-muted-foreground">{unlock.reward}</p><div className="mt-5 h-2 border border-foreground bg-background"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div><p className="mt-2 font-mono text-xs">{unlock.current.toLocaleString()} / {unlock.target.toLocaleString()}</p></article>
              })}
            </div>
          </div>
          <aside className="lg:col-span-5">
            <SectionHeading eyebrow="05 / Artist contract" title="No upload and vanish" description="The campaign includes artist actions creators can actually feel." />
            <div className="mt-7 border-t border-foreground">
              {launch.artistCommitments.map((commitment) => <div key={commitment.id} className="flex items-center justify-between border-b border-foreground py-5"><span className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" /><span className="font-semibold">{commitment.label}</span></span><span className="font-mono text-sm">{commitment.completed} / {commitment.target}</span></div>)}
            </div>
          </aside>
        </section>
      </section>
    </div>
  )
}

function EmptyCommandCenter() {
  return <div className="mx-auto grid min-h-screen max-w-[1440px] place-items-center px-4 pt-28 text-center"><div className="max-w-2xl"><Radio className="mx-auto size-10 text-primary" /><p className="signal-label mt-7">Viral command</p><h1 className="display-type mt-6 text-6xl leading-[0.85] sm:text-8xl">No launch<br />in motion.</h1><p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">Create the first test-to-blast protocol or inspect the complete labeled demonstration.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/launches/new">Build first launch<Rocket /></Link></Button><Button variant="outline" asChild><Link href="/launches?demo=1">Load demo signal<Sparkles /></Link></Button></div></div></div>
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="mono-label text-muted-foreground">{eyebrow}</p><h2 className="display-type mt-3 text-4xl leading-none sm:text-5xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>
}

function Metric({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  const icons = { "Creator K": Radio, Activated: Users, Qualified: Trophy, Saves: Save, Bounty: BadgeDollarSign }
  const Icon = icons[label as keyof typeof icons] ?? Clock3
  return <div className={accent ? "bg-secondary p-5" : "bg-card p-5"}><Icon className="size-5" /><p className="mono-label mt-7 text-muted-foreground">{label}</p><p className="mt-2 text-4xl font-semibold">{value}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p></div>
}

function Signal({ label, value }: { label: string; value: string }) {
  return <div className="bg-card p-3 text-center"><p className="text-2xl font-semibold">{value}</p><p className="mono-label mt-1 text-muted-foreground">{label}</p></div>
}

function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
function platformLabel(platform: string) { return platform === "instagram" ? "Instagram Reels" : platform === "youtube" ? "YouTube Shorts" : "TikTok" }
