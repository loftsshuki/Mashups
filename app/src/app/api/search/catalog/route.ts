import { NextResponse } from "next/server"

import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { getMashups } from "@/lib/data/mashups"
import { mockCreators } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

interface SearchCreator {
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  followerCount: number
  mashupCount: number
  totalPlays: number
}

export async function GET() {
  try {
    const rows = await getMashups()
    const mashups = rows.map((row) =>
      mapRowToMockMashup(row as unknown as Record<string, unknown>),
    )

    let creators: SearchCreator[] = mockCreators

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const [{ data: profileRows }, { data: followRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,username,display_name,avatar_url,bio")
          .order("created_at", { ascending: false })
          .limit(400),
        supabase
          .from("follows")
          .select("following_id")
          .limit(8000),
      ])

      if (profileRows && profileRows.length > 0) {
        const followersById = new Map<string, number>()
        for (const row of (followRows as Record<string, unknown>[] | null) ?? []) {
          const id = typeof row.following_id === "string" ? row.following_id : null
          if (!id) continue
          followersById.set(id, (followersById.get(id) ?? 0) + 1)
        }

        const mashupStatsByCreator = new Map<
          string,
          { mashupCount: number; totalPlays: number }
        >()
        for (const mashup of mashups) {
          const key = mashup.creator.username
          const current = mashupStatsByCreator.get(key) ?? { mashupCount: 0, totalPlays: 0 }
          current.mashupCount += 1
          current.totalPlays += mashup.playCount
          mashupStatsByCreator.set(key, current)
        }

        creators = (profileRows as Record<string, unknown>[]).map((row) => {
          const username = typeof row.username === "string" ? row.username : "creator"
          const stats = mashupStatsByCreator.get(username) ?? { mashupCount: 0, totalPlays: 0 }
          return {
            username,
            displayName:
              typeof row.display_name === "string" && row.display_name.length > 0
                ? row.display_name
                : username,
            avatarUrl:
              typeof row.avatar_url === "string" && row.avatar_url.length > 0
                ? row.avatar_url
                : "https://placehold.co/100x100/7c3aed/white?text=CR",
            bio: typeof row.bio === "string" ? row.bio : "",
            followerCount:
              typeof row.id === "string" ? followersById.get(row.id) ?? 0 : 0,
            mashupCount: stats.mashupCount,
            totalPlays: stats.totalPlays,
          }
        })
      }
    }

    return NextResponse.json({ mashups, creators })
  } catch {
    return NextResponse.json({ error: "Failed to load search catalog." }, { status: 500 })
  }
}
