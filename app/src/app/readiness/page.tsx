import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CircleAlert, CircleCheck, Clock3, RadioTower, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getReadinessSnapshot } from "@/lib/pilot/service"
import type { ReadinessItem } from "@/lib/pilot/types"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Launch Readiness", description: "Evidence-based launch gates for the Mashups founding pilot and production runtime." }

const categories: ReadinessItem["category"][] = ["infrastructure", "product", "pilot", "partners"]

export default async function ReadinessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  const snapshot = await getReadinessSnapshot(user?.id ?? null, demo)
  const blocked = snapshot.items.filter((item) => item.required && item.status === "blocked")
  return <main className="pilot-shell pb-28 pt-[68px]">
    <div className={`border-b border-foreground px-4 py-2 ${snapshot.status === "blocked" ? "bg-destructive text-white" : snapshot.status === "ready" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}><div className="mx-auto flex max-w-[1500px] justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Launch gate / {snapshot.mode}</span><span>Checked {new Date(snapshot.checkedAt).toLocaleString("en-US", { timeZone: "UTC", hour12: false })} UTC</span></div></div>
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-[1fr_25rem]"><div className="readiness-scan relative overflow-hidden p-5 py-12 sm:p-9 sm:py-16"><div className="relative"><div className="flex flex-wrap items-center gap-3"><p className="signal-label">Evidence before exposure</p><Badge variant="outline" className="rounded-none">{snapshot.status}</Badge></div><h1 className="display-type mt-8 text-[clamp(3.6rem,11vw,8.5rem)] leading-[0.73]">SHIP<br />NOTHING<br /><span className="text-primary">ON FAITH.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">Product code is only one launch dependency. This board separates verified capability, operator attention, and hard production blockers.</p></div></div><aside className="flex flex-col justify-between border-t border-foreground bg-foreground p-6 text-background lg:border-l lg:border-t-0 sm:p-8"><RadioTower className="size-7 text-secondary" /><div className="my-12"><p className="display-type text-8xl text-secondary">{snapshot.readyCount}/{snapshot.totalRequired}</p><p className="font-mono text-[10px] uppercase tracking-widest text-background/60">required gates ready</p></div><div className="h-4 border border-background/40"><div className="h-full bg-primary" style={{ width: `${Math.round(snapshot.readyCount / snapshot.totalRequired * 100)}%` }} /></div></aside></header>
      {blocked.length ? <section className="grid border-x border-b border-foreground bg-destructive text-white lg:grid-cols-[18rem_1fr]"><div className="p-5 sm:p-7 lg:border-r lg:border-white/40"><ShieldAlert className="size-7" /><h2 className="display-type mt-6 text-4xl">Hard blockers</h2></div><div className="p-5 sm:p-7">{blocked.map((item) => <div key={item.key} className="border-b border-white/40 py-4 first:pt-0 last:border-0 last:pb-0"><p className="font-semibold">{item.label}</p><p className="mt-2 text-sm text-white/75">{item.detail}</p></div>)}</div></section> : null}
      <div className="border-x border-b border-foreground">{categories.map((category, categoryIndex) => { const items = snapshot.items.filter((item) => item.category === category); return <section key={category} className="grid border-b border-foreground last:border-0 lg:grid-cols-[18rem_1fr]"><div className="bg-card p-5 sm:p-7 lg:border-r lg:border-foreground"><span className="display-type text-5xl text-primary">0{categoryIndex + 1}</span><h2 className="display-type mt-5 text-3xl">{category}</h2><p className="mt-3 text-sm text-muted-foreground">{items.filter((item) => item.status === "ready").length} of {items.length} checks ready.</p></div><div className="min-w-0 p-5 sm:p-7"><div className="border-t border-foreground">{items.map((item) => <ReadinessRow key={item.key} item={item} />)}</div></div></section> })}</div>
      <div className="grid gap-5 border-x border-b border-foreground bg-secondary p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="display-type text-3xl">The launch decision is auditable.</h2><p className="mt-2 text-sm text-muted-foreground">Demo readiness never masks missing infrastructure. Connect the replacement production services before inviting real rightsholders.</p></div><div className="flex flex-wrap gap-3"><Button variant="outline" asChild><Link href={`/operator${demo ? "?demo=1" : ""}`}>Operator desk</Link></Button><Button asChild><Link href={`/domination${demo ? "?demo=1" : ""}`}>Control plane<ArrowRight /></Link></Button></div></div>
    </section>
  </main>
}

function ReadinessRow({ item }: { item: ReadinessItem }) { const Icon = item.status === "ready" ? CircleCheck : item.status === "blocked" ? CircleAlert : Clock3; return <article className="grid gap-4 border-b border-foreground py-5 last:border-b-0 sm:grid-cols-[2.5rem_1fr_auto] sm:items-center"><span className={`grid size-10 place-items-center border border-foreground ${item.status === "ready" ? "bg-secondary" : item.status === "blocked" ? "bg-destructive text-white" : "bg-primary text-primary-foreground"}`}><Icon className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.label}</h3>{item.required ? <Badge variant="outline" className="rounded-none text-[9px]">Required</Badge> : null}</div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p></div>{item.actionHref && item.actionLabel ? <Button variant="outline" size="sm" asChild><Link href={item.actionHref}>{item.actionLabel}<ArrowRight /></Link></Button> : <Badge variant={item.status === "ready" ? "secondary" : "outline"} className="w-fit rounded-none">{item.status}</Badge>}</article> }
