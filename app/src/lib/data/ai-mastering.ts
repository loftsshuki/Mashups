import { createClient } from "@/lib/supabase/client"
import type { MasteringPreset, MasteringJob, MasteringStatus } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Constants ──

export const MASTERING_GENRES = ["Pop", "Hip-Hop", "EDM", "Rock", "Jazz", "Classical", "Lo-Fi", "Podcast"] as const

export const TARGET_PLATFORMS = [
  { name: "Spotify", targetLufs: -14 },
  { name: "Apple Music", targetLufs: -16 },
  { name: "YouTube", targetLufs: -14 },
  { name: "TikTok", targetLufs: -14 },
  { name: "SoundCloud", targetLufs: -14 },
  { name: "Club/DJ", targetLufs: -8 },
] as const

// ── Mock Data ──

const mockSystemPresets: MasteringPreset[] = [
  {
    id: "preset-broadcast",
    user_id: null,
    name: "Broadcast Standard",
    is_system: true,
    genre: "Pop",
    settings: {
      targetLufs: -14,
      eqBands: [
        { freq: 100, gain: 0.5, q: 1.0 },
        { freq: 1000, gain: 0.0, q: 1.0 },
        { freq: 8000, gain: 1.0, q: 0.8 },
      ],
      compression: { threshold: -12, ratio: 3, attack: 10, release: 100 },
      stereoWidth: 100,
      limiterCeiling: -1.0,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "preset-streaming",
    user_id: null,
    name: "Streaming Optimized",
    is_system: true,
    genre: "Pop",
    settings: {
      targetLufs: -14,
      eqBands: [
        { freq: 80, gain: 1.0, q: 0.7 },
        { freq: 2500, gain: 0.5, q: 1.2 },
        { freq: 10000, gain: 1.5, q: 0.8 },
      ],
      compression: { threshold: -10, ratio: 4, attack: 5, release: 80 },
      stereoWidth: 110,
      limiterCeiling: -1.0,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "preset-vinyl",
    user_id: null,
    name: "Vinyl Warm",
    is_system: true,
    genre: "Jazz",
    settings: {
      targetLufs: -12,
      eqBands: [
        { freq: 60, gain: 2.0, q: 0.6 },
        { freq: 800, gain: 1.0, q: 1.0 },
        { freq: 6000, gain: -1.0, q: 0.9 },
      ],
      compression: { threshold: -18, ratio: 2, attack: 30, release: 200 },
      stereoWidth: 90,
      limiterCeiling: -2.0,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "preset-club",
    user_id: null,
    name: "Club Ready",
    is_system: true,
    genre: "EDM",
    settings: {
      targetLufs: -8,
      eqBands: [
        { freq: 50, gain: 3.0, q: 0.5 },
        { freq: 3000, gain: 1.5, q: 1.0 },
        { freq: 12000, gain: 2.0, q: 0.7 },
      ],
      compression: { threshold: -6, ratio: 6, attack: 1, release: 50 },
      stereoWidth: 140,
      limiterCeiling: -0.3,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "preset-lofi",
    user_id: null,
    name: "Lo-Fi Chill",
    is_system: true,
    genre: "Lo-Fi",
    settings: {
      targetLufs: -16,
      eqBands: [
        { freq: 120, gain: 1.5, q: 0.8 },
        { freq: 1500, gain: -0.5, q: 1.0 },
        { freq: 5000, gain: -2.0, q: 0.6 },
      ],
      compression: { threshold: -20, ratio: 2, attack: 40, release: 300 },
      stereoWidth: 80,
      limiterCeiling: -3.0,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "preset-podcast",
    user_id: null,
    name: "Podcast Clear",
    is_system: true,
    genre: "Podcast",
    settings: {
      targetLufs: -16,
      eqBands: [
        { freq: 80, gain: -2.0, q: 0.5 },
        { freq: 2000, gain: 2.0, q: 1.2 },
        { freq: 8000, gain: 1.0, q: 1.0 },
      ],
      compression: { threshold: -14, ratio: 4, attack: 5, release: 60 },
      stereoWidth: 60,
      limiterCeiling: -1.5,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
]

function getMockCompletedJobs(): MasteringJob[] {
  return [
    {
      id: "job-001",
      user_id: "user-1",
      mashup_id: "mashup-001",
      preset_id: "preset-streaming",
      status: "completed" as MasteringStatus,
      input_url: "/audio/input_demo_1.mp3",
      output_url: "/audio/mastered_demo_1.mp3",
      analysis: {
        inputLufs: -18.5,
        outputLufs: -14.0,
        truePeak: -1.0,
        dynamicRange: 7.2,
        spectralBalance: { low: 0.32, mid: 0.42, high: 0.26 },
      },
      settings: { preset: "Streaming Optimized" },
      started_at: "2026-02-12T14:00:00Z",
      completed_at: "2026-02-12T14:00:45Z",
      created_at: "2026-02-12T14:00:00Z",
      preset: mockSystemPresets[1],
    },
    {
      id: "job-002",
      user_id: "user-1",
      mashup_id: "mashup-002",
      preset_id: "preset-club",
      status: "completed" as MasteringStatus,
      input_url: "/audio/input_demo_2.mp3",
      output_url: "/audio/mastered_demo_2.mp3",
      analysis: {
        inputLufs: -20.1,
        outputLufs: -8.0,
        truePeak: -0.3,
        dynamicRange: 5.8,
        spectralBalance: { low: 0.38, mid: 0.37, high: 0.25 },
      },
      settings: { preset: "Club Ready" },
      started_at: "2026-02-10T20:30:00Z",
      completed_at: "2026-02-10T20:31:12Z",
      created_at: "2026-02-10T20:30:00Z",
      preset: mockSystemPresets[3],
    },
  ]
}

// ── Data Functions ──

export async function getSystemPresets(): Promise<MasteringPreset[]> {
  if (!isSupabaseConfigured()) return mockSystemPresets

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("mastering_presets")
      .select("*")
      .eq("is_system", true)
      .order("name")

    if (error || !data) return mockSystemPresets
    return data as MasteringPreset[]
  } catch {
    return mockSystemPresets
  }
}

export async function getUserPresets(userId: string): Promise<MasteringPreset[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("mastering_presets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_system", false)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as MasteringPreset[]
  } catch {
    return []
  }
}

export async function startMasteringJob(
  mashupId: string,
  presetId: string,
  settings?: Record<string, unknown>,
): Promise<{ job?: MasteringJob; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
      .from("mastering_jobs")
      .insert({
        user_id: user.id,
        mashup_id: mashupId,
        preset_id: presetId,
        status: "processing" as MasteringStatus,
        settings: settings ?? {},
        started_at: new Date().toISOString(),
      })
      .select("*, preset:mastering_presets!preset_id(*)")
      .single()

    if (error || !data) return { error: error?.message ?? "Failed to start mastering job" }
    return { job: data as MasteringJob }
  } catch {
    return { error: "Failed to start mastering job" }
  }
}

export async function getMasteringJobs(userId: string): Promise<MasteringJob[]> {
  if (!isSupabaseConfigured()) return getMockCompletedJobs()

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("mastering_jobs")
      .select("*, preset:mastering_presets!preset_id(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as MasteringJob[]
  } catch {
    return []
  }
}

export async function getMasteringJobById(jobId: string): Promise<MasteringJob | null> {
  if (!isSupabaseConfigured()) {
    const mockJobs = getMockCompletedJobs()
    return mockJobs.find((j) => j.id === jobId) ?? null
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("mastering_jobs")
      .select("*, preset:mastering_presets!preset_id(*)")
      .eq("id", jobId)
      .single()

    if (error || !data) return null
    return data as MasteringJob
  } catch {
    return null
  }
}

export async function analyzeAudio(
  url: string,
): Promise<{
  lufs: number
  truePeak: number
  dynamicRange: number
  spectralBalance: Record<string, number>
}> {
  // In production this would call an analysis service; for now return mock data
  void url
  return {
    lufs: -18.5,
    truePeak: -1.2,
    dynamicRange: 8.4,
    spectralBalance: { low: 0.35, mid: 0.40, high: 0.25 },
  }
}
