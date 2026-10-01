import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { buildAuthPath, safeReturnPath } from "@/lib/auth/return-path"
import { ensureProfile } from "@/lib/auth/ensure-profile"
import { logServerEvent } from "@/lib/observability/logger"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next = safeReturnPath(requestUrl.searchParams.get("next"))
  const failure = `${buildAuthPath("login", next)}&error=callback_failed`
  const code = requestUrl.searchParams.get("code")
  if (requestUrl.searchParams.has("error") || !code) return redirectWithinApp(failure)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.user) {
      logServerEvent("warn", "auth_callback_failed", { code: error?.code ?? "missing_user" })
      return redirectWithinApp(failure)
    }
    if (!await ensureProfile(supabase, data.user)) {
      logServerEvent("warn", "auth_profile_unavailable")
      return redirectWithinApp(failure)
    }
    return redirectWithinApp(next)
  } catch {
    logServerEvent("warn", "auth_callback_unavailable")
    return redirectWithinApp(failure)
  }
}

function redirectWithinApp(path: string) {
  // A relative Location keeps cookies and device drafts on the initiating host,
  // including previews behind a reverse proxy. Every destination is built above
  // from a validated internal path, never from forwarded host headers.
  return new NextResponse(null, { status: 307, headers: { Location: path, "Cache-Control": "no-store" } })
}
