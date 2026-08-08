import "server-only"

import type { PlatformProvider } from "@/lib/growth-os/types"
import { refreshAuthorizationToken } from "@/lib/growth-os/platform-oauth"
import { decryptToken, encryptToken } from "@/lib/security/token-vault"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getValidPlatformAccessToken(userId: string, provider: PlatformProvider): Promise<string> {
  const admin = createAdminClient()
  if (!admin) throw new Error("Platform connection storage is unavailable.")
  const { data: connection, error } = await admin.from("platform_connections").select("encrypted_access_token,encrypted_refresh_token,expires_at,status").eq("user_id", userId).eq("provider", provider).maybeSingle()
  if (error || !connection || connection.status !== "connected") throw new Error(`Connect ${provider} first.`)
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : Number.POSITIVE_INFINITY
  if (expiresAt > Date.now() + 60_000) return decryptToken(connection.encrypted_access_token)
  if (!connection.encrypted_refresh_token) {
    await admin.from("platform_connections").update({ status: "action_required", updated_at: new Date().toISOString() }).eq("user_id", userId).eq("provider", provider)
    throw new Error(`Reconnect ${provider} to continue.`)
  }
  try {
    const currentRefreshToken = decryptToken(connection.encrypted_refresh_token)
    const refreshed = await refreshAuthorizationToken(provider, currentRefreshToken)
    const { error: updateError } = await admin.from("platform_connections").update({ encrypted_access_token: encryptToken(refreshed.accessToken), encrypted_refresh_token: refreshed.refreshToken ? encryptToken(refreshed.refreshToken) : connection.encrypted_refresh_token, expires_at: refreshed.expiresIn ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString() : null, scopes: refreshed.scope, status: "connected", last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("user_id", userId).eq("provider", provider)
    if (updateError) throw new Error("Unable to persist refreshed platform token.")
    return refreshed.accessToken
  } catch (refreshError) {
    await admin.from("platform_connections").update({ status: "action_required", updated_at: new Date().toISOString() }).eq("user_id", userId).eq("provider", provider)
    throw refreshError
  }
}
