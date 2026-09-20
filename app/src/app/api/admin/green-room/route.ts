import { NextResponse } from "next/server"
import { z } from "zod"

import { isAdminUser } from "@/lib/auth/admin"
import { buildInitialGreenProcessingPlan } from "@/lib/green-room/processor-routing"
import { assessGreenAudio } from "@/lib/green-room/quality"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify_rights"), trackId: z.uuid() }),
  z.object({ action: z.literal("queue_processing"), trackId: z.uuid() }),
  z.object({ action: z.literal("quarantine"), trackId: z.uuid() }),
  z.object({ action: z.literal("publish"), trackId: z.uuid() }),
  z.object({ action: z.literal("record_analysis"), trackId: z.uuid(), bpm: z.number().positive().max(300), musicalKey: z.string().min(1).max(20), camelotKey: z.string().min(2).max(3), integratedLufs: z.number(), truePeakDb: z.number(), vocalBleedDb: z.number().nullable(), separationSdrDb: z.number().nullable(), phraseConfidence: z.number().min(0).max(1), sampleScanStatus: z.enum(["clear", "flagged", "unavailable"]) }),
])

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser({ email: user?.email, id: user?.id })) return null
  const admin = createAdminClient()
  return user && admin ? { user, admin } : null
}

export async function GET() {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  const [tracks, jobs] = await Promise.all([
    ctx.admin.from("green_catalog_tracks").select("id,artist_name,track_title,genre,status,rights_status,quality_status,published_at,created_at").order("created_at", { ascending: false }).limit(100),
    ctx.admin.from("green_processing_jobs").select("id,track_id,job_type,status,provider,attempt_count,error_code,created_at").order("created_at", { ascending: false }).limit(100),
  ])
  if (tracks.error || jobs.error) return NextResponse.json({ error: "The catalog database is unavailable." }, { status: 503 })
  return NextResponse.json({ tracks: tracks.data ?? [], jobs: jobs.data ?? [] })
}

export async function POST(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  const parsed = actionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid Green Room action." }, { status: 400 })
  const input = parsed.data

  if (input.action === "quarantine") {
    const { error } = await ctx.admin.from("green_catalog_tracks").update({ status: "quarantined", updated_at: new Date().toISOString() }).eq("id", input.trackId)
    return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 })
  }
  if (input.action === "queue_processing") {
    const plan = buildInitialGreenProcessingPlan()
    if (!plan.ready) {
      return NextResponse.json({
        error: "Audio analysis processor is not configured; no jobs were queued.",
        missing: plan.missing.map((job) => `${job.jobType}:${job.provider}`),
      }, { status: 503 })
    }

    const { error } = await ctx.admin.from("green_processing_jobs").insert(
      plan.jobs.map((job) => ({
        track_id: input.trackId,
        job_type: job.jobType,
        provider: job.provider,
      })),
    )
    if (error) return NextResponse.json({ error: "Processing could not be queued." }, { status: 500 })

    const updated = await ctx.admin.from("green_catalog_tracks").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", input.trackId)
    return NextResponse.json({
      ok: !updated.error,
      queued: plan.jobs.map((job) => `${job.jobType}:${job.provider}`),
      skipped: plan.missing.map((job) => `${job.jobType}:${job.provider}`),
    }, { status: updated.error ? 500 : 200 })
  }
  if (input.action === "verify_rights") {
    const { error } = await ctx.admin.rpc("verify_green_track_rights", { p_track_id: input.trackId, p_reviewer_id: ctx.user.id })
    return approvalResponse(error)
  }
  if (input.action === "record_analysis") {
    const result = assessGreenAudio(input)
    const row = { track_id: input.trackId, bpm: input.bpm, musical_key: input.musicalKey, camelot_key: input.camelotKey, integrated_lufs: input.integratedLufs, true_peak_db: input.truePeakDb, vocal_bleed_db: input.vocalBleedDb, separation_sdr_db: input.separationSdrDb, phrase_confidence: input.phraseConfidence, sample_scan_status: input.sampleScanStatus, quality_reasons: result.reasons, analyzed_at: new Date().toISOString() }
    const { error } = await ctx.admin.from("green_track_analysis").upsert(row)
    if (error) return NextResponse.json({ error: "Analysis could not be saved." }, { status: 500 })
    const updated = await ctx.admin.from("green_catalog_tracks").update({ bpm: input.bpm, musical_key: input.musicalKey, camelot_key: input.camelotKey, quality_status: result.passed ? "passed" : "failed", status: result.passed ? "listening_review" : "quarantined", updated_at: new Date().toISOString() }).eq("id", input.trackId)
    return NextResponse.json({ ok: !updated.error, quality: result }, { status: updated.error ? 500 : 200 })
  }

  const { error } = await ctx.admin.rpc("publish_green_track", { p_track_id: input.trackId })
  return approvalResponse(error)
}

function approvalResponse(error: { code?: string; message: string } | null) {
  if (!error) return NextResponse.json({ ok: true })
  if (error.code === "P0001") return NextResponse.json({ error: error.message }, { status: 409 })
  return NextResponse.json({ error: "Catalog approval is unavailable. Check the database and foundation migration." }, { status: 503 })
}
