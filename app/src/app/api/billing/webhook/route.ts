import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface StubWebhookEvent {
  type?: string
  data?: {
    object?: {
      amount_total?: number
      amount_subtotal?: number
      metadata?: {
        referral_code?: string
      }
    }
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const expectedSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!expectedSecret || !signature) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook secret or signature missing. Configure STRIPE_WEBHOOK_SECRET and verify signatures.",
      },
      { status: 400 },
    )
  }

  const event = (await request.json().catch(() => ({}))) as StubWebhookEvent
  const amountCents =
    event.data?.object?.amount_total ?? event.data?.object?.amount_subtotal ?? 0
  const referralCode = event.data?.object?.metadata?.referral_code
  const revenueShareCents = referralCode ? Math.round(amountCents * 0.2) : 0

  if (referralCode && revenueShareCents > 0) {
    try {
      const supabase = await createClient()
      await supabase.from("recommendation_events").insert({
        user_id: null,
        mashup_id: null,
        event_type: "share",
        context: `referral:${referralCode}|webhook_type:${event.type ?? "unknown"}|amount_cents:${amountCents}|rev_cents:${revenueShareCents}`,
      })
    } catch {
      // Non-blocking accounting log.
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "stub",
    message: "Webhook received. Stub referral revenue share accounting applied when referral code is present.",
    referralCode: referralCode ?? null,
    revenueShareCents,
  })
}
