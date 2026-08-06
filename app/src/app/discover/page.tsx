import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BadgeCheck, Radio, Sparkles, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_TRACKS } from "@/lib/demo/catalog"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getMomentumFeed } from "@/lib/data/momentum-feed"

export const metadata: Metadata = {
  title: "Discover Rising Tracks",
  description: "Find rights-aware tracks ranked by current momentum rather than legacy popularity.",
  alternates: { canonical: "/discover" },
}

type DiscoverTrack = {
  id: string
  title: string
  creator: string
  genre: string
  bpm: number
  momentum: number
  uses: number
  rights: string
}

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const demo = isDemoQuery(typeof params.demo === "string" ? params.demo : null)
  const liveItems = demo ? [] : await getMomentumFeed(12)
  const tracks: DiscoverTrack[] = demo
    ? DEMO_TRACKS.map((track) => ({ id: track.id, title: track.title, creator: track.creator.username, genre: track.genre, bpm: track.bpm, momentum: track.momentum, uses: track.weeklyUses, rights: track.rightsMode }))
    : liveItems.map((track) => ({ id: track.id, title: track.title, creator: track.creator.username, genre: track.genre, bpm: track.bpm, momentum: Math.round(track.momentumScore), uses: track.playCount, rights: track.sponsoredEligible ? "Quality cleared" : "Review rights" }))

  return (
    <div className={demo ? "pt-40" : "pt-28"}>
      <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="signal-label">Momentum discovery</p>
            <h1 className="display-type mt-6 text-6xl leading-[0.82] sm:text-8xl xl:text-[8.5rem]">Catch the rise.<br /><span className="text-primary">Before the peak.</span></h1>
          </div>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">Tracks are ordered by acceleration, saves, and recent creator use, not lifetime plays.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/campaigns/new">Build with a track<ArrowUpRight /></Link></Button><Button variant="outline" asChild><Link href="/packs">Monday pack</Link></Button></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground py-4">
          <div className="flex items-center gap-2"><Radio className="size-4 text-primary" /><span className="font-mono text-xs font-semibold uppercase tracking-wider">{demo ? "Labeled demo signal" : "Live momentum signal"}</span></div>
          <div className="flex flex-wrap gap-2"><Badge variant="outline" className="rounded-none">Rising now</Badge><Badge variant="outline" className="rounded-none">Rights-aware</Badge><Badge variant="outline" className="rounded-none">Under 7 days</Badge></div>
        </div>

        {tracks.length ? (
          <ol className="stagger-children border-b border-foreground">
            {tracks.map((track, index) => <TrackRow key={track.id} track={track} rank={index + 1} demo={demo} />)}
          </ol>
        ) : (
          <div className="grid min-h-[25rem] place-items-center border-b border-foreground py-16 text-center">
            <div className="max-w-lg"><Sparkles className="mx-auto size-8 text-primary" /><h2 className="display-type mt-5 text-4xl">The live feed is warming up.</h2><p className="mt-4 text-muted-foreground">No production momentum events are available yet. Explore the labeled demo or publish the first attributed campaign.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/discover?demo=1">View demo signal</Link></Button><Button variant="outline" asChild><Link href="/campaigns/new">Create campaign</Link></Button></div></div>
          </div>
        )}
      </section>
    </div>
  )
}

function TrackRow({ track, rank, demo }: { track: DiscoverTrack; rank: number; demo: boolean }) {
  const bars = [38, 72, 52, 88, 64, 96, 58, 78, 44, 84, 66, 92]
  return (
    <li className="group grid gap-5 border-t border-foreground py-5 first:border-t-0 md:grid-cols-[4rem_1.2fr_1fr_auto] md:items-center">
      <span className="display-type text-4xl text-muted-foreground group-hover:text-primary">{String(rank).padStart(2, "0")}</span>
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold sm:text-2xl">{track.title}</h2>{demo ? <Badge variant="secondary" className="rounded-none">Demo</Badge> : null}</div><p className="mt-1 font-mono text-xs text-muted-foreground">@{track.creator} / {track.genre} / {track.bpm} BPM</p></div>
      <div className="flex h-14 items-center gap-1" aria-label={`Momentum waveform for ${track.title}`}>{bars.map((height, index) => <span key={index} className="w-1.5 bg-foreground transition-colors group-hover:bg-primary" style={{ height: `${Math.max(16, (height * track.momentum) / 100)}%` }} />)}</div>
      <div className="flex items-center justify-between gap-6 md:justify-end"><div className="text-right"><span className="display-type block text-3xl text-primary">{track.momentum}</span><span className="mono-label text-muted-foreground">Momentum</span></div><Button variant="outline" size="icon" asChild aria-label={`Build a campaign with ${track.title}`}><Link href={`/campaigns/new?${demo ? "demo=1&" : ""}track=${track.id}`}><ArrowUpRight /></Link></Button></div>
      <div className="md:col-start-2 md:col-span-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><BadgeCheck className="size-3.5" />{track.rights}</span><span className="flex items-center gap-1"><TrendingUp className="size-3.5" />{track.uses.toLocaleString()} recent uses</span></div>
    </li>
  )
}
