import { createClient } from "@/lib/supabase/client"
import type { Mashup, Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockCreators: Record<string, Profile> = {
  "user-001": {
    id: "user-001",
    username: "beatmaker",
    display_name: "BeatMaker",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-01T00:00:00Z",
  },
  "user-002": {
    id: "user-002",
    username: "synthqueen",
    display_name: "SynthQueen",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-03T00:00:00Z",
  },
  "user-003": {
    id: "user-003",
    username: "lofilarry",
    display_name: "Lo-Fi Larry",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-05T00:00:00Z",
  },
  "user-004": {
    id: "user-004",
    username: "djnova",
    display_name: "DJ Nova",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-07T00:00:00Z",
  },
  "user-005": {
    id: "user-005",
    username: "traparchitect",
    display_name: "Trap Architect",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-09T00:00:00Z",
  },
  "user-006": {
    id: "user-006",
    username: "jazzfusion",
    display_name: "Jazz Fusion",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-11T00:00:00Z",
  },
  "user-007": {
    id: "user-007",
    username: "ambientdreamer",
    display_name: "Ambient Dreamer",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-13T00:00:00Z",
  },
  "user-008": {
    id: "user-008",
    username: "popremixer",
    display_name: "Pop Remixer",
    avatar_url: null,
    bio: null,
    created_at: "2026-01-15T00:00:00Z",
  },
}

const mockMashups: Mashup[] = [
  {
    id: "feed-001",
    title: "Midnight Groove",
    description: "Late night electronic vibes",
    creator_id: "user-001",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Electronic",
    bpm: 128,
    duration: 234,
    play_count: 12400,
    is_published: true,
    created_at: "2026-02-13T22:00:00Z",
    updated_at: "2026-02-13T22:00:00Z",
    creator: mockCreators["user-001"],
  },
  {
    id: "feed-002",
    title: "Neon Skyline",
    description: "Retro synths meet modern pop",
    creator_id: "user-002",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Pop",
    bpm: 120,
    duration: 198,
    play_count: 34200,
    is_published: true,
    created_at: "2026-02-13T18:30:00Z",
    updated_at: "2026-02-13T18:30:00Z",
    creator: mockCreators["user-002"],
  },
  {
    id: "feed-003",
    title: "Rainy Day Tape",
    description: "Chill lo-fi beats to study to",
    creator_id: "user-003",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Lo-Fi",
    bpm: 85,
    duration: 312,
    play_count: 8750,
    is_published: true,
    created_at: "2026-02-13T14:00:00Z",
    updated_at: "2026-02-13T14:00:00Z",
    creator: mockCreators["user-003"],
  },
  {
    id: "feed-004",
    title: "Bass Cathedral",
    description: "Deep house with cathedral reverb",
    creator_id: "user-004",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "House",
    bpm: 124,
    duration: 276,
    play_count: 50000,
    is_published: true,
    created_at: "2026-02-12T20:00:00Z",
    updated_at: "2026-02-12T20:00:00Z",
    creator: mockCreators["user-004"],
  },
  {
    id: "feed-005",
    title: "808 Warfare",
    description: "Hard-hitting trap with cinematic samples",
    creator_id: "user-005",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Trap",
    bpm: 140,
    duration: 185,
    play_count: 27600,
    is_published: true,
    created_at: "2026-02-12T16:00:00Z",
    updated_at: "2026-02-12T16:00:00Z",
    creator: mockCreators["user-005"],
  },
  {
    id: "feed-006",
    title: "Blue Note Flip",
    description: "Classic jazz samples chopped and flipped",
    creator_id: "user-006",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Jazz",
    bpm: 95,
    duration: 248,
    play_count: 4300,
    is_published: true,
    created_at: "2026-02-12T10:00:00Z",
    updated_at: "2026-02-12T10:00:00Z",
    creator: mockCreators["user-006"],
  },
  {
    id: "feed-007",
    title: "Floating Worlds",
    description: "Ethereal ambient textures and field recordings",
    creator_id: "user-007",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Ambient",
    bpm: 70,
    duration: 420,
    play_count: 1850,
    is_published: true,
    created_at: "2026-02-11T22:00:00Z",
    updated_at: "2026-02-11T22:00:00Z",
    creator: mockCreators["user-007"],
  },
  {
    id: "feed-008",
    title: "Summer Anthem Remix",
    description: "Chart-topping pop reworked with R&B vocals",
    creator_id: "user-008",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "R&B",
    bpm: 108,
    duration: 210,
    play_count: 41500,
    is_published: true,
    created_at: "2026-02-11T15:00:00Z",
    updated_at: "2026-02-11T15:00:00Z",
    creator: mockCreators["user-008"],
  },
  {
    id: "feed-009",
    title: "Distortion Protocol",
    description: "Industrial rock fused with glitch electronics",
    creator_id: "user-001",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Rock",
    bpm: 135,
    duration: 195,
    play_count: 15900,
    is_published: true,
    created_at: "2026-02-11T08:00:00Z",
    updated_at: "2026-02-11T08:00:00Z",
    creator: mockCreators["user-001"],
  },
  {
    id: "feed-010",
    title: "Velvet Frequencies",
    description: "Smooth hip-hop beats with soulful chops",
    creator_id: "user-005",
    audio_url: "",
    cover_image_url: "/api/placeholder/400/400",
    genre: "Hip-Hop",
    bpm: 90,
    duration: 264,
    play_count: 22100,
    is_published: true,
    created_at: "2026-02-10T19:00:00Z",
    updated_at: "2026-02-10T19:00:00Z",
    creator: mockCreators["user-005"],
  },
]

// IDs of creators the mock user "follows"
const mockFollowedCreatorIds = [
  "user-001",
  "user-003",
  "user-004",
  "user-006",
]

const mockGenres = [
  "Electronic",
  "Hip-Hop",
  "Pop",
  "R&B",
  "Rock",
  "Lo-Fi",
  "House",
  "Ambient",
  "Trap",
  "Jazz",
]

// ---------------------------------------------------------------------------
// getFollowingFeed
// ---------------------------------------------------------------------------

/**
 * Fetch mashups from creators the current user follows,
 * ordered by most recent first with pagination.
 */
export async function getFollowingFeed(
  options?: { page?: number; limit?: number; genre?: string }
): Promise<{ mashups: Mashup[]; hasMore: boolean }> {
  const page = options?.page ?? 0
  const limit = options?.limit ?? 10
  const genre = options?.genre

  if (!isSupabaseConfigured()) {
    let results = mockMashups.filter((m) =>
      mockFollowedCreatorIds.includes(m.creator_id)
    )
    if (genre) {
      results = results.filter((m) => m.genre === genre)
    }
    const start = page * limit
    const paginated = results.slice(start, start + limit)
    return { mashups: paginated, hasMore: start + limit < results.length }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { mashups: [], hasMore: false }
    }

    // Get the list of user IDs the current user follows
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)

    if (!follows || follows.length === 0) {
      return { mashups: [], hasMore: false }
    }

    const followingIds = follows.map((f: { following_id: string }) => f.following_id)

    const from = page * limit
    const to = from + limit

    let query = supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .in("creator_id", followingIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (genre) {
      query = query.eq("genre", genre)
    }

    const { data, error } = await query

    if (error || !data) {
      return { mashups: [], hasMore: false }
    }

    const mashups: Mashup[] = data.map((row: Record<string, unknown>) => ({
      ...(row as unknown as Mashup),
      creator: (row.creator as Mashup["creator"]) ?? undefined,
      source_tracks: (row.source_tracks as Mashup["source_tracks"]) ?? undefined,
      like_count:
        ((row.like_count as Array<{ count: number | null }>) ?? [])[0]?.count ?? 0,
      comment_count:
        ((row.comment_count as Array<{ count: number | null }>) ?? [])[0]?.count ?? 0,
    }))

    // We fetched limit+1 rows to check hasMore
    return { mashups: mashups.slice(0, limit), hasMore: data.length > limit }
  } catch {
    return { mashups: [], hasMore: false }
  }
}

// ---------------------------------------------------------------------------
// getForYouFeed
// ---------------------------------------------------------------------------

/**
 * Algorithmic "For You" feed — a mix of trending (high play_count recently),
 * genre-matched, and recent mashups.
 */
export async function getForYouFeed(
  options?: { page?: number; limit?: number; genre?: string }
): Promise<{ mashups: Mashup[]; hasMore: boolean }> {
  const page = options?.page ?? 0
  const limit = options?.limit ?? 10
  const genre = options?.genre

  if (!isSupabaseConfigured()) {
    let results = [...mockMashups].sort((a, b) => {
      // Blend of recency and popularity
      const recencyA = new Date(a.created_at).getTime()
      const recencyB = new Date(b.created_at).getTime()
      const scoreA = a.play_count * 0.4 + recencyA * 0.0000006
      const scoreB = b.play_count * 0.4 + recencyB * 0.0000006
      return scoreB - scoreA
    })
    if (genre) {
      results = results.filter((m) => m.genre === genre)
    }
    const start = page * limit
    const paginated = results.slice(start, start + limit)
    return { mashups: paginated, hasMore: start + limit < results.length }
  }

  try {
    const supabase = createClient()

    // Trending window: mashups from the last 14 days
    const trendingCutoff = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString()

    const from = page * limit
    const to = from + limit

    let query = supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `
      )
      .eq("is_published", true)
      .gte("created_at", trendingCutoff)
      .order("play_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (genre) {
      query = query.eq("genre", genre)
    }

    const { data, error } = await query

    if (error || !data) {
      return { mashups: [], hasMore: false }
    }

    const mashups: Mashup[] = data.map((row: Record<string, unknown>) => ({
      ...(row as unknown as Mashup),
      creator: (row.creator as Mashup["creator"]) ?? undefined,
      source_tracks: (row.source_tracks as Mashup["source_tracks"]) ?? undefined,
      like_count:
        ((row.like_count as Array<{ count: number | null }>) ?? [])[0]?.count ?? 0,
      comment_count:
        ((row.comment_count as Array<{ count: number | null }>) ?? [])[0]?.count ?? 0,
    }))

    return { mashups: mashups.slice(0, limit), hasMore: data.length > limit }
  } catch {
    return { mashups: [], hasMore: false }
  }
}

// ---------------------------------------------------------------------------
// getFeedGenres
// ---------------------------------------------------------------------------

/**
 * Returns available genres for feed filtering.
 */
export async function getFeedGenres(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return mockGenres
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("mashups")
      .select("genre")
      .eq("is_published", true)
      .not("genre", "is", null)

    if (error || !data) {
      return mockGenres
    }

    const genres: string[] = [
      ...new Set<string>(
        data
          .map((row: { genre: string | null }) => row.genre)
          .filter((g: string | null): g is string => !!g)
      ),
    ].sort()

    return genres.length > 0 ? genres : mockGenres
  } catch {
    return mockGenres
  }
}
