import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, CircleDollarSign, Download, Landmark, ReceiptText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_EARNINGS } from "@/lib/demo/catalog"
import { isDemoQuery } from "@/lib/demo/runtime"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Creator Earnings",
  description: "Trace creator revenue from licenses, referrals, challenges, and collaborator splits.",
  alternates: { canonical: "/earnings" },
}

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function EarningsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const demo = isDemoQuery(typeof params.demo === "string" ? params.demo : null)
  if (!demo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?next=/earnings")
  }
  const data = demo ? DEMO_EARNINGS : { availableCents: 0, pendingCents: 0, monthCents: 0, sources: [] }

  return <div className={demo ? "pt-40" : "pt-28"}><section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8"><div className="grid gap-8 border-b border-foreground pb-9 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">Creator revenue</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">Know what earned.<br /><span className="text-primary">Know why.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">A traceable ledger across rights, referrals, challenges, and collaborator shares.</p><div className="mt-6 flex gap-3"><Button variant="outline" disabled={!demo}><Download />Export</Button><Button disabled><Landmark />Withdraw</Button></div></div></div><div className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-3"><MoneyBlock label="Available" value={money(data.availableCents)} emphasis /><MoneyBlock label="Pending clearance" value={money(data.pendingCents)} /><MoneyBlock label="This month" value={money(data.monthCents)} /></div>{data.sources.length ? <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.72fr]"><div className="border border-foreground bg-card"><div className="border-b border-foreground p-5"><p className="mono-label text-muted-foreground">Revenue composition</p></div>{data.sources.map((source) => <div key={source.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-foreground p-5 last:border-b-0"><div><div className="flex justify-between text-sm"><span className="font-semibold">{source.label}</span><span>{source.share}%</span></div><div className="mt-3 h-3 border border-foreground bg-background"><div className="h-full bg-primary" style={{ width: `${source.share}%` }} /></div></div><span className="font-mono text-sm">{money(source.cents)}</span></div>)}</div><aside className="border border-foreground bg-secondary p-6 shadow-[5px_5px_0_var(--foreground)]"><CircleDollarSign className="size-7" /><p className="mono-label mt-8">Payout readiness</p><h2 className="display-type mt-3 text-4xl">Connect Stripe to move funds.</h2><p className="mt-4 text-sm leading-relaxed">The ledger can operate in demo mode, but real checkout and payouts remain disabled until production billing credentials are installed.</p><Button className="mt-7" variant="outline" asChild><Link href="/admin/ops">Open integration health<ArrowUpRight /></Link></Button></aside></div> : <div className="grid min-h-[27rem] place-items-center border-b border-foreground text-center"><div className="max-w-lg"><ReceiptText className="mx-auto size-9 text-primary" /><h2 className="display-type mt-5 text-4xl">No live revenue events.</h2><p className="mt-4 text-muted-foreground">Connect billing and publish a licensed campaign to begin the ledger.</p><Button className="mt-7" asChild><Link href="/earnings?demo=1">View labeled demo ledger</Link></Button></div></div>}<div className="mt-7"><Badge variant="outline" className="rounded-none">{demo ? "All values are demonstration data" : "Live production ledger"}</Badge></div></section></div>
}

function MoneyBlock({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={emphasis ? "bg-primary p-5 text-primary-foreground" : "bg-card p-5"}><p className="mono-label opacity-65">{label}</p><p className="mt-3 text-3xl font-semibold sm:text-4xl">{value}</p></div>
}
