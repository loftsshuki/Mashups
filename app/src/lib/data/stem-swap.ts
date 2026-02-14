import { createClient } from "@/lib/supabase/client"
import type { StemSwapKit, StemSwapJob } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Constants ──

export const STEM_TYPES = ["drums", "bass", "vocals", "synths", "guitar", "other"] as const
export const SWAP_GENRES = ["Lo-Fi", "Techno", "Rock", "Trap", "Jazz", "Future Bass", "House", "Ambient"] as const

// ── Mock Data ──

const mockKits: StemSwapKit[] = [
  {
    id: "kit-lofi-drums",
    name: "Lo-Fi Drums",
    description: "Dusty, vinyl-crackle drum patterns with lazy swing and tape-saturated hits",
    genre: "Lo-Fi",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 70,
    bpm_range_max: 95,
    is_system: true,
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "kit-lofi-bass",
    name: "Lo-Fi Bass",
    description: "Warm, muted bass lines with subtle wobble and analog character",
    genre: "Lo-Fi",
    stem_type: "bass",
    audio_url: null,
    bpm_range_min: 70,
    bpm_range_max: 95,
    is_system: true,
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "kit-techno-drums",
    name: "Warehouse Techno Drums",
    description: "Pounding four-on-the-floor kicks with industrial hi-hats and cavernous reverb",
    genre: "Techno",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 125,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "kit-techno-synths",
    name: "Warehouse Techno Synths",
    description: "Dark, modular synth stabs and evolving acid lines for peak-time sets",
    genre: "Techno",
    stem_type: "synths",
    audio_url: null,
    bpm_range_min: 125,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "kit-rock-drums",
    name: "Indie Rock Drums",
    description: "Live-room drum kit with natural room mics and dynamic fills",
    genre: "Rock",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 100,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-14T00:00:00Z",
  },
  {
    id: "kit-rock-guitar",
    name: "Indie Rock Guitar",
    description: "Jangly clean tones and overdriven power chords with pedal-board textures",
    genre: "Rock",
    stem_type: "guitar",
    audio_url: null,
    bpm_range_min: 100,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-14T00:00:00Z",
  },
  {
    id: "kit-trap-hihats",
    name: "Atlanta Trap Hi-Hats",
    description: "Rapid-fire hi-hat rolls with pitch bends and ghost-note triplets",
    genre: "Trap",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 130,
    bpm_range_max: 160,
    is_system: true,
    created_at: "2026-01-16T00:00:00Z",
  },
  {
    id: "kit-trap-808",
    name: "Atlanta Trap 808",
    description: "Deep sliding 808 bass with long sustain and distortion options",
    genre: "Trap",
    stem_type: "bass",
    audio_url: null,
    bpm_range_min: 130,
    bpm_range_max: 160,
    is_system: true,
    created_at: "2026-01-16T00:00:00Z",
  },
  {
    id: "kit-jazz-drums",
    name: "Jazz Brush Drums",
    description: "Soft brush patterns on snare with ride cymbal swing and tasteful kick accents",
    genre: "Jazz",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 80,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "kit-jazz-bass",
    name: "Jazz Upright Bass",
    description: "Walking upright bass lines with natural finger tone and expressive slides",
    genre: "Jazz",
    stem_type: "bass",
    audio_url: null,
    bpm_range_min: 80,
    bpm_range_max: 140,
    is_system: true,
    created_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "kit-futurebass-synth",
    name: "Future Bass Synth",
    description: "Wobbly supersaw chords with sidechain pumping and bright pluck leads",
    genre: "Future Bass",
    stem_type: "synths",
    audio_url: null,
    bpm_range_min: 140,
    bpm_range_max: 160,
    is_system: true,
    created_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "kit-futurebass-drums",
    name: "Future Bass Drums",
    description: "Punchy snare-forward patterns with glitchy fills and pitched percussion",
    genre: "Future Bass",
    stem_type: "drums",
    audio_url: null,
    bpm_range_min: 140,
    bpm_range_max: 160,
    is_system: true,
    created_at: "2026-01-20T00:00:00Z",
  },
]

const mockJobs: StemSwapJob[] = [
  {
    id: "job-001",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    kit_id: "kit-lofi-drums",
    target_stem: "drums",
    status: "completed",
    input_url: "/audio/original-drums.mp3",
    output_url: "/audio/swapped-lofi-drums.mp3",
    settings: { crossfade: true, matchBpm: true },
    started_at: "2026-02-12T14:00:00Z",
    completed_at: "2026-02-12T14:02:30Z",
    created_at: "2026-02-12T14:00:00Z",
    kit: mockKits.find((k) => k.id === "kit-lofi-drums"),
  },
  {
    id: "job-002",
    user_id: "mock-user",
    mashup_id: "mashup-002",
    kit_id: "kit-trap-808",
    target_stem: "bass",
    status: "completed",
    input_url: "/audio/original-bass.mp3",
    output_url: "/audio/swapped-trap-808.mp3",
    settings: { crossfade: true, matchBpm: true },
    started_at: "2026-02-13T10:30:00Z",
    completed_at: "2026-02-13T10:33:00Z",
    created_at: "2026-02-13T10:30:00Z",
    kit: mockKits.find((k) => k.id === "kit-trap-808"),
  },
]

// ── Data Functions ──

export async function getStemSwapKits(
  options?: { genre?: string; stemType?: string },
): Promise<StemSwapKit[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockKits]
    if (options?.genre) results = results.filter((k) => k.genre === options.genre)
    if (options?.stemType) results = results.filter((k) => k.stem_type === options.stemType)
    return results
  }

  try {
    const supabase = createClient()
    let query = supabase.from("stem_swap_kits").select("*")

    if (options?.genre) query = query.eq("genre", options.genre)
    if (options?.stemType) query = query.eq("stem_type", options.stemType)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error || !data) return []
    return data as StemSwapKit[]
  } catch {
    return []
  }
}

export async function getStemSwapKitById(id: string): Promise<StemSwapKit | null> {
  if (!isSupabaseConfigured()) return mockKits.find((k) => k.id === id) ?? null

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("stem_swap_kits")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as StemSwapKit
  } catch {
    return null
  }
}

export async function startStemSwap(
  mashupId: string,
  kitId: string,
  targetStem: string,
): Promise<{ job?: StemSwapJob; error?: string }> {
  if (!isSupabaseConfigured()) {
    const kit = mockKits.find((k) => k.id === kitId)
    return {
      job: {
        id: `job-${Date.now()}`,
        user_id: "mock-user",
        mashup_id: mashupId,
        kit_id: kitId,
        target_stem: targetStem,
        status: "processing",
        input_url: `/audio/original-${targetStem}.mp3`,
        output_url: null,
        settings: { crossfade: true, matchBpm: true },
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        kit: kit,
      },
    }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("stem_swap_jobs")
      .insert({
        user_id: user.id,
        mashup_id: mashupId,
        kit_id: kitId,
        target_stem: targetStem,
        status: "pending",
        settings: { crossfade: true, matchBpm: true },
      })
      .select("*, kit:stem_swap_kits(*)")
      .single()

    if (error || !data) return { error: error?.message ?? "Failed to start stem swap" }
    return { job: data as StemSwapJob }
  } catch {
    return { error: "Failed to start stem swap" }
  }
}

export async function getStemSwapJobs(userId: string): Promise<StemSwapJob[]> {
  if (!isSupabaseConfigured()) return mockJobs.filter((j) => j.user_id === userId)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("stem_swap_jobs")
      .select("*, kit:stem_swap_kits(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as StemSwapJob[]
  } catch {
    return []
  }
}

export async function getStemSwapJobById(jobId: string): Promise<StemSwapJob | null> {
  if (!isSupabaseConfigured()) return mockJobs.find((j) => j.id === jobId) ?? null

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("stem_swap_jobs")
      .select("*, kit:stem_swap_kits(*)")
      .eq("id", jobId)
      .single()

    if (error || !data) return null
    return data as StemSwapJob
  } catch {
    return null
  }
}

export function getAvailableGenres(): string[] {
  const genres = mockKits.map((k) => k.genre)
  return [...new Set(genres)]
}

export function getAvailableStemTypes(): string[] {
  return ["drums", "bass", "vocals", "synths", "guitar", "other"]
}
