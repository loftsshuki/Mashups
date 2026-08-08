import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, CircleDollarSign, FileCheck2, Gauge, Music2, ShieldCheck, TimerReset, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Founding Label Pilot",
  description: "A controlled, rights-bound creator test for independent electronic artists and labels.",
  alternates: { canonical: "/partner" },
}

const fit = ["You control or can approve the master", "A release is active or arriving within 90 days", "The artist can react, repost, or join one live session", "You want attributable evidence, not screenshot reporting"]
const noFit = ["A major controls campaign permission", "Territories or edit authority are unclear", "The artist cannot participate", "You need guaranteed streams, charts, or virality"]
const process = [
  ["01", "Qualify", "Confirm authority, release window, campaign fit, and the decision this test must answer."],
  ["02", "License", "Bind organic use, hook edits, whitelisting, paid caps, territories, term, and takedown SLA."],
  ["03", "Test", "Run three hook structures through a qualified creator cohort across selected scene cells."],
  ["04", "Measure", "Compare treatment against a matched holdout and separate incremental intent from noise."],
  ["05", "Compound", "License proven posts for paid use and preserve the winning structure for the next release."],
] as const

export default function PartnerPortalPage() {
  return <main className="pb-28 pt-[68px]">
    <div className="border-b border-foreground bg-secondary px-4 py-2"><div className="mx-auto flex max-w-[1500px] justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Founding House / Rightsholder Pilot</span><span>Independent electronic only</span></div></div>
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-12">
        <div className="pipeline-stripes relative overflow-hidden p-5 py-14 sm:p-10 sm:py-20 lg:col-span-8"><div className="relative"><p className="signal-label">Controlled creator testing</p><h1 className="display-type mt-8 text-[clamp(4rem,12vw,10rem)] leading-[0.71]">YOUR TRACK<br />DESERVES<br /><span className="text-primary">A FAIR TEST.</span></h1><p className="mt-9 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">Mashups gives independent electronic releases the campaign operations usually reserved for major catalogs: explicit rights, paid creators, reproducible hook tests, and evidence a serious team can audit.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/pilot/new?demo=1">Build a private brief<ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><a href="mailto:hello@mashups.agency?subject=Founding%20House%20pilot">Talk to the operator</a></Button></div></div></div>
        <aside className="flex flex-col justify-between border-t border-foreground bg-foreground p-6 text-background lg:col-span-4 lg:border-l lg:border-t-0 sm:p-8"><Music2 className="size-8 text-secondary" /><div className="my-14"><p className="mono-label text-background/55">The offer</p><p className="display-type mt-6 text-7xl text-secondary">14 DAYS.</p><p className="mt-4 max-w-xs text-sm leading-relaxed text-background/65">One track. Three hook genomes. A contracted creator floor. A matched-control evidence report.</p></div><p className="border-t border-background/30 pt-5 font-mono text-[10px] uppercase tracking-widest text-background/55">We guarantee the work. Never the fantasy.</p></aside>
      </header>

      <section className="grid gap-px border-x border-b border-foreground bg-foreground sm:grid-cols-3"><Proof value="50" label="creator opportunities" icon={Gauge} /><Proof value="03" label="hook structures" icon={TimerReset} /><Proof value="01" label="causal evidence brief" icon={FileCheck2} /></section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-2"><div className="bg-secondary p-5 sm:p-9 lg:border-r lg:border-foreground"><p className="mono-label">Strong pilot fit</p><h2 className="display-type mt-6 text-5xl">CONTROL + A RELEASE<br />WORTH LEARNING FROM.</h2><div className="mt-8 border-t border-foreground">{fit.map((item) => <div key={item} className="flex gap-3 border-b border-foreground py-4"><span className="grid size-7 shrink-0 place-items-center bg-foreground text-background"><Check className="size-4" /></span><p className="font-medium">{item}</p></div>)}</div></div><div className="p-5 sm:p-9"><p className="mono-label text-muted-foreground">Not a fit yet</p><h2 className="display-type mt-6 text-5xl">AMBIGUOUS RIGHTS<br />KILL VELOCITY.</h2><div className="mt-8 border-t border-foreground">{noFit.map((item) => <div key={item} className="flex gap-3 border-b border-foreground py-4"><span className="grid size-7 shrink-0 place-items-center border border-foreground"><X className="size-4" /></span><p className="font-medium">{item}</p></div>)}</div></div></section>

      <section className="border-x border-b border-foreground"><div className="grid border-b border-foreground p-5 sm:p-9 lg:grid-cols-12 lg:items-end"><div className="min-w-0 lg:col-span-8"><p className="signal-label">The operating sequence</p><h2 className="display-type mt-6 text-6xl sm:text-8xl">FROM RIGHTS<br /><span className="block max-w-full break-words text-primary">TO REPEATABLE LIFT.</span></h2></div><p className="mt-6 min-w-0 text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:mt-0">Every stage produces evidence the next stage can trust. No campaign starts with a vague permission email.</p></div>{process.map(([number, title, detail]) => <article key={number} className="grid border-b border-foreground last:border-b-0 sm:grid-cols-[8rem_15rem_1fr] sm:items-center"><span className="display-type p-5 text-5xl text-primary sm:p-7">{number}</span><h3 className="display-type border-t border-foreground p-5 text-3xl sm:border-l sm:border-t-0 sm:p-7">{title}</h3><p className="border-t border-foreground p-5 leading-relaxed text-muted-foreground sm:border-l sm:border-t-0 sm:p-7">{detail}</p></article>)}</section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-[1.05fr_0.95fr]"><div className="p-5 sm:p-9 lg:border-r lg:border-foreground"><p className="mono-label text-muted-foreground">Commercial truth</p><h2 className="display-type mt-6 text-5xl sm:text-7xl">PAY FOR<br />OPERATING<br /><span className="text-primary">CERTAINTY.</span></h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Creator rewards and paid-media budgets remain visible pass-through costs. The Mashups fee pays for rights operations, creative testing, cohort execution, attribution, and analysis.</p><div className="mt-8 flex flex-wrap gap-2"><Badge variant="outline" className="rounded-none py-2"><CircleDollarSign />Transparent budgets</Badge><Badge variant="outline" className="rounded-none py-2"><ShieldCheck />Service-credit protection</Badge></div></div><aside className="bg-primary p-5 text-primary-foreground sm:p-9"><p className="mono-label">What the packet binds</p><div className="mt-7 border-t border-primary-foreground/50">{["Creator and qualified-post floors", "Hook-genome test count", "Growth License scope", "Artist participation", "Measurement design", "Delivery deadline", "Service-credit cap", "Explicit non-guarantees"].map((item) => <div key={item} className="flex items-center gap-3 border-b border-primary-foreground/50 py-4"><Check className="size-4" />{item}</div>)}</div></aside></section>

      <section className="readiness-scan relative overflow-hidden border-x border-b border-foreground bg-secondary p-6 text-center sm:p-12"><div className="relative mx-auto max-w-4xl"><p className="signal-label">Founding cohort applications</p><h2 className="display-type mt-7 text-6xl leading-[0.82] sm:text-8xl">ONE RIGHTS-READY TRACK.<br />ONE DECISION WORTH PROVING.</h2><p className="mx-auto mt-7 max-w-2xl text-muted-foreground">Build the operating brief privately on this device, export it, and bring it to a fit review. No account or production database is required for planning.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button size="lg" asChild><Link href="/pilot/new?demo=1">Open portable intake<ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><a href="mailto:hello@mashups.agency?subject=Rights-ready%20track%20for%20Mashups">Email the team</a></Button></div></div></section>
    </section>
  </main>
}

function Proof({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Gauge }) { return <div className="bg-card p-5 sm:p-7"><div className="flex items-center justify-between"><p className="display-type text-6xl text-primary">{value}</p><Icon className="size-6" /></div><p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest">{label}</p></div> }
