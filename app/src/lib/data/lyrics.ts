import { createClient } from "@/lib/supabase/client"
import type { LyricsRecord } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Mock Data ──

const mockSyncedLyrics: LyricsRecord["synced_lyrics"] = [
  { text: "Take me to the midnight hour", startTime: 12.0, endTime: 15.2, words: [
    { word: "Take", startTime: 12.0, endTime: 12.4 },
    { word: "me", startTime: 12.4, endTime: 12.7 },
    { word: "to", startTime: 12.7, endTime: 12.9 },
    { word: "the", startTime: 12.9, endTime: 13.1 },
    { word: "midnight", startTime: 13.1, endTime: 13.8 },
    { word: "hour", startTime: 13.8, endTime: 14.5 },
  ]},
  { text: "Where the neon lights come alive", startTime: 15.5, endTime: 18.8, words: [
    { word: "Where", startTime: 15.5, endTime: 15.9 },
    { word: "the", startTime: 15.9, endTime: 16.1 },
    { word: "neon", startTime: 16.1, endTime: 16.6 },
    { word: "lights", startTime: 16.6, endTime: 17.1 },
    { word: "come", startTime: 17.1, endTime: 17.5 },
    { word: "alive", startTime: 17.5, endTime: 18.2 },
  ]},
  { text: "Feel the bass drop in your chest", startTime: 19.0, endTime: 22.3, words: [
    { word: "Feel", startTime: 19.0, endTime: 19.4 },
    { word: "the", startTime: 19.4, endTime: 19.6 },
    { word: "bass", startTime: 19.6, endTime: 20.1 },
    { word: "drop", startTime: 20.1, endTime: 20.6 },
    { word: "in", startTime: 20.6, endTime: 20.8 },
    { word: "your", startTime: 20.8, endTime: 21.1 },
    { word: "chest", startTime: 21.1, endTime: 21.8 },
  ]},
  { text: "Every beat puts you to the test", startTime: 22.5, endTime: 25.7, words: [
    { word: "Every", startTime: 22.5, endTime: 23.0 },
    { word: "beat", startTime: 23.0, endTime: 23.4 },
    { word: "puts", startTime: 23.4, endTime: 23.8 },
    { word: "you", startTime: 23.8, endTime: 24.1 },
    { word: "to", startTime: 24.1, endTime: 24.3 },
    { word: "the", startTime: 24.3, endTime: 24.5 },
    { word: "test", startTime: 24.5, endTime: 25.2 },
  ]},
  { text: "We collide like two melodies", startTime: 26.0, endTime: 29.4, words: [
    { word: "We", startTime: 26.0, endTime: 26.3 },
    { word: "collide", startTime: 26.3, endTime: 26.9 },
    { word: "like", startTime: 26.9, endTime: 27.2 },
    { word: "two", startTime: 27.2, endTime: 27.6 },
    { word: "melodies", startTime: 27.6, endTime: 28.6 },
  ]},
  { text: "Mixing up our frequencies", startTime: 29.5, endTime: 32.8, words: [
    { word: "Mixing", startTime: 29.5, endTime: 30.1 },
    { word: "up", startTime: 30.1, endTime: 30.4 },
    { word: "our", startTime: 30.4, endTime: 30.7 },
    { word: "frequencies", startTime: 30.7, endTime: 32.0 },
  ]},
  { text: "Turn it up don't let it fade", startTime: 33.0, endTime: 36.2, words: [
    { word: "Turn", startTime: 33.0, endTime: 33.4 },
    { word: "it", startTime: 33.4, endTime: 33.6 },
    { word: "up", startTime: 33.6, endTime: 33.9 },
    { word: "don't", startTime: 33.9, endTime: 34.3 },
    { word: "let", startTime: 34.3, endTime: 34.6 },
    { word: "it", startTime: 34.6, endTime: 34.8 },
    { word: "fade", startTime: 34.8, endTime: 35.5 },
  ]},
  { text: "This mashup was meant to be made", startTime: 36.5, endTime: 39.8, words: [
    { word: "This", startTime: 36.5, endTime: 36.8 },
    { word: "mashup", startTime: 36.8, endTime: 37.4 },
    { word: "was", startTime: 37.4, endTime: 37.7 },
    { word: "meant", startTime: 37.7, endTime: 38.1 },
    { word: "to", startTime: 38.1, endTime: 38.3 },
    { word: "be", startTime: 38.3, endTime: 38.5 },
    { word: "made", startTime: 38.5, endTime: 39.2 },
  ]},
]

function getMockLyricsRecord(mashupId: string): LyricsRecord {
  return {
    id: "lyrics-mock-001",
    mashup_id: mashupId,
    user_id: "user-mock-001",
    language: "en",
    synced_lyrics: mockSyncedLyrics,
    plain_text: mockSyncedLyrics.map(l => l.text).join("\n"),
    source: "auto-transcription",
    confidence: 92,
    created_at: "2026-02-10T12:00:00Z",
    updated_at: "2026-02-10T12:00:00Z",
  }
}

// ── Functions ──

/**
 * Get lyrics for a specific mashup.
 */
export async function getLyricsForMashup(mashupId: string): Promise<LyricsRecord | null> {
  if (!isSupabaseConfigured()) {
    return getMockLyricsRecord(mashupId)
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lyrics")
      .select("*")
      .eq("mashup_id", mashupId)
      .maybeSingle()

    if (error) {
      console.error("[getLyricsForMashup] Error:", error)
      return getMockLyricsRecord(mashupId)
    }

    return data as LyricsRecord | null
  } catch {
    return getMockLyricsRecord(mashupId)
  }
}

/**
 * Save (upsert) lyrics for a mashup. Requires authentication.
 */
export async function saveLyrics(
  mashupId: string,
  lyrics: LyricsRecord["synced_lyrics"],
  plainText: string,
  language?: string
): Promise<{ lyrics?: LyricsRecord; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { lyrics: getMockLyricsRecord(mashupId) }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data, error } = await supabase
      .from("lyrics")
      .upsert(
        {
          mashup_id: mashupId,
          user_id: user.id,
          synced_lyrics: lyrics,
          plain_text: plainText,
          language: language ?? "en",
          source: "user-edit",
          confidence: 100,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mashup_id" }
      )
      .select()
      .single()

    if (error) {
      console.error("[saveLyrics] Error:", error)
      return { error: error.message }
    }

    return { lyrics: data as LyricsRecord }
  } catch {
    return { error: "Failed to save lyrics" }
  }
}

/**
 * Search mashups by lyrics content.
 */
export async function searchByLyrics(
  query: string
): Promise<Array<{ mashup_id: string; matched_text: string; confidence: number }>> {
  if (!isSupabaseConfigured()) {
    const lowerQuery = query.toLowerCase()
    return [
      {
        mashup_id: "mashup-001",
        matched_text: `...${lowerQuery} in the midnight hour...`,
        confidence: 95,
      },
      {
        mashup_id: "mashup-002",
        matched_text: `...feel the ${lowerQuery} drop in your chest...`,
        confidence: 82,
      },
      {
        mashup_id: "mashup-003",
        matched_text: `...${lowerQuery} was meant to be made...`,
        confidence: 74,
      },
    ]
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lyrics")
      .select("mashup_id, plain_text, confidence")
      .ilike("plain_text", `%${query}%`)
      .limit(20)

    if (error) {
      console.error("[searchByLyrics] Error:", error)
      return []
    }

    return (data || []).map((row: { mashup_id: string; plain_text: string | null; confidence: number | null }) => ({
      mashup_id: row.mashup_id,
      matched_text: row.plain_text?.slice(0, 120) ?? "",
      confidence: row.confidence ?? 0,
    }))
  } catch {
    return []
  }
}

/**
 * Get the list of available language codes.
 */
export function getAvailableLanguages(): string[] {
  return ["en", "es", "fr", "de", "ja", "ko", "pt", "zh"]
}

/**
 * Detect the language of a text string.
 * In production, this would call a language detection API.
 */
export async function detectLanguage(_text: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return "en"
  }

  try {
    // In production: call a language detection service
    await new Promise(resolve => setTimeout(resolve, 300))
    return "en"
  } catch {
    return "en"
  }
}

// ── Constants ──

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
] as const
