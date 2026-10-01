import "server-only"

import { NextResponse } from "next/server"
import type { GreenProjectErrorCode } from "@mashups/contracts"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export function projectError(code: GreenProjectErrorCode, error: string, status: number) {
  return NextResponse.json({ code, error }, { status, headers: { "Cache-Control": "no-store" } })
}

export async function getProjectContext(request: Request) {
  const admin = createAdminClient()
  if (!admin) return { response: projectError("unavailable", "Account saves are temporarily unavailable.", 503) }
  try {
    const supabase = await createClient()
    const authorization = request.headers.get("authorization")
    if (authorization && !/^Bearer \S+$/i.test(authorization)) return { response: projectError("unauthenticated", "Sign in to access your saved mashups.", 401) }
    const token = authorization?.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error && (error.status === 0 || error.status >= 500)) return { response: projectError("unavailable", "Sign-in is temporarily unavailable.", 503) }
    if (!user) return { response: projectError("unauthenticated", "Sign in to access your saved mashups.", 401) }
    return { admin, user }
  } catch {
    return { response: projectError("unavailable", "Account saves are temporarily unavailable.", 503) }
  }
}
