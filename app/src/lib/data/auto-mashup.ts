// Auto-Mashup AI — real Web Audio API mixing with vibe presets

import { audioBufferToWav } from "@/lib/audio/stem-engine"
import {
  buildMashupArrangementPlan,
  estimateTempoGridFromPcm,
  findStrongPhraseStart,
  type TempoGridAnalysis,
} from "@/lib/audio/mashup-arrangement"

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
  timing?: TempoGridAnalysis
  audioBuffer?: AudioBuffer
  file?: File
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
      const timing = estimateTempoGridFromPcm(
        getBufferChannels(audioBuffer),
        audioBuffer.sampleRate,
      )

      tracks.push({
        id: `track_${i}`,
        fileName: file.name,
        duration: Math.round(audioBuffer.duration),
        bpm: timing.bpm,
        key: "Unknown",
        analyzed: true,
        timing,
        audioBuffer,
        file,
      })
    } catch {
      // If decode fails, add with basic info
      tracks.push({
        id: `track_${i}`,
        fileName: file.name,
        duration: 0,
        bpm: 120,
        key: "Unknown",
        analyzed: false,
      })
    }
  }

  await ctx.close()
  return tracks
}

function getBufferChannels(buffer: AudioBuffer): Float32Array[] {
  return Array.from(
    { length: buffer.numberOfChannels },
    (_, channel) => buffer.getChannelData(channel),
  )
}

// ---------------------------------------------------------------------------
// Generate a short, phrase-aligned stem swap instead of overlaying full mixes.
// ---------------------------------------------------------------------------

export type ProgressCallback = (message: string, percent: number) => void

interface SeparatedMashupBuffers {
  vocalsBuffer: AudioBuffer
  sourceHarmonyBuffer: AudioBuffer
  beatDrumsBuffer: AudioBuffer
}

export async function generateAutoMashup(
  config: AIMashupConfig,
  onProgress?: ProgressCallback,
): Promise<AIMashupResult> {
  const buffers = config.tracks
    .map((track) => track.audioBuffer)
    .filter((buffer): buffer is AudioBuffer => buffer != null)

  if (buffers.length < 2) {
    throw new Error("Need at least 2 tracks with audio data")
  }

  const vibe = vibePresets[config.vibe]
  const trackA = config.tracks[0]
  const trackB = config.tracks[1]
  const plan = buildMashupArrangementPlan(trackA.bpm, trackB.bpm)

  if (!plan.compatible) {
    throw new Error(
      `${plan.reason}. Choose tracks with a direct, half-time, or 3:4 tempo relationship.`,
    )
  }

  let stemBuffers: SeparatedMashupBuffers | null = null
  if (trackA.file && trackB.file) {
    onProgress?.("Separating musical stems...", 10)
    stemBuffers = await tryStemSeparation(trackA.file, trackB.file, onProgress)
  }

  if (!stemBuffers) {
    throw new Error(
      "Studio-quality stem separation is unavailable. Mashups will not publish a fake frequency-filtered blend.",
    )
  }

  onProgress?.("Finding strong phrases and matching downbeats...", 68)
  const vocalTiming = trackA.timing ?? {
    bpm: trackA.bpm,
    confidence: 0,
    beatOffset: 0,
    downbeatOffset: 0,
    beatInterval: 60 / trackA.bpm,
  }
  const beatTiming = trackB.timing ?? {
    bpm: trackB.bpm,
    confidence: 0,
    beatOffset: 0,
    downbeatOffset: 0,
    beatInterval: 60 / trackB.bpm,
  }
  const vocalStart = findStrongPhraseStart(
    getBufferChannels(stemBuffers.vocalsBuffer),
    stemBuffers.vocalsBuffer.sampleRate,
    vocalTiming,
    plan.sourceBodyBars,
  )
  const beatStart = findStrongPhraseStart(
    getBufferChannels(stemBuffers.beatDrumsBuffer),
    stemBuffers.beatDrumsBuffer.sampleRate,
    beatTiming,
    plan.totalBars,
  )

  const sampleRate = 44_100
  const outputLength = Math.ceil(plan.totalDuration * sampleRate)
  const offline = new OfflineAudioContext(2, outputLength, sampleRate)
  const masterGain = offline.createGain()
  masterGain.gain.value = 0.82 + (config.intensity / 100) * 0.16

  const limiter = offline.createDynamicsCompressor()
  limiter.threshold.value = -7
  limiter.knee.value = 8
  limiter.ratio.value = 10
  limiter.attack.value = 0.003
  limiter.release.value = 0.12
  masterGain.connect(limiter)
  limiter.connect(offline.destination)

  const beatSource = offline.createBufferSource()
  beatSource.buffer = stemBuffers.beatDrumsBuffer
  beatSource.playbackRate.value = plan.beatPlaybackRate
  const beatGain = offline.createGain()
  const bodyBeatGain = config.vocalFocus ? 0.52 : 0.62
  beatGain.gain.setValueAtTime(0.74, 0)
  beatGain.gain.setValueAtTime(0.74, Math.max(0, plan.introDuration - 0.08))
  beatGain.gain.linearRampToValueAtTime(bodyBeatGain, plan.introDuration + 0.08)
  beatGain.gain.setValueAtTime(
    bodyBeatGain,
    plan.introDuration + plan.bodyDuration - 0.08,
  )
  beatGain.gain.linearRampToValueAtTime(
    0.68,
    plan.introDuration + plan.bodyDuration + 0.08,
  )
  beatSource.connect(beatGain)
  beatGain.connect(masterGain)
  beatSource.start(0, beatStart)
  beatSource.stop(plan.totalDuration)

  const harmonySource = offline.createBufferSource()
  harmonySource.buffer = stemBuffers.sourceHarmonyBuffer
  harmonySource.playbackRate.value = plan.vocalPlaybackRate
  const harmonyFilter = offline.createBiquadFilter()
  harmonyFilter.type = "lowpass"
  harmonyFilter.frequency.value = 12_500
  const harmonyGain = offline.createGain()
  harmonyGain.gain.setValueAtTime(0, plan.introDuration)
  harmonyGain.gain.linearRampToValueAtTime(0.24, plan.introDuration + 0.08)
  harmonyGain.gain.setValueAtTime(
    0.24,
    plan.introDuration + plan.bodyDuration - 0.25,
  )
  harmonyGain.gain.linearRampToValueAtTime(
    0,
    plan.introDuration + plan.bodyDuration,
  )
  harmonySource.connect(harmonyFilter)
  harmonyFilter.connect(harmonyGain)
  harmonyGain.connect(masterGain)
  harmonySource.start(plan.introDuration, vocalStart)
  harmonySource.stop(plan.introDuration + plan.bodyDuration)

  const vocalSource = offline.createBufferSource()
  vocalSource.buffer = stemBuffers.vocalsBuffer
  vocalSource.playbackRate.value = plan.vocalPlaybackRate
  const vocalHighpass = offline.createBiquadFilter()
  vocalHighpass.type = "highpass"
  vocalHighpass.frequency.value = 90
  const vocalCompressor = offline.createDynamicsCompressor()
  vocalCompressor.threshold.value = -24
  vocalCompressor.knee.value = 12
  vocalCompressor.ratio.value = 3.5
  vocalCompressor.attack.value = 0.006
  vocalCompressor.release.value = 0.13
  const vocalGain = offline.createGain()
  const vocalLevel = config.vocalFocus ? 1 : 0.82
  vocalGain.gain.setValueAtTime(0, plan.introDuration)
  vocalGain.gain.linearRampToValueAtTime(
    vocalLevel,
    plan.introDuration + 0.06,
  )
  vocalGain.gain.setValueAtTime(
    vocalLevel,
    plan.introDuration + plan.bodyDuration - 0.22,
  )
  vocalGain.gain.linearRampToValueAtTime(
    0,
    plan.introDuration + plan.bodyDuration,
  )
  vocalSource.connect(vocalHighpass)
  vocalHighpass.connect(vocalCompressor)
  vocalCompressor.connect(vocalGain)
  vocalGain.connect(masterGain)
  vocalSource.start(plan.introDuration, vocalStart)
  vocalSource.stop(plan.introDuration + plan.bodyDuration)

  onProgress?.(`Rendering ${plan.reason.toLowerCase()}...`, 85)
  const rendered = await offline.startRendering()
  const wavBlob = audioBufferToWav(rendered)
  const blobUrl = URL.createObjectURL(wavBlob)
  onProgress?.("Complete!", 100)

  const segments: AIMashupResult["segments"] = [
    {
      startTime: plan.introDuration,
      endTime: plan.introDuration + plan.bodyDuration,
      sourceTrack: trackA.id,
      stem: "vocals",
      effect: `stem-separated:${plan.mode}:phrase-aligned`,
    },
    {
      startTime: 0,
      endTime: plan.totalDuration,
      sourceTrack: trackB.id,
      stem: "drums",
      effect: "stem-separated:downbeat-aligned",
    },
    {
      startTime: plan.introDuration,
      endTime: plan.introDuration + plan.bodyDuration,
      sourceTrack: trackA.id,
      stem: "other",
      effect: "harmonic-bed:key-safe",
    },
  ]

  return {
    id: `ai_${Date.now()}`,
    config,
    status: "complete",
    progress: 100,
    outputUrl: blobUrl,
    duration: Math.round(plan.totalDuration),
    bpm: Math.round(plan.targetBpm),
    key: trackA.key,
    aiAnalysis: {
      energy: Math.min(100, config.intensity * 1.1 + 15),
      danceability: Math.min(100, 55 + config.intensity * 0.45),
      valence: vibe.id === "dark" ? 38 : 68,
      acousticness: vibe.settings.filterType === "lowpass" ? 45 : 18,
    },
    segments,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Stem separation: calls Modal directly from the browser to avoid
// Vercel serverless timeout (Demucs takes 30-60+ seconds).
// Falls back to /api/audio/separate if Modal endpoint is not set.
// ---------------------------------------------------------------------------

const MODAL_ENDPOINT = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_MODAL_STEM_ENDPOINT
  : undefined

// Debug: log Modal endpoint availability at module load
if (typeof window !== "undefined") {
  console.log("[AutoMashup] MODAL_ENDPOINT:", MODAL_ENDPOINT ? "configured" : "NOT SET")
}

async function tryStemSeparation(
  fileA: File,
  fileB: File,
  onProgress?: ProgressCallback,
): Promise<SeparatedMashupBuffers | null> {
  try {
    onProgress?.("Uploading vocal source...", 10)
    const urlA = await uploadFileForSeparation(fileA)
    onProgress?.("Uploading rhythm source...", 20)
    const urlB = await uploadFileForSeparation(fileB)

    if (!urlA || !urlB) {
      console.warn("File upload failed; cannot separate stems")
      return null
    }

    onProgress?.("Separating vocal and harmony stems...", 30)
    const stemsA = await callStemSeparation(urlA)
    if (!stemsA) return null

    onProgress?.("Separating destination drums...", 50)
    const stemsB = await callStemSeparation(urlB)
    if (!stemsB) return null

    onProgress?.("Decoding separated stems...", 62)
    const ctx = new AudioContext()
    const vocalsBuffer = await decodeAudioFromUri(ctx, stemsA.vocals)
    const sourceBassBuffer = await decodeAudioFromUri(ctx, stemsA.bass)
    const sourceOtherBuffer = await decodeAudioFromUri(ctx, stemsA.other)
    const beatDrumsBuffer = await decodeAudioFromUri(ctx, stemsB.drums)

    const harmonyLength = Math.max(
      sourceBassBuffer.length,
      sourceOtherBuffer.length,
    )
    const harmonyOffline = new OfflineAudioContext(
      2,
      harmonyLength,
      sourceOtherBuffer.sampleRate,
    )
    for (const buffer of [sourceBassBuffer, sourceOtherBuffer]) {
      const source = harmonyOffline.createBufferSource()
      source.buffer = buffer
      source.connect(harmonyOffline.destination)
      source.start(0)
    }
    const sourceHarmonyBuffer = await harmonyOffline.startRendering()

    await ctx.close()
    return { vocalsBuffer, sourceHarmonyBuffer, beatDrumsBuffer }
  } catch (error) {
    console.warn("Stem separation failed:", error)
    return null
  }
}

async function uploadFileForSeparation(file: File): Promise<string | null> {
  try {
    console.log(`[Stems] Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`)

    // Try client-side upload first (bypasses 4.5MB serverless body limit)
    try {
      const { upload } = await import("@vercel/blob/client")
      const blob = await upload(
        `audio/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload/client-token",
        }
      )
      console.log("[Stems] Client upload success:", blob.url)
      return blob.url
    } catch {
      console.log("[Stems] Client upload failed, trying server upload...")
    }

    // Fallback: server-side upload
    const formData = new FormData()
    formData.set("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) {
      console.warn("[Stems] Upload HTTP error:", res.status)
      return null
    }
    const data = (await res.json()) as { url?: string }
    const url = data.url || null
    console.log("[Stems] Upload result URL:", url)
    // Reject placeholder URLs that Modal can't access
    if (url && (url.startsWith("/audio/dev-") || !url.startsWith("http"))) {
      console.warn("[Stems] Upload returned local placeholder — Blob storage not configured")
      return null
    }
    return url
  } catch (err) {
    console.warn("[Stems] Upload error:", err)
    return null
  }
}

/** Call stem separation — tries Modal directly from browser, then API route */
async function callStemSeparation(audioUrl: string): Promise<{
  vocals: string
  drums: string
  bass: string
  other: string
} | null> {
  // Try Modal directly from browser (no Vercel timeout issue)
  if (MODAL_ENDPOINT) {
    try {
      console.log("[Stems] Calling Modal directly:", MODAL_ENDPOINT)
      const res = await fetch(MODAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_url: audioUrl }),
      })
      if (res.ok) {
        const data = (await res.json()) as Record<string, string>
        if (data.error) {
          console.warn("[Stems] Modal returned error:", data.error)
        } else if (data.vocals || data.drums) {
          console.log("[Stems] Modal separation successful")
          return {
            vocals: data.vocals || "",
            drums: data.drums || "",
            bass: data.bass || "",
            other: data.other || "",
          }
        }
      } else {
        console.warn("[Stems] Modal HTTP error:", res.status)
      }
    } catch (err) {
      console.warn("[Stems] Modal direct call failed:", err)
    }
  }

  // Fallback: try via API route (may timeout on Vercel)
  try {
    console.log("[Stems] Trying API route fallback")
    const res = await fetch("/api/audio/separate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { stems?: { vocals: string; drums: string; bass: string; other: string } }
    return data.stems || null
  } catch {
    return null
  }
}

/** Decode audio from a URL or data URI into an AudioBuffer */
async function decodeAudioFromUri(ctx: AudioContext, uri: string): Promise<AudioBuffer> {
  if (uri.startsWith("data:")) {
    // Data URI — extract base64, decode to ArrayBuffer
    const [, b64] = uri.split(",")
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return ctx.decodeAudioData(bytes.buffer)
  }
  // Regular URL
  const res = await fetch(uri)
  const arrayBuffer = await res.arrayBuffer()
  return ctx.decodeAudioData(arrayBuffer)
}

// Get generation status
export async function getMashupStatus(_id: string): Promise<AIMashupResult | null> {
  return null
}

// Refine/edit AI result
export async function refineMashup(
  mashupId: string,
  _adjustments: {
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

  const plan = buildMashupArrangementPlan(tracks[0].bpm, tracks[1].bpm)
  if (!plan.compatible) {
    issues.push(`${plan.reason}. This pair cannot be warped cleanly in-browser.`)
  } else if (plan.mode !== "direct") {
    suggestions.push(`${plan.reason}; phrase boundaries still resolve on the bar grid.`)
  }

  if (tracks.some((track) => (track.timing?.confidence ?? 1) < 0.15)) {
    suggestions.push("Low beat confidence detected; confirm the downbeat before publishing.")
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
