import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const errorParam = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Use the app URL env var, falling back to request origin
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  console.log("[auth/callback] request url:", request.url)
  console.log("[auth/callback] code present:", !!code)
  console.log("[auth/callback] siteUrl:", siteUrl)
  console.log("[auth/callback] error:", errorParam, errorDescription)

  // Handle OAuth error from provider
  if (errorParam) {
    console.error("[auth/callback] OAuth error:", errorParam, errorDescription)
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(errorDescription || errorParam)}`
    )
  }

  if (!code) {
    console.error("[auth/callback] No code parameter in callback URL")
    return NextResponse.redirect(`${siteUrl}/login?error=no-auth-code`)
  }

  try {
    const supabase = await createClient()
    console.log("[auth/callback] Exchanging code for session...")

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth/callback] Exchange error:", error.message)
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(error.message)}`
      )
    }

    console.log("[auth/callback] Session exchanged successfully")

    // Create profile for OAuth users if one doesn't exist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      console.log("[auth/callback] User:", user.id, user.email)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!profile) {
        const username =
          user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`
        console.log("[auth/callback] Creating profile for:", username)
        await supabase.from("profiles").insert({
          id: user.id,
          username,
          display_name: user.user_metadata?.full_name || username,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
      }
    }

    console.log("[auth/callback] Redirecting to:", `${siteUrl}${next}`)
    return NextResponse.redirect(`${siteUrl}${next}`)
  } catch (err) {
    console.error("[auth/callback] Unexpected error:", err)
    return NextResponse.redirect(
      `${siteUrl}/login?error=callback-failed`
    )
  }
}
