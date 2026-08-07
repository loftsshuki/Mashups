import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Clock3, FileCheck2, Globe2, ShieldCheck } from "lucide-react"

import { LicenseAcceptance } from "@/components/domination/license-acceptance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getGrowthLicenseDocument } from "@/lib/domination/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Mashups Growth License", description: "A standardized campaign-rights agreement built for fast, attributable music growth.", alternates: { canonical: "/growth-license" }, robots: { index: false, follow: false } }

export default async function GrowthLicensePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/growth-license")
  const document = await getGrowthLicenseDocument(user?.id ?? null, demo)

  if (!document) return <main className="mx-auto grid min-h-[78vh] max-w-3xl place-items-center px-4 pt-28 text-center"><div><p className="signal-label justify-center">Mashups Growth License</p><h1 className="display-type mt-6 text-6xl leading-[0.84]">NO AGREEMENT<br />IN YOUR QUEUE.</h1><p className="mt-6 text-muted-foreground">An issued agreement will appear here for rightsholder review and acceptance.</p><Button className="mt-8" asChild><Link href="/domination">Return to control plane</Link></Button></div></main>

  const license = document.license
  return <main className="license-page overflow-x-clip pt-[68px]">
    <div className="border-b border-foreground bg-secondary px-4 py-2"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em]"><span>Standard instrument / MGL v{license.version}</span><span>{demo ? "Labeled simulation" : "Binding review surface"}</span></div></div>
    <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
      <header className="grid border-x border-b border-foreground lg:grid-cols-[1fr_20rem]">
        <div className="relative overflow-hidden p-6 sm:p-10 lg:p-14"><div className="domination-grid absolute inset-0 opacity-30" /><div className="relative"><Button variant="ghost" className="-ml-3" asChild><Link href={`/domination${demo ? "?demo=1" : ""}`}><ArrowLeft />Control plane</Link></Button><p className="signal-label mt-10">Rights velocity instrument</p><h1 className="display-type mt-7 text-[clamp(3.4rem,13vw,8.5rem)] leading-[0.75]">GROWTH<br />WITHOUT<br /><span className="text-primary">RIGHTS FOG.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">One standardized contract grants exactly the campaign uses the network needs, while ownership stays where it belongs.</p></div></div>
        <aside className="flex flex-col justify-between border-t border-foreground bg-foreground p-6 text-background lg:border-l lg:border-t-0"><div><p className="mono-label text-background/55">Verification code</p><p className="mt-3 break-all font-mono text-lg font-semibold text-secondary">{license.code}</p></div><div className="my-12"><Badge variant="secondary" className="rounded-none text-sm">{license.status.toUpperCase()}</Badge><p className="display-type mt-4 text-5xl">{license.termDays} DAYS</p><p className="mt-2 text-sm text-background/60">Offer expires {formatDate(document.expiresAt)}</p></div><div className="border-t border-background/30 pt-5 text-sm text-background/65">Issued to {document.organizationName}<br />for {document.artistName} / {document.trackTitle}</div></aside>
      </header>

      <section className="grid border-x border-b border-foreground lg:grid-cols-3">
        <LicenseMetric icon={Globe2} label="Territory" value={license.territories.join(", ") || "Not granted"} />
        <LicenseMetric icon={FileCheck2} label="Paid media ceiling" value={money(license.paidMediaCapCents)} />
        <LicenseMetric icon={Clock3} label="Takedown SLA" value={`${license.takedownSlaHours} hours`} />
      </section>

      <section className="grid border-x border-b border-foreground lg:grid-cols-[1fr_22rem]">
        <article className="p-6 sm:p-10 lg:border-r lg:border-foreground"><p className="mono-label text-muted-foreground">Exact grant</p><h2 className="display-type mt-5 text-5xl">WHAT CAN MOVE.</h2><div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-2">{license.permittedUses.map((use) => <div key={use} className="flex items-start gap-3 bg-card p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><span className="font-semibold">{use}</span></div>)}</div><div className="mt-10 border-t border-foreground pt-8"><p className="mono-label text-muted-foreground">Derivative boundary</p><p className="mt-4 max-w-3xl text-lg leading-relaxed">{license.derivativePolicy}</p></div><div className="mt-10 border-t border-foreground pt-8"><p className="mono-label text-muted-foreground">Terms snapshot</p><p className="mt-4 whitespace-pre-line leading-8 text-muted-foreground">{document.termsMarkdown}</p></div></article>
        <aside className="p-6 sm:p-8"><p className="mono-label text-muted-foreground">Execution</p><h2 className="display-type mt-5 text-4xl">SIGN ONCE.<br />PROVE FOREVER.</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Acceptance records the signer, timestamp, terms snapshot, verification code, and commercial limits. Changes require a new instrument.</p><div className="mt-8"><LicenseAcceptance agreementId={document.agreementId} initialStatus={license.status} demo={demo} /></div><dl className="mt-8 space-y-4 border-t border-foreground pt-6 text-sm"><div><dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Offered</dt><dd className="mt-1 font-semibold">{formatDate(document.offeredAt)}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Instrument</dt><dd className="mt-1 font-semibold">{document.launchTitle}</dd></div></dl></aside>
      </section>
    </section>
  </main>
}

function LicenseMetric({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) { return <div className="border-b border-foreground p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 sm:p-7"><Icon className="size-5 text-primary" /><p className="mono-label mt-8 text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div> }
function formatDate(value: string) { return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)) : "Pending" }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
