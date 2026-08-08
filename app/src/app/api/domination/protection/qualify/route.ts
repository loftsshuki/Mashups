import { NextResponse } from "next/server"
import { z } from "zod"

import { qualifyLaunchProtection } from "@/lib/domination/engines"
import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().trim().min(2).max(100), platformFeeCents: z.number().int().min(0).max(100_000_000), rightsVerified: z.boolean(), trustScore: z.number().int().min(0).max(100), treatmentSample: z.number().int().min(0), controlSample: z.number().int().min(0), artistContractAccepted: z.boolean(), measurementConnected: z.boolean() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid protection evidence." }, { status: 400 })
  const protection = qualifyLaunchProtection(parsed.data)
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, protection, demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Protection storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data: offer } = await admin.from("commercial_offers").select("id,platform_fee_cents,expires_at").eq("owner_id", user.id).eq("launch_id", launch.id).in("status", ["quoted", "offered", "accepted"]).gte("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (!offer) return NextResponse.json({ error: "Create a current commercial offer before qualifying protection." }, { status: 409 })
  if (offer.platform_fee_cents !== parsed.data.platformFeeCents) return NextResponse.json({ error: "Protection evidence does not match the current offer." }, { status: 409 })
  const { data: policy, error } = await admin.from("launch_protection_policies").upsert({
    launch_id: launch.id,
    commercial_offer_id: offer.id,
    owner_id: user.id,
    status: protection.status,
    service_credit_cents: protection.serviceCreditCents,
    conditions: protection.conditions,
    terms_snapshot: { summary: protection.terms, coverage: "contracted operating deliverables", excludes: ["streams", "revenue", "chart position", "virality"] },
    expires_at: offer.expires_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: "launch_id" }).select("id,status").single()
  if (error || !policy) return NextResponse.json({ error: "Unable to save protection qualification." }, { status: 500 })
  return NextResponse.json({ ok: true, protection, policyId: policy.id, status: policy.status })
}
