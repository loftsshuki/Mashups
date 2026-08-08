import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { constructStripeWebhookEvent } from "@/lib/billing/stripe"
import { writeAuditEvent } from "@/lib/data/audit-log"
import {
  clampReferralRevShareBps,
  computeReferralRevenueShareCents,
} from "@/lib/growth/referral-accounting"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"

type WebhookObject = Record<string, unknown>
type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asRecord(value: unknown): WebhookObject {
  return value && typeof value === "object" ? (value as WebhookObject) : {}
}

function normalizeSubscriptionStatus(value: string | null) {
  if (value === "trialing" || value === "past_due" || value === "canceled") {
    return value
  }
  if (value === "active") return "active"
  return "past_due"
}

function assertNoError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`)
}

async function recordReferralRevenueEvent(
  admin: AdminClient,
  input: {
    providerEventId: string
    referralCode: string
    amountCents: number
    providerEventType: string
    metadata: Record<string, unknown>
  },
) {
  const { data: inviteData, error: inviteError } = await admin
    .from("referral_invites")
    .select("code,rev_share_bps")
    .eq("code", input.referralCode)
    .maybeSingle()
  assertNoError(inviteError, "Referral lookup failed")

  const invite = inviteData as { code: string; rev_share_bps: number | null } | null
  const revShareBps = clampReferralRevShareBps(invite?.rev_share_bps ?? undefined)
  const revenueShareCents = computeReferralRevenueShareCents(
    input.amountCents,
    revShareBps,
  )

  const { error } = await admin.from("referral_revenue_events").insert({
    referral_code: invite?.code ?? input.referralCode,
    provider_event_id: input.providerEventId,
    provider_event_type: input.providerEventType,
    amount_cents: Math.max(0, Math.round(input.amountCents)),
    revenue_share_cents: revenueShareCents,
    currency: "USD",
    status: "recorded",
    metadata: { ...input.metadata, revShareBps, revenueShareCents },
  })
  assertNoError(error, "Referral revenue insert failed")

  return {
    revenueShareCents,
    revShareBps,
    referralCode: invite?.code ?? input.referralCode,
  }
}

async function markWebhook(
  admin: AdminClient,
  eventId: string,
  status: "completed" | "failed",
  errorMessage?: string,
) {
  const { error } = await admin
    .from("billing_webhook_events")
    .update({
      status,
      error_message: errorMessage ?? null,
      processed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_event_id", eventId)
  assertNoError(error, "Webhook status update failed")
}

export async function POST(request: Request) {
  const rate = await consumeRateLimit({
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !signature || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, message: "Stripe webhook is not configured." },
      { status: 503 },
    )
  }

  const payload = await request.text()
  let event
  try {
    event = constructStripeWebhookEvent({
      payload,
      signatureHeader: signature,
      secret: webhookSecret,
    })
  } catch {
    await writeAuditEvent({
      actorId: null,
      action: "billing.webhook.process",
      resourceType: "webhook",
      status: "error",
      metadata: { reason: "invalid_signature" },
    })
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { ok: false, message: "Billing database access is not configured." },
      { status: 503 },
    )
  }

  const object = asRecord(event.data.object)
  const { data: claimed, error: claimError } = await admin.rpc(
    "claim_billing_webhook_event",
    {
      p_event_id: event.id,
      p_event_type: event.type,
      p_payload: { objectId: asString(object.id) },
    },
  )
  if (claimError) {
    console.error("[Billing] Could not claim webhook:", claimError.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  if (!claimed) {
    return NextResponse.json({ ok: true, duplicate: true, eventType: event.type })
  }

  let referralResult:
    | { revenueShareCents: number; revShareBps: number; referralCode: string }
    | null = null

  try {
    if (event.type === "checkout.session.completed") {
      const providerSessionId = asString(object.id)
      const metadata = asRecord(object.metadata)
      const sessionType = asString(metadata.session_type)
      const targetId = asString(metadata.target_id)
      const userId = asString(metadata.user_id)
      const referralCode = asString(metadata.referral_code)?.trim() || null
      const amountCents = asNumber(object.amount_total) ?? 0
      const subscriptionId = asString(object.subscription)

      if (providerSessionId) {
        const { error } = await admin
          .from("checkout_sessions")
          .update({ status: "completed" })
          .eq("provider_session_id", providerSessionId)
        assertNoError(error, "Checkout completion update failed")
      }

      if (sessionType === "subscription" && userId && targetId) {
        const providerSubscriptionId = subscriptionId ?? providerSessionId
        if (providerSubscriptionId) {
          const planId = targetId === "pro_studio" ? "pro_studio" : "pro_creator"
          const { data: existing, error: findError } = await admin
            .from("subscriptions")
            .select("id")
            .eq("provider_subscription_id", providerSubscriptionId)
            .maybeSingle()
          assertNoError(findError, "Subscription lookup failed")

          const periodStart = new Date().toISOString()
          const periodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
          const values = {
            plan_id: planId,
            status: "active",
            current_period_start: periodStart,
            current_period_end: periodEnd,
          }
          const result = existing?.id
            ? await admin.from("subscriptions").update(values).eq("id", existing.id)
            : await admin.from("subscriptions").insert({
                ...values,
                user_id: userId,
                provider: "stripe",
                provider_subscription_id: providerSubscriptionId,
              })
          assertNoError(result.error, "Subscription write failed")
        }
      }

      if (sessionType === "license" && userId && targetId) {
        const startsAt = new Date()
        const endsAt = new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000)
        const { error } = await admin.from("creator_licenses").insert({
          user_id: userId,
          license_type:
            targetId === "paid_ads_shorts" ? "paid_ads_shorts" : "organic_shorts",
          territory: "US",
          term_days: 365,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "active",
          verification_code: `ML-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
        })
        assertNoError(error, "License issuance failed")
      }

      if (referralCode && amountCents > 0) {
        referralResult = await recordReferralRevenueEvent(admin, {
          providerEventId: event.id,
          referralCode,
          amountCents,
          providerEventType: event.type,
          metadata: { providerSessionId },
        })
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const providerSessionId = asString(object.id)
      if (providerSessionId) {
        const { error } = await admin
          .from("checkout_sessions")
          .update({ status: "failed" })
          .eq("provider_session_id", providerSessionId)
        assertNoError(error, "Checkout failure update failed")
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const providerSubscriptionId = asString(object.id)
      if (providerSubscriptionId) {
        const periodStart = asNumber(object.current_period_start)
        const periodEnd = asNumber(object.current_period_end)
        const values: Record<string, unknown> = {
          status: normalizeSubscriptionStatus(asString(object.status)),
        }
        if (periodStart) values.current_period_start = new Date(periodStart * 1000).toISOString()
        if (periodEnd) values.current_period_end = new Date(periodEnd * 1000).toISOString()

        const { error } = await admin
          .from("subscriptions")
          .update(values)
          .eq("provider_subscription_id", providerSubscriptionId)
        assertNoError(error, "Subscription status update failed")
      }
    }

    if (event.type === "invoice.paid") {
      const parentMetadata = asRecord(asRecord(asRecord(object.parent).subscription_details).metadata)
      const metadata = { ...parentMetadata, ...asRecord(object.metadata) }
      const referralCode = asString(metadata.referral_code)?.trim() || null
      const amountCents = asNumber(object.amount_paid) ?? asNumber(object.amount_due) ?? 0
      if (referralCode && amountCents > 0) {
        referralResult = await recordReferralRevenueEvent(admin, {
          providerEventId: event.id,
          referralCode,
          amountCents,
          providerEventType: event.type,
          metadata: { invoiceId: asString(object.id) },
        })
      }
    }

    await markWebhook(admin, event.id, "completed")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error"
    console.error(`[Billing] Webhook ${event.id} failed:`, message)
    await markWebhook(admin, event.id, "failed", message).catch(() => undefined)
    await writeAuditEvent({
      actorId: null,
      action: "billing.webhook.process",
      resourceType: "webhook",
      resourceId: event.id,
      status: "error",
      metadata: { eventType: event.type, message },
    })
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  await writeAuditEvent({
    actorId: null,
    action: "billing.webhook.process",
    resourceType: "webhook",
    resourceId: event.id,
    status: "success",
    metadata: { eventType: event.type },
  })

  return NextResponse.json({
    ok: true,
    eventType: event.type,
    referralCode: referralResult?.referralCode ?? null,
    revenueShareCents: referralResult?.revenueShareCents ?? 0,
    revShareBps: referralResult?.revShareBps ?? null,
  })
}
