import { createHmac } from "node:crypto"

interface AttributionPayload {
  campaignId: string
  creatorId: string
  destination: string
  issuedAt: number
}

const secret = () => process.env.ATTRIBUTION_SIGNING_SECRET ?? "dev-signing-secret"

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url")
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

export function signAttributionLink(payload: AttributionPayload): string {
  const body = JSON.stringify(payload)
  const encoded = encodeBase64Url(body)
  const sig = createHmac("sha256", secret()).update(encoded).digest("base64url")
  return `${encoded}.${sig}`
}

export function verifyAttributionToken(token: string): AttributionPayload | null {
  const [encoded, sig] = token.split(".")
  if (!encoded || !sig) return null
  const expected = createHmac("sha256", secret()).update(encoded).digest("base64url")
  if (expected !== sig) return null
  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as AttributionPayload
    if (!parsed.destination || !parsed.campaignId || !parsed.creatorId) return null
    return parsed
  } catch {
    return null
  }
}
