import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().trim().min(2).max(100), trackSubmissionId: z.uuid(), organizationId: z.uuid(), territories: z.array(z.string().trim().min(2).max(80)).min(1).max(100), termDays: z.number().int().min(1).max(3650), paidMediaCapCents: z.number().int().min(0).max(1_000_000_000) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid growth-license configuration." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, agreementId: "agreement-demo", verificationCode: "MGL-MV-2026-001", status: "offered", demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "License storage is unavailable." }, { status: 503 })
  const [{ data: launch }, { data: track }, { data: template }] = await Promise.all([
    admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle(),
    admin.from("supply_track_submissions").select("id,organization_id,rights_status,artist_name,track_title").eq("id", parsed.data.trackSubmissionId).eq("organization_id", parsed.data.organizationId).maybeSingle(),
    admin.from("growth_license_templates").select("*").eq("code", "MGL").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  if (!track) return NextResponse.json({ error: "Supply track not found for that rightsholder." }, { status: 404 })
  if (track.rights_status !== "verified") return NextResponse.json({ error: "Track rights must be verified before an agreement can be issued." }, { status: 409 })
  if (!template) return NextResponse.json({ error: "No active Mashups Growth License template is configured." }, { status: 503 })
  const verificationCode = `MGL-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`
  const expiresAt = new Date(Date.now() + 14 * 86_400_000).toISOString()
  const termsSnapshot = { templateCode: template.code, version: template.version, title: template.title, termsMarkdown: template.terms_markdown, permittedUses: template.permitted_uses, derivativePolicy: template.derivative_policy, takedownSlaHours: template.takedown_sla_hours, territories: parsed.data.territories, termDays: parsed.data.termDays, paidMediaCapCents: parsed.data.paidMediaCapCents, artistName: track.artist_name, trackTitle: track.track_title }
  const { data, error } = await admin.from("growth_license_agreements").insert({ template_id: template.id, launch_id: launch.id, track_submission_id: track.id, organization_id: parsed.data.organizationId, offered_by: user.id, status: "offered", territories: parsed.data.territories, term_days: parsed.data.termDays, paid_media_cap_cents: parsed.data.paidMediaCapCents, economics: { currency: "USD" }, terms_snapshot: termsSnapshot, verification_code: verificationCode, expires_at: expiresAt }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to issue growth license." }, { status: 500 })
  return NextResponse.json({ ok: true, agreementId: data.id, verificationCode, status: "offered", expiresAt }, { status: 201 })
}
