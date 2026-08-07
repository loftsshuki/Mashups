import { NextResponse } from "next/server"
import { z } from "zod"

import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ trackSubmissionId: z.uuid(), organizationId: z.uuid(), exclusivityType: z.enum(["campaign", "category", "platform", "territory"]), startsAt: z.iso.datetime(), endsAt: z.iso.datetime(), territories: z.array(z.string().trim().min(2).max(80)).max(100).default([]), categories: z.array(z.string().trim().min(2).max(80)).max(50).default([]), campaignSlotLimit: z.number().int().min(1).max(10_000), economics: z.record(z.string(), z.unknown()).default({}) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || new Date(parsed.data?.endsAt ?? 0) <= new Date(parsed.data?.startsAt ?? 0)) return NextResponse.json({ error: "Invalid exclusivity window." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, inventoryId: "inventory-demo", status: "active", demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Inventory storage is unavailable." }, { status: 503 })
  const [{ data: organization }, { data: membership }, { data: track }] = await Promise.all([
    admin.from("rightsholder_organizations").select("id,owner_id").eq("id", parsed.data.organizationId).maybeSingle(),
    admin.from("rightsholder_members").select("role").eq("organization_id", parsed.data.organizationId).eq("user_id", user.id).maybeSingle(),
    admin.from("supply_track_submissions").select("id,rights_status").eq("id", parsed.data.trackSubmissionId).eq("organization_id", parsed.data.organizationId).maybeSingle(),
  ])
  const authorized = organization?.owner_id === user.id || membership?.role === "owner" || membership?.role === "admin" || membership?.role === "rights"
  if (!authorized) return NextResponse.json({ error: "You cannot manage this catalog." }, { status: 403 })
  if (!track) return NextResponse.json({ error: "Supply track not found." }, { status: 404 })
  if (track.rights_status !== "verified") return NextResponse.json({ error: "Only rights-verified tracks can enter exclusive inventory." }, { status: 409 })
  const { data, error } = await admin.from("inventory_exclusivity_windows").insert({ track_submission_id: track.id, organization_id: parsed.data.organizationId, exclusivity_type: parsed.data.exclusivityType, starts_at: parsed.data.startsAt, ends_at: parsed.data.endsAt, territories: parsed.data.territories, categories: parsed.data.categories, campaign_slot_limit: parsed.data.campaignSlotLimit, status: "active", economics: parsed.data.economics }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to create exclusivity window." }, { status: 500 })
  return NextResponse.json({ ok: true, inventoryId: data.id, status: "active" }, { status: 201 })
}
