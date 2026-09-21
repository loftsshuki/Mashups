import { NextResponse } from "next/server"
import { z } from "zod"

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
  providerReference: z.string().trim().min(1).max(240),
  matchCount: z.number().int().min(0).max(1_000_000),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/i),
}).superRefine((value, ctx) => {
  if (value.sampleScanStatus === "clear" && value.matchCount !== 0) {
    ctx.addIssue({ code: "custom", message: "A matching source cannot be labelled clear." })
  }
})
const processorAssetSchema = z.object({
  blobUrl: z.url().refine((value) => value.startsWith("https://")),
  blobPathname: z.string().regex(/^green-room\//).max(500),
  contentType: z.string().regex(/^audio\//).max(120),
  byteSize: z.number().int().positive().max(1_000_000_000),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
})
const separationSchema = z.object({
  assets: z.array(processorAssetSchema.extend({
    kind: z.enum(["stem_vocal", "stem_drums", "stem_bass", "stem_other"]),
  })).length(4),
  separationSdrDb: z.number().nullable().optional(),
  vocalBleedDb: z.number().nullable().optional(),
}).superRefine((value, ctx) => {
  if (new Set(value.assets.map((asset) => asset.kind)).size !== 4) {
    ctx.addIssue({ code: "custom", message: "Separation must contain each canonical stem exactly once." })
  }
})
const renderCandidateSchema = z.object({
  arrangement: z.enum(["vocal-a-over-b", "vocal-b-over-a", "drop-swap"]),
  asset: processorAssetSchema,
  durationSeconds: z.number().positive().max(30.5),
  qualityScore: z.number().int().min(0).max(100),
  qualityStatus: z.enum(["passed", "failed", "manual_review"]),
  metrics: z.record(z.string(), z.unknown()).default({}),
})
const candidatesSchema = z.array(renderCandidateSchema).length(3).superRefine((value, ctx) => {
  if (new Set(value.map((candidate) => candidate.arrangement)).size !== 3) {
    ctx.addIssue({ code: "custom", message: "Render output must contain each canonical arrangement exactly once." })
  }
})
const schema = z.object({
  jobId: z.uuid(),
  dispatchToken: z.uuid(),
  status: z.enum(["succeeded", "failed"]),
  errorCode: z.string().max(80).optional(),
  errorMessage: z.string().max(500).optional(),
  analysis: analysisSchema.optional(),
  fingerprint: fingerprintSchema.optional(),
  separation: separationSchema.optional(),
  candidates: candidatesSchema.optional(),
})

export async function POST(request: Request) {
  const secret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  const rawBody = await request.text()
  const timestamp = Number(request.headers.get("x-green-timestamp"))
  const signature = request.headers.get("x-green-signature") ?? ""
  if (!verifyGreenProcessorCallback(timestamp, rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid or expired processor signature." }, { status: 401 })
  }
  const parsed = schema.safeParse(safeJson(rawBody))
  if (!parsed.success) return NextResponse.json({ error: "Invalid processor callback." }, { status: 400 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const { data: job, error: jobError } = await admin
    .from("green_processing_jobs")
    .select("track_id,project_id,job_type,status,dispatch_token,source_asset_id,source_sha256")
    .eq("id", parsed.data.jobId)
    .maybeSingle()
  if (jobError) return NextResponse.json({ error: "Job lookup failed." }, { status: 503 })
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 })
  if (["succeeded", "failed", "cancelled"].includes(job.status)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }
  if (job.status !== "running" || job.dispatch_token !== parsed.data.dispatchToken) {
    return NextResponse.json({ error: "Processor lease is no longer active." }, { status: 409 })
  }

  if (parsed.data.status === "failed") {
    const failed = await admin.rpc("fail_green_processing_job", {
      p_job_id: parsed.data.jobId,
      p_dispatch_token: parsed.data.dispatchToken,
      p_error_code: parsed.data.errorCode ?? "PROCESSOR_FAILED",
      p_error_message: parsed.data.errorMessage ?? "Processor reported failure.",
    })
    if (failed.error) return rpcError(failed.error)
    return NextResponse.json({ ok: true })
  }

  if (job.job_type === "render_candidates") {
    if (!job.project_id || !parsed.data.candidates) {
      return NextResponse.json({ error: "Render job completed without three candidates." }, { status: 400 })
    }
    const completed = await admin.rpc("complete_green_project_render_leased", {
      p_job_id: parsed.data.jobId,
      p_dispatch_token: parsed.data.dispatchToken,
      p_candidates: parsed.data.candidates,
    })
    if (completed.error) return rpcError(completed.error)
    return NextResponse.json({ ok: true })
  }

  if (!job.track_id || !job.source_asset_id || !job.source_sha256) {
    return NextResponse.json({ error: "Track job is missing source provenance." }, { status: 409 })
  }

  let result: Record<string, unknown>
  if (job.job_type === "analyze") {
    if (!parsed.data.analysis) return NextResponse.json({ error: "Analysis output missing." }, { status: 400 })
    result = { analysis: parsed.data.analysis }
  } else if (job.job_type === "fingerprint") {
    if (!parsed.data.fingerprint) return NextResponse.json({ error: "Fingerprint output missing." }, { status: 400 })
    if (parsed.data.fingerprint.sourceSha256.toLowerCase() !== String(job.source_sha256).toLowerCase()) {
      return NextResponse.json({ error: "Fingerprint source hash does not match this job." }, { status: 409 })
    }
    result = { fingerprint: { ...parsed.data.fingerprint, sourceSha256: parsed.data.fingerprint.sourceSha256.toLowerCase() } }
  } else if (job.job_type === "separate") {
    if (!parsed.data.separation) return NextResponse.json({ error: "Separation output missing." }, { status: 400 })
    const { data: track } = await admin.from("green_catalog_tracks").select("owner_id").eq("id", job.track_id).maybeSingle()
    if (!track?.owner_id) return NextResponse.json({ error: "Track owner unavailable." }, { status: 409 })
    const rows = parsed.data.separation.assets.map((asset) => ({
      track_id: job.track_id,
      owner_id: track.owner_id,
      asset_kind: asset.kind,
      blob_url: asset.blobUrl,
      blob_pathname: asset.blobPathname,
      content_type: asset.contentType,
      byte_size: asset.byteSize,
      access_level: "private",
      sha256: asset.sha256.toLowerCase(),
      source_asset_id: job.source_asset_id,
      source_sha256: String(job.source_sha256).toLowerCase(),
      provenance: { jobId: parsed.data.jobId, provider: "green-processing", version: 1 },
    }))
    const inserted = await admin.from("green_track_assets").upsert(rows, { onConflict: "blob_url", ignoreDuplicates: true })
    if (inserted.error) return NextResponse.json({ error: "Separated stems could not be registered." }, { status: 500 })
    const urls = rows.map((row) => row.blob_url)
    const { data: registered, error } = await admin.from("green_track_assets")
      .select("blob_url,track_id,owner_id,asset_kind,access_level,quarantined_at,source_asset_id,source_sha256,sha256")
      .in("blob_url", urls)
    if (error) return NextResponse.json({ error: "Stem registration could not be verified." }, { status: 500 })
    const valid = new Set((registered ?? []).filter((asset) =>
      asset.track_id === job.track_id &&
      asset.owner_id === track.owner_id &&
      asset.access_level === "private" &&
      !asset.quarantined_at &&
      asset.source_asset_id === job.source_asset_id &&
      asset.source_sha256 === job.source_sha256 &&
      typeof asset.sha256 === "string"
    ).map((asset) => asset.blob_url))
    if (valid.size !== 4 || urls.some((url) => !valid.has(url))) {
      return NextResponse.json({ error: "Separated stems failed provenance verification." }, { status: 409 })
    }
    result = { separation: parsed.data.separation }
  } else {
    return NextResponse.json({ error: "Unsupported processor job." }, { status: 400 })
  }

  const merged = await admin.rpc("merge_green_processing_evidence", {
    p_job_id: parsed.data.jobId,
    p_dispatch_token: parsed.data.dispatchToken,
    p_result: result,
  })
  if (merged.error) return rpcError(merged.error)
  return NextResponse.json({ ok: true, duplicate: Boolean(merged.data?.duplicate) })
}

function rpcError(error: { code?: string; message: string }) {
  if (error.code === "P0001" || error.code === "40001") {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }
  if (error.code === "22023") return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ error: "Processor result could not be committed." }, { status: 503 })
}

function safeJson(value: string) {
  try { return JSON.parse(value) as unknown } catch { return null }
}
