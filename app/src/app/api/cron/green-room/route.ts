import { NextResponse } from "next/server"

import { signGreenAsset } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const processorUrl = process.env.GREEN_ROOM_PROCESSOR_URL
  const processorSecret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  if (!processorUrl || !processorSecret) return NextResponse.json({ error: "Green Room processor is not configured; queued jobs were left untouched." }, { status: 503 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const { data: jobs, error } = await admin.from("green_processing_jobs").select("id,track_id,job_type,provider,attempt_count").eq("status", "queued").lte("available_at", new Date().toISOString()).order("created_at").limit(5)
  if (error) return NextResponse.json({ error: "Unable to claim jobs." }, { status: 500 })
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mashups.agency").replace(/\/$/, "")
  const accepted: string[] = []
  for (const job of jobs ?? []) {
    const claimedAt = new Date().toISOString()
    const { data: claimed } = await admin.from("green_processing_jobs").update({ status: "running", started_at: claimedAt, attempt_count: job.attempt_count + 1, updated_at: claimedAt }).eq("id", job.id).eq("status", "queued").select("id").maybeSingle()
    if (!claimed) continue
    const expires = Date.now() + 10 * 60_000
    const sig = signGreenAsset(job.id, expires, processorSecret)
    const assetUrl = `${baseUrl}/api/green/assets/${job.id}?expires=${expires}&sig=${sig}`
    const callbackUrl = `${baseUrl}/api/green/processing/callback`
    const response = await fetch(processorUrl, { method: "POST", headers: { "Authorization": `Bearer ${processorSecret}`, "Content-Type": "application/json" }, body: JSON.stringify({ jobId: job.id, trackId: job.track_id, jobType: job.job_type, assetUrl, callbackUrl }) }).catch(() => null)
    if (response?.ok) {
      accepted.push(job.id)
    } else {
      await admin.from("green_processing_jobs").update({ status: "queued", started_at: null, error_code: "HANDOFF_FAILED", error_message: `Processor handoff returned ${response?.status ?? "network failure"}.`, available_at: new Date(Date.now() + 5 * 60_000).toISOString(), updated_at: new Date().toISOString() }).eq("id", job.id).eq("status", "running")
    }
  }
  return NextResponse.json({ ok: true, queued: jobs?.length ?? 0, accepted: accepted.length })
}
