import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import { deliverPartnerManifest } from "@/lib/domination/partner-rails"
import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ integrationId: z.string().min(2).max(120), provider: z.enum(["linkfire", "featurefm", "distributor", "ad_platform"]), deliveryType: z.string().trim().min(2).max(80), launchId: z.string().optional(), manifest: z.record(z.string(), z.unknown()) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid partner delivery." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, status: "delivered", deliveryId: "delivery-demo", demo: true })
  if (!z.uuid().safeParse(parsed.data.integrationId).success) return NextResponse.json({ error: "Invalid integration." }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Partner delivery storage is unavailable." }, { status: 503 })
  const { data: integration } = await admin.from("partner_integrations").select("id,provider").eq("id", parsed.data.integrationId).eq("owner_id", user.id).eq("status", "connected").maybeSingle()
  if (!integration || integration.provider !== parsed.data.provider) return NextResponse.json({ error: "Connected partner integration not found." }, { status: 404 })
  const idempotencyKey = randomUUID()
  const { data: event, error } = await admin.from("partner_delivery_events").insert({ integration_id: integration.id, launch_id: parsed.data.launchId && z.uuid().safeParse(parsed.data.launchId).success ? parsed.data.launchId : null, delivery_type: parsed.data.deliveryType, idempotency_key: idempotencyKey, request_manifest: parsed.data.manifest, status: "pending" }).select("id").single()
  if (error || !event) return NextResponse.json({ error: "Unable to queue partner delivery." }, { status: 500 })
  try {
    const result = await deliverPartnerManifest({ provider: parsed.data.provider, deliveryType: parsed.data.deliveryType, idempotencyKey, manifest: parsed.data.manifest })
    await Promise.all([
      admin.from("partner_delivery_events").update({ status: "delivered", response_manifest: result.response, delivered_at: new Date().toISOString() }).eq("id", event.id),
      admin.from("partner_integrations").update({ last_delivery_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", integration.id),
    ])
    return NextResponse.json({ ok: true, status: "delivered", deliveryId: event.id })
  } catch (deliveryError) {
    const message = deliveryError instanceof Error ? deliveryError.message : "Partner delivery failed."
    await admin.from("partner_delivery_events").update({ status: "failed", error_message: message }).eq("id", event.id)
    return NextResponse.json({ error: message, deliveryId: event.id }, { status: 502 })
  }
}
