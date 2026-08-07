import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ programCode: z.string().trim().min(2).max(80), campaignName: z.string().trim().min(2).max(160), artistName: z.string().trim().min(2).max(120), trackTitle: z.string().trim().min(2).max(160), contactName: z.string().trim().min(2).max(120), contactEmail: z.email(), genre: z.string().trim().min(2).max(80), subgenre: z.string().trim().max(80).default(""), releaseStage: z.enum(["unreleased", "released", "catalog"]), releaseDate: z.iso.date().nullable().optional(), objectives: z.array(z.string().trim().min(2).max(120)).min(1).max(12), targetMarkets: z.array(z.string().trim().min(2).max(80)).min(1).max(10), targetNiches: z.array(z.string().trim().min(2).max(80)).min(1).max(12), targetCreatorCount: z.number().int().min(10).max(10_000), creatorBudgetCents: z.number().int().min(0).max(1_000_000_000), paidMediaBudgetCents: z.number().int().min(0).max(1_000_000_000), masterUrl: z.url().nullable().optional(), rightsReadiness: z.enum(["unverified", "review", "verified"]), notes: z.string().trim().max(3000).nullable().optional() })

const checklist = [
  ["master-authority", "rights", "Master authority verified"], ["growth-license", "rights", "Growth License terms configured"], ["hook-genomes", "creative", "Three hook genomes selected"], ["creator-liquidity", "creator", "Creator floor is fillable"], ["measurement", "measurement", "Matched holdout designed"], ["artist-contract", "commercial", "Artist participation accepted"], ["partner-rails", "partner", "Attribution rails connected"], ["production-backend", "deployment", "Production backend connected"],
] as const

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid pilot intake.", issues: parsed.error.issues }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, intakeId: "intake-demo-new", status: "submitted", next: "/operator?demo=1", demo: true }, { status: 201 })
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Pilot storage is unavailable." }, { status: 503 })
  const { data: program } = await admin.from("pilot_program_templates").select("id").eq("code", parsed.data.programCode).eq("is_active", true).maybeSingle()
  if (!program) return NextResponse.json({ error: "Pilot program is unavailable." }, { status: 404 })
  const { data, error } = await admin.from("pilot_campaign_intakes").insert({ owner_id: user.id, program_template_id: program.id, campaign_name: parsed.data.campaignName, artist_name: parsed.data.artistName, track_title: parsed.data.trackTitle, contact_name: parsed.data.contactName, contact_email: parsed.data.contactEmail, genre: parsed.data.genre, subgenre: parsed.data.subgenre || null, release_stage: parsed.data.releaseStage, release_date: parsed.data.releaseDate ?? null, objectives: parsed.data.objectives, target_markets: parsed.data.targetMarkets, target_niches: parsed.data.targetNiches, target_creator_count: parsed.data.targetCreatorCount, creator_budget_cents: parsed.data.creatorBudgetCents, paid_media_budget_cents: parsed.data.paidMediaBudgetCents, master_url: parsed.data.masterUrl ?? null, rights_readiness: parsed.data.rightsReadiness, notes: parsed.data.notes ?? null, status: parsed.data.rightsReadiness === "verified" ? "qualified" : "submitted" }).select("id,status").single()
  if (error || !data) return NextResponse.json({ error: "Unable to create pilot intake." }, { status: 500 })
  await admin.from("pilot_checklist_items").insert(checklist.map(([key, category, label]) => ({ intake_id: data.id, item_key: key, category, label, required: true, status: key === "master-authority" && parsed.data.rightsReadiness === "verified" ? "ready" : "pending", evidence: { detail: key === "master-authority" ? `Intake rights state: ${parsed.data.rightsReadiness}` : "Awaiting operator evidence." } })))
  return NextResponse.json({ ok: true, intakeId: data.id, status: data.status, next: "/operator" }, { status: 201 })
}
