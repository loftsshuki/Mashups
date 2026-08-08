"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole, RefreshCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Track = { id: string; artist_name: string; track_title: string; genre: string; status: string; rights_status: string; quality_status: string; created_at: string }
type Job = { id: string; track_id: string; job_type: string; status: string; provider: string; attempt_count: number; error_code: string | null }

export default function GreenRoomAdminPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const load = useCallback(async () => { const response = await fetch("/api/admin/green-room"); const data = await response.json() as { tracks?: Track[]; jobs?: Job[]; error?: string }; if (!response.ok) setMessage(data.error ?? "Unable to load review queue."); else { setTracks(data.tracks ?? []); setJobs(data.jobs ?? []) } }, [])
  useEffect(() => {
    let active = true
    void fetch("/api/admin/green-room").then(async (response) => {
      const data = await response.json() as { tracks?: Track[]; jobs?: Job[]; error?: string }
      if (!active) return
      if (!response.ok) setMessage(data.error ?? "Unable to load review queue.")
      else { setTracks(data.tracks ?? []); setJobs(data.jobs ?? []) }
    })
    return () => { active = false }
  }, [])
  const jobsByTrack = useMemo(() => new Map(tracks.map((track) => [track.id, jobs.filter((job) => job.track_id === track.id)])), [jobs, tracks])
  async function act(trackId: string, action: "verify_rights" | "queue_processing" | "quarantine" | "publish") { setBusy(`${trackId}-${action}`); setMessage(null); const response = await fetch("/api/admin/green-room", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId, action }) }); const data = await response.json() as { error?: string }; setMessage(response.ok ? `${action.replaceAll("_", " ")} completed.` : data.error ?? "Action failed."); setBusy(null); if (response.ok) await load() }
  return <div className="pt-28"><section className="mx-auto max-w-[1300px] px-4 pb-24 sm:px-6 lg:px-8"><header className="grid gap-6 border-b border-foreground pb-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="signal-label">Green Room / fail-closed operations</p><h1 className="display-type mt-5 text-5xl leading-[0.84] sm:text-7xl">Nothing ships<br /><span className="text-primary">on vibes alone.</span></h1></div><Button variant="outline" onClick={() => void load()}><RefreshCcw />Refresh queue</Button></header>{message ? <p role="status" className="mt-5 border border-foreground bg-secondary p-4 text-sm">{message}</p> : null}<div className="mt-7 border border-foreground bg-card">{tracks.length ? tracks.map((track) => { const trackJobs = jobsByTrack.get(track.id) ?? []; const active = busy?.startsWith(track.id); return <article key={track.id} className="border-b border-foreground p-5 last:border-b-0"><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold">{track.track_title}</h2><Badge variant={track.status === "green" ? "secondary" : track.status === "quarantined" ? "destructive" : "outline"} className="rounded-none">{track.status.replaceAll("_", " ")}</Badge></div><p className="mt-1 font-mono text-xs text-muted-foreground">{track.artist_name} / {track.genre}</p><div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider"><span className="border border-foreground px-2 py-1">rights {track.rights_status}</span><span className="border border-foreground px-2 py-1">quality {track.quality_status}</span>{trackJobs.map((job) => <span key={job.id} className="border border-foreground px-2 py-1">{job.job_type} {job.status}</span>)}</div></div><div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end"><Button size="sm" disabled={active || track.rights_status === "verified"} onClick={() => void act(track.id, "verify_rights")}><CheckCircle2 />Verify rights</Button><Button size="sm" variant="outline" disabled={active} onClick={() => void act(track.id, "queue_processing")}>{active ? <Loader2 className="animate-spin" /> : <RefreshCcw />}Queue processing</Button><Button size="sm" variant="outline" disabled={active || track.status === "green"} onClick={() => void act(track.id, "publish")}>Publish</Button><Button size="sm" variant="destructive" disabled={active} onClick={() => void act(track.id, "quarantine")}><AlertTriangle />Quarantine</Button></div></div></article> }) : <div className="p-8 text-sm text-muted-foreground"><LockKeyhole className="mb-4 size-6" />No Green Catalog records, or migration 024 has not been applied.</div>}</div><div className="mt-6 flex gap-3"><Button asChild variant="outline"><Link href="/admin/ops">Integration health</Link></Button><Button asChild variant="outline"><Link href="/supply">Open intake</Link></Button></div></section></div>
}
