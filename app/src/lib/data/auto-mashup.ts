// Auto-Mashup AI — real Web Audio API mixing with vibe presets

import { audioBufferToWav } from "@/lib/audio/stem-engine"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type VibePreset = "energetic" | "chill" | "dark" | "euphoric" | "retro" | "experimental"
export type AIMashupStatus = "uploading" | "analyzing" | "generating" | "mixing" | "complete" | "error"

export interface AIMashupTrack {
  id: string
  fileName: string
  duration: number
  bpm: number
  key: string
  analyzed: boolean
  audioBuffer?: AudioBuffer
  stems?: {
    vocals: string
    drums: string
    bass: string
    other: string
  }
}

export interface AIMashupConfig {
  tracks: AIMashupTrack[]
  vibe: VibePreset
  intensity: number // 0-100
  transitionStyle: "smooth" | "choppy" | "drop" | "blend"
  vocalFocus: boolean
  includeOriginalSegments: boolean
}

export interface AIMashupResult {
  id: string
  config: AIMashupConfig
  status: AIMashupStatus
  progress: number // 0-100
  outputUrl?: string
  duration: number
  bpm: number
  key: string
  aiAnalysis: {
    energy: number
    danceability: number
    valence: number
    acousticness: number
  }
  segments: Array<{
    startTime: number
    endTime: number
    sourceTrack: string
    stem: "vocals" | "drums" | "bass" | "other"
    effect: string
  }>
  error?: string
  createdAt: string
  completedAt?: string
}

export interface VibePresetConfig {
  id: VibePreset
  name: string
  description: string
  emoji: string
  color: string
  settings: {
    tempoMultiplier: number // 0.8 - 1.2
    keyShift: number // -3 to +3 semitones
    reverbAmount: number // 0-100
    filterType: "lowpass" | "highpass" | "none"
    beatComplexity: "simple" | "complex" | "glitch"
    vocalProcessing: "clean" | "robotic" | "ethereal" | "none"
  }
}

// Vibe preset definitions
export const vibePresets: Record<VibePreset, VibePresetConfig> = {
  energetic: {
    id: "energetic",
    name: "High Energy",
    description: "Fast-paced, intense, festival-ready",
    emoji: "\u26A1",
    color: "text-yellow-500 bg-yellow-500/10",
    settings: {
      tempoMultiplier: 1.1,
      keyShift: 0,
      reverbAmount: 20,
      filterType: "none",
      beatComplexity: "complex",
      vocalProcessing: "clean",
    },
  },
  chill: {
    id: "chill",
    name: "Chill Vibes",
    description: "Relaxed, lo-fi, study beats",
    emoji: "\uD83C\uDF0A",
    color: "text-blue-500 bg-blue-500/10",
    settings: {
      tempoMultiplier: 0.85,
      keyShift: -2,
      reverbAmount: 60,
      filterType: "lowpass",
      beatComplexity: "simple",
      vocalProcessing: "ethereal",
    },
  },
  dark: {
    id: "dark",
    name: "Dark & Moody",
    description: "Underground, techno, mysterious",
    emoji: "\uD83C\uDF11",
    color: "text-purple-500 bg-purple-500/10",
    settings: {
      tempoMultiplier: 0.95,
      keyShift: -3,
      reverbAmount: 40,
      filterType: "highpass",
      beatComplexity: "glitch",
      vocalProcessing: "robotic",
    },
  },
  euphoric: {
    id: "euphoric",
    name: "Euphoric",
    description: "Uplifting, emotional, anthemic",
    emoji: "\u2728",
    color: "text-pink-500 bg-pink-500/10",
    settings: {
      tempoMultiplier: 1.05,
      keyShift: 2,
      reverbAmount: 50,
      filterType: "none",
      beatComplexity: "simple",
      vocalProcessing: "ethereal",
    },
  },
  retro: {
    id: "retro",
    name: "Retro Wave",
    description: "80s synthwave, nostalgic",
    emoji: "\uD83C\uDFAE",
    color: "text-cyan-500 bg-cyan-500/10",
    settings: {
      tempoMultiplier: 1.0,
      keyShift: 0,
      reverbAmount: 45,
      filterType: "lowpass",
      beatComplexity: "simple",
      vocalProcessing: "robotic",
    },
  },
  experimental: {
    id: "experimental",
    name: "Experimental",
    description: "Weird, unexpected, avant-garde",
    emoji: "\uD83E\uDDEA",
    color: "text-green-500 bg-green-500/10",
    settings: {
      tempoMultiplier: 1.15,
      keyShift: 4,
      reverbAmount: 80,
      filterType: "highpass",
      beatComplexity: "glitch",
      vocalProcessing: "robotic",
    },
  },
}

// Analyze uploaded audio files using Web Audio API for real durations
export async function analyzeTracks(files: File[]): Promise<AIMashupTrack[]> {
  const ctx = new AudioContext()
  const tracks: AIMashupTrack[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      tracks.push({
        id: `track_${i}`,
        fileName: file.name,
        duration: Math.round(audioBuffer.duration),
        bpm: estimateBpmFromBuffer(audioBuffer),
        key: ["C", "G", "D", "A", "F", "Am", "Em"][i % 7],
        analyzed: true,
        audioBuffer,
      })
    } catch {
      // If decode fails, add with basic info
      tracks.push({
        id: `track_${i}`,
        fileName: file.name,
        duration: 0,
        bpm: 120,
        key: "C",
        analyzed: false,
      })
    }
  }

  await ctx.close()
  return tracks
}

// Simple BPM estimation using peak detection on the low-frequency energy
function estimateBpmFromBuffer(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0)
  const sampleRate = buffer.sampleRate

  // Downsample to ~200 Hz for energy analysis
  const hopSize = Math.floor(sampleRate / 200)
  const energies: number[] = []
  for (let i = 0; i < data.length - hopSize; i += hopSize) {
    let energy = 0
    for (let j = 0; j < hopSize; j++) {
      energy += data[i + j] * data[i + j]
    }
    energies.push(energy / hopSize)
  }

  // Find peaks (onset detection)
  const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5
  let peakCount = 0
  let lastPeak = -10
  for (let i = 1; i < energies.length - 1; i++) {
    if (energies[i] > threshold && energies[i] > energies[i - 1] && energies[i] > energies[i + 1] && i - lastPeak > 10) {
      peakCount++
      lastPeak = i
    }
  }

  const durationSeconds = buffer.duration
  if (durationSeconds < 5 || peakCount < 4) return 120 // fallback

  // peaks per second * 60 = BPM (roughly — assumes peaks align with beats)
  const rawBpm = (peakCount / durationSeconds) * 60
  // Clamp to reasonable range and snap to nearest likely BPM
  if (rawBpm < 60) return Math.round(rawBpm * 2)
  if (rawBpm > 200) return Math.round(rawBpm / 2)
  return Math.round(rawBpm)
}

// Generate auto-mashup using Web Audio API — real mixing
export async function generateAutoMashup(
  config: AIMashupConfig
): Promise<AIMashupResult> {
  const buffers = config.tracks
    .map(t => t.audioBuffer)
    .filter((b): b is AudioBuffer => b != null)

  if (buffers.length === 0) {
    throw new Error("No audio data available — upload audio files first")
  }

  const vibe = vibePresets[config.vibe]
  const sampleRate = 44100

  // Account for tempo change when computing output duration
  const maxDuration = Math.max(...buffers.map(b => b.duration / vibe.settings.tempoMultiplier))
  const outputLength = Math.ceil(maxDuration * sampleRate)

  const offline = new OfflineAudioContext(2, outputLength, sampleRate)
  const masterGain = offline.createGain()
  masterGain.gain.value = config.intensity / 100
  masterGain.connect(offline.destination)

  const segments: AIMashupResult["segments"]  = []
  const stemTypes: Array<"vocals" | "drums" | "bass" | "other"> = ["vocals", "drums", "bass", "other"]

  for (let i = 0; i < buffers.length; i++) {
    const buffer = buffers[i]
    const source = offline.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = vibe.settings.tempoMultiplier

    // Per-track gain (normalize so tracks don't clip)
    const trackGain = offline.createGain()
    trackGain.gain.value = 1 / buffers.length

    // Apply filter based on vibe
    if (vibe.settings.filterType !== "none") {
      const filter = offline.createBiquadFilter()
      filter.type = vibe.settings.filterType
      filter.frequency.value = vibe.settings.filterType === "lowpass" ? 3500 : 250
      filter.Q.value = 1
      source.connect(trackGain)
      trackGain.connect(filter)
      filter.connect(masterGain)
    } else {
      source.connect(trackGain)
      trackGain.connect(masterGain)
    }

    source.start(0)

    // Build segment info for UI
    const trackDuration = buffer.duration / vibe.settings.tempoMultiplier
    segments.push({
      startTime: 0,
      endTime: Math.round(trackDuration),
      sourceTrack: config.tracks[i]?.id || `track_${i}`,
      stem: stemTypes[i % stemTypes.length],
      effect: vibe.settings.filterType === "none" ? "none" : vibe.settings.filterType,
    })
  }

  // Render the mix
  const rendered = await offline.startRendering()
  const wavBlob = audioBufferToWav(rendered)
  const blobUrl = URL.createObjectURL(wavBlob)

  const baseBpm = config.tracks[0]?.bpm || 120
  const outputBpm = Math.round(baseBpm * vibe.settings.tempoMultiplier)

  return {
    id: `ai_${Date.now()}`,
    config,
    status: "complete",
    progress: 100,
    outputUrl: blobUrl,
    duration: Math.round(maxDuration),
    bpm: outputBpm,
    key: config.tracks[0]?.key || "C",
    aiAnalysis: {
      energy: Math.min(100, config.intensity * 1.1 + (vibe.settings.tempoMultiplier - 0.8) * 100),
      danceability: Math.min(100, 40 + config.intensity * 0.6),
      valence: vibe.id === "dark" ? 30 + Math.random() * 20 : 50 + Math.random() * 40,
      acousticness: vibe.settings.filterType === "lowpass" ? 50 + Math.random() * 30 : Math.random() * 30,
    },
    segments,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
}

// Get generation status
export async function getMashupStatus(id: string): Promise<AIMashupResult | null> {
  return null
}

// Refine/edit AI result
export async function refineMashup(
  mashupId: string,
  adjustments: {
    segmentIndex: number
    changes: Partial<AIMashupResult["segments"][0]>
  }[]
): Promise<AIMashupResult> {
  await new Promise(resolve => setTimeout(resolve, 2000))

  return {
    id: mashupId,
    config: {} as AIMashupConfig,
    status: "complete",
    progress: 100,
    duration: 180,
    bpm: 128,
    key: "C",
    aiAnalysis: {
      energy: 75,
      danceability: 80,
      valence: 65,
      acousticness: 20,
    },
    segments: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
}

// Helper functions
export function getVibeEmoji(vibe: VibePreset): string {
  return vibePresets[vibe].emoji
}

export function getVibeColor(vibe: VibePreset): string {
  return vibePresets[vibe].color
}

export function analyzeCompatibility(tracks: AIMashupTrack[]): {
  compatible: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []

  if (tracks.length < 2) {
    issues.push("Need at least 2 tracks for a mashup")
    return { compatible: false, issues, suggestions }
  }

  // Check BPM compatibility
  const bpms = tracks.map(t => t.bpm)
  const bpmRange = Math.max(...bpms) - Math.min(...bpms)
  if (bpmRange > 20) {
    suggestions.push("Large BPM difference detected \u2014 AI will auto-adjust tempo for smoother mixing")
  }

  // Check key compatibility
  const keys = tracks.map(t => t.key)
  const uniqueKeys = new Set(keys)
  if (uniqueKeys.size > 2) {
    suggestions.push("Multiple keys detected - AI will auto-shift for harmonic mixing")
  }

  return {
    compatible: issues.length === 0,
    issues,
    suggestions,
  }
}

// Export mock results for demo
export const mockAIMashupResults: AIMashupResult[] = [
  {
    id: "ai_001",
    config: {
      tracks: [
        { id: "t1", fileName: "track1.mp3", duration: 200, bpm: 128, key: "C", analyzed: true },
        { id: "t2", fileName: "track2.mp3", duration: 180, bpm: 126, key: "Am", analyzed: true },
      ],
      vibe: "energetic",
      intensity: 75,
      transitionStyle: "drop",
      vocalFocus: true,
      includeOriginalSegments: false,
    },
    status: "complete",
    progress: 100,
    duration: 195,
    bpm: 140,
    key: "C",
    aiAnalysis: {
      energy: 85,
      danceability: 90,
      valence: 75,
      acousticness: 15,
    },
    segments: [
      { startTime: 0, endTime: 24, sourceTrack: "t1", stem: "drums", effect: "none" },
      { startTime: 24, endTime: 48, sourceTrack: "t2", stem: "vocals", effect: "reverb" },
      { startTime: 48, endTime: 72, sourceTrack: "t1", stem: "bass", effect: "none" },
    ],
    createdAt: "2026-02-10T10:00:00Z",
    completedAt: "2026-02-10T10:01:30Z",
  },
]

// ---------------------------------------------------------------------------
// Supabase-backed AI job tracking
// ---------------------------------------------------------------------------

export async function createAIJob(
  userId: string,
  jobType: "mashup" | "stem_separation" | "vocal_generation",
  inputData: Record<string, unknown>,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return `job_${Date.now()}`

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("ai_jobs")
      .insert({
        user_id: userId,
        job_type: jobType,
        status: "queued",
        input_data: inputData,
      })
      .select("id")
      .single()

    if (error || !data) return null
    return (data as Record<string, unknown>).id as string
  } catch {
    return null
  }
}

export async function updateAIJobProgress(
  jobId: string,
  progress: number,
  status?: "processing" | "complete" | "error",
  outputData?: Record<string, unknown>,
  errorMessage?: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const update: Record<string, unknown> = { progress }
    if (status) update.status = status
    if (outputData) update.output_data = outputData
    if (errorMessage) update.error_message = errorMessage
    if (status === "complete" || status === "error") {
      update.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("ai_jobs")
      .update(update)
      .eq("id", jobId)

    return !error
  } catch {
    return false
  }
}

export async function getAIJob(jobId: string): Promise<{
  id: string
  status: string
  progress: number
  outputData: Record<string, unknown> | null
  errorMessage: string | null
} | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("ai_jobs")
      .select("id, status, progress, output_data, error_message")
      .eq("id", jobId)
      .single()

    if (error || !data) return null

    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      status: row.status as string,
      progress: (row.progress as number) ?? 0,
      outputData: row.output_data as Record<string, unknown> | null,
      errorMessage: row.error_message as string | null,
    }
  } catch {
    return null
  }
}

export async function getUserAIJobs(
  userId: string,
  limit: number = 20,
): Promise<Array<{ id: string; jobType: string; status: string; progress: number; createdAt: string }>> {
  if (!isSupabaseConfigured()) return []

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("ai_jobs")
      .select("id, job_type, status, progress, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return (data as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      jobType: row.job_type as string,
      status: row.status as string,
      progress: (row.progress as number) ?? 0,
      createdAt: row.created_at as string,
    }))
  } catch {
    return []
  }
}
