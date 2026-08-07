import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const VERSION = "v1"

export function encryptToken(value: string, secret = process.env.PLATFORM_TOKEN_ENCRYPTION_KEY): string {
  if (!secret) throw new Error("PLATFORM_TOKEN_ENCRYPTION_KEY is not configured.")
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".")
}

export function decryptToken(payload: string, secret = process.env.PLATFORM_TOKEN_ENCRYPTION_KEY): string {
  if (!secret) throw new Error("PLATFORM_TOKEN_ENCRYPTION_KEY is not configured.")
  const [version, ivText, tagText, encryptedText] = payload.split(".")
  if (version !== VERSION || !ivText || !tagText || !encryptedText) throw new Error("Invalid encrypted token payload.")
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), Buffer.from(ivText, "base64url"))
  decipher.setAuthTag(Buffer.from(tagText, "base64url"))
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8")
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest()
}
