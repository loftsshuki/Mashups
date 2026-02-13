import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const expectedSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!expectedSecret || !signature) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook secret or signature missing. Configure STRIPE_WEBHOOK_SECRET and verify signatures.",
      },
      { status: 400 },
    )
  }

  // Stub endpoint: replace with Stripe event verification and persistence updates.
  return NextResponse.json({
    ok: true,
    mode: "stub",
    message: "Webhook received. Production verification logic pending.",
  })
}
