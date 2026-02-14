import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import {
  createStripeCheckoutSession,
  isStripeConfigured,
  resolveStripePriceId,
  type CheckoutSessionType,
} from "@/lib/billing/stripe"
import { createClient } from "@/lib/supabase/server"

interface CheckoutBody {
  sessionType: CheckoutSessionType
  targetId: string
  referralCode?: string
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody
    if (!body.sessionType || !body.targetId) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isSupabaseConfigured() && !user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const successUrl = `${appUrl}/dashboard/monetization?checkout=success`
    const cancelUrl = `${appUrl}/pricing?checkout=cancelled`
    const sessionId = randomUUID()
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    if (isStripeConfigured() && stripeSecret) {
      const priceId = resolveStripePriceId(body.sessionType, body.targetId)
      if (!priceId) {
        return NextResponse.json(
          { error: "Stripe price id is not configured for this checkout target." },
          { status: 500 },
        )
      }

      const liveSession = await createStripeCheckoutSession({
        secretKey: stripeSecret,
        mode: body.sessionType === "subscription" ? "subscription" : "payment",
        priceId,
        successUrl,
        cancelUrl,
        metadata: {
          session_type: body.sessionType,
          target_id: body.targetId,
          user_id: user?.id ?? "anonymous",
          referral_code: body.referralCode ?? "",
        },
        customerEmail: user?.email ?? undefined,
      })

      if (!liveSession) {
        return NextResponse.json(
          { error: "Failed to create Stripe checkout session." },
          { status: 502 },
        )
      }

      if (user?.id) {
        await supabase.from("checkout_sessions").insert({
          id: sessionId,
          user_id: user.id,
          session_type: body.sessionType,
          target_id: body.targetId,
          provider: "stripe",
          provider_session_id: liveSession.id,
          status: "pending",
        })
      }

      return NextResponse.json({
        checkoutUrl: liveSession.url,
        providerSessionId: liveSession.id,
        mode: "live",
      })
    }

    const fakeProviderSessionId = `cs_test_${randomUUID().replace(/-/g, "")}`
    if (user?.id) {
      await supabase.from("checkout_sessions").insert({
        id: sessionId,
        user_id: user.id,
        session_type: body.sessionType,
        target_id: body.targetId,
        provider: "stripe",
        provider_session_id: fakeProviderSessionId,
        status: "pending",
      })
    }

    const checkoutUrl = `${appUrl}/dashboard/monetization?checkout=${fakeProviderSessionId}`

    return NextResponse.json({
      checkoutUrl,
      providerSessionId: fakeProviderSessionId,
      mode: "stub",
      message:
        "Stripe SDK keys are not configured. Add STRIPE_SECRET_KEY and price IDs for live checkout.",
    })
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
