import { NextRequest, NextResponse } from "next/server"
import { mockStems } from "@/lib/data/stems-registry"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    // Mock: return simulated featured-in data
    const userStems = mockStems.filter((s) => s.creator_id === username)
    if (userStems.length === 0) {
      return NextResponse.json({ mashups: [] })
    }

    // Simulated mashups that used this creator's stems
    const mockFeatured = [
      {
        id: "mash-001",
        title: "Midnight Groove x Electric Dreams",
        playCount: 124500,
        creatorName: "Beat Alchemy",
      },
      {
        id: "mash-003",
        title: "Cloud Nine Sessions",
        playCount: 89200,
        creatorName: "SynthMaster",
      },
      {
        id: "mash-005",
        title: "Tokyo Drift Beats",
        playCount: 67800,
        creatorName: "Lo-Fi Lucy",
      },
    ]

    return NextResponse.json({ mashups: mockFeatured })
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Find mashups that use stems created by this user
    const { data, error } = await supabase
      .from("stem_mashup_links")
      .select(`
        mashup:mashups(id, title, play_count, creator:profiles!creator_id(display_name)),
        stem:stems!inner(creator_id)
      `)
      .eq("stem.creator_id", username)
      .limit(10)

    if (error || !data) {
      return NextResponse.json({ mashups: [] })
    }

    const mashups = data
      .map((row: Record<string, unknown>) => {
        const mashup = row.mashup as { id: string; title: string; play_count: number; creator: { display_name: string } | null } | null
        if (!mashup) return null
        return {
          id: mashup.id,
          title: mashup.title,
          playCount: mashup.play_count,
          creatorName: mashup.creator?.display_name ?? "Unknown",
        }
      })
      .filter(Boolean)

    return NextResponse.json({ mashups })
  } catch {
    return NextResponse.json({ mashups: [] })
  }
}
