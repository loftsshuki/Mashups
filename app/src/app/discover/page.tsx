import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BadgeCheck, GitFork, Radio, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRecommendedGreenPairs, GREEN_CATALOG, type GreenCatalogTrack } from "@/lib/catalog/green-catalog"
import { getMomentumFeed } from "@/lib/data/momentum-feed"

export const metadata: Metadata = {
  title: "Discover Remixable Music",
  description: "Find rights-cleared tracks, compatible pairings, and public mashups worth taking further.",
  alternates: { canonical: "/discover" },
}

export default async function DiscoverPage() {
  const pairs = getRecommendedGreenPairs(3)
  const momentum = await getMomentumFeed(6)

  return <div className="pt-28">
    <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
      <div className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8"><p className="signal-label">The open crate</p><h1 className="display-type mt-6 text-6xl leading-[0.8] sm:text-8xl xl:text-[8.5rem]">Find a sound.<br /><span className="text-primary">Take it further.</span></h1></div>
        <div className="lg:col-span-4 lg:pb-2"><p className="max-w-md text-lg leading-relaxed text-muted-foreground">Everything in the green crate is structurally analyzed and permissioned for the exact uses shown.</p><Button className="mt-6" asChild><Link href="/create">Open the mixer <ArrowUpRight /></Link></Button></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground py-4">
        <div className="flex items-center gap-2"><Radio className="size-4 text-primary" /><span className="font-mono text-xs font-semibold uppercase tracking-wider">Green catalog / {GREEN_CATALOG.length} sources</span></div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original synthesis / no third-party samples</span>
      </div>

      <div className="grid border-x border-b border-foreground md:grid-cols-2">
        {GREEN_CATALOG.map((track, index) => <TrackTile key={track.id} track={track} index={index} />)}
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-foreground pb-5"><div><p className="mono-label text-primary">Recommended collisions</p><h2 className="display-type mt-4 text-5xl">Start with a strong match.</h2></div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tempo + Camelot + energy</span></div>
        <div className="grid gap-px border-x border-b border-foreground bg-foreground lg:grid-cols-3">
          {pairs.map(({ left, right, assessment }, index) => <Link key={`${left.id}-${right.id}`} href={`/create?left=${left.id}&right=${right.id}`} className="group bg-card p-5 hover:bg-secondary sm:p-6">
            <div className="flex items-center justify-between"><span className="font-mono text-xs">0{index + 1}</span><span className="display-type text-4xl text-primary">{assessment.score}</span></div>
            <div className="mt-12 flex items-center gap-3"><span className="size-10 rounded-full border border-foreground" style={{ background: left.color }} /><span className="display-type min-w-0 flex-1 truncate text-2xl">{left.title}</span></div>
            <div className="mt-3 flex items-center gap-3"><span className="size-10 rounded-full border border-foreground" style={{ background: right.color }} /><span className="display-type min-w-0 flex-1 truncate text-2xl">{right.title}</span></div>
            <p className="mt-7 text-sm text-muted-foreground">{assessment.summary}</p>
            <span className="mt-5 flex items-center justify-between border-t border-foreground/30 pt-4 font-mono text-[10px] font-semibold uppercase tracking-wider">Make this collision <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>)}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-foreground pb-5"><div><p className="mono-label text-primary">Community signal</p><h2 className="display-type mt-4 text-5xl">Fresh branches.</h2></div><Button variant="outline" asChild><Link href="/chains">See remix trees <GitFork /></Link></Button></div>
        {momentum.length ? <div className="divide-y divide-foreground border-b border-foreground">{momentum.map((item, index) => <Link key={item.id} href={`/mashup/${item.id}`} className="group grid gap-4 py-5 md:grid-cols-[4rem_1fr_auto] md:items-center"><span className="display-type text-4xl text-muted-foreground group-hover:text-primary">{String(index + 1).padStart(2, "0")}</span><span><span className="block text-xl font-semibold">{item.title}</span><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">@{item.creator.username} / {item.genre} / {item.bpm} BPM</span></span><ArrowUpRight className="size-5" /></Link>)}</div> : <div className="grid min-h-64 place-items-center border-b border-foreground text-center"><div className="max-w-lg p-8"><Sparkles className="mx-auto size-7 text-primary" /><h3 className="display-type mt-4 text-3xl">The first public branch is still open.</h3><p className="mt-3 text-sm text-muted-foreground">The green crate is playable now. Community rankings begin when creators publish signed-in versions.</p><Button className="mt-6" asChild><Link href="/create">Make the first one</Link></Button></div></div>}
      </section>
    </section>
  </div>
}

function TrackTile({ track, index }: { track: GreenCatalogTrack; index: number }) {
  return <article className="group relative min-h-[25rem] overflow-hidden border-t border-foreground p-5 first:border-t-0 md:border-l md:odd:border-l-0 md:[&:nth-child(2)]:border-t-0 sm:p-7">
    <div className="absolute right-0 top-0 size-52 rounded-full opacity-90 transition-transform duration-500 group-hover:scale-125" style={{ background: track.color, transform: "translate(35%, -35%)" }} />
    <div className="relative flex items-start justify-between"><span className="font-mono text-xs">0{index + 1} / 04</span><span className="flex items-center gap-1.5 bg-background px-2 py-1 font-mono text-[9px] font-bold uppercase"><BadgeCheck className="size-3 text-primary" /> Green</span></div>
    <div className="relative mt-24"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{track.genre} / {track.bpm} BPM / {track.camelot}</p><h2 className="display-type mt-3 text-5xl leading-[0.86]">{track.title}</h2><p className="mt-3 text-sm">{track.artist}</p></div>
    <div className="absolute inset-x-5 bottom-5 flex items-center justify-between border-t border-foreground pt-4 sm:inset-x-7"><span className="font-mono text-[9px] uppercase tracking-wider">{track.rights.passportId}</span><Button size="sm" asChild><Link href={`/create?left=${track.id}`}>Use this track <ArrowRight /></Link></Button></div>
  </article>
}
