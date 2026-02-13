import { NextResponse } from "next/server"
import { signAttributionLink } from "@/lib/attribution/signing"

interface SignBody {
  campaignId: string
  creatorId: string
  destination: string
  source?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignBody
    if (!body.campaignId || !body.creatorId || !body.destination) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const destinationWithSource = (() => {
      try {
        const url = new URL(body.destination)
        url.searchParams.set("utm_source", body.source ?? "mashups_signature")
        url.searchParams.set("utm_medium", "creator_campaign")
        url.searchParams.set("utm_campaign", body.campaignId)
        return url.toString()
      } catch {
        return body.destination
      }
    })()

    const token = signAttributionLink({
      campaignId: body.campaignId,
      creatorId: body.creatorId,
      destination: destinationWithSource,
      issuedAt: Date.now(),
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    return NextResponse.json({
      token,
      url: `${appUrl}/a/${token}`,
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
