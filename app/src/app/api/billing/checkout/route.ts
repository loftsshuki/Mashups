import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import {
  createStripeCheckoutSession,
  isStripeConfigured,
  resolveStripePriceId,
} from "@/lib/billing/stripe"
import { isDemoMode, isSupabaseConfigured } from "@/lib/config/runtime"
import { writeAuditEvent } from "@/lib/data/audit-log"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const checkoutSchema = z.discriminatedUnion("sessionType", [
  z.object({
    sessionType: z.literal("subscription"),
    targetId: z.enum(["pro_creator", "pro_studio"]),
    referralCode: z.string().trim().min(3).max(64).optional(),
  }),
  z.object({
    sessionType: z.literal("license"),
    targetId: z.enum(["organic_shorts", "paid_ads_shorts"]),
    referralCode: z.string().trim().min(3).max(64).optional(),
  }),
])

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload.", issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const supabaseConfigured = isSupabaseConfigured()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (supabaseConfigured && !user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }
  if (!supabaseConfigured && !isDemoMode()) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    )
  }

  const rate = await consumeRateLimit({
    key: resolveRateLimitKey(request, "billing.checkout", user?.id ?? null),
    limit: 10,
    windowMs: 60_000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const successUrl = new URL("/dashboard/monetization?checkout=success", appUrl).toString()
  const cancelUrl = new URL("/pricing?checkout=cancelled", appUrl).toString()
  const body = parsed.data

  if (!isStripeConfigured()) {
    if (!isDemoMode()) {
      return NextResponse.json(
        { error: "Billing is not configured." },
        { status: 503 },
      )
    }

    const demoSessionId = `cs_demo_${randomUUID().replace(/-/g, "")}`
    return NextResponse.json({
      checkoutUrl: new URL(
        `/dashboard/monetization?checkout=${demoSessionId}`,
        appUrl,
      ).toString(),
      providerSessionId: demoSessionId,
      mode: "demo",
    })
  }

  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const priceId = resolveStripePriceId(body.sessionType, body.targetId)
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price id is not configured for this product." },
      { status: 503 },
    )
  }

  try {
    const liveSession = await createStripeCheckoutSession({
      secretKey: process.env.STRIPE_SECRET_KEY!,
      mode: body.sessionType === "subscription" ? "subscription" : "payment",
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        session_type: body.sessionType,
        target_id: body.targetId,
        user_id: user.id,
        referral_code: body.referralCode ?? "",
      },
      customerEmail: user.email ?? undefined,
    })

    const admin = createAdminClient()
    if (!admin) {
      throw new Error("Supabase service role is not configured.")
    }

    const { error: insertError } = await admin.from("checkout_sessions").insert({
      user_id: user.id,
      session_type: body.sessionType,
      target_id: body.targetId,
      provider: "stripe",
      provider_session_id: liveSession.id,
      status: "pending",
    })
    if (insertError) throw insertError

    await writeAuditEvent({
      actorId: user.id,
      action: "billing.checkout.create",
      resourceType: "checkout_session",
      resourceId: liveSession.id,
      status: "success",
      metadata: { sessionType: body.sessionType, targetId: body.targetId },
    })

    return NextResponse.json({
      checkoutUrl: liveSession.url,
      providerSessionId: liveSession.id,
      mode: "live",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown checkout error"
    console.error("[Billing] Checkout creation failed:", message)
    await writeAuditEvent({
      actorId: user.id,
      action: "billing.checkout.create",
      resourceType: "checkout_session",
      status: "error",
      metadata: { sessionType: body.sessionType, targetId: body.targetId, message },
    })
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session." },
      { status: 502 },
    )
  }
}
