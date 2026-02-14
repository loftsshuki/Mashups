import { createClient } from "@/lib/supabase/client"
import type { StylePreset, StyleTransferJob } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Constants ──

export const STYLE_TARGET_STEMS = ["full_mix", "vocals", "drums", "bass", "synths"] as const

export const STYLE_INTENSITY_LEVELS = [
  { value: 0.25, label: "Subtle" },
  { value: 0.5, label: "Moderate" },
  { value: 0.75, label: "Strong" },
  { value: 1.0, label: "Full" },
] as const

// ── Mock Data ──

const mockPresets: StylePreset[] = [
  {
    id: "sp-daft-punk",
    name: "Daft Punk",
    description: "French house filters + vocoder",
    artist_reference: "Daft Punk",
    genre: "Electronic",
    style_embedding: { filters: "resonant_lowpass", vocoder: 0.85, sidechain: 0.7, compression: "pumping" },
    preview_url: "/audio/style-preview/daft-punk.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-billie-eilish",
    name: "Billie Eilish",
    description: "Whispered intimacy + deep bass",
    artist_reference: "Billie Eilish",
    genre: "Pop",
    style_embedding: { whisper: 0.9, sub_bass: 0.95, intimacy: 0.85, space: "close_mic" },
    preview_url: "/audio/style-preview/billie-eilish.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-travis-scott",
    name: "Travis Scott",
    description: "Heavy autotune + dark reverb",
    artist_reference: "Travis Scott",
    genre: "Hip-Hop",
    style_embedding: { autotune: 0.95, reverb: "dark_hall", distortion: 0.4, ad_libs: true },
    preview_url: "/audio/style-preview/travis-scott.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-tame-impala",
    name: "Tame Impala",
    description: "Phaser + tape saturation",
    artist_reference: "Tame Impala",
    genre: "Psychedelic",
    style_embedding: { phaser: 0.8, tape_saturation: 0.75, chorus: 0.6, stereo_width: "wide" },
    preview_url: "/audio/style-preview/tame-impala.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-aphex-twin",
    name: "Aphex Twin",
    description: "Granular glitch + complex rhythms",
    artist_reference: "Aphex Twin",
    genre: "IDM",
    style_embedding: { granular: 0.9, glitch: 0.85, rhythm_complexity: 0.95, time_stretch: "extreme" },
    preview_url: "/audio/style-preview/aphex-twin.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-frank-ocean",
    name: "Frank Ocean",
    description: "Lush pads + pitched vocals",
    artist_reference: "Frank Ocean",
    genre: "R&B",
    style_embedding: { pads: "lush_analog", pitch_shift: 0.3, warmth: 0.85, reverb: "plate" },
    preview_url: "/audio/style-preview/frank-ocean.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-burial",
    name: "Burial",
    description: "Vinyl crackle + pitched-down vocals",
    artist_reference: "Burial",
    genre: "UK Garage",
    style_embedding: { vinyl_crackle: 0.8, pitch_down: 0.7, reverb: "dark_space", shuffle: 0.65 },
    preview_url: "/audio/style-preview/burial.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "sp-flume",
    name: "Flume",
    description: "Granular synthesis + heavy sidechain",
    artist_reference: "Flume",
    genre: "Future Bass",
    style_embedding: { granular_synth: 0.85, sidechain: 0.9, glitch_hop: 0.6, texture: "metallic" },
    preview_url: "/audio/style-preview/flume.mp3",
    is_system: true,
    created_at: "2026-01-15T00:00:00Z",
  },
]

const mockJobs: StyleTransferJob[] = [
  {
    id: "stj-001",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    style_preset_id: "sp-daft-punk",
    target_stem: "full_mix",
    status: "completed",
    input_url: "/audio/mashup-001-original.mp3",
    output_url: "/audio/mashup-001-daft-punk.mp3",
    settings: { intensity: 0.75, target_stem: "full_mix" },
    started_at: "2026-02-10T14:00:00Z",
    completed_at: "2026-02-10T14:02:30Z",
    created_at: "2026-02-10T14:00:00Z",
    preset: mockPresets[0],
  },
  {
    id: "stj-002",
    user_id: "mock-user",
    mashup_id: "mashup-003",
    style_preset_id: "sp-frank-ocean",
    target_stem: "vocals",
    status: "completed",
    input_url: "/audio/mashup-003-original.mp3",
    output_url: "/audio/mashup-003-frank-ocean.mp3",
    settings: { intensity: 0.5, target_stem: "vocals" },
    started_at: "2026-02-12T09:15:00Z",
    completed_at: "2026-02-12T09:17:45Z",
    created_at: "2026-02-12T09:15:00Z",
    preset: mockPresets[5],
  },
]

// ── Data Functions ──

export async function getStylePresets(): Promise<StylePreset[]> {
  if (!isSupabaseConfigured()) return mockPresets

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("style_presets")
      .select("*")
      .eq("is_system", true)
      .order("name", { ascending: true })

    if (error || !data) return mockPresets
    return data as StylePreset[]
  } catch {
    return mockPresets
  }
}

export async function getStylePresetById(id: string): Promise<StylePreset | null> {
  if (!isSupabaseConfigured()) {
    return mockPresets.find((p) => p.id === id) ?? null
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("style_presets")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as StylePreset
  } catch {
    return null
  }
}

export async function startStyleTransfer(
  mashupId: string,
  presetId: string,
  targetStem?: string,
): Promise<{ job?: StyleTransferJob; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Return a mock processing job
    const preset = mockPresets.find((p) => p.id === presetId)
    const job: StyleTransferJob = {
      id: `stj-${Date.now()}`,
      user_id: "mock-user",
      mashup_id: mashupId,
      style_preset_id: presetId,
      target_stem: targetStem ?? "full_mix",
      status: "processing",
      input_url: `/audio/${mashupId}-original.mp3`,
      output_url: null,
      settings: { intensity: 0.75, target_stem: targetStem ?? "full_mix" },
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      preset: preset,
    }
    return { job }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("style_transfer_jobs")
      .insert({
        user_id: user.id,
        mashup_id: mashupId,
        style_preset_id: presetId,
        target_stem: targetStem ?? "full_mix",
        status: "pending",
        settings: { intensity: 0.75, target_stem: targetStem ?? "full_mix" },
      })
      .select("*, preset:style_presets!style_preset_id(*)")
      .single()

    if (error || !data) return { error: error?.message ?? "Failed to start style transfer" }
    return { job: data as StyleTransferJob }
  } catch {
    return { error: "Failed to start style transfer" }
  }
}

export async function getStyleTransferJobs(userId: string): Promise<StyleTransferJob[]> {
  if (!isSupabaseConfigured()) return mockJobs

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("style_transfer_jobs")
      .select("*, preset:style_presets!style_preset_id(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as StyleTransferJob[]
  } catch {
    return []
  }
}

export async function getStyleTransferJobById(jobId: string): Promise<StyleTransferJob | null> {
  if (!isSupabaseConfigured()) {
    return mockJobs.find((j) => j.id === jobId) ?? null
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("style_transfer_jobs")
      .select("*, preset:style_presets!style_preset_id(*)")
      .eq("id", jobId)
      .single()

    if (error || !data) return null
    return data as StyleTransferJob
  } catch {
    return null
  }
}
