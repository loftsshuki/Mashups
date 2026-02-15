// Auto-Caption Generator - Lyrics and audio transcription

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface CaptionSegment {
  id: string
  startTime: number // seconds
  endTime: number
  text: string
  confidence: number // 0-100
  speaker?: string
}

export interface GeneratedCaptions {
  id: string
  mashupId: string
  language: string
  segments: CaptionSegment[]
  isLyrics: boolean
  generatedAt: string
  wordCount: number
  duration: number
}

export interface CaptionStyle {
  fontFamily: string
  fontSize: number
  color: string
  backgroundColor: string
  outlineColor?: string
  outlineWidth?: number
  position: "top" | "middle" | "bottom"
  alignment: "left" | "center" | "right"
  animation: "none" | "fade" | "slide" | "karaoke"
}

// Transcribe audio to text (mock implementation)
// In production, this would use Whisper API or similar
export async function transcribeAudio(
  audioBlob: Blob,
  options: {
    language?: string
    detectLyrics?: boolean
    minConfidence?: number
  } = {}
): Promise<GeneratedCaptions> {
  const { language = "en", detectLyrics = true, minConfidence = 70 } = options
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock transcription based on audio duration
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
  const duration = audioBuffer.duration
  
  // Generate mock segments
  const segments: CaptionSegment[] = []
  const segmentDuration = 3 // Average segment length in seconds
  const numSegments = Math.floor(duration / segmentDuration)
  
  const mockPhrases = detectLyrics ? getMockLyrics() : getMockPhrases()
  
  for (let i = 0; i < numSegments && i < mockPhrases.length; i++) {
    const startTime = i * segmentDuration
    const endTime = Math.min(startTime + segmentDuration + Math.random(), duration)
    
    segments.push({
      id: `seg_${i}`,
      startTime,
      endTime,
      text: mockPhrases[i],
      confidence: minConfidence + Math.random() * (100 - minConfidence),
      speaker: detectLyrics ? undefined : (i % 2 === 0 ? "Speaker 1" : "Speaker 2"),
    })
  }
  
  const wordCount = segments.reduce((acc, seg) => 
    acc + seg.text.split(/\s+/).length, 0
  )
  
  return {
    id: `captions_${Date.now()}`,
    mashupId: "",
    language,
    segments,
    isLyrics: detectLyrics,
    generatedAt: new Date().toISOString(),
    wordCount,
    duration,
  }
}

// Mock lyrics phrases
function getMockLyrics(): string[] {
  return [
    "In the city lights, we found our way",
    "Through the endless nights and endless days",
    "The beat goes on, it never stops",
    "We dance together 'til the morning drops",
    "Can you feel the rhythm in your soul?",
    "Let the music take complete control",
    "Every moment is a brand new start",
    "Forever dancing, never fall apart",
    "Raise your hands up to the sky",
    "We're gonna live until we die",
    "The melody is calling me",
    "Together now, forever free",
  ]
}

// Mock spoken phrases
function getMockPhrases(): string[] {
  return [
    "Welcome to this mashup session.",
    "We're combining two amazing tracks today.",
    "First, let's hear the original elements.",
    "Now bringing in the secondary melody.",
    "Notice how the beats align perfectly.",
    "This transition is key to the mix.",
    "The bass line provides the foundation.",
    "Listen to those harmonies blend together.",
    "That's the magic of mashup creation.",
    "Thanks for listening to this mix.",
  ]
}

// Export captions in various formats
export function exportCaptions(
  captions: GeneratedCaptions,
  format: "srt" | "vtt" | "json" | "txt"
): string {
  switch (format) {
    case "srt":
      return exportSRT(captions)
    case "vtt":
      return exportVTT(captions)
    case "txt":
      return captions.segments.map(s => s.text).join(" ")
    case "json":
    default:
      return JSON.stringify(captions, null, 2)
  }
}

// Export as SubRip (SRT) format
function exportSRT(captions: GeneratedCaptions): string {
  return captions.segments.map((seg, index) => {
    const start = formatSRTTime(seg.startTime)
    const end = formatSRTTime(seg.endTime)
    return `${index + 1}\n${start} --> ${end}\n${seg.text}\n`
  }).join("\n")
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

// Export as WebVTT format
function exportVTT(captions: GeneratedCaptions): string {
  const header = "WEBVTT\n\n"
  const body = captions.segments.map(seg => {
    const start = formatVTTTime(seg.startTime)
    const end = formatVTTTime(seg.endTime)
    return `${start} --> ${end}\n${seg.text}\n`
  }).join("\n")
  
  return header + body
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
}

// Default caption styles
export const defaultCaptionStyles: CaptionStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 24,
  color: "#ffffff",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  outlineColor: "#000000",
  outlineWidth: 2,
  position: "bottom",
  alignment: "center",
  animation: "fade",
}

// Karaoke-style timed word highlighting
export function generateKaraokeTiming(
  segment: CaptionSegment
): Array<{ word: string; startTime: number; endTime: number }> {
  const words = segment.text.split(/\s+/)
  const duration = segment.endTime - segment.startTime
  const timePerWord = duration / words.length
  
  return words.map((word, index) => ({
    word,
    startTime: segment.startTime + index * timePerWord,
    endTime: segment.startTime + (index + 1) * timePerWord,
  }))
}

// Auto-generate captions for social media
export async function generateSocialCaptions(
  captions: GeneratedCaptions,
  platform: "tiktok" | "instagram" | "youtube" | "twitter"
): Promise<string> {
  const highlights = captions.segments
    .filter(s => s.confidence > 85)
    .slice(0, 3)
    .map(s => s.text)
  
  switch (platform) {
    case "tiktok":
      return highlights.join(" ✨ ") + " #mashup #remix #music"
    case "instagram":
      return `🎵 ${highlights[0] || "New mashup dropped!"}\n\n` +
        `Full track in bio 🔗`
    case "twitter":
      return highlights[0]?.slice(0, 200) || "Check out this mashup!"
    case "youtube":
      return generateYouTubeCaptions(captions)
    default:
      return highlights.join(" ")
  }
}

function generateYouTubeCaptions(captions: GeneratedCaptions): string {
  const timestamps = captions.segments
    .filter((_, i) => i % 3 === 0) // Every 3rd segment
    .map(s => {
      const time = formatYouTubeTime(s.startTime)
      return `${time} ${s.text.slice(0, 50)}${s.text.length > 50 ? "..." : ""}`
    })
  
  return "🎵 Highlights:\n" + timestamps.join("\n")
}

function formatYouTubeTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Search captions
export function searchCaptions(
  captions: GeneratedCaptions,
  query: string
): CaptionSegment[] {
  const lowerQuery = query.toLowerCase()
  return captions.segments.filter(seg => 
    seg.text.toLowerCase().includes(lowerQuery)
  )
}

// Edit caption segment
export function editSegment(
  captions: GeneratedCaptions,
  segmentId: string,
  updates: Partial<Omit<CaptionSegment, "id">>
): GeneratedCaptions {
  return {
    ...captions,
    segments: captions.segments.map(seg => 
      seg.id === segmentId ? { ...seg, ...updates } : seg
    ),
  }
}

// Merge adjacent segments
export function mergeSegments(
  captions: GeneratedCaptions,
  segmentIds: string[]
): GeneratedCaptions {
  const segmentsToMerge = captions.segments.filter(s => segmentIds.includes(s.id))
  
  if (segmentsToMerge.length < 2) return captions
  
  const merged: CaptionSegment = {
    id: `merged_${Date.now()}`,
    startTime: Math.min(...segmentsToMerge.map(s => s.startTime)),
    endTime: Math.max(...segmentsToMerge.map(s => s.endTime)),
    text: segmentsToMerge.map(s => s.text).join(" "),
    confidence: segmentsToMerge.reduce((acc, s) => acc + s.confidence, 0) / segmentsToMerge.length,
  }
  
  return {
    ...captions,
    segments: [
      ...captions.segments.filter(s => !segmentIds.includes(s.id)),
      merged,
    ].sort((a, b) => a.startTime - b.startTime),
  }
}

// ---------------------------------------------------------------------------
// Supabase-backed caption storage
// ---------------------------------------------------------------------------

export async function getCaptionsForMashup(
  mashupId: string,
  language: string = "en",
): Promise<GeneratedCaptions | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("mashup_captions")
      .select("*")
      .eq("mashup_id", mashupId)
      .eq("language", language)
      .maybeSingle()

    if (error || !data) return null

    const row = data as Record<string, unknown>
    const segments = Array.isArray(row.segments) ? (row.segments as CaptionSegment[]) : []
    const wordTimings = row.word_timings as Record<string, unknown>[] | null

    return {
      id: row.id as string,
      mashupId: row.mashup_id as string,
      language: (row.language ?? "en") as string,
      segments,
      isLyrics: true,
      generatedAt: (row.created_at ?? "") as string,
      wordCount: segments.reduce((acc: number, seg) => acc + seg.text.split(/\s+/).length, 0),
      duration: segments.length > 0 ? segments[segments.length - 1].endTime : 0,
    }
  } catch {
    return null
  }
}

export async function saveCaptionsToDb(
  mashupId: string,
  captions: GeneratedCaptions,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const srtText = exportCaptions(captions, "srt")
    const vttText = exportCaptions(captions, "vtt")

    const { error } = await supabase.from("mashup_captions").upsert(
      {
        mashup_id: mashupId,
        language: captions.language,
        segments: captions.segments,
        srt_text: srtText,
        vtt_text: vttText,
      },
      { onConflict: "mashup_id,language" },
    )

    return !error
  } catch {
    return false
  }
}

// Mock generated captions for testing
export const mockGeneratedCaptions: GeneratedCaptions = {
  id: "captions_mock",
  mashupId: "mashup_001",
  language: "en",
  isLyrics: true,
  generatedAt: new Date().toISOString(),
  wordCount: 48,
  duration: 180,
  segments: [
    {
      id: "seg_0",
      startTime: 0,
      endTime: 4,
      text: "In the city lights, we found our way",
      confidence: 92,
    },
    {
      id: "seg_1",
      startTime: 4,
      endTime: 8,
      text: "Through the endless nights and endless days",
      confidence: 88,
    },
    {
      id: "seg_2",
      startTime: 8,
      endTime: 12,
      text: "The beat goes on, it never stops",
      confidence: 95,
    },
    {
      id: "seg_3",
      startTime: 12,
      endTime: 16,
      text: "We dance together 'til the morning drops",
      confidence: 90,
    },
  ],
}
