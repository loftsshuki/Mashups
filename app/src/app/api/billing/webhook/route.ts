import { NextResponse } from "next/server"

import { verifyStripeWebhookSignature } from "@/lib/billing/stripe"
import { writeAuditEvent } from "@/lib/data/audit-log"
import {
  clampReferralRevShareBps,
  computeReferralRevenueShareCents,
} from "@/lib/growth/referral-accounting"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

type WebhookObject = Record<string, unknown>

interface StripeWebhookEvent {
  id?: string
  type?: string
  data?: { object?: WebhookObject }
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function normalizeSubscriptionStatus(value: string | null): string {
  if (value === "trialing" || value === "past_due" || value === "canceled" || value === "active") {
    return value
  }
  return "active"
}

async function recordReferralRevenueEvent(input: {
  referralCode: string
  amountCents: number
  providerEventType: string
  metadata: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data: inviteData } = await supabase
    .from("referral_invites")
    .select("code,rev_share_bps")
    .eq("code", input.referralCode)
    .maybeSingle()

  const invite = inviteData as { code: string; rev_share_bps: number | null } | null
  const revShareBps = clampReferralRevShareBps(invite?.rev_share_bps ?? undefined)
  const revenueShareCents = computeReferralRevenueShareCents(input.amountCents, revShareBps)

  await supabase.from("referral_revenue_events").insert({
    referral_code: invite?.code ?? input.referralCode,
    provider_event_type: input.providerEventType,
    amount_cents: Math.max(0, Math.round(input.amountCents)),
    revenue_share_cents: revenueShareCents,
    currency: "USD",
    status: "recorded",
    metadata: {
      ...input.metadata,
      revShareBps,
      revenueShareCents,
    },
  })

  return { revenueShareCents, revShareBps, referralCode: invite?.code ?? input.referralCode }
}

export async function POST(request: Request) {
  const rate = consumeRateLimit({
    key: resolveRateLimitKey(request, "billing.webhook"),
    limit: 120,
    windowMs: 60_000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Rate limit exceeded." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

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

  const payload = await request.text()
  const isValidSignature = verifyStripeWebhookSignature({
    payload,
    signatureHeader: signature,
    secret: expectedSecret,
  })

  if (!isValidSignature) {
    await writeAuditEvent({
      actorId: null,
      action: "billing.webhook.process",
      resourceType: "webhook",
      status: "error",
      metadata: { reason: "invalid_signature" },
    })
    return NextResponse.json({ ok: false, message: "Invalid webhook signature." }, { status: 400 })
  }

  const event = (JSON.parse(payload || "{}") as StripeWebhookEvent)
  const eventType = event.type ?? "unknown"
  const object = event.data?.object ?? {}
  const supabase = await createClient()

  let referralResult:
    | { revenueShareCents: number; revShareBps: number; referralCode: string }
    | null = null

  try {
    if (eventType === "checkout.session.completed") {
      const providerSessionId = asString(object.id)
      const metadata = (object.metadata ?? {}) as Record<string, unknown>
      const sessionType = asString(metadata.session_type)
      const targetId = asString(metadata.target_id)
      const userId = asString(metadata.user_id)
      const referralCode = asString(metadata.referral_code)?.trim() ?? null
      const amountCents = asNumber(object.amount_total) ?? 0
      const subscriptionId = asString(object.subscription)

      if (providerSessionId) {
        await supabase
          .from("checkout_sessions")
          .update({ status: "completed" })
          .eq("provider_session_id", providerSessionId)
      }

      if (sessionType === "subscription" && userId && targetId) {
        const periodStart = new Date().toISOString()
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const providerSubscriptionId = subscriptionId ?? providerSessionId ?? null
        if (providerSubscriptionId) {
          const { data: existing } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("provider_subscription_id", providerSubscriptionId)
            .maybeSingle()

          if (existing?.id) {
            await supabase
              .from("subscriptions")
              .update({
                plan_id: targetId.toLowerCase().includes("studio")
                  ? "pro_studio"
                  : "pro_creator",
                status: "active",
                current_period_start: periodStart,
                current_period_end: periodEnd,
              })
              .eq("id", existing.id)
          } else {
            await supabase.from("subscriptions").insert({
              user_id: userId,
              plan_id: targetId.toLowerCase().includes("studio")
                ? "pro_studio"
                : "pro_creator",
              provider: "stripe",
              provider_subscription_id: providerSubscriptionId,
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
          }
        }
      }

      if (referralCode && amountCents > 0) {
        referralResult = await recordReferralRevenueEvent({
          referralCode,
          amountCents,
          providerEventType: eventType,
          metadata: {
            eventId: event.id ?? null,
            providerSessionId,
          },
        })
      }
    }

    if (eventType === "checkout.session.expired" || eventType === "checkout.session.async_payment_failed") {
      const providerSessionId = asString(object.id)
      if (providerSessionId) {
        await supabase
          .from("checkout_sessions")
          .update({ status: "failed" })
          .eq("provider_session_id", providerSessionId)
      }
    }

    if (eventType === "customer.subscription.updated" || eventType === "customer.subscription.deleted") {
      const providerSubscriptionId = asString(object.id)
      const status = normalizeSubscriptionStatus(asString(object.status))
      const periodStartSeconds = asNumber(object.current_period_start)
      const periodEndSeconds = asNumber(object.current_period_end)

      if (providerSubscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: periodStartSeconds
              ? new Date(periodStartSeconds * 1000).toISOString()
              : undefined,
            current_period_end: periodEndSeconds
              ? new Date(periodEndSeconds * 1000).toISOString()
              : undefined,
          })
          .eq("provider_subscription_id", providerSubscriptionId)
      }
    }

    if (eventType === "invoice.paid") {
      const metadata = (object.metadata ?? {}) as Record<string, unknown>
      const referralCode = asString(metadata.referral_code)?.trim() ?? null
      const amountCents = asNumber(object.amount_paid) ?? asNumber(object.amount_due) ?? 0

      if (referralCode && amountCents > 0) {
        referralResult = await recordReferralRevenueEvent({
          referralCode,
          amountCents,
          providerEventType: eventType,
          metadata: {
            eventId: event.id ?? null,
            invoiceId: asString(object.id),
          },
        })
      }
    }
  } catch {
    await writeAuditEvent({
      actorId: null,
      action: "billing.webhook.process",
      resourceType: "webhook",
      resourceId: event.id ?? null,
      status: "error",
      metadata: { eventType },
    })
    return NextResponse.json({ ok: false, message: "Failed to process webhook." }, { status: 500 })
  }

  await writeAuditEvent({
    actorId: null,
    action: "billing.webhook.process",
    resourceType: "webhook",
    resourceId: event.id ?? null,
    status: "success",
    metadata: { eventType, referralCode: referralResult?.referralCode ?? null },
  })

  return NextResponse.json({
    ok: true,
    mode: "live",
    eventType,
    referralCode: referralResult?.referralCode ?? null,
    revenueShareCents: referralResult?.revenueShareCents ?? 0,
    revShareBps: referralResult?.revShareBps ?? null,
  })
}
