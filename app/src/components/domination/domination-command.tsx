"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity, ArrowRight, Banknote, BarChart3, Check,
  ChevronRight, CircleDollarSign, CircuitBoard, ClipboardCheck, CloudCog,
  Crosshair, DatabaseZap, FileSignature, Fingerprint, Gauge, Handshake,
  Headphones, Landmark, LockKeyhole, Network, RefreshCw,
  Rocket, ShieldCheck, Sparkles, Target, TrendingUp, Trophy, Users, Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CampaignQuote, DominationSnapshot, LiftMetric, LaunchProtection, TrustAssessment } from "@/lib/domination/types"

type Feedback = { key: string; text: string; error?: boolean } | null

export function DominationCommand({ snapshot, demo }: { snapshot: DominationSnapshot | null; demo: boolean }) {
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [lift, setLift] = useState<LiftMetric | null>(snapshot?.lift ?? null)
  const [trust, setTrust] = useState<TrustAssessment | null>(snapshot?.trust ?? null)
  const [quote, setQuote] = useState<CampaignQuote | null>(snapshot?.quote ?? null)
  const [protection, setProtection] = useState<LaunchProtection | null>(snapshot?.protection ?? null)

  if (!snapshot || !lift || !trust || !quote || !protection) return <EmptyDomination />
  const campaign = snapshot
  const currentLift = lift
  const currentTrust = trust
  const currentQuote = quote
  const detailSuffix = demo ? "?demo=1" : ""

  async function post<T>(key: string, path: string, body: Record<string, unknown>): Promise<T | null> {
    setPending(key); setFeedback(null)
    try {
      const response = await fetch(`${path}${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const result = await response.json() as T & { error?: string }
      if (!response.ok) throw new Error(result.error ?? "Operation failed.")
      return result
    } catch (error) {
      setFeedback({ key, text: error instanceof Error ? error.message : "Operation failed.", error: true })
      return null
    } finally { setPending(null) }
  }

  async function runMeasurement() {
    const result = await post<{ lift: LiftMetric }>("measurement", "/api/domination/measurement", { launchSlug: campaign.launchSlug, metric: "save_rate", treatmentVisitors: 5200, treatmentConversions: 624, controlVisitors: 1800, controlConversions: 92, hypothesis: "Creator activation increases verified saves against a matched geographic holdout." })
    if (result) { setLift(result.lift); setFeedback({ key: "measurement", text: "Matched-holdout evidence recalculated and sealed." }) }
  }

  async function runTrust() {
    const result = await post<{ assessment: TrustAssessment }>("trust", "/api/domination/trust", { launchSlug: campaign.launchSlug, subjectType: "launch", subjectId: campaign.launchSlug, rightsVerified: true, audienceOverlap: 0.08, engagementAnomaly: 0.06, duplicateContentRate: 0.04, suspiciousSaveRate: 0.03, payoutDisputes: 0 })
    if (result) { setTrust(result.assessment); setFeedback({ key: "trust", text: "Rights, audience, content, save, and payout signals reassessed." }) }
  }

  async function recalculateQuote() {
    const result = await post<{ quote: CampaignQuote }>("quote", "/api/domination/quote", { launchSlug: campaign.launchSlug, tier: "pilot", targetCreators: 50, mediaBudgetCents: 0, creatorRewardCents: 5000 })
    if (result) { setQuote(result.quote); setFeedback({ key: "quote", text: "Commercial offer recalculated with pass-through budgets separated." }) }
  }

  async function qualifyProtection() {
    const result = await post<{ protection: LaunchProtection }>("protection", "/api/domination/protection/qualify", { launchSlug: campaign.launchSlug, platformFeeCents: currentQuote.platformFeeCents, rightsVerified: campaign.license.status === "accepted", trustScore: currentTrust.score, treatmentSample: currentLift.treatmentVisitors, controlSample: currentLift.controlVisitors, artistContractAccepted: campaign.artistObligations.length > 0, measurementConnected: currentLift.credible })
    if (result) { setProtection(result.protection); setFeedback({ key: "protection", text: "Operational protection conditions recalculated." }) }
  }

  async function activateGuarantee() {
    const result = await post<{ status: string }>("guarantee", "/api/domination/guarantee", { launchSlug: campaign.launchSlug, creatorTestFloor: 50, qualifiedPostFloor: 50, hookGenomeFloor: 3, reportDueDays: 14 })
    if (result) setFeedback({ key: "guarantee", text: `Guaranteed Launch is ${result.status}. Deliverables, not virality, are now contract-bound.` })
  }

  async function testPartnerRail() {
    const partner = campaign.partners.find((rail) => rail.status === "connected" && rail.id)
    if (!partner?.id) { setFeedback({ key: "partner", text: "Connect a partner rail before sending a signed manifest.", error: true }); return }
    const result = await post<{ status: string }>("partner", "/api/domination/partners/deliver", { integrationId: partner.id, provider: partner.provider, deliveryType: "smart_link_manifest", manifest: { launchSlug: campaign.launchSlug, source: "domination-command" } })
    if (result) setFeedback({ key: "partner", text: `Partner manifest ${result.status}. Idempotent delivery evidence recorded.` })
  }

  return <div className="domination-os pb-28 pt-[68px]">
    <div className="border-b border-foreground bg-primary px-4 py-2 text-primary-foreground"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"><span>Domination operating layer / {snapshot.launchTitle}</span><span className="hidden sm:inline">14 moats / one evidence standard</span></div></div>
    <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <header className="grid border-x border-b border-foreground lg:grid-cols-12">
        <div className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-20 lg:col-span-8"><div className="domination-grid absolute inset-0 opacity-35" /><div className="relative"><div className="flex flex-wrap items-center gap-3"><p className="signal-label">Independent music control plane</p><Badge variant="secondary" className="rounded-none">{demo ? "Labeled simulation" : "Live evidence"}</Badge></div><h1 className="display-type mt-8 text-[clamp(2.9rem,12vw,10.5rem)] leading-[0.72] tracking-[-0.07em]">CONTROL<br />WHAT<br /><span className="text-primary">COMPOUNDS.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">Do not rent virality. Contract the rights, manufacture credible tests, identify causal lift, pay the network, and own the intelligence that remains.</p></div></div>
        <aside className="flex min-h-96 flex-col justify-between border-t border-foreground bg-foreground p-6 text-background lg:col-span-4 lg:border-l lg:border-t-0 sm:p-8"><div className="flex items-center justify-between"><span className="mono-label text-background/55">Campaign truth pulse</span><Activity className="size-5 text-secondary" /></div><div><p className="display-type text-8xl text-secondary">{Math.round(lift.relativeLift * 100)}%</p><p className="mt-2 font-mono text-xs uppercase tracking-widest text-background/55">incremental save lift</p></div><div className="grid grid-cols-3 gap-px border border-background/30 bg-background/30"><DarkMetric value={`${Math.round(lift.confidence * 100)}%`} label="confidence" /><DarkMetric value={String(trust.score)} label="trust" /><DarkMetric value={`${snapshot.ar.breakoutProbability}%`} label="breakout" /></div></aside>
      </header>

      <section className="grid border-x border-b border-foreground xl:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-secondary p-5 sm:p-8 xl:border-r xl:border-foreground"><SystemMark number="01" icon={ClipboardCheck} label="Guaranteed Launch Product" /><h2 className="display-type mt-9 text-5xl leading-[0.88]">SELL THE TEST.<br />NEVER SELL A FANTASY.</h2><p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">Creator volume, qualified posts, hook tests, rights proof, and a due-date-bound report are enforceable. Streams and virality are not.</p><div className="mt-8 h-4 border border-foreground bg-card"><div className="h-full bg-primary" style={{ width: `${snapshot.guarantee.completion}%` }} /></div><div className="mt-3 flex justify-between font-mono text-xs"><span>{snapshot.guarantee.completion}% delivered</span><span>{snapshot.guarantee.qualifiedPostFloor} qualified-post floor</span></div><Button className="mt-6" onClick={() => void activateGuarantee()} disabled={pending === "guarantee"}>{pending === "guarantee" ? <RefreshCw className="animate-spin" /> : <Rocket />}Activate contract</Button><FeedbackLine feedback={feedback} target="guarantee" /></div>
        <div className="p-5 sm:p-8"><SystemMark number="02" icon={Network} label="Campaign Truth Graph" /><div className="mt-8 flex flex-wrap items-end justify-between gap-5"><div><h2 className="display-type text-4xl sm:text-6xl">CAUSALITY,<br />NOT SCREENSHOTS.</h2><p className="mt-4 max-w-xl text-muted-foreground">Every edge carries evidence from licensed source through measured listening outcome.</p></div><Button variant="outline" onClick={() => void runMeasurement()} disabled={pending === "measurement"}><BarChart3 />Recalculate lift</Button></div><div className="mt-8 overflow-x-auto"><div className="flex min-w-[680px] items-stretch">{snapshot.graph.nodes.map((node, index) => <div key={node.id} className="contents"><div className="min-w-28 flex-1 border border-foreground bg-card p-4"><span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{node.kind}</span><p className="mt-5 font-semibold">{node.label}</p><p className="mt-1 text-xs text-muted-foreground">{node.value}</p></div>{index < snapshot.graph.nodes.length - 1 ? <div className="grid w-10 shrink-0 place-items-center border-y border-foreground bg-foreground text-background"><ArrowRight className="size-4" /></div> : null}</div>)}</div></div><FeedbackLine feedback={feedback} target="measurement" /></div>
      </section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-2">
        <Link href={`/growth-license${detailSuffix}`} className="group p-5 hover:bg-secondary sm:p-8 lg:border-r lg:border-foreground"><SystemMark number="03" icon={FileSignature} label="Mashups Growth License" /><div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between"><h2 className="display-type text-5xl">RIGHTS THAT<br />MOVE AT SPEED.</h2><span className="display-type text-4xl text-primary sm:text-5xl">{snapshot.license.status.toUpperCase()}</span></div><div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3"><LightMetric value={`${snapshot.license.termDays}D`} label="term" /><LightMetric value={snapshot.license.territories[0] ?? "None"} label="territory" /><LightMetric value={money(snapshot.license.paidMediaCapCents)} label="paid cap" /></div><span className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest">Inspect signed terms<ArrowRight className="size-4" /></span></Link>
        <div className="p-5 sm:p-8"><SystemMark number="04" icon={LockKeyhole} label="Exclusive Rights Inventory" /><div className="mt-8 border-t border-foreground">{snapshot.inventory.length ? snapshot.inventory.map((track) => <div key={track.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-foreground py-5"><div><p className="text-xl font-semibold">{track.trackTitle}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{track.artistName} / {track.genre}</p></div><div className="text-right"><p className="display-type text-3xl text-primary">{track.launchReadiness}</p><p className="font-mono text-[9px] uppercase">{track.campaignSlots} slots</p></div></div>) : <EmptyRow text="No active exclusivity windows." />}</div></div>
      </section>

      <section className="grid border-x border-b border-foreground xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5 sm:p-8 xl:border-r xl:border-foreground"><SystemMark number="05" icon={Users} label="Creator Liquidity Engine" /><h2 className="display-type mt-8 text-4xl sm:text-6xl">BRIEFS NEED CREATORS.<br />CREATORS NEED MONEY.</h2><div className="mt-8 border-t border-foreground">{snapshot.liquidity.map((cell) => <div key={`${cell.city}-${cell.niche}`} className="grid grid-cols-[1fr_auto] gap-4 border-b border-foreground py-5 sm:grid-cols-[1fr_7rem_7rem_8rem]"><div><p className="font-semibold">{cell.city} / {cell.niche}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{cell.pressure.replaceAll("_", " ")}</p></div><span className="hidden font-mono text-sm sm:block">{cell.qualifiedCreators} creators</span><span className="hidden font-mono text-sm sm:block">{cell.openBriefs} briefs</span><span className="text-right font-mono font-semibold">{Math.round(cell.fillRate * 100)}% fill</span></div>)}</div></div>
        <div className="bg-primary p-5 text-primary-foreground sm:p-8"><SystemMark number="06" icon={Headphones} label="EDM / House Beachhead" inverse /><h2 className="display-type mt-10 text-6xl leading-[0.82]">FIVE CITIES.<br />ONE SCENE<br />GRAPH.</h2><div className="mt-10 border-t border-primary-foreground/50">{snapshot.scenes.map((scene) => <div key={scene.code} className="flex items-center justify-between border-b border-primary-foreground/50 py-4"><span><strong>{scene.city}</strong><small className="ml-3 font-mono text-[10px] uppercase">{scene.status}</small></span><span className="font-mono text-sm">{scene.creators} creators</span></div>)}</div></div>
      </section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-2">
        <div className="p-5 sm:p-8 lg:border-r lg:border-foreground"><SystemMark number="07" icon={TrendingUp} label="Organic-To-Paid Flywheel" /><h2 className="display-type mt-8 text-5xl">WINNERS EARN<br />THE NEXT DOLLAR.</h2><div className="mt-8 border-t border-foreground">{snapshot.amplification.map((candidate) => <div key={candidate.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-foreground py-5"><div><p className="font-semibold">{candidate.creatorHandle} / {candidate.genomeName}</p><p className="mt-1 text-xs text-muted-foreground">Consent {candidate.consent} / rights {candidate.rights} / trust {candidate.trustScore}</p></div><div className="text-right"><p className="display-type text-3xl text-primary">{candidate.organicLift}x</p><p className="font-mono text-[9px] uppercase">{money(candidate.recommendedSpendCents)}</p></div></div>)}</div></div>
        <div className="p-5 sm:p-8"><SystemMark number="08" icon={Handshake} label="Artist Participation Contract" /><h2 className="display-type mt-8 text-5xl">NO UPLOAD<br />AND VANISH.</h2><div className="mt-8 border-t border-foreground">{snapshot.artistObligations.map((obligation) => <div key={obligation.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-foreground py-5"><span className={obligation.status === "complete" ? "grid size-9 place-items-center bg-secondary" : "grid size-9 place-items-center border border-foreground"}>{obligation.status === "complete" ? <Check className="size-4" /> : <Target className="size-4" />}</span><span className="font-semibold">{obligation.action}</span><span className="font-mono text-sm">{obligation.completed}/{obligation.required}</span></div>)}</div></div>
      </section>

      <section className="grid border-x border-b border-foreground xl:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-foreground p-5 text-background sm:p-8 xl:border-r xl:border-background/30"><SystemMark number="09" icon={CloudCog} label="Partner Instead Of Rebuilding" inverse /><h2 className="display-type mt-8 text-5xl">USE THE RAILS.<br /><span className="text-secondary">OWN THE PROOF.</span></h2><div className="mt-8 border-t border-background/30">{snapshot.partners.map((partner) => <div key={partner.provider} className="flex items-center justify-between gap-4 border-b border-background/30 py-4"><span><strong>{partner.label}</strong><small className="mt-1 block font-mono text-[9px] uppercase text-background/50">{partner.capabilities.join(" / ") || "Configure capabilities"}</small></span><Badge variant={partner.status === "connected" ? "secondary" : "outline"} className="rounded-none border-background/40 text-current">{partner.status.replaceAll("_", " ")}</Badge></div>)}</div><Button variant="secondary" className="mt-6" onClick={() => void testPartnerRail()} disabled={pending === "partner"}><Zap />Test signed delivery</Button><FeedbackLine feedback={feedback} target="partner" dark /></div>
        <div className="p-5 sm:p-8"><SystemMark number="10" icon={Fingerprint} label="Fraud And Trust Network" /><div className="mt-8 grid gap-8 sm:grid-cols-[13rem_1fr]"><div className="grid aspect-square place-items-center border border-foreground bg-secondary"><div className="text-center"><p className="display-type text-7xl text-primary">{trust.score}</p><p className="font-mono text-[10px] uppercase tracking-widest">{trust.level}</p></div></div><div className="border-t border-foreground">{trust.signals.map((signal) => <div key={signal.label} className="flex items-center justify-between border-b border-foreground py-3"><span className="text-sm font-semibold">{signal.label}</span><span className="flex items-center gap-2 font-mono text-xs"><span>{signal.impact}</span><span className={signal.status === "clear" ? "size-2 bg-secondary" : signal.status === "warning" ? "size-2 bg-primary" : "size-2 bg-destructive"} /></span></div>)}</div></div><Button variant="outline" className="mt-6" onClick={() => void runTrust()} disabled={pending === "trust"}><ShieldCheck />Re-run trust</Button><FeedbackLine feedback={feedback} target="trust" /></div>
      </section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-3">
        <FeatureBlock number="11" icon={Trophy} title="Mashups Index" stat={`#${snapshot.index[0]?.rank ?? "-"}`} copy="Publish independent breakout intelligence as a media property and acquisition engine." href={`/index${detailSuffix}`} cta="Open weekly index" />
        <FeatureBlock number="12" icon={DatabaseZap} title="A&R Data Product" stat={`${snapshot.ar.breakoutProbability}%`} copy={`${snapshot.ar.recommendedNiche} in ${snapshot.ar.recommendedCity}, with the strongest hook at ${snapshot.ar.strongestHookSec} seconds.`} href={`/reports/${snapshot.launchSlug}${detailSuffix}`} cta="Open intelligence report" />
        <div className="p-5 sm:p-8"><SystemMark number="13" icon={CircleDollarSign} label="Revenue Model" /><p className="display-type mt-10 text-5xl text-primary">{money(quote.totalCents)}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pilot campaign total</p><div className="mt-7 space-y-3 text-sm"><MoneyLine label="Platform fee" cents={quote.platformFeeCents} /><MoneyLine label="Creator budget" cents={quote.creatorBudgetCents} /><MoneyLine label="Operations" cents={quote.operationsFeeCents} /></div><Button variant="outline" className="mt-6 w-full" onClick={() => void recalculateQuote()} disabled={pending === "quote"}><Banknote />Recalculate offer</Button><FeedbackLine feedback={feedback} target="quote" /></div>
      </section>

      <section className="relative overflow-hidden border-x border-b border-foreground bg-secondary p-5 sm:p-10"><CircuitBoard className="absolute -bottom-20 -right-12 size-80 opacity-10" /><div className="relative grid gap-10 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><SystemMark number="14" icon={Landmark} label="Launch Protection" /><h2 className="display-type mt-9 text-5xl leading-[0.82] sm:text-8xl">GUARANTEE THE WORK.<br /><span className="text-primary">NEVER GUARANTEE FAME.</span></h2><p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">Qualified campaigns can receive a platform-fee service credit when Mashups misses contracted operating deliverables. This is not insurance and does not promise streams, revenue, chart position, or virality.</p></div><div className="lg:col-span-4"><div className="border border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)]"><div className="flex items-center justify-between"><Badge className="rounded-none" variant={protection.status === "eligible" ? "secondary" : "outline"}>{protection.status}</Badge><span className="display-type text-4xl text-primary">{money(protection.serviceCreditCents)}</span></div><div className="mt-6 space-y-3">{protection.conditions.map((condition) => <div key={condition.label} className="flex items-start gap-3 text-sm"><span className={condition.passed ? "mt-0.5 grid size-5 shrink-0 place-items-center bg-secondary" : "mt-0.5 grid size-5 shrink-0 place-items-center border border-foreground"}>{condition.passed ? <Check className="size-3" /> : null}</span><span><strong>{condition.label}</strong><small className="block text-muted-foreground">{condition.detail}</small></span></div>)}</div><Button className="mt-6 w-full" onClick={() => void qualifyProtection()} disabled={pending === "protection"}><Gauge />Qualify protection</Button><FeedbackLine feedback={feedback} target="protection" /></div></div></div></section>
    </section>
  </div>
}

function EmptyDomination() { return <div className="mx-auto grid min-h-[82vh] max-w-4xl place-items-center px-4 pt-28 text-center"><div><Crosshair className="mx-auto size-12 text-primary" /><p className="signal-label mt-7 justify-center">Domination operating layer</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">NO COMMERCIAL<br />CONTROL PLANE.</h1><p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Create a live launch or inspect the complete labeled strategy simulation.</p><Button className="mt-8" asChild><Link href="/domination?demo=1">Load all fourteen<Sparkles /></Link></Button></div></div> }
function SystemMark({ number, icon: Icon, label, inverse = false }: { number: string; icon: typeof Rocket; label: string; inverse?: boolean }) { return <div className={`flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${inverse ? "text-current" : "text-muted-foreground"}`}><span className={`grid size-8 place-items-center border ${inverse ? "border-current" : "border-foreground"}`}>{number}</span><Icon className="size-4" /><span>{label}</span></div> }
function DarkMetric({ value, label }: { value: string; label: string }) { return <div className="bg-foreground p-3"><p className="text-xl font-semibold">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-background/50">{label}</p></div> }
function LightMetric({ value, label }: { value: string; label: string }) { return <div className="bg-card p-4"><p className="text-xl font-semibold">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p></div> }
function MoneyLine({ label, cents }: { label: string; cents: number }) { return <div className="flex items-center justify-between border-b border-foreground pb-3"><span>{label}</span><strong>{money(cents)}</strong></div> }
function EmptyRow({ text }: { text: string }) { return <p className="border-b border-foreground py-8 text-muted-foreground">{text}</p> }
function FeedbackLine({ feedback, target, dark = false }: { feedback: Feedback; target: string; dark?: boolean }) { if (!feedback || feedback.key !== target) return null; return <p role="status" className={`mt-4 border p-3 text-sm ${dark ? "border-background/40" : "border-foreground"} ${feedback.error ? "text-destructive" : ""}`}>{feedback.text}</p> }
function FeatureBlock({ number, icon, title, stat, copy, href, cta }: { number: string; icon: typeof Trophy; title: string; stat: string; copy: string; href: string; cta: string }) { return <article className="border-b border-foreground p-5 last:border-b-0 sm:p-8 lg:border-b-0 lg:border-r lg:last:border-r-0"><SystemMark number={number} icon={icon} label={title} /><p className="display-type mt-10 text-6xl text-primary">{stat}</p><p className="mt-6 min-h-20 leading-relaxed text-muted-foreground">{copy}</p><Button variant="outline" className="mt-6" asChild><Link href={href}>{cta}<ChevronRight /></Link></Button></article> }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
