import { NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { buildAuthorizationUrl, isPlatformProvider } from "@/lib/growth-os/platform-oauth"
import { signOAuthState } from "@/lib/security/oauth-state"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  if (!isPlatformProvider(provider)) return NextResponse.json({ error: "Unsupported platform." }, { status: 404 })
  const requestUrl = new URL(request.url)
  if (isDemoRequest(request)) return NextResponse.redirect(new URL(`/network?demo=1&connected=${provider}`, requestUrl.origin))
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`/network?connect=${provider}`)}`, requestUrl.origin))

  try {
    const redirectUri = new URL(`/api/growth/connections/${provider}/callback`, requestUrl.origin).toString()
    const state = signOAuthState({ provider, userId: user.id, returnTo: "/network", issuedAt: Date.now() })
    return NextResponse.redirect(buildAuthorizationUrl(provider, redirectUri, state))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Platform connection unavailable." }, { status: 503 })
  }
}
