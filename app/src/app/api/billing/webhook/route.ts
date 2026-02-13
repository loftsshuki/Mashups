import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  clampReferralRevShareBps,
  computeReferralRevenueShareCents,
  DEFAULT_REFERRAL_REV_SHARE_BPS,
} from "@/lib/growth/referral-accounting"

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

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
  const referralCode = event.data?.object?.metadata?.referral_code?.trim() || null
  let referralEventRecorded = false
  let revenueShareCents = 0
  let revShareBps = DEFAULT_REFERRAL_REV_SHARE_BPS

  if (referralCode && amountCents > 0) {
    try {
      const supabase = await createClient()
      const { data: inviteData } = await supabase
        .from("referral_invites")
        .select("code,rev_share_bps")
        .eq("code", referralCode)
        .single()

      const invite = inviteData as { code: string; rev_share_bps: number | null } | null
      if (!invite && isSupabaseConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            message: "Referral code not found.",
            referralCode,
          },
          { status: 404 },
        )
      }

      revShareBps = clampReferralRevShareBps(invite?.rev_share_bps ?? undefined)
      revenueShareCents = computeReferralRevenueShareCents(amountCents, revShareBps)

      const { error } = await supabase.from("referral_revenue_events").insert({
        referral_code: invite?.code ?? referralCode,
        provider_event_type: event.type ?? "unknown",
        amount_cents: Math.round(amountCents),
        revenue_share_cents: revenueShareCents,
        currency: "USD",
        status: "recorded",
        metadata: {
          referralCode: invite?.code ?? referralCode,
          webhookType: event.type ?? "unknown",
          amountCents: Math.round(amountCents),
        },
      })
      referralEventRecorded = !error || !isSupabaseConfigured()
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
    revShareBps: referralCode ? revShareBps : null,
    referralEventRecorded,
  })
}
