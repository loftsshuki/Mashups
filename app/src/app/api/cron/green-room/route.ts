import { NextResponse } from "next/server"

import { resolveGreenProcessorRoute, type GreenProcessingJobType } from "@/lib/green-room/processor-routing"
import { signGreenAsset } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return NextResponse.json({ error: "Application origin is not configured." }, { status: 503 })
  let baseUrl: string
  try {
    const parsed = new URL(appUrl)
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") throw new Error()
    baseUrl = parsed.origin
  } catch {
    return NextResponse.json({ error: "Application origin is invalid." }, { status: 503 })
  }

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const recovered = await admin.rpc("requeue_expired_green_jobs", { p_limit: 20 })
  if (recovered.error) return NextResponse.json({ error: "Job lease recovery is unavailable." }, { status: 503 })

  const { data: jobs, error } = await admin.from("green_processing_jobs")
    .select("id,job_type,provider")
    .eq("status", "queued")
    .lte("available_at", new Date().toISOString())
    .order("created_at")
    .limit(5)
  if (error) return NextResponse.json({ error: "Unable to inspect queued jobs." }, { status: 500 })

  const accepted: string[] = []
  const configurationFailures: string[] = []
  for (const queued of jobs ?? []) {
    const processor = resolveGreenProcessorRoute({
      jobType: queued.job_type as GreenProcessingJobType,
      provider: queued.provider,
    })
    if (!processor) {
      configurationFailures.push(queued.id)
      await admin.from("green_processing_jobs").update({
        status: "failed",
        error_code: "PROCESSOR_NOT_CONFIGURED",
        error_message: `No processor route is configured for ${queued.job_type}:${queued.provider}.`,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", queued.id).eq("status", "queued")
      continue
    }

    const leaseSeconds = queued.job_type === "render_candidates" || queued.job_type === "separate" ? 1800 : 600
    const claim = await admin.rpc("claim_green_processing_job", {
      p_job_id: queued.id,
      p_lease_seconds: leaseSeconds,
    })
    if (claim.error || !claim.data?.id || !claim.data.dispatch_token) continue
    const job = claim.data
    const expires = Date.now() + Math.min(10 * 60_000, leaseSeconds * 1000 - 30_000)
    const callbackUrl = `${baseUrl}/api/green/processing/callback`
    const inputAssets = projectInputAssets(job.input).map((asset) => {
      const sig = signGreenAsset(job.id, expires, processor.secret, asset.assetId)
      const query = new URLSearchParams({ assetId: asset.assetId, expires: String(expires), sig })
      return { ...asset, url: `${baseUrl}/api/green/assets/${job.id}?${query.toString()}` }
    })

    let assetUrl: string | null = null
    if (job.track_id) {
      const sig = signGreenAsset(job.id, expires, processor.secret)
      const query = new URLSearchParams({ expires: String(expires), sig })
      assetUrl = `${baseUrl}/api/green/assets/${job.id}?${query.toString()}`
    }
    if (job.project_id && inputAssets.length === 0) {
      await admin.rpc("fail_green_processing_job", {
        p_job_id: job.id,
        p_dispatch_token: job.dispatch_token,
        p_error_code: "INPUT_ASSETS_MISSING",
        p_error_message: "Project job has no immutable authorized input assets.",
      })
      continue
    }

    const response = await fetch(processor.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${processor.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        dispatchToken: job.dispatch_token,
        trackId: job.track_id,
        projectId: job.project_id,
        jobType: job.job_type,
        provider: job.provider,
        sourceAssetId: job.source_asset_id,
        sourceSha256: job.source_sha256,
        assetUrl,
        inputAssets,
        input: job.input,
        callbackUrl,
      }),
      signal: AbortSignal.timeout(30_000),
    }).catch(() => null)

    if (response?.ok) {
      accepted.push(job.id)
    } else {
      const delay = Math.min(900, 30 * 2 ** Math.max(0, Number(job.attempt_count) - 1))
      await admin.rpc("release_green_processing_job", {
        p_job_id: job.id,
        p_dispatch_token: job.dispatch_token,
        p_error_code: "HANDOFF_FAILED",
        p_error_message: `Processor handoff returned ${response?.status ?? "network failure"}.`,
        p_delay_seconds: delay,
      })
    }
  }

  return NextResponse.json({
    ok: configurationFailures.length === 0,
    recovered: Number(recovered.data ?? 0),
    queued: jobs?.length ?? 0,
    accepted: accepted.length,
    configurationFailures: configurationFailures.length,
  }, { status: configurationFailures.length ? 503 : 200 })
}

function projectInputAssets(input: unknown) {
  if (!input || typeof input !== "object") return [] as Array<{ assetId: string; role: string; assetSha256?: string; sourceSha256?: string }>
  const assets = (input as { assets?: unknown }).assets
  if (!Array.isArray(assets)) return []
  return assets.flatMap((asset) => {
    if (!asset || typeof asset !== "object") return []
    const value = asset as Record<string, unknown>
    if (typeof value.assetId !== "string" || typeof value.role !== "string") return []
    return [{
      assetId: value.assetId,
      role: value.role,
      ...(typeof value.assetSha256 === "string" ? { assetSha256: value.assetSha256 } : {}),
      ...(typeof value.sourceSha256 === "string" ? { sourceSha256: value.sourceSha256 } : {}),
    }]
  })
}
