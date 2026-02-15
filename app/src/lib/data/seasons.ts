import type { Season, SeasonStatus } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockSeasons: Season[] = [
  {
    id: "season-001",
    name: "Neon Genesis",
    theme: "retro-future",
    description: "A season of synthwave, retrowave, and neon-lit sonic landscapes. Channel the 80s that never were.",
    stem_pack_ids: ["stem-003"],
    collective_goal: 100000,
    current_count: 42847,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2026-03-31T23:59:59Z",
    status: "active",
  },
  {
    id: "season-002",
    name: "Roots & Routes",
    theme: "world-fusion",
    description: "Explore world music traditions and create unexpected fusions. From Afrobeat to Zydeco.",
    stem_pack_ids: [],
    collective_goal: 100000,
    current_count: 0,
    starts_at: "2026-04-01T00:00:00Z",
    ends_at: "2026-06-30T23:59:59Z",
    status: "upcoming",
  },
]

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function getSeasons(options?: {
  status?: SeasonStatus
  limit?: number
}): Promise<Season[]> {
  if (!isSupabaseConfigured()) {
    let filtered = [...mockSeasons]
    if (options?.status) filtered = filtered.filter((s) => s.status === options.status)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    let query = supabase.from("seasons").select("*")
    if (options?.status) query = query.eq("status", options.status)
    query = query.order("starts_at", { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error || !data) {
      console.error("Supabase getSeasons error, falling back to mock:", error)
      return mockSeasons
    }
    return data as Season[]
  } catch {
    return mockSeasons
  }
}

export async function getCurrentSeason(): Promise<Season | null> {
  if (!isSupabaseConfigured()) {
    return mockSeasons.find((s) => s.status === "active") ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("status", "active")
      .single()

    if (error || !data) {
      return mockSeasons.find((s) => s.status === "active") ?? null
    }
    return data as Season
  } catch {
    return mockSeasons.find((s) => s.status === "active") ?? null
  }
}

export async function getSeasonById(id: string): Promise<Season | null> {
  if (!isSupabaseConfigured()) {
    return mockSeasons.find((s) => s.id === id) ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return mockSeasons.find((s) => s.id === id) ?? null
    }
    return data as Season
  } catch {
    return mockSeasons.find((s) => s.id === id) ?? null
  }
}

export { mockSeasons }
