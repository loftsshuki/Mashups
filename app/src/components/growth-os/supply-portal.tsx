"use client"

import { type FormEvent, useState } from "react"
import { upload } from "@vercel/blob/client"
import Link from "next/link"
import { ArrowLeft, Check, FileCheck2, Globe2, LockKeyhole, Music2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SupplyTrack } from "@/lib/growth-os/types"

export function SupplyPortal({ tracks, demo }: { tracks: SupplyTrack[]; demo: boolean }) {
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setMessage(null)
    if (demo) {
      setMessage("Demo only: sign in to upload a private master and create a reviewable rights record.")
      return
    }
    const form = new FormData(formElement)
    const file = form.get("master")
    if (!(file instanceof File) || file.size === 0) { setMessage("Choose a WAV, FLAC, MP3, M4A, AAC, or OGG master."); return }
    setSubmitting(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")
      const tokenResponse = await fetch("/api/green/uploads/path", { method: "POST" })
      const tokenResult = await tokenResponse.json() as { prefix?: string; error?: string }
      if (!tokenResponse.ok || !tokenResult.prefix) throw new Error(tokenResult.error ?? "Could not prepare private storage.")
      const blob = await upload(`${tokenResult.prefix}${safeName}`, file, {
        access: "private",
        handleUploadUrl: "/api/green/uploads/token",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      const payload = {
        organizationName: String(form.get("organizationName")),
        artistName: String(form.get("artistName")),
        trackTitle: String(form.get("trackTitle")),
        genre: String(form.get("genre")),
        isrc: String(form.get("isrc") || "") || undefined,
        masterAssetUrl: blob.url,
        masterAssetPathname: blob.pathname,
        masterAssetContentType: file.type || "audio/mpeg",
        masterAssetByteSize: file.size,
        masterController: String(form.get("masterController")),
        compositionController: String(form.get("compositionController")),
        masterControlConfirmed: form.get("masterControlConfirmed") === "on",
        compositionControlConfirmed: form.get("compositionControlConfirmed") === "on",
        sampleStatus: String(form.get("sampleStatus")),
        stemExtractionAllowed: form.get("stemExtractionAllowed") === "on",
        crossTrackDerivativesAllowed: form.get("crossTrackDerivativesAllowed") === "on",
        inAppPlaybackAllowed: form.get("inAppPlaybackAllowed") === "on",
        shortVideoExportAllowed: form.get("shortVideoExportAllowed") === "on",
        paidMediaAllowed: false,
        territories: [String(form.get("territory"))],
        endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : null,
        rightsAttested: form.get("rightsAttested") === "on",
      }
      const response = await fetch("/api/green/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const result = await response.json() as { trackId?: string; error?: string }
      if (!response.ok) throw new Error(result.error ?? "Submission failed.")
      formElement.reset()
      setProgress(0)
      setMessage(`Submission ${result.trackId?.slice(0, 8)} is sealed for rights, fingerprint, and listening review.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="pb-28 pt-28"><section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
    <Link href="/create" className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"><ArrowLeft className="size-4" />Green Room</Link>
    <header className="mt-7 grid gap-8 border-y border-foreground py-10 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">Artist-direct catalog / permission first</p><h1 className="display-type mt-6 text-6xl leading-[0.8] sm:text-8xl xl:text-9xl">MUSIC IN.<br /><span className="text-primary">AMBIGUITY OUT.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Masters stay private. Tracks remain quarantined until rights, sample status, processing quality, and human listening all pass.</p></div></header>
    <div className="grid border-x border-b border-foreground xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={submit} className="bg-secondary p-5 sm:p-8 xl:border-r xl:border-foreground">
        <div className="flex items-center gap-3"><LockKeyhole className="size-5" /><p className="mono-label">Private master intake</p></div>
        <h2 className="display-type mt-6 text-4xl">Apply for the<br />Green Catalog.</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Rights organization" name="organizationName" placeholder="Artist LLC or label" />
          <Field label="Artist name" name="artistName" placeholder="Release artist" />
          <Field label="Track title" name="trackTitle" placeholder="Exact release title" />
          <Field label="Genre" name="genre" placeholder="Tech House" />
          <Field label="ISRC (optional)" name="isrc" placeholder="US..." required={false} />
          <Field label="License end date (optional)" name="endsAt" type="date" placeholder="" required={false} />
          <Field label="Master controller" name="masterController" placeholder="Legal person or company" />
          <Field label="Composition controller" name="compositionController" placeholder="100% publisher / writers" />
          <div className="sm:col-span-2 space-y-2"><Label htmlFor="master">Private audio master</Label><Input id="master" name="master" type="file" accept="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac" required={!demo} /><p className="text-xs text-muted-foreground">Maximum 250 MB. Uploaded directly to a private store; the browser never receives a reusable storage credential.</p></div>
          <div className="space-y-2"><Label htmlFor="sampleStatus">Sample status</Label><select id="sampleStatus" name="sampleStatus" className="h-10 w-full border border-input bg-background px-3 text-sm" defaultValue="sample_free"><option value="sample_free">Sample-free</option><option value="cleared_samples">All samples cleared</option></select></div>
          <div className="space-y-2"><Label htmlFor="territory">Territory</Label><select id="territory" name="territory" className="h-10 w-full border border-input bg-background px-3 text-sm" defaultValue="Worldwide"><option>Worldwide</option><option>United States</option><option>United Kingdom</option><option>European Union</option></select></div>
        </div>
        <div className="mt-6 grid gap-3 border-y border-foreground py-5 text-sm">
          <Consent name="masterControlConfirmed" text="I control 100% of the master for these pilot uses." />
          <Consent name="compositionControlConfirmed" text="I control or have written consent for 100% of the composition." />
          <Consent name="stemExtractionAllowed" text="Mashups may securely extract and store stems." />
          <Consent name="crossTrackDerivativesAllowed" text="Fans may combine this track with other opted-in Green Catalog tracks." />
          <Consent name="inAppPlaybackAllowed" text="Creations may play inside Mashups with attribution." />
          <Consent name="shortVideoExportAllowed" text="30-second watermarked video exports are permitted." />
          <Consent name="rightsAttested" text="I attest this information is accurate and auditable. No standalone MP3/WAV or stem export is granted." />
        </div>
        <Button className="mt-6 w-full" type="submit" disabled={submitting}><ShieldCheck />{submitting ? `Private upload ${progress}%` : demo ? "Preview submission flow" : "Seal private submission"}</Button>
        {message ? <p role="status" className="mt-4 border border-foreground bg-card p-3 text-sm">{message}</p> : null}
      </form>
      <div className="p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mono-label text-muted-foreground">Existing campaign ledger</p><h2 className="display-type mt-3 text-4xl">Submitted sources</h2></div><Badge variant="outline" className="rounded-none">{tracks.length} sources</Badge></div>
        <div className="mt-8 border-t border-foreground">{tracks.length ? tracks.map((track) => <article key={track.id} className="grid gap-5 border-b border-foreground py-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-2xl font-semibold">{track.trackTitle}</h3><Badge variant={track.rightsStatus === "verified" ? "secondary" : "outline"} className="rounded-none">{track.rightsStatus.replaceAll("_", " ")}</Badge></div><p className="mt-1 font-mono text-xs text-muted-foreground">{track.artistName} / {track.organization}</p></div><div className="min-w-28 sm:text-right"><p className="display-type text-4xl text-primary">{track.launchReadiness}</p><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">readiness</p></div></article>) : <p className="border-b border-foreground py-8 text-sm text-muted-foreground">No live submissions yet. The four creation tracks remain explicitly labeled Mashups originals.</p>}</div>
        <div className="mt-8 grid gap-px border border-foreground bg-foreground sm:grid-cols-3"><SupplyStep icon={FileCheck2} label="Attest" note="Master + composition" /><SupplyStep icon={Globe2} label="Verify" note="Samples + territory" /><SupplyStep icon={Music2} label="Listen" note="Quality + pairing" /></div>
      </div>
    </div>
  </section></div>
}

function Field({ label, name, type = "text", placeholder, required = true }: { label: string; name: string; type?: string; placeholder: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} placeholder={placeholder} required={required} /></div> }
function Consent({ name, text }: { name: string; text: string }) { return <label className="flex items-start gap-3 leading-relaxed"><input name={name} type="checkbox" required className="mt-1 size-4 accent-[var(--primary)]" /><span>{text}</span></label> }
function SupplyStep({ icon: Icon, label, note }: { icon: typeof Check; label: string; note: string }) { return <div className="bg-card p-4"><Icon className="size-5 text-primary" /><p className="mt-5 font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }
