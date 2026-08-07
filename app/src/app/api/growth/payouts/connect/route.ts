import { NextResponse } from "next/server"

import { createConnectOnboarding } from "@/lib/billing/connect"
import { isDemoRequest } from "@/lib/demo/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, url: "/network?demo=1&payout=ready", accountId: "acct_demo", demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe Connect is not configured." }, { status: 503 })
  const origin = new URL(request.url).origin
  try {
    const result = await createConnectOnboarding({ userId: user.id, email: user.email, returnUrl: `${origin}/network?payout=return`, refreshUrl: `${origin}/network?payout=refresh` })
    const admin = createAdminClient()
    if (!admin) throw new Error("Payout storage is unavailable.")
    const { error } = await admin.from("creator_payout_accounts").upsert({ user_id: user.id, provider: "stripe_connect", provider_account_id: result.accountId, onboarding_status: "pending", updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payout onboarding." }, { status: 502 })
  }
}
