import { NextResponse } from "next/server"

import {
  createStripePortalSession,
  findStripeCustomerByEmail,
  isStripeConfigured,
} from "@/lib/billing/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id || !user.email) {
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

    const customerId = await findStripeCustomerByEmail({
      secretKey: stripeSecret,
      email: user.email,
    })

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
