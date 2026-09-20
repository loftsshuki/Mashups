import { NextResponse } from "next/server"
import { z } from "zod"

import {
  preferSpecialistSampleScan,
  type GreenSampleScanStatus,
} from "@/lib/green-room/processor-results"
import { assessGreenAudio } from "@/lib/green-room/quality"
import { verifyGreenProcessorCallback } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

const sampleStatusSchema = z.enum(["clear", "flagged", "unavailable"])

const analysisSchema = z.object({
  bpm: z.number().positive().max(300),
  musicalKey: z.string().min(1).max(20),
  camelotKey: z.string().min(2).max(3),
  integratedLufs: z.number(),
  truePeakDb: z.number(),
  vocalBleedDb: z.number().nullable(),
  separationSdrDb: z.number().nullable(),
  phraseConfidence: z.number().min(0).max(1),
  sampleScanStatus: sampleStatusSchema,
})

const fingerprintSchema = z.object({
  sampleScanStatus: sampleStatusSchema,
  providerReference: z.string().min(1).max(240).optional(),
  matchCount: z.number().int().min(0).max(1_000_000).optional(),
})

const processorAssetSchema = z.object({
  blobUrl: z.url().refine((value) => value.startsWith("https://")),
  blobPathname: z.string().regex(/^green-room\//).max(500),
  contentType: z.string().regex(/^audio\//).max(120),
  byteSize: z.number().int().positive().max(1_000_000_000),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
})

const separationSchema = z.object({
  assets: z.array(
    processorAssetSchema.extend({
      kind: z.enum(["stem_vocal", "stem_drums", "stem_bass", "stem_other"]),
    }),
  ).length(4),
  separationSdrDb: z.number().nullable().optional(),
  vocalBleedDb: z.number().nullable().optional(),
}).superRefine((value, ctx) => {
  if (new Set(value.assets.map((asset) => asset.kind)).size !== 4) {
    ctx.addIssue({
      code: "custom",
      message: "Separation must contain each canonical stem exactly once.",
    })
  }
})

const renderCandidateSchema = z.object({
  arrangement: z.enum([
    "vocal-a-over-b",
    "vocal-b-over-a",
    "drop-swap",
  ]),
  asset: processorAssetSchema,
  durationSeconds: z.number().positive().max(30.5),
  qualityScore: z.number().int().min(0).max(100),
  qualityStatus: z.enum(["passed", "failed", "manual_review"]),
  metrics: z.record(z.string(), z.unknown()).default({}),
})

const candidatesSchema = z.array(renderCandidateSchema).length(3).superRefine((value, ctx) => {
  if (new Set(value.map((candidate) => candidate.arrangement)).size !== 3) {
    ctx.addIssue({
      code: "custom",
      message: "Render output must contain each canonical arrangement exactly once.",
    })
  }
})

const schema = z.object({
  jobId: z.uuid(),
  status: z.enum(["succeeded", "failed"]),
  errorCode: z.string().max(80).optional(),
  errorMessage: z.string().max(500).optional(),
  analysis: analysisSchema.optional(),
  fingerprint: fingerprintSchema.optional(),
  separation: separationSchema.optional(),
  candidates: candidatesSchema.optional(),
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
    .select("track_id,project_id,job_type,status")
    .eq("id", parsed.data.jobId)
    .maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 })
  if (["succeeded", "failed", "cancelled"].includes(job.status)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }
  if (job.status !== "running") {
    return NextResponse.json({ error: "Job is not active." }, { status: 409 })
  }

  const now = new Date().toISOString()
  if (parsed.data.status === "failed") {
    await admin
      .from("green_processing_jobs")
      .update({
        status: "failed",
        error_code: parsed.data.errorCode ?? "PROCESSOR_FAILED",
        error_message: parsed.data.errorMessage ?? null,
        completed_at: now,
        updated_at: now,
      })
      .eq("id", parsed.data.jobId)

    if (job.project_id && job.job_type === "render_candidates") {
      await admin
        .from("green_projects")
        .update({ status: "draft", updated_at: now })
        .eq("id", job.project_id)
        .eq("status", "rendering")
    } else if (job.track_id) {
      await admin
        .from("green_catalog_tracks")
        .update({ quality_status: "manual_review", updated_at: now })
        .eq("id", job.track_id)
    }
    return NextResponse.json({ ok: true })
  }

  if (job.job_type === "render_candidates") {
    if (!job.project_id || !parsed.data.candidates) {
      return NextResponse.json(
        { error: "Render job completed without three candidates." },
        { status: 400 },
      )
    }

    const { error } = await admin.rpc("complete_green_project_render", {
      p_job_id: parsed.data.jobId,
      p_candidates: parsed.data.candidates,
    })
    if (error) {
      return NextResponse.json(
        { error: error.message || "Render completion was rejected." },
        { status: error.code === "P0001" ? 409 : 500 },
      )
    }
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
  if (job.job_type === "separate" && !parsed.data.separation) {
    return NextResponse.json(
      { error: "Separation job completed without stem output." },
      { status: 400 },
    )
  }

  let jobOutput: Record<string, unknown> = parsed.data.output ?? {}

  if (job.job_type === "analyze" && parsed.data.analysis && job.track_id) {
    const [fingerprintResult, separationResult] = await Promise.all([
      admin
        .from("green_processing_jobs")
        .select("output")
        .eq("track_id", job.track_id)
        .eq("job_type", "fingerprint")
        .eq("status", "succeeded")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("green_processing_jobs")
        .select("output")
        .eq("track_id", job.track_id)
        .eq("job_type", "separate")
        .eq("status", "succeeded")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const separation = separationOutputSchema.safeParse(separationResult.data?.output)
    const analysis = parsed.data.analysis
    const sampleScanStatus = preferSpecialistSampleScan(
      analysis.sampleScanStatus,
      fingerprintResult.data?.output,
    )
    const combined = {
      ...analysis,
      sampleScanStatus,
      separationSdrDb: separation.success
        ? separation.data.separationSdrDb ?? analysis.separationSdrDb
        : analysis.separationSdrDb,
      vocalBleedDb: separation.success
        ? separation.data.vocalBleedDb ?? analysis.vocalBleedDb
        : analysis.vocalBleedDb,
    }
    await persistAnalysis(admin, job.track_id, combined, now)
    jobOutput = combined
  }

  if (job.job_type === "fingerprint" && parsed.data.fingerprint && job.track_id) {
    const fingerprint = parsed.data.fingerprint
    jobOutput = fingerprint

    const stored = await loadStoredAnalysis(admin, job.track_id)
    if (stored) {
      await persistAnalysis(
        admin,
        job.track_id,
        toAssessmentInput(stored, {
          sampleScanStatus: fingerprint.sampleScanStatus,
        }),
        now,
      )
    }
  }

  if (job.job_type === "separate" && parsed.data.separation && job.track_id) {
    const separation = parsed.data.separation
    const { data: track } = await admin
      .from("green_catalog_tracks")
      .select("owner_id")
      .eq("id", job.track_id)
      .maybeSingle()
    if (!track?.owner_id) {
      return NextResponse.json(
        { error: "Track owner is unavailable for stem storage." },
        { status: 409 },
      )
    }

    const rows = separation.assets.map((asset) => ({
      track_id: job.track_id,
      owner_id: track.owner_id,
      asset_kind: asset.kind,
      blob_url: asset.blobUrl,
      blob_pathname: asset.blobPathname,
      content_type: asset.contentType,
      byte_size: asset.byteSize,
      access_level: "private",
      sha256: asset.sha256 ?? null,
    }))
    const { error: assetError } = await admin
      .from("green_track_assets")
      .upsert(rows, { onConflict: "blob_url", ignoreDuplicates: true })
    if (assetError) {
      return NextResponse.json(
        { error: "Separated stems could not be registered." },
        { status: 500 },
      )
    }

    const urls = rows.map((row) => row.blob_url)
    const { data: registered } = await admin
      .from("green_track_assets")
      .select("blob_url,track_id,owner_id,asset_kind,access_level,quarantined_at")
      .in("blob_url", urls)
    const validRegistered = new Set(
      (registered ?? [])
        .filter((asset) =>
          asset.track_id === job.track_id &&
          asset.owner_id === track.owner_id &&
          asset.access_level === "private" &&
          !asset.quarantined_at,
        )
        .map((asset) => asset.blob_url),
    )
    if (validRegistered.size !== 4 || urls.some((url) => !validRegistered.has(url))) {
      return NextResponse.json(
        { error: "Separated stems failed ownership verification." },
        { status: 409 },
      )
    }

    jobOutput = separation
    const stored = await loadStoredAnalysis(admin, job.track_id)
    if (stored) {
      await persistAnalysis(
        admin,
        job.track_id,
        toAssessmentInput(stored, {
          separationSdrDb:
            separation.separationSdrDb ?? stored.separation_sdr_db,
          vocalBleedDb:
            separation.vocalBleedDb ?? stored.vocal_bleed_db,
        }),
        now,
      )
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

const separationOutputSchema = z.object({
  separationSdrDb: z.number().nullable().optional(),
  vocalBleedDb: z.number().nullable().optional(),
}).passthrough()

async function loadStoredAnalysis(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  trackId: string,
) {
  const { data } = await admin
    .from("green_track_analysis")
    .select(
      "bpm,musical_key,camelot_key,integrated_lufs,true_peak_db,vocal_bleed_db,separation_sdr_db,phrase_confidence,sample_scan_status",
    )
    .eq("track_id", trackId)
    .maybeSingle()
  return data as StoredAnalysis | null
}

function toAssessmentInput(
  stored: StoredAnalysis,
  overrides: Partial<{
    vocalBleedDb: number | null
    separationSdrDb: number | null
    sampleScanStatus: GreenSampleScanStatus
  }> = {},
) {
  return {
    bpm: Number(stored.bpm),
    musicalKey: stored.musical_key,
    camelotKey: stored.camelot_key,
    integratedLufs: Number(stored.integrated_lufs),
    truePeakDb: Number(stored.true_peak_db),
    vocalBleedDb:
      overrides.vocalBleedDb !== undefined
        ? overrides.vocalBleedDb
        : stored.vocal_bleed_db === null
          ? null
          : Number(stored.vocal_bleed_db),
    separationSdrDb:
      overrides.separationSdrDb !== undefined
        ? overrides.separationSdrDb
        : stored.separation_sdr_db === null
          ? null
          : Number(stored.separation_sdr_db),
    phraseConfidence: Number(stored.phrase_confidence),
    sampleScanStatus:
      overrides.sampleScanStatus ?? stored.sample_scan_status,
  }
}

async function persistAnalysis(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  trackId: string,
  analysis: z.infer<typeof analysisSchema>,
  now: string,
) {
  const gate = assessGreenAudio(analysis)
  const needsSpecialistReview = analysis.sampleScanStatus === "unavailable"

  await Promise.all([
    admin.from("green_track_analysis").upsert({
      track_id: trackId,
      bpm: analysis.bpm,
      musical_key: analysis.musicalKey,
      camelot_key: analysis.camelotKey,
      integrated_lufs: analysis.integratedLufs,
      true_peak_db: analysis.truePeakDb,
      vocal_bleed_db: analysis.vocalBleedDb,
      separation_sdr_db: analysis.separationSdrDb,
      phrase_confidence: analysis.phraseConfidence,
      sample_scan_status: analysis.sampleScanStatus,
      quality_reasons: gate.reasons,
      analyzed_at: now,
    }),
    admin
      .from("green_catalog_tracks")
      .update({
        bpm: analysis.bpm,
        musical_key: analysis.musicalKey,
        camelot_key: analysis.camelotKey,
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
      .eq("id", trackId),
  ])
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
