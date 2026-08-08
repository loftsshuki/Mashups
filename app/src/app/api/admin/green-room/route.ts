import { NextResponse } from "next/server"
import { z } from "zod"

import { isAdminUser } from "@/lib/auth/admin"
import { assessGreenAudio, assessGreenRights, canPublishGreenTrack } from "@/lib/green-room/quality"
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
  if (tracks.error || jobs.error) return NextResponse.json({ error: "Green Room migration 024 is not available." }, { status: 503 })
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
    const { error } = await ctx.admin.from("green_processing_jobs").insert([{ track_id: input.trackId, job_type: "fingerprint", provider: "pex" }, { track_id: input.trackId, job_type: "analyze", provider: "modal" }])
    if (!error) await ctx.admin.from("green_catalog_tracks").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", input.trackId)
    return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 })
  }
  if (input.action === "verify_rights") {
    const { data: grant } = await ctx.admin.from("green_rights_grants").select("*").eq("track_id", input.trackId).maybeSingle()
    if (!grant) return NextResponse.json({ error: "Rights grant not found." }, { status: 404 })
    const result = assessGreenRights({ masterControlConfirmed: grant.master_control_confirmed, compositionControlConfirmed: grant.composition_control_confirmed, sampleStatus: grant.sample_status, stemExtractionAllowed: grant.stem_extraction_allowed, crossTrackDerivativesAllowed: grant.cross_track_derivatives_allowed, inAppPlaybackAllowed: grant.in_app_playback_allowed, shortVideoExportAllowed: grant.short_video_export_allowed, standaloneAudioExportAllowed: false, paidMediaAllowed: grant.paid_media_allowed, territories: grant.territories ?? [], endsAt: grant.ends_at })
    if (!result.passed) return NextResponse.json({ error: result.reasons.join(" ") }, { status: 409 })
    await Promise.all([
      ctx.admin.from("green_rights_grants").update({ verified_by: ctx.user.id, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("track_id", input.trackId),
      ctx.admin.from("green_catalog_tracks").update({ rights_status: "verified", status: "processing", updated_at: new Date().toISOString() }).eq("id", input.trackId),
    ])
    return NextResponse.json({ ok: true, rights: result })
  }
  if (input.action === "record_analysis") {
    const result = assessGreenAudio(input)
    const row = { track_id: input.trackId, bpm: input.bpm, musical_key: input.musicalKey, camelot_key: input.camelotKey, integrated_lufs: input.integratedLufs, true_peak_db: input.truePeakDb, vocal_bleed_db: input.vocalBleedDb, separation_sdr_db: input.separationSdrDb, phrase_confidence: input.phraseConfidence, sample_scan_status: input.sampleScanStatus, quality_reasons: result.reasons, analyzed_at: new Date().toISOString() }
    const { error } = await ctx.admin.from("green_track_analysis").upsert(row)
    if (!error) await ctx.admin.from("green_catalog_tracks").update({ bpm: input.bpm, musical_key: input.musicalKey, camelot_key: input.camelotKey, quality_status: result.passed ? "passed" : "failed", status: result.passed ? "listening_review" : "quarantined", updated_at: new Date().toISOString() }).eq("id", input.trackId)
    return NextResponse.json({ ok: !error, quality: result }, { status: error ? 500 : 200 })
  }

  const [{ data: track }, { data: grant }, { data: analysis }, projects] = await Promise.all([
    ctx.admin.from("green_catalog_tracks").select("rights_status,quality_status").eq("id", input.trackId).maybeSingle(),
    ctx.admin.from("green_rights_grants").select("*").eq("track_id", input.trackId).maybeSingle(),
    ctx.admin.from("green_track_analysis").select("*").eq("track_id", input.trackId).maybeSingle(),
    ctx.admin.from("green_projects").select("id").or(`left_track_id.eq.${input.trackId},right_track_id.eq.${input.trackId}`),
  ])
  if (!track || !grant || !analysis) return NextResponse.json({ error: "Rights and analysis must exist before publication." }, { status: 409 })
  const projectIds = (projects.data ?? []).map((project) => project.id)
  const { data: candidates } = projectIds.length ? await ctx.admin.from("green_render_candidates").select("id").in("project_id", projectIds) : { data: [] }
  const candidateIds = (candidates ?? []).map((candidate) => candidate.id)
  const { count: keeps } = candidateIds.length ? await ctx.admin.from("green_listening_reviews").select("id", { count: "exact", head: true }).in("candidate_id", candidateIds).eq("decision", "keep") : { count: 0 }
  const rights = assessGreenRights({ masterControlConfirmed: grant.master_control_confirmed, compositionControlConfirmed: grant.composition_control_confirmed, sampleStatus: grant.sample_status, stemExtractionAllowed: grant.stem_extraction_allowed, crossTrackDerivativesAllowed: grant.cross_track_derivatives_allowed, inAppPlaybackAllowed: grant.in_app_playback_allowed, shortVideoExportAllowed: grant.short_video_export_allowed, standaloneAudioExportAllowed: false, paidMediaAllowed: grant.paid_media_allowed, territories: grant.territories ?? [], endsAt: grant.ends_at })
  const audio = assessGreenAudio({ integratedLufs: Number(analysis.integrated_lufs), truePeakDb: Number(analysis.true_peak_db), vocalBleedDb: analysis.vocal_bleed_db == null ? null : Number(analysis.vocal_bleed_db), separationSdrDb: analysis.separation_sdr_db == null ? null : Number(analysis.separation_sdr_db), phraseConfidence: Number(analysis.phrase_confidence), sampleScanStatus: analysis.sample_scan_status })
  if (!canPublishGreenTrack(rights, audio, keeps ?? 0)) return NextResponse.json({ error: "Publication gate requires verified rights, passing audio, and two independent keep reviews.", rights, audio, keeps: keeps ?? 0 }, { status: 409 })
  const now = new Date().toISOString()
  const { error } = await ctx.admin.from("green_catalog_tracks").update({ status: "green", rights_status: "verified", quality_status: "passed", published_at: now, updated_at: now }).eq("id", input.trackId)
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 })
}
