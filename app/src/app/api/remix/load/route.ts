import { NextRequest, NextResponse } from "next/server"
import { loadStemsForRemix } from "@/lib/data/remix-loader"

export async function GET(request: NextRequest) {
  const mashupId = request.nextUrl.searchParams.get("mashupId")
  if (!mashupId) {
    return NextResponse.json({ error: "mashupId is required" }, { status: 400 })
  }

  const result = await loadStemsForRemix(mashupId)
  if (!result) {
    return NextResponse.json({ error: "Mashup not found" }, { status: 404 })
  }

  return NextResponse.json({
    mashupTitle: result.mashupTitle,
    creatorName: result.creatorName,
    stems: result.stems.map((s) => ({
      title: s.title,
      audio_url: s.audio_url,
      instrument: s.instrument,
      duration_ms: s.duration_ms,
    })),
  })
}
