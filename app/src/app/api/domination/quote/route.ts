import { NextResponse } from "next/server"
import { z } from "zod"

import { priceCampaign } from "@/lib/domination/engines"
import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().trim().min(2).max(100), tier: z.enum(["pilot", "growth", "label_os"]), targetCreators: z.number().int().min(10).max(10_000), mediaBudgetCents: z.number().int().min(0).max(100_000_000), creatorRewardCents: z.number().int().min(1500).max(1_000_000) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid commercial configuration." }, { status: 400 })
  const quote = priceCampaign(parsed.data)
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, quote, offerId: "offer-demo", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Commercial storage is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  const { data, error } = await admin.from("commercial_offers").insert({ owner_id: user.id, launch_id: launch.id, tier: quote.tier, target_creators: parsed.data.targetCreators, platform_fee_cents: quote.platformFeeCents, creator_budget_cents: quote.creatorBudgetCents, media_budget_cents: quote.mediaBudgetCents, operations_fee_cents: quote.operationsFeeCents, total_cents: quote.totalCents, deliverables: quote.deliverables, status: "quoted", expires_at: new Date(Date.now() + 14 * 86_400_000).toISOString() }).select("id").single()
  if (error || !data) return NextResponse.json({ error: "Unable to save quote." }, { status: 500 })
  return NextResponse.json({ ok: true, quote, offerId: data.id })
}
