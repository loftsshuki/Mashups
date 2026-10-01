import { get } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"

import { verifyGreenAssetSignature } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params
  if (!z.uuid().safeParse(jobId).success) {
    return NextResponse.json({ error: "Invalid processing job." }, { status: 400 })
  }

  const url = new URL(request.url)
  const expires = Number(url.searchParams.get("expires"))
  const signature = url.searchParams.get("sig") ?? ""
  const assetIdParam = url.searchParams.get("assetId")
  const assetId = assetIdParam && z.uuid().safeParse(assetIdParam).success
    ? assetIdParam
    : null
  if (assetIdParam && !assetId) {
    return NextResponse.json({ error: "Invalid asset ID." }, { status: 400 })
  }

  const secret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  const token =
    process.env.GREEN_ROOM_READ_WRITE_TOKEN ??
    process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if (
    !secret ||
    !token ||
    !verifyGreenAssetSignature(jobId, expires, signature, secret, assetId)
  ) {
    return NextResponse.json(
      { error: "Invalid or expired asset grant." },
      { status: 403 },
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  }

  const { data: job } = await admin
    .from("green_processing_jobs")
    .select("track_id,project_id,job_type,status,input")
    .eq("id", jobId)
    .maybeSingle()
  if (!job || !["queued", "running"].includes(job.status)) {
    return NextResponse.json(
      { error: "Processing job is not active." },
      { status: 404 },
    )
  }

  let asset:
    | {
        blob_url: string
        content_type: string
        access_level: string
        quarantined_at: string | null
      }
    | null = null

  if (job.project_id) {
    if (!assetId || !manifestAllowsAsset(job.input, assetId)) {
      return NextResponse.json(
        { error: "Asset is not part of this project job." },
        { status: 403 },
      )
    }
    const result = await admin
      .from("green_track_assets")
      .select("blob_url,content_type,access_level,quarantined_at")
      .eq("id", assetId)
      .maybeSingle()
    asset = result.data
  } else if (job.track_id) {
    if (assetId) {
      const result = await admin
        .from("green_track_assets")
        .select("blob_url,content_type,access_level,quarantined_at")
        .eq("id", assetId)
        .eq("track_id", job.track_id)
        .maybeSingle()
      asset = result.data
    } else {
      const result = await admin
        .from("green_track_assets")
        .select("blob_url,content_type,access_level,quarantined_at")
        .eq("track_id", job.track_id)
        .eq("asset_kind", "master")
        .eq("access_level", "private")
        .is("quarantined_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      asset = result.data
    }
  }

  if (
    !asset ||
    asset.access_level !== "private" ||
    asset.quarantined_at
  ) {
    return NextResponse.json({ error: "Private asset not found." }, { status: 404 })
  }

  const blob = await get(asset.blob_url, { token, access: "private" })
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Private asset unavailable." }, { status: 404 })
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": asset.content_type,
      "Content-Disposition": "attachment",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function manifestAllowsAsset(input: unknown, assetId: string) {
  if (!input || typeof input !== "object") return false
  const assets = (input as { assets?: unknown }).assets
  if (!Array.isArray(assets)) return false
  return assets.some((asset) => {
    if (!asset || typeof asset !== "object") return false
    return (asset as { assetId?: unknown }).assetId === assetId
  })
}
