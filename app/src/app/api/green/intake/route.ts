import { createHash, randomUUID } from "node:crypto"
import { get } from "@vercel/blob"
import { NextResponse } from "next/server"

import { greenIntakeSchema } from "@/lib/green-room/schemas"
import { buildInitialGreenProcessingPlan } from "@/lib/green-room/processor-routing"
import { makeGreenSlug } from "@/lib/green-room/service"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const parsed = greenIntakeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Complete every required rights and master field.", issues: parsed.error.issues }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.intake", user.id), limit: 4, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Submission limit exceeded." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } })

  const input = parsed.data
  if (!input.masterAssetPathname.startsWith(`green-room/${user.id}/masters/`)) return NextResponse.json({ error: "Master upload ownership is invalid." }, { status: 403 })
  const assetUrl = new URL(input.masterAssetUrl)
  if (assetUrl.protocol !== "https:" || assetUrl.username || assetUrl.password || assetUrl.port || !assetUrl.hostname.endsWith(".blob.vercel-storage.com")) return NextResponse.json({ error: "Master must use private Green Room storage." }, { status: 400 })
  if (input.masterAssetPathname.includes("..") || input.masterAssetPathname.includes("\\")) return NextResponse.json({ error: "Master pathname is invalid." }, { status: 400 })
  if (decodeURIComponent(assetUrl.pathname).replace(/^\//, "") !== input.masterAssetPathname) return NextResponse.json({ error: "Master URL and private pathname do not match." }, { status: 400 })

  const admin = createAdminClient()
  const token = process.env.GREEN_ROOM_READ_WRITE_TOKEN ?? process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if (!admin || !token) return NextResponse.json({ error: "Green Room storage is unavailable." }, { status: 503 })
  const sourceSha256 = await hashPrivateMaster(input.masterAssetUrl, token, input.masterAssetByteSize).catch(() => null)
  if (!sourceSha256) return NextResponse.json({ error: "The private master could not be hashed and verified." }, { status: 409 })

  let organizationId: string | undefined
  const { data: membership } = await admin.from("rightsholder_members").select("organization_id,role").eq("user_id", user.id).in("role", ["owner", "admin", "rights"]).limit(1).maybeSingle()
  organizationId = membership?.organization_id
  if (!organizationId) {
    const slugStem = input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "rights-team"
    const { data: organization, error } = await admin.from("rightsholder_organizations").insert({ name: input.organizationName, slug: `${slugStem}-${randomUUID().slice(0, 6)}`, organization_type: "artist", owner_id: user.id, verification_status: "pending" }).select("id").single()
    if (error || !organization) return NextResponse.json({ error: "Unable to create the rights organization." }, { status: 500 })
    organizationId = organization.id
    await admin.from("rightsholder_members").insert({ organization_id: organizationId, user_id: user.id, role: "owner" })
  }

  const { data: track, error: trackError } = await admin.from("green_catalog_tracks").insert({
    owner_id: user.id, organization_id: organizationId, slug: makeGreenSlug(input.artistName, input.trackTitle),
    artist_name: input.artistName, track_title: input.trackTitle, genre: input.genre, isrc: input.isrc || null,
    source_type: "artist_direct", status: "rights_review", rights_status: "pending", quality_status: "pending",
  }).select("id").single()
  if (trackError || !track) return NextResponse.json({ error: "Unable to create the Green Catalog submission." }, { status: 500 })

  const grant = await admin.from("green_rights_grants").insert({
    track_id: track.id, submitted_by: user.id, master_controller: input.masterController, composition_controller: input.compositionController,
    master_control_confirmed: true, composition_control_confirmed: true, sample_status: input.sampleStatus,
    stem_extraction_allowed: true, cross_track_derivatives_allowed: true, in_app_playback_allowed: true,
    short_video_export_allowed: input.shortVideoExportAllowed, standalone_audio_export_allowed: false,
    paid_media_allowed: input.paidMediaAllowed, territories: input.territories, ends_at: input.endsAt ?? null,
    evidence: { attestationVersion: "green-pilot-v1", acceptedAt: new Date().toISOString(), sourceSha256 },
  })
  const asset = await admin.from("green_track_assets").insert({
    track_id: track.id, owner_id: user.id, asset_kind: "master", blob_url: input.masterAssetUrl,
    blob_pathname: input.masterAssetPathname, content_type: input.masterAssetContentType,
    byte_size: input.masterAssetByteSize, access_level: "private", sha256: sourceSha256,
    provenance: { intakeVersion: 2, hashedAt: new Date().toISOString() },
  }).select("id,sha256").single()
  if (grant.error || asset.error || !asset.data?.id || asset.data.sha256 !== sourceSha256) {
    await admin.from("green_catalog_tracks").update({ status: "quarantined" }).eq("id", track.id)
    return NextResponse.json({ error: "The submission was quarantined because its rights or source provenance failed." }, { status: 500 })
  }

  const plan = buildInitialGreenProcessingPlan()
  if (plan.jobs.length) {
    const queued = await admin.from("green_processing_jobs").insert(plan.jobs.map((job) => ({
      track_id: track.id,
      job_type: job.jobType,
      provider: job.provider,
      source_asset_id: asset.data.id,
      source_sha256: sourceSha256,
      input: { assetPathname: input.masterAssetPathname, provenanceVersion: 1 },
    })))
    if (queued.error) {
      await admin.from("green_catalog_tracks").update({ status: "quarantined" }).eq("id", track.id)
      return NextResponse.json({ error: "The submission was saved but processing provenance could not be queued." }, { status: 500 })
    }
  }
  return NextResponse.json({
    ok: true, trackId: track.id, status: "rights_review",
    queued: plan.jobs.map((job) => `${job.jobType}:${job.provider}`),
    skipped: plan.missing.map((job) => `${job.jobType}:${job.provider}`),
  }, { status: 201 })
}

async function hashPrivateMaster(url: string, token: string, expectedBytes: number) {
  const blob = await get(url, { token, access: "private" })
  if (!blob || blob.statusCode !== 200) throw new Error("Master unavailable")
  const hash = createHash("sha256")
  let bytes = 0
  for await (const chunk of blob.stream as unknown as AsyncIterable<Uint8Array>) {
    bytes += chunk.byteLength
    if (bytes > 250 * 1024 * 1024 || bytes > expectedBytes) throw new Error("Master size mismatch")
    hash.update(chunk)
  }
  if (bytes !== expectedBytes) throw new Error("Master size mismatch")
  return hash.digest("hex")
}
