import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface CheckoutBody {
  sessionType: "subscription" | "license"
  targetId: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody
    if (!body.sessionType || !body.targetId) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const fakeProviderSessionId = `cs_test_${randomUUID().replace(/-/g, "")}`
    const sessionId = randomUUID()

    if (user?.id) {
      await supabase.from("checkout_sessions").insert({
        id: sessionId,
        user_id: user.id,
        session_type: body.sessionType,
        target_id: body.targetId,
        provider: "stripe",
        provider_session_id: fakeProviderSessionId,
        status: "pending",
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const checkoutUrl = `${appUrl}/dashboard/monetization?checkout=${fakeProviderSessionId}`

    return NextResponse.json({
      checkoutUrl,
      providerSessionId: fakeProviderSessionId,
      mode: "stub",
      message:
        "Stripe SDK not wired yet. Replace with real Checkout Session creation in production.",
    })
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
