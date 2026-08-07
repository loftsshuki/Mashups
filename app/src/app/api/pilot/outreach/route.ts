import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ entityName: z.string().trim().min(2).max(160), entityType: z.enum(["label", "distributor", "artist_manager", "venue", "creator_agency", "artist"]), contactName: z.string().trim().max(120).nullable().optional(), contactEmail: z.email().nullable().optional(), city: z.string().trim().max(100).nullable().optional(), countryCode: z.string().trim().max(3).nullable().optional(), genres: z.array(z.string().trim().min(2).max(80)).max(20), catalogSignal: z.string().trim().max(500).nullable().optional(), priority: z.number().int().min(1).max(5), nextAction: z.string().trim().max(500).nullable().optional(), dueAt: z.iso.datetime().nullable().optional(), sourceUrl: z.url().nullable().optional(), notes: z.string().trim().max(2000).nullable().optional() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid outreach prospect." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, prospectId: "prospect-demo-new", stage: "research", demo: true }, { status: 201 })
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Outreach storage is unavailable." }, { status: 503 })
  const { data, error } = await admin.from("outreach_prospects").insert({ owner_id: user.id, entity_name: parsed.data.entityName, entity_type: parsed.data.entityType, contact_name: parsed.data.contactName ?? null, contact_email: parsed.data.contactEmail ?? null, city: parsed.data.city ?? null, country_code: parsed.data.countryCode ?? null, genres: parsed.data.genres, catalog_signal: parsed.data.catalogSignal ?? null, priority: parsed.data.priority, stage: "research", next_action: parsed.data.nextAction ?? null, due_at: parsed.data.dueAt ?? null, source_url: parsed.data.sourceUrl ?? null, notes: parsed.data.notes ?? null }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to save outreach prospect." }, { status: 500 })
  return NextResponse.json({ ok: true, prospectId: data.id, stage: "research" }, { status: 201 })
}
