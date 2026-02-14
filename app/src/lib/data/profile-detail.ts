import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { getMockCreator, mockMashups, type MockMashup } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

export interface ProfileDetailCreator {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  followerCount: number
  mashupCount: number
  totalPlays: number
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function buildFallbackProfile(username: string): {
  creator: ProfileDetailCreator
  mashups: MockMashup[]
} | null {
  const mockCreator = getMockCreator(username)
  if (!mockCreator) return null

  const mashups = mockMashups.filter((mashup) => mashup.creator.username === mockCreator.username)
  return {
    creator: {
      id: mockCreator.username,
      username: mockCreator.username,
      displayName: mockCreator.displayName,
      avatarUrl: mockCreator.avatarUrl,
      bio: mockCreator.bio,
      followerCount: mockCreator.followerCount,
      mashupCount: mockCreator.mashupCount,
      totalPlays: mockCreator.totalPlays,
    },
    mashups,
  }
}

export async function getProfileDetailByUsername(username: string): Promise<{
  creator: ProfileDetailCreator
  mashups: MockMashup[]
} | null> {
  const fallback = buildFallbackProfile(username)
  if (!isSupabaseConfigured()) return fallback

  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url,bio")
      .eq("username", username)
      .maybeSingle()

    if (!profile) return fallback

    const profileId = typeof profile.id === "string" ? profile.id : ""
    if (!profileId) return fallback

    const { data: mashupRows, error } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `,
      )
      .eq("creator_id", profileId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error || !mashupRows) return fallback

    const mashups = (mashupRows as Record<string, unknown>[]).map((row) =>
      mapRowToMockMashup(row),
    )
    const totalPlays = mashups.reduce((sum, mashup) => sum + mashup.playCount, 0)

    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileId)
    const followerCount = count ?? 0

    return {
      creator: {
        id: profileId,
        username:
          typeof profile.username === "string" && profile.username.length > 0
            ? profile.username
            : username,
        displayName:
          typeof profile.display_name === "string" && profile.display_name.length > 0
            ? profile.display_name
            : username,
        avatarUrl:
          typeof profile.avatar_url === "string" && profile.avatar_url.length > 0
            ? profile.avatar_url
            : "https://placehold.co/100x100/7c3aed/white?text=MC",
        bio: typeof profile.bio === "string" ? profile.bio : "",
        followerCount,
        mashupCount: mashups.length,
        totalPlays,
      },
      mashups,
    }
  } catch {
    return fallback
  }
}
