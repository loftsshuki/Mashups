import { NextResponse } from "next/server"
import { z } from "zod"

import {
  preferSpecialistSampleScan,
  type GreenSampleScanStatus,
} from "@/lib/green-room/processor-results"
import { assessGreenAudio } from "@/lib/green-room/quality"
import { verifyGreenProcessorCallback } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

const analysisSchema = z.object({
  bpm: z.number().positive().max(300),
  musicalKey: z.string().min(1).max(20),
  camelotKey: z.string().min(2).max(3),
  integratedLufs: z.number(),
  truePeakDb: z.number(),
  vocalBleedDb: z.number().nullable(),
  separationSdrDb: z.number().nullable(),
  phraseConfidence: z.number().min(0).max(1),
  sampleScanStatus: z.enum(["clear", "flagged", "unavailable"]),
})

const fingerprintSchema = z.object({
  sampleScanStatus: z.enum(["clear", "flagged", "unavailable"]),
  providerReference: z.string().min(1).max(240).optional(),
  matchCount: z.number().int().min(0).max(1_000_000).optional(),
})

const schema = z.object({
  jobId: z.uuid(),
  status: z.enum(["succeeded", "failed"]),
  errorCode: z.string().max(80).optional(),
  errorMessage: z.string().max(500).optional(),
  analysis: analysisSchema.optional(),
  fingerprint: fingerprintSchema.optional(),
  output: z.record(z.string(), z.unknown()).optional(),
})

type StoredAnalysis = {
  bpm: number
  musical_key: string
  camelot_key: string
  integrated_lufs: number
  true_peak_db: number
  vocal_bleed_db: number | null
  separation_sdr_db: number | null
  phrase_confidence: number
  sample_scan_status: GreenSampleScanStatus
}

export async function POST(request: Request) {
  const secret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const rawBody = await request.text()
  const timestamp = Number(request.headers.get("x-green-timestamp"))
  const signature = request.headers.get("x-green-signature") ?? ""
  if (!verifyGreenProcessorCallback(timestamp, rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid or expired processor signature." },
      { status: 401 },
    )
  }

  const parsed = schema.safeParse(safeJson(rawBody))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid processor callback." }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  }

  const { data: job } = await admin
    .from("green_processing_jobs")
    .select("track_id,job_type,status")
    .eq("id", parsed.data.jobId)
    .maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 })
  if (["succeeded", "failed"].includes(job.status)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }
  if (job.status !== "running") {
    return NextResponse.json({ error: "Job is not active." }, { status: 409 })
  }

  const now = new Date().toISOString()
  if (parsed.data.status === "failed") {
    await Promise.all([
      admin
        .from("green_processing_jobs")
        .update({
          status: "failed",
          error_code: parsed.data.errorCode ?? "PROCESSOR_FAILED",
          error_message: parsed.data.errorMessage ?? null,
          completed_at: now,
          updated_at: now,
        })
        .eq("id", parsed.data.jobId),
      admin
        .from("green_catalog_tracks")
        .update({ quality_status: "manual_review", updated_at: now })
        .eq("id", job.track_id),
    ])
    return NextResponse.json({ ok: true })
  }

  if (job.job_type === "analyze" && !parsed.data.analysis) {
    return NextResponse.json(
      { error: "Analysis job completed without analysis output." },
      { status: 400 },
    )
  }
  if (job.job_type === "fingerprint" && !parsed.data.fingerprint) {
    return NextResponse.json(
      { error: "Fingerprint job completed without fingerprint output." },
      { status: 400 },
    )
  }

  let jobOutput: Record<string, unknown> = parsed.data.output ?? {}

  if (job.job_type === "analyze" && parsed.data.analysis) {
    const analysis = parsed.data.analysis
    const { data: fingerprintJob } = await admin
      .from("green_processing_jobs")
      .select("output")
      .eq("track_id", job.track_id)
      .eq("job_type", "fingerprint")
      .eq("status", "succeeded")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const sampleScanStatus = preferSpecialistSampleScan(
      analysis.sampleScanStatus,
      fingerprintJob?.output,
    )
    const combined = { ...analysis, sampleScanStatus }
    const gate = assessGreenAudio(combined)
    const needsSpecialistReview = sampleScanStatus === "unavailable"

    await Promise.all([
      admin.from("green_track_analysis").upsert({
        track_id: job.track_id,
        bpm: combined.bpm,
        musical_key: combined.musicalKey,
        camelot_key: combined.camelotKey,
        integrated_lufs: combined.integratedLufs,
        true_peak_db: combined.truePeakDb,
        vocal_bleed_db: combined.vocalBleedDb,
        separation_sdr_db: combined.separationSdrDb,
        phrase_confidence: combined.phraseConfidence,
        sample_scan_status: combined.sampleScanStatus,
        quality_reasons: gate.reasons,
        analyzed_at: now,
      }),
      admin
        .from("green_catalog_tracks")
        .update({
          bpm: combined.bpm,
          musical_key: combined.musicalKey,
          camelot_key: combined.camelotKey,
          quality_status: gate.passed
            ? "passed"
            : needsSpecialistReview
              ? "manual_review"
              : "failed",
          status:
            gate.passed || needsSpecialistReview
              ? "listening_review"
              : "quarantined",
          updated_at: now,
        })
        .eq("id", job.track_id),
    ])

    jobOutput = combined
  }

  if (job.job_type === "fingerprint" && parsed.data.fingerprint) {
    const fingerprint = parsed.data.fingerprint
    jobOutput = fingerprint

    const { data: stored } = await admin
      .from("green_track_analysis")
      .select(
        "bpm,musical_key,camelot_key,integrated_lufs,true_peak_db,vocal_bleed_db,separation_sdr_db,phrase_confidence,sample_scan_status",
      )
      .eq("track_id", job.track_id)
      .maybeSingle()

    if (stored) {
      const analysis = stored as StoredAnalysis
      const combined = {
        bpm: Number(analysis.bpm),
        musicalKey: analysis.musical_key,
        camelotKey: analysis.camelot_key,
        integratedLufs: Number(analysis.integrated_lufs),
        truePeakDb: Number(analysis.true_peak_db),
        vocalBleedDb:
          analysis.vocal_bleed_db === null ? null : Number(analysis.vocal_bleed_db),
        separationSdrDb:
          analysis.separation_sdr_db === null
            ? null
            : Number(analysis.separation_sdr_db),
        phraseConfidence: Number(analysis.phrase_confidence),
        sampleScanStatus: fingerprint.sampleScanStatus,
      }
      const gate = assessGreenAudio(combined)
      const needsSpecialistReview =
        fingerprint.sampleScanStatus === "unavailable"

      await Promise.all([
        admin
          .from("green_track_analysis")
          .update({
            sample_scan_status: fingerprint.sampleScanStatus,
            quality_reasons: gate.reasons,
            analyzed_at: now,
          })
          .eq("track_id", job.track_id),
        admin
          .from("green_catalog_tracks")
          .update({
            quality_status: gate.passed
              ? "passed"
              : needsSpecialistReview
                ? "manual_review"
                : "failed",
            status:
              gate.passed || needsSpecialistReview
                ? "listening_review"
                : "quarantined",
            updated_at: now,
          })
          .eq("id", job.track_id),
      ])
    }
  }

  await admin
    .from("green_processing_jobs")
    .update({
      status: "succeeded",
      output: jobOutput,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", parsed.data.jobId)

  return NextResponse.json({ ok: true })
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
