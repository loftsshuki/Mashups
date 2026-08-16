import { NextResponse } from "next/server"
import { z } from "zod"

import { assessGreenAudio } from "@/lib/green-room/quality"
import { verifyGreenProcessorCallback } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

const schema = z.object({
  jobId: z.uuid(),
  status: z.enum(["succeeded", "failed"]),
  errorCode: z.string().max(80).optional(),
  errorMessage: z.string().max(500).optional(),
  analysis: z.object({ bpm: z.number().positive().max(300), musicalKey: z.string().min(1).max(20), camelotKey: z.string().min(2).max(3), integratedLufs: z.number(), truePeakDb: z.number(), vocalBleedDb: z.number().nullable(), separationSdrDb: z.number().nullable(), phraseConfidence: z.number().min(0).max(1), sampleScanStatus: z.enum(["clear", "flagged", "unavailable"]) }).optional(),
})

export async function POST(request: Request) {
  const secret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const rawBody = await request.text()
  const timestamp = Number(request.headers.get("x-green-timestamp"))
  const signature = request.headers.get("x-green-signature") ?? ""
  if (!verifyGreenProcessorCallback(timestamp, rawBody, signature, secret)) return NextResponse.json({ error: "Invalid or expired processor signature." }, { status: 401 })
  const parsed = schema.safeParse(safeJson(rawBody))
  if (!parsed.success) return NextResponse.json({ error: "Invalid processor callback." }, { status: 400 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const { data: job } = await admin.from("green_processing_jobs").select("track_id,job_type,status").eq("id", parsed.data.jobId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 })
  if (["succeeded", "failed"].includes(job.status)) return NextResponse.json({ ok: true, duplicate: true })
  if (job.status !== "running") return NextResponse.json({ error: "Job is not active." }, { status: 409 })
  const now = new Date().toISOString()
  if (parsed.data.status === "failed") {
    await Promise.all([
      admin.from("green_processing_jobs").update({ status: "failed", error_code: parsed.data.errorCode ?? "PROCESSOR_FAILED", error_message: parsed.data.errorMessage ?? null, completed_at: now, updated_at: now }).eq("id", parsed.data.jobId),
      admin.from("green_catalog_tracks").update({ quality_status: "manual_review", updated_at: now }).eq("id", job.track_id),
    ])
    return NextResponse.json({ ok: true })
  }
  if (parsed.data.analysis) {
    const analysis = parsed.data.analysis
    const gate = assessGreenAudio(analysis)
    const needsSpecialistReview = analysis.sampleScanStatus === "unavailable"
    await Promise.all([
      admin.from("green_track_analysis").upsert({ track_id: job.track_id, bpm: analysis.bpm, musical_key: analysis.musicalKey, camelot_key: analysis.camelotKey, integrated_lufs: analysis.integratedLufs, true_peak_db: analysis.truePeakDb, vocal_bleed_db: analysis.vocalBleedDb, separation_sdr_db: analysis.separationSdrDb, phrase_confidence: analysis.phraseConfidence, sample_scan_status: analysis.sampleScanStatus, quality_reasons: gate.reasons, analyzed_at: now }),
      admin.from("green_catalog_tracks").update({ bpm: analysis.bpm, musical_key: analysis.musicalKey, camelot_key: analysis.camelotKey, quality_status: gate.passed ? "passed" : needsSpecialistReview ? "manual_review" : "failed", status: gate.passed || needsSpecialistReview ? "listening_review" : "quarantined", updated_at: now }).eq("id", job.track_id),
    ])
  }
  await admin.from("green_processing_jobs").update({ status: "succeeded", output: parsed.data.analysis ?? {}, completed_at: now, updated_at: now }).eq("id", parsed.data.jobId)
  return NextResponse.json({ ok: true })
}

function safeJson(value: string) {
  try { return JSON.parse(value) as unknown } catch { return null }
}
