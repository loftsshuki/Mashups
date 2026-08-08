import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Check, FileCheck2, ShieldCheck, TrendingUp, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isDemoQuery } from "@/lib/demo/runtime"
import { DEMO_GROWTH_OS } from "@/lib/growth-os/demo"
import { getCreatorPassport } from "@/lib/growth-os/service"

export function generateStaticParams() { return [{ username: DEMO_GROWTH_OS.passport.username }] }
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> { const { username } = await params; return { title: `@${username} Proof Passport`, description: "Verified campaign lift, rights standing, and creator reliability.", alternates: { canonical: `/passport/${username}` } } }

export default async function PassportPage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ username }, query] = await Promise.all([params, searchParams])
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const passport = await getCreatorPassport(username, demo)
  if (!passport) notFound()
  return <div className="pb-28 pt-28"><section className="mx-auto max-w-5xl px-4 sm:px-6"><Link href="/network?demo=1" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"><ArrowLeft className="size-4" />Network command</Link><div className="mt-8 border border-foreground bg-card shadow-[9px_9px_0_var(--foreground)]"><header className="relative overflow-hidden border-b border-foreground bg-secondary p-6 sm:p-10"><BadgeCheck className="absolute -right-8 -top-10 size-64 opacity-10" /><p className="signal-label">Mashups verified proof passport</p><div className="relative mt-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="display-type text-5xl sm:text-7xl">{passport.displayName}</h1><p className="mt-2 font-mono text-sm">@{passport.username} / public evidence record</p></div><div className="grid size-24 place-items-center border border-foreground bg-primary display-type text-3xl text-primary-foreground">{initials(passport.displayName)}</div></div></header><div className="grid gap-px border-b border-foreground bg-foreground sm:grid-cols-3"><ProofMetric value={`${passport.liftPercentile}th`} label="Lift percentile" icon={TrendingUp} /><ProofMetric value={`${passport.reliabilityScore}`} label="Reliability" icon={ShieldCheck} /><ProofMetric value={`${passport.verifiedRightsUses}`} label="Rights-clean uses" icon={FileCheck2} /></div><div className="grid lg:grid-cols-[1.1fr_0.9fr]"><div className="p-6 sm:p-10 lg:border-r lg:border-foreground"><p className="mono-label text-muted-foreground">Recent verified proof</p><div className="mt-6 border-t border-foreground">{passport.recentProofs.map((proof) => <div key={`${proof.label}-${proof.verifiedAt}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-foreground py-5"><span className="grid size-9 place-items-center bg-secondary"><Check className="size-4" /></span><span><strong className="block">{proof.label}</strong><small className="font-mono text-[10px] text-muted-foreground">Verified {formatDate(proof.verifiedAt)}</small></span><strong className="text-right text-xl text-primary">{proof.value}</strong></div>)}</div></div><aside className="p-6 sm:p-10"><p className="mono-label text-muted-foreground">Trust marks</p><div className="mt-6 flex flex-wrap gap-2">{passport.badges.map((badge) => <Badge key={badge} variant="outline" className="rounded-none py-2"><Trophy />{badge}</Badge>)}</div><div className="mt-8 border border-foreground bg-secondary p-5"><p className="font-mono text-[10px] uppercase tracking-widest">Fan A&R reputation</p><p className="display-type mt-3 text-5xl text-primary">{passport.fanArReputation}</p><p className="mt-5 text-sm text-muted-foreground">{passport.qualifiedCampaigns} qualified campaigns / {passport.paidMediaCleared} paid-use clearances</p></div><Button className="mt-6 w-full" asChild><Link href="/launches?demo=1">Invite to campaign</Link></Button></aside></div></div></section></div>
}

function ProofMetric({ value, label, icon: Icon }: { value: string; label: string; icon: typeof TrendingUp }) { return <div className="bg-card p-6"><Icon className="size-5 text-primary" /><p className="display-type mt-7 text-5xl">{value}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p></div> }
function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) }
