import type { Crate, CrateStem } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockCrates: Crate[] = [
  {
    id: "crate-001",
    creator_id: "beatalchemy",
    title: "Late Night Vibes",
    description: "Smooth stems perfect for after-hours sessions",
    is_public: true,
    follower_count: 234,
    created_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "crate-002",
    creator_id: "lofilucy",
    title: "Dusty Vinyl Essentials",
    description: "Crackly, warm, lo-fi goodness",
    is_public: true,
    follower_count: 567,
    created_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "crate-003",
    creator_id: "synthmaster",
    title: "Retro Future Pack",
    description: "Synthwave and outrun essentials",
    is_public: true,
    follower_count: 891,
    created_at: "2026-01-22T00:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function getCrates(options?: {
  creatorId?: string
  isPublic?: boolean
  limit?: number
}): Promise<Crate[]> {
  if (!isSupabaseConfigured()) {
    let filtered = [...mockCrates]
    if (options?.creatorId) filtered = filtered.filter((c) => c.creator_id === options.creatorId)
    if (options?.isPublic !== undefined) filtered = filtered.filter((c) => c.is_public === options.isPublic)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    let query = supabase.from("crates").select("*, creator:profiles!creator_id(*)")
    if (options?.creatorId) query = query.eq("creator_id", options.creatorId)
    if (options?.isPublic !== undefined) query = query.eq("is_public", options.isPublic)
    query = query.order("created_at", { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error || !data) {
      console.error("Supabase getCrates error, falling back to mock:", error)
      return mockCrates
    }
    return data as Crate[]
  } catch {
    return mockCrates
  }
}

export async function getCrateById(id: string): Promise<Crate | null> {
  if (!isSupabaseConfigured()) {
    return mockCrates.find((c) => c.id === id) ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("crates")
      .select("*, creator:profiles!creator_id(*), stems:crate_stems(*, stem:stems(*, creator:profiles!creator_id(*)))")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Supabase getCrateById error, falling back to mock:", error)
      return mockCrates.find((c) => c.id === id) ?? null
    }
    return data as Crate
  } catch {
    return mockCrates.find((c) => c.id === id) ?? null
  }
}

export async function getCrateStemsByCrateId(crateId: string): Promise<CrateStem[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("crate_stems")
      .select("*, stem:stems(*, creator:profiles!creator_id(*)), added_by_user:profiles!added_by(*)")
      .eq("crate_id", crateId)
      .order("added_at", { ascending: false })

    if (error || !data) return []
    return data as CrateStem[]
  } catch {
    return []
  }
}

export { mockCrates }
