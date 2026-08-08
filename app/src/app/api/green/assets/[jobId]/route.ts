import { get } from "@vercel/blob"
import { NextResponse } from "next/server"

import { verifyGreenAssetSignature } from "@/lib/green-room/processor-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const url = new URL(request.url)
  const expires = Number(url.searchParams.get("expires"))
  const signature = url.searchParams.get("sig") ?? ""
  const secret = process.env.GREEN_ROOM_PROCESSOR_SECRET
  const token = process.env.GREEN_ROOM_READ_WRITE_TOKEN ?? process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if (!secret || !token || !verifyGreenAssetSignature(jobId, expires, signature, secret)) return NextResponse.json({ error: "Invalid or expired asset grant." }, { status: 403 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 })
  const { data: job } = await admin.from("green_processing_jobs").select("track_id,status").eq("id", jobId).maybeSingle()
  if (!job || !["queued", "running"].includes(job.status)) return NextResponse.json({ error: "Processing job is not active." }, { status: 404 })
  const { data: asset } = await admin.from("green_track_assets").select("blob_url,content_type").eq("track_id", job.track_id).eq("asset_kind", "master").eq("access_level", "private").maybeSingle()
  if (!asset) return NextResponse.json({ error: "Private master not found." }, { status: 404 })
  const blob = await get(asset.blob_url, { token, access: "private" })
  if (!blob || blob.statusCode !== 200) return NextResponse.json({ error: "Private master unavailable." }, { status: 404 })
  return new Response(blob.stream, { headers: { "Content-Type": asset.content_type, "Content-Disposition": "attachment", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } })
}
