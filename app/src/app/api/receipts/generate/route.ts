import { NextRequest, NextResponse } from "next/server"
import { getMashupById } from "@/lib/data/mashups"

interface ReceiptData {
  mashupId: string
  title: string
  creators: { name: string; avatarUrl: string; role: string }[]
  duration: number
  playCount: number
  createdAt: string
  genre: string
}

export async function GET(request: NextRequest) {
  const mashupId = request.nextUrl.searchParams.get("mashupId")
  if (!mashupId) {
    return NextResponse.json({ error: "mashupId required" }, { status: 400 })
  }

  const mashup = await getMashupById(mashupId)
  if (!mashup) {
    return NextResponse.json({ error: "Mashup not found" }, { status: 404 })
  }

  // Build receipt data from mashup
  const receipt: ReceiptData = {
    mashupId: mashup.id,
    title: mashup.title,
    creators: [
      {
        name: mashup.creator?.display_name ?? mashup.creator?.username ?? "Creator",
        avatarUrl: mashup.creator?.avatar_url ?? "https://placehold.co/100x100/333/white?text=?",
        role: "Producer",
      },
    ],
    duration: mashup.duration ?? 0,
    playCount: mashup.play_count,
    createdAt: mashup.created_at,
    genre: mashup.genre ?? "Various",
  }

  // If there are source tracks, add original artists as collaborators
  if (mashup.source_tracks) {
    mashup.source_tracks.forEach((track) => {
      receipt.creators.push({
        name: track.artist,
        avatarUrl: "https://placehold.co/100x100/555/white?text=" + track.artist.charAt(0),
        role: `Original (${track.title})`,
      })
    })
  }

  return NextResponse.json({ receipt })
}
