import { NextResponse } from "next/server"

import { exchangeAuthorizationCode, isPlatformProvider } from "@/lib/growth-os/platform-oauth"
import { encryptToken } from "@/lib/security/token-vault"
import { verifyOAuthState } from "@/lib/security/oauth-state"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const url = new URL(request.url)
  if (!isPlatformProvider(provider)) return NextResponse.redirect(new URL("/network?connection_error=provider", url.origin))
  const code = url.searchParams.get("code")
  const stateToken = url.searchParams.get("state")
  if (!code || !stateToken) return NextResponse.redirect(new URL(`/network?connection_error=${provider}`, url.origin))

  try {
    const state = verifyOAuthState(stateToken)
    if (state.provider !== provider || !state.returnTo.startsWith("/")) throw new Error("OAuth state mismatch.")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== state.userId) throw new Error("OAuth session mismatch.")
    const redirectUri = new URL(`/api/growth/connections/${provider}/callback`, url.origin).toString()
    const token = await exchangeAuthorizationCode(provider, code, redirectUri)
    const admin = createAdminClient()
    if (!admin) throw new Error("Connection storage is unavailable.")
    const expiresAt = token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000).toISOString() : null
    const { error } = await admin.from("platform_connections").upsert({
      user_id: user.id,
      provider,
      provider_user_id: token.providerUserId,
      status: "connected",
      scopes: token.scope,
      encrypted_access_token: encryptToken(token.accessToken),
      encrypted_refresh_token: token.refreshToken ? encryptToken(token.refreshToken) : null,
      expires_at: expiresAt,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" })
    if (error) throw new Error(error.message)
    return NextResponse.redirect(new URL(`${state.returnTo}?connected=${provider}`, url.origin))
  } catch (error) {
    console.error(`[GrowthOS] ${provider} OAuth callback failed:`, error instanceof Error ? error.message : error)
    return NextResponse.redirect(new URL(`/network?connection_error=${provider}`, url.origin))
  }
}
