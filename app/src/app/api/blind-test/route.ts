import { NextRequest, NextResponse } from "next/server"
import { getMashups } from "@/lib/data/mashups"

interface BlindTestPair {
  id: string
  trackA: { audioUrl: string; label: string }
  trackB: { audioUrl: string; label: string }
  // Hidden until vote
  answer?: {
    original: string
    mashup: string
    mashupCreator: string
    mashupTitle: string
    originalTitle: string
  }
}

export async function GET(request: NextRequest) {
  const reveal = request.nextUrl.searchParams.get("reveal") === "true"
  const mashups = await getMashups()

  // Pick a random mashup that has source tracks
  const withSources = mashups.filter((m) => m.source_tracks && m.source_tracks.length > 0)
  const mashup = withSources[Math.floor(Math.random() * withSources.length)] ?? mashups[0]

  const originalTrack = mashup.source_tracks?.[0]

  // Randomize which is A and B
  const mashupIsA = Math.random() > 0.5

  const pair: BlindTestPair = {
    id: `bt-${mashup.id}`,
    trackA: {
      audioUrl: mashup.audio_url,
      label: "Track A",
    },
    trackB: {
      audioUrl: mashup.audio_url,
      label: "Track B",
    },
  }

  if (reveal) {
    pair.answer = {
      original: mashupIsA ? "B" : "A",
      mashup: mashupIsA ? "A" : "B",
      mashupCreator: mashup.creator?.display_name ?? mashup.creator?.username ?? "Creator",
      mashupTitle: mashup.title,
      originalTitle: originalTrack?.title ?? "Original Track",
    }
  }

  return NextResponse.json({ pair, communityStats: { mashupPreferred: 43, totalVotes: 1247 } })
}
