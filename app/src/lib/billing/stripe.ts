import "server-only"

import Stripe from "stripe"

export type CheckoutSessionType = "subscription" | "license"

let stripeClient: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(secretKey = process.env.STRIPE_SECRET_KEY): Stripe {
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.")
  }

  if (!stripeClient || secretKey !== process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(secretKey, {
      appInfo: { name: "Mashups", version: "0.1.0" },
    })
  }

  return stripeClient
}

function normalizeTarget(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_")
}

export function resolveStripePriceId(
  sessionType: CheckoutSessionType,
  targetId: string,
): string | null {
  const normalized = normalizeTarget(targetId)

  if (sessionType === "subscription") {
    return normalized.includes("studio")
      ? process.env.STRIPE_PRICE_ID_PRO_STUDIO ?? null
      : process.env.STRIPE_PRICE_ID_PRO_CREATOR ?? null
  }

  return normalized.includes("paid_ads")
    ? process.env.STRIPE_PRICE_ID_LICENSE_PAID_ADS_SHORTS ?? null
    : process.env.STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS ?? null
}

export async function createStripeCheckoutSession(input: {
  secretKey: string
  mode: "subscription" | "payment"
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
  customerEmail?: string
}): Promise<{ id: string; url: string }> {
  const stripe = getStripe(input.secretKey)
  const session = await stripe.checkout.sessions.create({
    mode: input.mode,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: [{ price: input.priceId, quantity: 1 }],
    customer_email: input.customerEmail,
    metadata: input.metadata,
    subscription_data:
      input.mode === "subscription" ? { metadata: input.metadata } : undefined,
    payment_intent_data:
      input.mode === "payment" ? { metadata: input.metadata } : undefined,
  })

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.")
  }

  return { id: session.id, url: session.url }
}

export function constructStripeWebhookEvent(input: {
  payload: string
  signatureHeader: string
  secret: string
}): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    input.payload,
    input.signatureHeader,
    input.secret,
  )
}

export async function createStripePortalSession(input: {
  secretKey: string
  customerId: string
  returnUrl: string
}): Promise<{ url: string }> {
  const session = await getStripe(input.secretKey).billingPortal.sessions.create({
    customer: input.customerId,
    return_url: input.returnUrl,
  })

  return { url: session.url }
}

export async function findStripeCustomerByEmail(input: {
  secretKey: string
  email: string
}): Promise<string | null> {
  const customers = await getStripe(input.secretKey).customers.list({
    email: input.email,
    limit: 1,
  })
  return customers.data[0]?.id ?? null
}
