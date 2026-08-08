import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ organizationId: z.uuid().optional(), organizationName: z.string().trim().min(2).max(120).optional(), artistName: z.string().trim().min(2).max(100), trackTitle: z.string().trim().min(2).max(120), audioUrl: z.url(), isrc: z.string().trim().max(20).optional(), releaseAt: z.iso.datetime().optional(), territories: z.array(z.string().trim().min(2).max(40)).min(1).max(30), permittedUses: z.array(z.enum(["organic short-form", "creator whitelisting", "paid social <= $25k", "live venue activation"])).min(1), rightsAttested: z.literal(true) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid track submission.", issues: parsed.error.issues }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, submissionId: "track-demo-new", rightsStatus: "review", launchReadiness: 68, demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Supply storage is unavailable." }, { status: 503 })
  let organizationId = parsed.data.organizationId
  if (!organizationId) {
    const { data: owned } = await admin.from("rightsholder_organizations").select("id").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle()
    organizationId = owned?.id
  }
  if (!organizationId) {
    const name = parsed.data.organizationName ?? `${parsed.data.artistName} Rights`
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "rights-team"}-${randomUUID().slice(0, 6)}`
    const { data: organization, error: organizationError } = await admin.from("rightsholder_organizations").insert({ name, slug, organization_type: "artist", owner_id: user.id, verification_status: "pending" }).select("id").single()
    if (organizationError || !organization) return NextResponse.json({ error: "Unable to create rights organization." }, { status: 500 })
    organizationId = organization.id
    await admin.from("rightsholder_members").insert({ organization_id: organizationId, user_id: user.id, role: "owner" })
  }
  const { data: member } = await admin.from("rightsholder_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).maybeSingle()
  if (!member || !["owner", "admin", "rights"].includes(member.role)) return NextResponse.json({ error: "Insufficient organization permission." }, { status: 403 })
  const readiness = Math.min(100, 40 + parsed.data.territories.length * 3 + parsed.data.permittedUses.length * 8 + (parsed.data.isrc ? 12 : 0))
  const { data, error } = await admin.from("supply_track_submissions").insert({ organization_id: organizationId, submitted_by: user.id, artist_name: parsed.data.artistName, track_title: parsed.data.trackTitle, audio_url: parsed.data.audioUrl, isrc: parsed.data.isrc ?? null, release_at: parsed.data.releaseAt ?? null, territories: parsed.data.territories, permitted_uses: parsed.data.permittedUses, rights_status: "review", rights_attestation: { accepted: true, acceptedAt: new Date().toISOString(), acceptedBy: user.id }, launch_readiness: readiness }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to submit track." }, { status: 500 })
  return NextResponse.json({ ok: true, submissionId: data.id, rightsStatus: "review", launchReadiness: readiness }, { status: 201 })
}
