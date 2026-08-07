"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, FileCheck2, Globe2, Music2, ShieldCheck, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SupplyTrack } from "@/lib/growth-os/types"

export function SupplyPortal({ tracks, demo }: { tracks: SupplyTrack[]; demo: boolean }) {
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/growth/supply${demo ? "?demo=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organizationName: `${form.get("artistName")} Rights`, artistName: form.get("artistName"), trackTitle: form.get("trackTitle"), audioUrl: form.get("audioUrl"), isrc: form.get("isrc") || undefined, territories: ["Worldwide"], permittedUses: ["organic short-form", "creator whitelisting", "paid social <= $25k"], rightsAttested: true }) })
    const result = await response.json() as { error?: string; launchReadiness?: number }
    setMessage(response.ok ? `Submission sealed. Launch readiness: ${result.launchReadiness}%. Rights review is next.` : result.error ?? "Submission failed.")
    setSubmitting(false)
  }

  return <div className="pb-28 pt-28"><section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8"><Link href="/network?demo=1" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"><ArrowLeft className="size-4" />Network command</Link><header className="mt-7 grid gap-8 border-y border-foreground py-10 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">Rightsholder supply / chain of title first</p><h1 className="display-type mt-6 text-6xl leading-[0.8] sm:text-8xl xl:text-9xl">MUSIC IN.<br /><span className="text-primary">AMBIGUITY OUT.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">No mystery masters. No rights cleanup after virality. Every track arrives with parties, uses, territory, term, and payout instructions attached.</p></div></header>
  <div className="grid border-x border-b border-foreground xl:grid-cols-[0.85fr_1.15fr]"><form onSubmit={submit} className="bg-secondary p-5 sm:p-8 xl:border-r xl:border-foreground"><div className="flex items-center gap-3"><Upload className="size-5" /><p className="mono-label">New master intake</p></div><h2 className="display-type mt-6 text-4xl">Submit the next<br />campaign source.</h2><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Artist name" name="artistName" defaultValue="AERON" /><Field label="Track title" name="trackTitle" defaultValue="Soft Static" /><Field label="ISRC" name="isrc" defaultValue="USABC2600012" /><Field label="Release date" name="releaseAt" type="date" defaultValue="2026-08-21" /><div className="sm:col-span-2"><Field label="Secure master URL" name="audioUrl" type="url" defaultValue="https://assets.mashups.agency/demo/soft-static.wav" /></div></div><div className="mt-6 border-y border-foreground py-5"><label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" required defaultChecked className="mt-1 size-4 accent-[var(--primary)]" /><span>I attest that the submitted parties control the uses selected below and authorize Mashups to review the source. This attestation is versioned and auditable.</span></label></div><Button className="mt-6 w-full" type="submit" disabled={submitting}><ShieldCheck />{submitting ? "Sealing submission..." : "Seal rights submission"}</Button>{message ? <p role="status" className="mt-4 border border-foreground bg-card p-3 text-sm">{message}</p> : null}</form>
  <div className="p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mono-label text-muted-foreground">Supply ledger</p><h2 className="display-type mt-3 text-4xl">Campaign-ready catalog</h2></div><Badge variant="outline" className="rounded-none">{tracks.length} sources</Badge></div><div className="mt-8 border-t border-foreground">{tracks.map((track) => <article key={track.id} className="grid gap-5 border-b border-foreground py-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-2xl font-semibold">{track.trackTitle}</h3><Badge variant={track.rightsStatus === "verified" ? "secondary" : "outline"} className="rounded-none">{track.rightsStatus.replaceAll("_", " ")}</Badge></div><p className="mt-1 font-mono text-xs text-muted-foreground">{track.artistName} / {track.organization}</p><div className="mt-4 flex flex-wrap gap-2">{track.permittedUses.map((use) => <span key={use} className="border border-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-wider">{use}</span>)}</div></div><div className="min-w-28 text-left sm:text-right"><p className="display-type text-4xl text-primary">{track.launchReadiness}</p><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">readiness</p></div></article>)}</div><div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3"><SupplyStep icon={FileCheck2} label="Attest" note="Parties + ownership" /><SupplyStep icon={Globe2} label="Bound" note="Use + territory" /><SupplyStep icon={Music2} label="Launch" note="Creators + proof" /></div><Button variant="outline" className="mt-6" asChild><Link href="/launches/new?demo=1">Build launch from source<ArrowRight /></Link></Button></div></div></section></div>
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue: string }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={defaultValue} required={name !== "isrc" && name !== "releaseAt"} /></div> }
function SupplyStep({ icon: Icon, label, note }: { icon: typeof Check; label: string; note: string }) { return <div className="bg-card p-4"><Icon className="size-5 text-primary" /><p className="mt-5 font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }
