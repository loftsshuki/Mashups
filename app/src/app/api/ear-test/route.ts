import { NextRequest, NextResponse } from "next/server"
import { getMashups } from "@/lib/data/mashups"

interface BlindMashup {
  id: string
  audioUrl: string
}

interface RevealedMashup {
  id: string
  title: string
  audioUrl: string
  genre: string
  creatorName: string
  playCount: number
  coverUrl: string | null
}

export async function GET(request: NextRequest) {
  const reveal = request.nextUrl.searchParams.get("reveal")

  // Get all mashups and pick 5 weighted toward lesser-known creators
  const allMashups = await getMashups()

  // Sort by play count ascending (lesser-known first) and take more from there
  const sorted = [...allMashups].sort((a, b) => a.play_count - b.play_count)

  // Pick 5: 3 from low play count, 2 from higher
  const lowPool = sorted.slice(0, Math.ceil(sorted.length * 0.6))
  const highPool = sorted.slice(Math.ceil(sorted.length * 0.6))

  function pickRandom<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const picked = [
    ...pickRandom(lowPool, Math.min(3, lowPool.length)),
    ...pickRandom(highPool, Math.min(2, highPool.length)),
  ].sort(() => Math.random() - 0.5) // Shuffle final order

  if (reveal === "true") {
    // Return full metadata
    const revealed: RevealedMashup[] = picked.map((m) => ({
      id: m.id,
      title: m.title,
      audioUrl: m.audio_url,
      genre: m.genre ?? "Various",
      creatorName: m.creator?.display_name ?? m.creator?.username ?? "Unknown",
      playCount: m.play_count,
      coverUrl: m.cover_image_url,
    }))
    return NextResponse.json({ mashups: revealed })
  }

  // Return blind — audio only
  const blind: BlindMashup[] = picked.map((m) => ({
    id: m.id,
    audioUrl: m.audio_url,
  }))

  return NextResponse.json({ mashups: blind })
}
