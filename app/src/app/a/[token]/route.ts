import { NextResponse } from "next/server"
import { verifyAttributionToken } from "@/lib/attribution/signing"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const payload = verifyAttributionToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
  }

  try {
    const supabase = await createClient()
    await supabase.from("recommendation_events").insert({
      user_id: null,
      mashup_id: null,
      event_type: "open",
      context: `campaign:${payload.campaignId}|creator:${payload.creatorId}`,
    })
  } catch {
    // Non-blocking attribution logging
  }

  return NextResponse.redirect(payload.destination)
}
