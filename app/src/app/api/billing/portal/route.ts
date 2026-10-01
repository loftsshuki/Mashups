import { NextResponse } from "next/server"

import {
  createStripePortalSession,
  isStripeConfigured,
  resolveStripeCustomerId,
} from "@/lib/billing/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!isStripeConfigured() || !stripeSecret) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      return NextResponse.json({
        url: `${appUrl}/settings`,
        mode: "stub",
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY for live portal.",
      })
    }

    // Bind the portal to billing records this user actually owns (RLS limits these
    // reads to the caller's own rows). Previously the customer was looked up by
    // email, so changing your account email to someone else's could open their
    // billing portal.
    const references: string[] = []

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("provider_subscription_id")
      .eq("user_id", user.id)
      .not("provider_subscription_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(3)
    for (const row of (subscriptions ?? []) as { provider_subscription_id: string | null }[]) {
      if (row.provider_subscription_id) references.push(row.provider_subscription_id)
    }

    // Fallback: the user's own checkout sessions (covers payments whose
    // subscription row was never written by the webhook).
    const { data: sessions } = await supabase
      .from("checkout_sessions")
      .select("provider_session_id")
      .eq("user_id", user.id)
      .not("provider_session_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(5)
    for (const row of (sessions ?? []) as { provider_session_id: string | null }[]) {
      if (row.provider_session_id) references.push(row.provider_session_id)
    }

    let customerId: string | null = null
    for (const reference of references) {
      customerId = await resolveStripeCustomerId({ secretKey: stripeSecret, reference })
      if (customerId) break
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 404 },
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const session = await createStripePortalSession({
      secretKey: stripeSecret,
      customerId,
      returnUrl: `${appUrl}/settings`,
    })

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 502 },
      )
    }

    return NextResponse.json({ url: session.url, mode: "live" })
  } catch {
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    )
  }
}
