import type { Stem, StemMashupLink, StemUsageLog } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockStems: Stem[] = [
  {
    id: "stem-001",
    creator_id: "beatalchemy",
    title: "Velvet Vocal Chop",
    instrument: "vocal",
    genre: "R&B",
    bpm: 90,
    key: "Am",
    duration_ms: 8000,
    audio_url: "/audio/stems/vocal-chop-1.mp3",
    waveform_data: null,
    tags: ["vocal", "chop", "soulful"],
    source: "upload",
    play_count: 3200,
    usage_count: 47,
    created_at: "2026-01-10T12:00:00Z",
  },
  {
    id: "stem-002",
    creator_id: "lofilucy",
    title: "Dusty Lo-fi Drums",
    instrument: "drums",
    genre: "Lo-fi",
    bpm: 85,
    key: null,
    duration_ms: 16000,
    audio_url: "/audio/stems/lofi-drums-1.mp3",
    waveform_data: null,
    tags: ["drums", "lofi", "dusty", "vinyl"],
    source: "recorded",
    play_count: 5600,
    usage_count: 89,
    created_at: "2026-01-08T14:30:00Z",
  },
  {
    id: "stem-003",
    creator_id: "synthmaster",
    title: "Neon Arp Synth",
    instrument: "synth",
    genre: "Synthwave",
    bpm: 120,
    key: "Cm",
    duration_ms: 12000,
    audio_url: "/audio/stems/neon-arp-1.mp3",
    waveform_data: null,
    tags: ["synth", "arp", "neon", "retro"],
    source: "upload",
    play_count: 4100,
    usage_count: 62,
    created_at: "2026-01-12T09:00:00Z",
  },
  {
    id: "stem-004",
    creator_id: "bassqueen",
    title: "808 Glide Bass",
    instrument: "bass",
    genre: "Trap",
    bpm: 140,
    key: "F#",
    duration_ms: 4000,
    audio_url: "/audio/stems/808-glide-1.mp3",
    waveform_data: null,
    tags: ["808", "bass", "glide", "trap"],
    source: "upload",
    play_count: 8900,
    usage_count: 134,
    created_at: "2026-01-05T18:00:00Z",
  },
  {
    id: "stem-005",
    creator_id: "beatalchemy",
    title: "Rain Ambience Texture",
    instrument: "texture",
    genre: "Ambient",
    bpm: null,
    key: null,
    duration_ms: 30000,
    audio_url: "/audio/stems/rain-texture-1.mp3",
    waveform_data: null,
    tags: ["texture", "rain", "ambient", "atmosphere"],
    source: "recorded",
    play_count: 1200,
    usage_count: 23,
    created_at: "2026-01-15T22:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function getStems(options?: {
  instrument?: string
  genre?: string
  source?: string
  limit?: number
}): Promise<Stem[]> {
  if (!isSupabaseConfigured()) {
    let filtered = [...mockStems]
    if (options?.instrument) filtered = filtered.filter((s) => s.instrument === options.instrument)
    if (options?.genre) filtered = filtered.filter((s) => s.genre === options.genre)
    if (options?.source) filtered = filtered.filter((s) => s.source === options.source)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    let query = supabase.from("stems").select("*, creator:profiles!creator_id(*)")
    if (options?.instrument) query = query.eq("instrument", options.instrument)
    if (options?.genre) query = query.eq("genre", options.genre)
    if (options?.source) query = query.eq("source", options.source)
    query = query.order("created_at", { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error || !data) {
      console.error("Supabase getStems error, falling back to mock:", error)
      return mockStems
    }
    return data as Stem[]
  } catch {
    return mockStems
  }
}

export async function getStemById(id: string): Promise<Stem | null> {
  if (!isSupabaseConfigured()) {
    return mockStems.find((s) => s.id === id) ?? null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("stems")
      .select("*, creator:profiles!creator_id(*)")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Supabase getStemById error, falling back to mock:", error)
      return mockStems.find((s) => s.id === id) ?? null
    }
    return data as Stem
  } catch {
    return mockStems.find((s) => s.id === id) ?? null
  }
}

export async function getStemsByCreator(creatorId: string): Promise<Stem[]> {
  if (!isSupabaseConfigured()) {
    return mockStems.filter((s) => s.creator_id === creatorId)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("stems")
      .select("*, creator:profiles!creator_id(*)")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("Supabase getStemsByCreator error, falling back to mock:", error)
      return mockStems.filter((s) => s.creator_id === creatorId)
    }
    return data as Stem[]
  } catch {
    return mockStems.filter((s) => s.creator_id === creatorId)
  }
}

export async function getRandomStems(count: number): Promise<Stem[]> {
  if (!isSupabaseConfigured()) {
    const shuffled = [...mockStems].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Fetch more than needed and randomly pick
    const { data, error } = await supabase
      .from("stems")
      .select("*, creator:profiles!creator_id(*)")
      .limit(count * 3)

    if (error || !data || data.length === 0) {
      const shuffled = [...mockStems].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }

    const shuffled = [...data].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count) as Stem[]
  } catch {
    const shuffled = [...mockStems].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}

export async function getStemsForMashup(mashupId: string): Promise<Stem[]> {
  if (!isSupabaseConfigured()) {
    // Return first 3 mock stems as a simulation
    return mockStems.slice(0, 3)
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("stem_mashup_links")
      .select("stem_id, track_number, stem:stems(*, creator:profiles!creator_id(*))")
      .eq("mashup_id", mashupId)
      .order("track_number")

    if (error || !data) {
      return mockStems.slice(0, 3)
    }

    return data
      .map((row: Record<string, unknown>) => row.stem as Stem)
      .filter(Boolean)
  } catch {
    return mockStems.slice(0, 3)
  }
}

export async function getStemUsageLog(stemId: string): Promise<StemUsageLog[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("stem_usage_log")
      .select("*")
      .eq("stem_id", stemId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as StemUsageLog[]
  } catch {
    return []
  }
}

// Re-export mock data for other modules
export { mockStems }
