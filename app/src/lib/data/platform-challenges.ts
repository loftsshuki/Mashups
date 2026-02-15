import type { PlatformChallenge, ChallengeType, ChallengeStatus } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockPlatformChallenges: PlatformChallenge[] = [
  {
    id: "pc-001",
    type: "flip",
    title: "The 5-Minute Flip",
    description: "Take these 3 stems and make something amazing in 5 minutes flat.",
    stem_ids: ["stem-001", "stem-002", "stem-003"],
    genre_pair: null,
    rules: { time_limit_seconds: 300, min_stems: 2 },
    starts_at: "2026-02-10T00:00:00Z",
    ends_at: "2026-02-17T23:59:59Z",
    max_entries: 200,
    prize_description: "Featured on homepage for a week",
    status: "active",
    created_at: "2026-02-09T00:00:00Z",
  },
  {
    id: "pc-002",
    type: "collision",
    title: "Baroque x Trap",
    description: "Harpsichords meet 808s. Vivaldi meets Future. Make it slap.",
    stem_ids: ["stem-003", "stem-004"],
    genre_pair: ["Baroque", "Trap"],
    rules: { must_include_genres: true },
    starts_at: "2026-02-01T00:00:00Z",
    ends_at: "2026-02-28T23:59:59Z",
    max_entries: null,
    prize_description: "Custom creator badge + $500",
    status: "active",
    created_at: "2026-01-30T00:00:00Z",
  },
  {
    id: "pc-003",
    type: "chain",
    title: "The Never-Ending Flip",
    description: "Each creator changes one element. How far can this chain go?",
    stem_ids: ["stem-001"],
    genre_pair: null,
    rules: { max_chain_length: 50, change_one_element: true },
    starts_at: "2026-02-14T00:00:00Z",
    ends_at: "2026-03-14T23:59:59Z",
    max_entries: 50,
    prize_description: "All participants get a Chain Champion badge",
    status: "upcoming",
    created_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "pc-004",
    type: "roulette",
    title: "Weekly Stem Roulette",
    description: "Spin the wheel, get 3 random stems, create something new.",
    stem_ids: [],
    genre_pair: null,
    rules: { random_stem_count: 3, time_limit_seconds: 300 },
    starts_at: "2026-02-10T00:00:00Z",
    ends_at: "2026-02-16T23:59:59Z",
    max_entries: null,
    prize_description: null,
    status: "active",
    created_at: "2026-02-09T00:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function getPlatformChallenges(options?: {
  type?: ChallengeType
  status?: ChallengeStatus
  limit?: number
}): Promise<PlatformChallenge[]> {
  if (!isSupabaseConfigured()) {
    let filtered = [...mockPlatformChallenges]
    if (options?.type) filtered = filtered.filter((c) => c.type === options.type)
    if (options?.status) filtered = filtered.filter((c) => c.status === options.status)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    let query = supabase.from("platform_challenges").select("*")
    if (options?.type) query = query.eq("type", options.type)
    if (options?.status) query = query.eq("status", options.status)
    query = query.order("created_at", { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error || !data) {
      console.error("Supabase getPlatformChallenges error, falling back to mock:", error)
      return mockPlatformChallenges
    }
    return data as PlatformChallenge[]
  } catch {
    return mockPlatformChallenges
  }
}

export async function getPlatformChallengeById(id: string): Promise<PlatformChallenge | null> {
  if (!isSupabaseConfigured()) {
    return mockPlatformChallenges.find((c) => c.id === id) ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("platform_challenges")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return mockPlatformChallenges.find((c) => c.id === id) ?? null
    }
    return data as PlatformChallenge
  } catch {
    return mockPlatformChallenges.find((c) => c.id === id) ?? null
  }
}

export async function getActiveChallenges(): Promise<PlatformChallenge[]> {
  return getPlatformChallenges({ status: "active" })
}

export { mockPlatformChallenges }
