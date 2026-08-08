import { createHmac, timingSafeEqual } from "node:crypto"

export function signGreenAsset(jobId: string, expires: number, secret: string) {
  return createHmac("sha256", secret).update(`${jobId}:${expires}`).digest("hex")
}

export function verifyGreenAssetSignature(jobId: string, expires: number, signature: string, secret: string) {
  if (!Number.isFinite(expires) || expires < Date.now() || expires > Date.now() + 15 * 60_000) return false
  const expected = signGreenAsset(jobId, expires, secret)
  if (signature.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
