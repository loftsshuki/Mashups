import { NextRequest, NextResponse } from "next/server"
import { getCreativeProfile } from "@/lib/data/creative-profile"

interface StylePortrait {
  username: string
  archetype: string
  genres: { name: string; weight: number }[]
  avgBpmRange: [number, number]
  harmonicPreference: "major" | "minor" | "mixed"
  colorPalette: string[]
  stats: {
    totalMashups: number
    totalPlays: number
    avgDuration: number
    favInstrument: string
  }
}

const archetypeColors: Record<string, string[]> = {
  "The Genre Bender": ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"],
  "The Beatsmith": ["#f59e0b", "#ef4444", "#84cc16", "#6366f1"],
  "The Vibe Curator": ["#06b6d4", "#8b5cf6", "#10b981", "#f472b6"],
  "The Melodist": ["#ec4899", "#a855f7", "#3b82f6", "#f97316"],
  "The Experimentalist": ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 })
  }

  const profile = await getCreativeProfile(username)

  const portrait: StylePortrait = {
    username,
    archetype: profile.archetype,
    genres: profile.topGenres.slice(0, 5).map((g) => ({
      name: g.genre,
      weight: g.count,
    })),
    avgBpmRange: [profile.bpmRange.average - 10, profile.bpmRange.average + 10],
    harmonicPreference: profile.keyPreference.minor > profile.keyPreference.major
      ? "minor"
      : profile.keyPreference.major > profile.keyPreference.minor
        ? "major"
        : "mixed",
    colorPalette: archetypeColors[profile.archetype] ?? ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"],
    stats: {
      totalMashups: profile.totalMashups,
      totalPlays: 0,
      avgDuration: 210,
      favInstrument: profile.topInstruments[0]?.instrument ?? "synth",
    },
  }

  return NextResponse.json({ portrait })
}
