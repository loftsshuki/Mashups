import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { greenIntakeSchema } from "@/lib/green-room/schemas"
import { makeGreenSlug } from "@/lib/green-room/service"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const parsed = greenIntakeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Complete every required rights and master field.", issues: parsed.error.issues }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const input = parsed.data
  if (!input.masterAssetPathname.startsWith(`green-room/${user.id}/masters/`)) return NextResponse.json({ error: "Master upload ownership is invalid." }, { status: 403 })
  const assetUrl = new URL(input.masterAssetUrl)
  const assetHost = assetUrl.hostname
  if (!assetHost.endsWith(".blob.vercel-storage.com")) return NextResponse.json({ error: "Master must use private Green Room storage." }, { status: 400 })
  if (decodeURIComponent(assetUrl.pathname).replace(/^\//, "") !== input.masterAssetPathname) return NextResponse.json({ error: "Master URL and private pathname do not match." }, { status: 400 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Green Room storage is unavailable." }, { status: 503 })

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

  const { data: track, error: trackError } = await admin.from("green_catalog_tracks").insert({ owner_id: user.id, organization_id: organizationId, slug: makeGreenSlug(input.artistName, input.trackTitle), artist_name: input.artistName, track_title: input.trackTitle, genre: input.genre, isrc: input.isrc || null, source_type: "artist_direct", status: "rights_review", rights_status: "pending", quality_status: "pending" }).select("id").single()
  if (trackError || !track) return NextResponse.json({ error: "Unable to create the Green Catalog submission." }, { status: 500 })

  const [grantResult, assetResult] = await Promise.all([
    admin.from("green_rights_grants").insert({ track_id: track.id, submitted_by: user.id, master_controller: input.masterController, composition_controller: input.compositionController, master_control_confirmed: true, composition_control_confirmed: true, sample_status: input.sampleStatus, stem_extraction_allowed: true, cross_track_derivatives_allowed: true, in_app_playback_allowed: true, short_video_export_allowed: input.shortVideoExportAllowed, standalone_audio_export_allowed: false, paid_media_allowed: input.paidMediaAllowed, territories: input.territories, ends_at: input.endsAt ?? null, evidence: { attestationVersion: "green-pilot-v1", acceptedAt: new Date().toISOString() } }),
    admin.from("green_track_assets").insert({ track_id: track.id, owner_id: user.id, asset_kind: "master", blob_url: input.masterAssetUrl, blob_pathname: input.masterAssetPathname, content_type: input.masterAssetContentType, byte_size: input.masterAssetByteSize, access_level: "private" }),
  ])
  if (grantResult.error || assetResult.error) {
    await admin.from("green_catalog_tracks").update({ status: "quarantined" }).eq("id", track.id)
    return NextResponse.json({ error: "The submission was quarantined because its rights or asset record failed." }, { status: 500 })
  }
  await admin.from("green_processing_jobs").insert([{ track_id: track.id, job_type: "fingerprint", provider: "pex", input: { assetPathname: input.masterAssetPathname } }, { track_id: track.id, job_type: "analyze", provider: "modal", input: { assetPathname: input.masterAssetPathname } }])
  return NextResponse.json({ ok: true, trackId: track.id, status: "rights_review" }, { status: 201 })
}
