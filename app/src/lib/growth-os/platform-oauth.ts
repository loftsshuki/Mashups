import "server-only"

import type { PlatformProvider } from "@/lib/growth-os/types"

type OAuthProviderConfig = {
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  scopes: string[]
  clientIdParameter: string
  tokenAuth: "basic" | "body"
  extraAuthorizationParameters?: Record<string, string>
}

export interface OAuthTokenSet {
  accessToken: string
  refreshToken: string | null
  expiresIn: number | null
  scope: string[]
  providerUserId: string | null
}

export function getOAuthProviderConfig(provider: PlatformProvider): OAuthProviderConfig | null {
  if (provider === "spotify" && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    return { clientId: process.env.SPOTIFY_CLIENT_ID, clientSecret: process.env.SPOTIFY_CLIENT_SECRET, authorizationUrl: "https://accounts.spotify.com/authorize", tokenUrl: "https://accounts.spotify.com/api/token", scopes: ["user-library-modify"], clientIdParameter: "client_id", tokenAuth: "basic", extraAuthorizationParameters: { show_dialog: "true" } }
  }
  if (provider === "youtube" && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"], clientIdParameter: "client_id", tokenAuth: "body", extraAuthorizationParameters: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" } }
  }
  if (provider === "tiktok" && process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
    return { clientId: process.env.TIKTOK_CLIENT_KEY, clientSecret: process.env.TIKTOK_CLIENT_SECRET, authorizationUrl: "https://www.tiktok.com/v2/auth/authorize/", tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/", scopes: ["user.info.basic", "video.upload"], clientIdParameter: "client_key", tokenAuth: "body" }
  }
  if (provider === "instagram" && process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET && process.env.INSTAGRAM_AUTHORIZATION_URL && process.env.INSTAGRAM_TOKEN_URL) {
    return { clientId: process.env.INSTAGRAM_CLIENT_ID, clientSecret: process.env.INSTAGRAM_CLIENT_SECRET, authorizationUrl: process.env.INSTAGRAM_AUTHORIZATION_URL, tokenUrl: process.env.INSTAGRAM_TOKEN_URL, scopes: ["instagram_business_basic", "instagram_business_content_publish"], clientIdParameter: "client_id", tokenAuth: "body" }
  }
  return null
}

export function buildAuthorizationUrl(provider: PlatformProvider, redirectUri: string, state: string): string {
  const config = getOAuthProviderConfig(provider)
  if (!config) throw new Error(`${provider} OAuth is not configured.`)
  const url = new URL(config.authorizationUrl)
  url.searchParams.set(config.clientIdParameter, config.clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", config.scopes.join(provider === "tiktok" ? "," : " "))
  url.searchParams.set("state", state)
  for (const [key, value] of Object.entries(config.extraAuthorizationParameters ?? {})) url.searchParams.set(key, value)
  return url.toString()
}

export async function exchangeAuthorizationCode(provider: PlatformProvider, code: string, redirectUri: string): Promise<OAuthTokenSet> {
  const config = getOAuthProviderConfig(provider)
  if (!config) throw new Error(`${provider} OAuth is not configured.`)
  const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri })
  const headers: HeadersInit = { "Content-Type": "application/x-www-form-urlencoded" }
  if (config.tokenAuth === "basic") headers.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`
  else {
    body.set(provider === "tiktok" ? "client_key" : "client_id", config.clientId)
    body.set("client_secret", config.clientSecret)
  }
  const response = await fetch(config.tokenUrl, { method: "POST", headers, body, cache: "no-store" })
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok || typeof payload.access_token !== "string") throw new Error(`${provider} token exchange failed.`)
  return {
    accessToken: payload.access_token,
    refreshToken: typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    expiresIn: typeof payload.expires_in === "number" ? payload.expires_in : null,
    scope: typeof payload.scope === "string" ? payload.scope.split(/[ ,]+/).filter(Boolean) : config.scopes,
    providerUserId: typeof payload.open_id === "string" ? payload.open_id : null,
  }
}

export async function refreshAuthorizationToken(provider: PlatformProvider, refreshToken: string): Promise<OAuthTokenSet> {
  const config = getOAuthProviderConfig(provider)
  if (!config) throw new Error(`${provider} OAuth is not configured.`)
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken })
  const headers: HeadersInit = { "Content-Type": "application/x-www-form-urlencoded" }
  if (config.tokenAuth === "basic") headers.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`
  else {
    body.set(provider === "tiktok" ? "client_key" : "client_id", config.clientId)
    body.set("client_secret", config.clientSecret)
  }
  const response = await fetch(config.tokenUrl, { method: "POST", headers, body, cache: "no-store" })
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok || typeof payload.access_token !== "string") throw new Error(`${provider} token refresh failed.`)
  return {
    accessToken: payload.access_token,
    refreshToken: typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    expiresIn: typeof payload.expires_in === "number" ? payload.expires_in : null,
    scope: typeof payload.scope === "string" ? payload.scope.split(/[ ,]+/).filter(Boolean) : config.scopes,
    providerUserId: typeof payload.open_id === "string" ? payload.open_id : null,
  }
}

export function isPlatformProvider(value: string): value is PlatformProvider {
  return ["spotify", "tiktok", "instagram", "youtube"].includes(value)
}
