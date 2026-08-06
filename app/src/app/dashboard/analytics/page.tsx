import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, BarChart3, MousePointerClick, Save, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DEMO_ANALYTICS } from "@/lib/demo/catalog"
import { isDemoQuery } from "@/lib/demo/runtime"
import { createClient } from "@/lib/supabase/server"
import { getCurrentTimestamp } from "@/lib/time/clock"

export const metadata: Metadata = {
  title: "Creator Analytics",
  description: "Attribution-led campaign analytics and a concise recommendation for the next post.",
  alternates: { canonical: "/dashboard/analytics" },
}

type AnalyticsView = {
  period: string
  views: number
  attributedClicks: number
  saves: number
  followerLift: number
  topHook: string
  nextMove: string
  series: readonly number[]
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const demo = isDemoQuery(typeof params.demo === "string" ? params.demo : null)
  let analytics: AnalyticsView | null = demo ? DEMO_ANALYTICS : null

  if (!demo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?next=/dashboard/analytics")

    const { data: events } = await supabase
      .from("attribution_events")
      .select("event_type,created_at")
      .eq("creator_id", user.id)
      .gte("created_at", new Date(getCurrentTimestamp() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5000)

    if (events?.length) {
      const counts = (events as Array<{ event_type: string }>).reduce<Record<string, number>>((result, event) => {
        result[event.event_type] = (result[event.event_type] ?? 0) + 1
        return result
      }, {})
      analytics = {
        period: "Last 7 days",
        views: counts.view ?? 0,
        attributedClicks: counts.click ?? 0,
        saves: counts.save ?? 0,
        followerLift: counts.follow ?? 0,
        topHook: "Awaiting enough hook events",
        nextMove: "Keep attribution enabled on each export. A recommendation appears after the first complete campaign window.",
        series: [0, 0, 0, 0, 0, 0, 0],
      }
    }
  }

  return (
    <div className={demo ? "pt-40" : "pt-28"}>
      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-foreground pb-9 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8"><p className="signal-label">Performance brief</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">Read the signal.<br /><span className="text-primary">Make the next move.</span></h1></div>
          <div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">One decision-ready brief instead of another wall of vanity metrics.</p><Button className="mt-6" asChild><Link href="/campaigns/new">New campaign<ArrowUpRight /></Link></Button></div>
        </div>

        {analytics ? <AnalyticsReport analytics={analytics} demo={demo} /> : <EmptyAnalytics />}
      </section>
    </div>
  )
}

function AnalyticsReport({ analytics, demo }: { analytics: AnalyticsView; demo: boolean }) {
  const metrics = [
    { label: "Views", value: analytics.views, icon: BarChart3 },
    { label: "Attributed clicks", value: analytics.attributedClicks, icon: MousePointerClick },
    { label: "Saves", value: analytics.saves, icon: Save },
    { label: "Follower lift", value: analytics.followerLift, icon: Users, prefix: "+" },
  ]
  return <div className="pt-7"><div className="flex items-center justify-between gap-4 border-b border-foreground pb-4"><p className="font-mono text-xs font-semibold uppercase tracking-wider">{analytics.period}</p><p className="font-mono text-xs text-muted-foreground">{demo ? "Labeled demo data" : "Live attributed events"}</p></div><div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-4">{metrics.map(({ label, value, icon: Icon, prefix }) => <div key={label} className="bg-card p-5"><Icon className="size-5 text-primary" /><p className="mono-label mt-6 text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold sm:text-4xl">{prefix}{value.toLocaleString()}</p></div>)}</div><div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><div className="border border-foreground bg-card p-5 sm:p-7"><div className="flex items-end justify-between"><div><p className="mono-label text-muted-foreground">Seven-day velocity</p><p className="mt-2 text-sm">Best hook: <strong>{analytics.topHook}</strong></p></div><span className="font-mono text-xs text-primary">DAY 01 to 07</span></div><div className="signal-bars mt-8">{analytics.series.map((value, index) => <span key={index} style={{ height: `${Math.max(3, value)}%`, animationDelay: `${index * 60}ms` }} />)}</div></div><aside className="border border-foreground bg-primary p-6 text-primary-foreground shadow-[5px_5px_0_var(--foreground)]"><Sparkles className="size-6" /><p className="mono-label mt-8 text-primary-foreground/65">What to post next</p><p className="mt-4 text-xl font-semibold leading-snug">{analytics.nextMove}</p></aside></div></div>
}

function EmptyAnalytics() {
  return <div className="grid min-h-[30rem] place-items-center border-b border-foreground text-center"><div className="max-w-lg"><BarChart3 className="mx-auto size-9 text-primary" /><h2 className="display-type mt-5 text-4xl">No attributed window yet.</h2><p className="mt-4 text-muted-foreground">Publish a campaign package or inspect the labeled demonstration report.</p><div className="mt-7 flex justify-center gap-3"><Button asChild><Link href="/campaigns/new">Create campaign</Link></Button><Button variant="outline" asChild><Link href="/dashboard/analytics?demo=1">View demo report</Link></Button></div></div></div>
}
