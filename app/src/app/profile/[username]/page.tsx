import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, BadgeCheck, Music2, Play, TrendingUp, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getProfileDetailByUsername } from "@/lib/data/profile-detail"
import { DEMO_CREATOR, DEMO_TRACKS } from "@/lib/demo/catalog"
import { isDemoQuery } from "@/lib/demo/runtime"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username}`, description: `Creator profile and attributed campaigns from @${username}.`, alternates: { canonical: `/profile/${username}` } }
}

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { username } = await params
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const detail = demo
    ? {
        creator: { id: DEMO_CREATOR.id, username: DEMO_CREATOR.username, displayName: DEMO_CREATOR.displayName, avatarUrl: "", bio: DEMO_CREATOR.bio, followerCount: DEMO_CREATOR.followers, mashupCount: DEMO_TRACKS.length, totalPlays: DEMO_TRACKS.reduce((total, track) => total + track.weeklyUses, 0) },
        tracks: DEMO_TRACKS.map((track) => ({ id: track.id, title: track.title, genre: track.genre, plays: track.weeklyUses, momentum: track.momentum })),
      }
    : await getProfileDetailByUsername(username).then((result) => result ? ({ creator: result.creator, tracks: result.mashups.map((track) => ({ id: track.id, title: track.title, genre: track.genre, plays: track.playCount, momentum: null })) }) : null)

  if (!detail) notFound()
  const initials = detail.creator.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  return <div className={demo ? "pt-40" : "pt-28"}><section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8"><header className="grid gap-7 border-b border-foreground pb-9 lg:grid-cols-[auto_1fr_auto] lg:items-end"><div className="grid size-28 place-items-center border border-foreground bg-primary display-type text-4xl text-primary-foreground shadow-[6px_6px_0_var(--foreground)] sm:size-36 sm:text-5xl">{initials}</div><div><div className="flex flex-wrap items-center gap-2"><p className="signal-label">Creator signal</p>{demo ? <Badge variant="secondary" className="rounded-none">Demo profile</Badge> : null}</div><h1 className="display-type mt-5 text-5xl leading-[0.86] sm:text-7xl">{detail.creator.displayName}</h1><p className="mt-2 font-mono text-sm text-muted-foreground">@{detail.creator.username}</p><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{detail.creator.bio || "This creator has not added a bio yet."}</p></div><div className="flex gap-3"><Button variant="outline"><Users />Follow</Button><Button asChild><Link href={`/campaigns/new?${demo ? "demo=1&" : ""}creator=${detail.creator.username}`}>Fork a track<ArrowUpRight /></Link></Button></div></header><div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-4"><ProfileStat icon={TrendingUp} label="Weekly growth" value={demo ? `+${DEMO_CREATOR.weeklyGrowth}%` : "Building"} /><ProfileStat icon={Users} label="Followers" value={formatCount(detail.creator.followerCount)} /><ProfileStat icon={Music2} label="Tracks" value={String(detail.creator.mashupCount)} /><ProfileStat icon={Play} label="Attributed plays" value={formatCount(detail.creator.totalPlays)} /></div><div className="mt-9 flex items-end justify-between gap-5 border-b border-foreground pb-4"><div><p className="mono-label text-muted-foreground">Released signal</p><h2 className="display-type mt-2 text-4xl">Tracks and campaign roots</h2></div><Badge variant="outline" className="rounded-none"><BadgeCheck />Rights shown per track</Badge></div>{detail.tracks.length ? <div className="border-b border-foreground">{detail.tracks.map((track, index) => <article key={track.id} className="grid gap-4 border-t border-foreground py-5 first:border-t-0 sm:grid-cols-[4rem_1fr_auto] sm:items-center"><span className="display-type text-3xl text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-xl font-semibold">{track.title}</h3><p className="mt-1 font-mono text-xs text-muted-foreground">{track.genre} / {track.plays.toLocaleString()} recent plays</p></div><div className="flex items-center gap-4">{track.momentum ? <span className="text-right"><span className="display-type block text-3xl text-primary">{track.momentum}</span><span className="mono-label text-muted-foreground">Momentum</span></span> : null}<Button size="icon" variant="outline" asChild aria-label={`Open ${track.title}`}><Link href={`/campaigns/new?${demo ? "demo=1&" : ""}track=${track.id}`}><ArrowUpRight /></Link></Button></div></article>)}</div> : <div className="grid min-h-60 place-items-center border-b border-foreground text-center text-muted-foreground">No published tracks yet.</div>}</section></div>
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="bg-card p-4 sm:p-5"><Icon className="size-4 text-primary" /><p className="mono-label mt-5 text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}
