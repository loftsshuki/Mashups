import { createHmac, timingSafeEqual } from "node:crypto"

export const GREEN_BETA_COOKIE = "mashups_green_beta"

export function signBetaAccess(inviteId: string, secret: string) {
  const signature = createHmac("sha256", secret).update(inviteId).digest("hex")
  return `${inviteId}.${signature}`
}

export function verifyBetaAccess(value: string, secret: string) {
  const [inviteId, signature] = value.split(".")
  if (!inviteId || !signature) return false
  const expected = createHmac("sha256", secret).update(inviteId).digest("hex")
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
