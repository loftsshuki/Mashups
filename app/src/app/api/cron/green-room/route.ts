import { NextResponse } from "next/server"

import {
  resolveGreenProcessorRoute,
  type GreenProcessingJobType,
} from "@/lib/green-room/processor-routing"
import { signGreenAsset } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })

  const { data: jobs, error } = await admin
    .from("green_processing_jobs")
    .select("id,track_id,project_id,job_type,provider,attempt_count,input")
    .eq("status", "queued")
    .lte("available_at", new Date().toISOString())
    .order("created_at")
    .limit(5)
  if (error) return NextResponse.json({ error: "Unable to claim jobs." }, { status: 500 })

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mashups.agency").replace(/\/$/, "")
  const accepted: string[] = []
  const configurationFailures: string[] = []

  for (const job of jobs ?? []) {
    const processor = resolveGreenProcessorRoute({
      jobType: job.job_type as GreenProcessingJobType,
      provider: job.provider,
    })

    if (!processor) {
      configurationFailures.push(job.id)
      await admin
        .from("green_processing_jobs")
        .update({
          status: "failed",
          error_code: "PROCESSOR_NOT_CONFIGURED",
          error_message: `No processor route is configured for ${job.job_type}:${job.provider}.`,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "queued")
      continue
    }

    const claimedAt = new Date().toISOString()
    const { data: claimed } = await admin
      .from("green_processing_jobs")
      .update({
        status: "running",
        started_at: claimedAt,
        attempt_count: job.attempt_count + 1,
        updated_at: claimedAt,
      })
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle()
    if (!claimed) continue

    const expires = Date.now() + 10 * 60_000
    const callbackUrl = `${baseUrl}/api/green/processing/callback`
    const inputAssets = projectInputAssets(job.input).map((asset) => {
      const sig = signGreenAsset(job.id, expires, processor.secret, asset.assetId)
      const query = new URLSearchParams({
        assetId: asset.assetId,
        expires: String(expires),
        sig,
      })
      return {
        ...asset,
        url: `${baseUrl}/api/green/assets/${job.id}?${query.toString()}`,
      }
    })

    let assetUrl: string | null = null
    if (job.track_id) {
      const sig = signGreenAsset(job.id, expires, processor.secret)
      const query = new URLSearchParams({ expires: String(expires), sig })
      assetUrl = `${baseUrl}/api/green/assets/${job.id}?${query.toString()}`
    }

    if (job.project_id && inputAssets.length === 0) {
      await admin
        .from("green_processing_jobs")
        .update({
          status: "failed",
          error_code: "INPUT_ASSETS_MISSING",
          error_message: "Project processing job has no authorized input assets.",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "running")
      continue
    }

    const response = await fetch(processor.url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${processor.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: job.id,
        trackId: job.track_id,
        projectId: job.project_id,
        jobType: job.job_type,
        provider: job.provider,
        assetUrl,
        inputAssets,
        input: job.input,
        callbackUrl,
      }),
    }).catch(() => null)

    if (response?.ok) {
      accepted.push(job.id)
    } else {
      await admin
        .from("green_processing_jobs")
        .update({
          status: "queued",
          started_at: null,
          error_code: "HANDOFF_FAILED",
          error_message: `Processor handoff returned ${response?.status ?? "network failure"}.`,
          available_at: new Date(Date.now() + 5 * 60_000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "running")
    }
  }

  return NextResponse.json(
    {
      ok: configurationFailures.length === 0,
      queued: jobs?.length ?? 0,
      accepted: accepted.length,
      configurationFailures: configurationFailures.length,
    },
    { status: configurationFailures.length ? 503 : 200 },
  )
}

function projectInputAssets(input: unknown) {
  if (!input || typeof input !== "object") return [] as Array<{ assetId: string; role: string }>
  const assets = (input as { assets?: unknown }).assets
  if (!Array.isArray(assets)) return [] as Array<{ assetId: string; role: string }>
  return assets.flatMap((asset) => {
    if (!asset || typeof asset !== "object") return []
    const value = asset as { assetId?: unknown; role?: unknown }
    if (typeof value.assetId !== "string" || typeof value.role !== "string") return []
    return [{ assetId: value.assetId, role: value.role }]
  })
}
