import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Clock3, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getChallengesFromBackend } from "@/lib/data/challenge-engine"
import { DEMO_CHALLENGES } from "@/lib/demo/catalog"
import { isDemoQuery } from "@/lib/demo/runtime"

export const metadata: Metadata = {
  title: "Creator Challenges",
  description: "High-frequency creator briefs with clear rules, rights-aware entries, and meaningful prizes.",
  alternates: { canonical: "/challenges" },
}

type ChallengeView = { id: string; title: string; brief: string; prize: string; sponsor: string; timing: string; entries: number; status: string }

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const demo = isDemoQuery(typeof params.demo === "string" ? params.demo : null)
  const live = demo ? [] : await getChallengesFromBackend()
  const challenges: ChallengeView[] = demo
    ? DEMO_CHALLENGES.map((challenge) => ({ ...challenge, timing: challenge.endsIn, status: "active" }))
    : live.map((challenge) => ({ id: challenge.id, title: challenge.title, brief: challenge.description, prize: challenge.prizeText, sponsor: challenge.sponsor ?? "Community", timing: new Date(challenge.endsAt).toLocaleDateString(), entries: 0, status: challenge.status }))

  return (
    <div className={demo ? "pt-40" : "pt-28"}>
      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8"><p className="signal-label">Challenge engine</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">A deadline makes<br /><span className="text-primary">the cut sharper.</span></h1></div>
          <div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Fast creative briefs, transparent judging, and prizes worth shipping for.</p><Button className="mt-6" asChild><Link href="/campaigns/new">Start an open entry<ArrowUpRight /></Link></Button></div>
        </div>

        {challenges.length ? <div className="grid gap-5 py-8 lg:grid-cols-2">{challenges.map((challenge, index) => <ChallengeCard challenge={challenge} index={index} demo={demo} key={challenge.id} />)}</div> : <div className="grid min-h-[28rem] place-items-center border-b border-foreground text-center"><div className="max-w-lg"><Trophy className="mx-auto size-9 text-primary" /><h2 className="display-type mt-5 text-4xl">No live rounds are open.</h2><p className="mt-4 text-muted-foreground">The challenge calendar is empty until the production backend is connected.</p><Button className="mt-7" asChild><Link href="/challenges?demo=1">Preview challenge mode</Link></Button></div></div>}

        <div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3">
          <Principle number="01" title="Rights at entry" text="Every submission declares its source and intended usage before judging." />
          <Principle number="02" title="Growth over reach" text="Judging values lift and completion, not existing audience size." />
          <Principle number="03" title="Fast payout trail" text="Winner operations and sponsor events remain auditable." />
        </div>
      </section>
    </div>
  )
}

function ChallengeCard({ challenge, index, demo }: { challenge: ChallengeView; index: number; demo: boolean }) {
  return <article className="relative overflow-hidden border border-foreground bg-card p-5 shadow-[5px_5px_0_var(--foreground)] sm:p-7"><div className="absolute right-0 top-0 bg-foreground px-4 py-2 font-mono text-xs text-background">ROUND {String(index + 1).padStart(2, "0")}</div><div className="flex flex-wrap gap-2"><Badge className="rounded-none">{challenge.status}</Badge>{demo ? <Badge variant="secondary" className="rounded-none">Demo data</Badge> : null}</div><h2 className="display-type mt-8 text-4xl leading-none sm:text-5xl">{challenge.title}</h2><p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{challenge.brief}</p><div className="mt-7 grid grid-cols-3 gap-px border border-foreground bg-foreground"><MiniStat icon={Trophy} label="Prize" value={challenge.prize} /><MiniStat icon={Clock3} label="Ends" value={challenge.timing} /><MiniStat icon={Users} label="Entries" value={String(challenge.entries)} /></div><div className="mt-6 flex items-center justify-between gap-4"><span className="font-mono text-xs text-muted-foreground">Presented by {challenge.sponsor}</span><Button asChild><Link href={`/campaigns/new?${demo ? "demo=1&" : ""}challenge=${challenge.id}`}>Build entry<ArrowUpRight /></Link></Button></div></article>
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return <div className="min-w-0 bg-card p-3"><Icon className="size-4 text-primary" /><span className="mono-label mt-3 block text-muted-foreground">{label}</span><span className="mt-1 block truncate font-semibold">{value}</span></div>
}

function Principle({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="bg-card p-5"><span className="font-mono text-xs text-primary">{number}</span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>
}
