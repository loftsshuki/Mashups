import "server-only"

import { createHmac } from "node:crypto"

export async function deliverPartnerManifest(input: {
  provider: string
  deliveryType: string
  idempotencyKey: string
  manifest: Record<string, unknown>
}): Promise<{ delivered: boolean; response: Record<string, unknown> }> {
  const endpoint = process.env.PARTNER_DELIVERY_URL
  const secret = process.env.PARTNER_DELIVERY_SECRET
  if (!endpoint || !secret) throw new Error("Partner delivery bridge is not configured.")
  const payload = JSON.stringify({ provider: input.provider, deliveryType: input.deliveryType, manifest: input.manifest })
  const signature = createHmac("sha256", secret).update(payload).digest("hex")
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey, "X-Mashups-Signature": `sha256=${signature}` }, body: payload, cache: "no-store" })
  const result = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) throw new Error(`Partner delivery failed with status ${response.status}.`)
  return { delivered: true, response: result }
}
