import { createHmac, timingSafeEqual } from "node:crypto"

export interface OAuthState {
  provider: string
  userId: string
  returnTo: string
  issuedAt: number
}

export function signOAuthState(state: OAuthState, secret = process.env.OAUTH_STATE_SECRET): string {
  if (!secret) throw new Error("OAUTH_STATE_SECRET is not configured.")
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url")
  return `${payload}.${signature(payload, secret)}`
}

export function verifyOAuthState(token: string, secret = process.env.OAUTH_STATE_SECRET, now = Date.now()): OAuthState {
  if (!secret) throw new Error("OAUTH_STATE_SECRET is not configured.")
  const [payload, supplied] = token.split(".")
  if (!payload || !supplied) throw new Error("Invalid OAuth state.")
  const expected = Buffer.from(signature(payload, secret))
  const actual = Buffer.from(supplied)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Invalid OAuth state signature.")
  const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState
  if (!state.userId || !state.provider || !state.returnTo || now - state.issuedAt > 10 * 60_000 || state.issuedAt > now + 30_000) {
    throw new Error("Expired OAuth state.")
  }
  return state
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}
