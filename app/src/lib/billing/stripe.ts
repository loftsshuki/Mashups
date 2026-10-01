import { createHmac, timingSafeEqual } from "node:crypto"

export type CheckoutSessionType = "subscription" | "license"

export const STRIPE_API_BASE = "https://api.stripe.com/v1"

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
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
    if (normalized.includes("studio")) {
      return process.env.STRIPE_PRICE_ID_PRO_STUDIO ?? null
    }
    return process.env.STRIPE_PRICE_ID_PRO_CREATOR ?? null
  }

  if (normalized.includes("paid_ads")) {
    return process.env.STRIPE_PRICE_ID_LICENSE_PAID_ADS_SHORTS ?? null
  }
  return process.env.STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS ?? null
}

export async function createStripeCheckoutSession(input: {
  secretKey: string
  mode: "subscription" | "payment"
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
  customerEmail?: string
}): Promise<{ id: string; url: string } | null> {
  const body = new URLSearchParams()
  body.set("mode", input.mode)
  body.set("success_url", input.successUrl)
  body.set("cancel_url", input.cancelUrl)
  body.set("line_items[0][price]", input.priceId)
  body.set("line_items[0][quantity]", "1")

  if (input.customerEmail) {
    body.set("customer_email", input.customerEmail)
  }

  for (const [key, value] of Object.entries(input.metadata)) {
    body.set(`metadata[${key}]`, value)
  }

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as { id?: string; url?: string }
  if (!payload.id || !payload.url) {
    return null
  }

  return { id: payload.id, url: payload.url }
}

function parseStripeSignatureHeader(header: string): {
  timestamp: string | null
  signatures: string[]
} {
  const segments = header.split(",").map((item) => item.trim())
  let timestamp: string | null = null
  const signatures: string[] = []

  for (const segment of segments) {
    if (segment.startsWith("t=")) {
      timestamp = segment.slice(2)
    } else if (segment.startsWith("v1=")) {
      signatures.push(segment.slice(3))
    }
  }

  return { timestamp, signatures }
}

export function verifyStripeWebhookSignature(input: {
  payload: string
  signatureHeader: string
  secret: string
  toleranceSeconds?: number
}): boolean {
  const tolerance = input.toleranceSeconds ?? 300
  const { timestamp, signatures } = parseStripeSignatureHeader(input.signatureHeader)
  if (!timestamp || signatures.length === 0) return false

  const timestampNumber = Number(timestamp)
  if (!Number.isFinite(timestampNumber)) return false
  const ageSeconds = Math.abs(Date.now() / 1000 - timestampNumber)
  if (ageSeconds > tolerance) return false

  const signedPayload = `${timestamp}.${input.payload}`
  const expected = createHmac("sha256", input.secret).update(signedPayload).digest("hex")
  const expectedBuffer = Buffer.from(expected)

  for (const signature of signatures) {
    const actualBuffer = Buffer.from(signature)
    if (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return true
    }
  }

  return false
}

// ---------------------------------------------------------------------------
// Stripe Customer Portal
// ---------------------------------------------------------------------------

export async function createStripePortalSession(input: {
  secretKey: string
  customerId: string
  returnUrl: string
}): Promise<{ url: string } | null> {
  const body = new URLSearchParams()
  body.set("customer", input.customerId)
  body.set("return_url", input.returnUrl)

  const response = await fetch(`${STRIPE_API_BASE}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (!response.ok) return null

  const payload = (await response.json()) as { url?: string }
  if (!payload.url) return null
  return { url: payload.url }
}

// Resolve the Stripe customer behind a subscription (`sub_...`) or checkout
// session (`cs_...`) id that our own database already associates with the user.
// This binds billing access to records the user owns, not to an email address.
export async function resolveStripeCustomerId(input: {
  secretKey: string
  reference: string
}): Promise<string | null> {
  const ref = input.reference
  let path: string | null = null
  if (ref.startsWith("sub_")) path = `subscriptions/${encodeURIComponent(ref)}`
  else if (ref.startsWith("cs_")) path = `checkout/sessions/${encodeURIComponent(ref)}`
  if (!path) return null

  const response = await fetch(`${STRIPE_API_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${input.secretKey}` },
  })
  if (!response.ok) return null

  const payload = (await response.json()) as {
    customer?: string | { id?: string } | null
  }
  const customer = payload.customer
  if (typeof customer === "string") return customer
  return customer?.id ?? null
}

// Look up Stripe customer ID by email.
// Not used for billing-portal access: email is not proof of account ownership.
export async function findStripeCustomerByEmail(input: {
  secretKey: string
  email: string
}): Promise<string | null> {
  const response = await fetch(
    `${STRIPE_API_BASE}/customers?email=${encodeURIComponent(input.email)}&limit=1`,
    {
      headers: { Authorization: `Bearer ${input.secretKey}` },
    },
  )

  if (!response.ok) return null

  const payload = (await response.json()) as { data?: Array<{ id: string }> }
  return payload.data?.[0]?.id ?? null
}
