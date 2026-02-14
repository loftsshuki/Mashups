import { createClient } from "@/lib/supabase/client"
import type { SeparatedStems } from "@/components/create/stem-upload-zone"

export interface MashupStem {
  id: string
  mashup_id: string
  original_track_name: string
  original_track_url: string
  vocals_url: string
  drums_url: string
  bass_url: string
  other_url: string
  processing_time_seconds?: number
  model_version: string
  vocals_volume: number
  vocals_muted: boolean
  drums_volume: number
  drums_muted: boolean
  bass_volume: number
  bass_muted: boolean
  other_volume: number
  other_muted: boolean
  created_at: string
}

export interface StemMixerSettings {
  vocals: { volume: number; muted: boolean }
  drums: { volume: number; muted: boolean }
  bass: { volume: number; muted: boolean }
  other: { volume: number; muted: boolean }
}

/**
 * Save separated stems to the database
 */
export async function saveMashupStems(
  mashupId: string,
  originalTrackName: string,
  originalTrackUrl: string,
  stems: SeparatedStems,
  processingTimeSeconds?: number
): Promise<MashupStem | { error: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("mashup_stems")
    .insert({
      mashup_id: mashupId,
      original_track_name: originalTrackName,
      original_track_url: originalTrackUrl,
      vocals_url: stems.vocals,
      drums_url: stems.drums,
      bass_url: stems.bass,
      other_url: stems.other,
      processing_time_seconds: processingTimeSeconds,
    })
    .select()
    .single()

  if (error) {
    console.error("[saveMashupStems] Error:", error)
    return { error: error.message }
  }

  return data as MashupStem
}

/**
 * Get all stems for a mashup
 */
export async function getMashupStems(mashupId: string): Promise<MashupStem[] | { error: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("mashup_stems")
    .select("*")
    .eq("mashup_id", mashupId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getMashupStems] Error:", error)
    return { error: error.message }
  }

  return (data || []) as MashupStem[]
}

/**
 * Update stem mixer settings
 */
export async function updateStemMixerSettings(
  stemId: string,
  settings: StemMixerSettings
): Promise<MashupStem | { error: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("mashup_stems")
    .update({
      vocals_volume: settings.vocals.volume,
      vocals_muted: settings.vocals.muted,
      drums_volume: settings.drums.volume,
      drums_muted: settings.drums.muted,
      bass_volume: settings.bass.volume,
      bass_muted: settings.bass.muted,
      other_volume: settings.other.volume,
      other_muted: settings.other.muted,
    })
    .eq("id", stemId)
    .select()
    .single()

  if (error) {
    console.error("[updateStemMixerSettings] Error:", error)
    return { error: error.message }
  }

  return data as MashupStem
}

/**
 * Delete a stem record
 */
export async function deleteMashupStem(stemId: string): Promise<{ success: boolean } | { error: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from("mashup_stems")
    .delete()
    .eq("id", stemId)

  if (error) {
    console.error("[deleteMashupStem] Error:", error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Convert MashupStem to SeparatedStems
 */
export function toSeparatedStems(stem: MashupStem): SeparatedStems {
  return {
    vocals: stem.vocals_url,
    drums: stem.drums_url,
    bass: stem.bass_url,
    other: stem.other_url,
  }
}

/**
 * Convert MashupStem to StemMixerSettings
 */
export function toStemMixerSettings(stem: MashupStem): StemMixerSettings {
  return {
    vocals: { volume: stem.vocals_volume, muted: stem.vocals_muted },
    drums: { volume: stem.drums_volume, muted: stem.drums_muted },
    bass: { volume: stem.bass_volume, muted: stem.bass_muted },
    other: { volume: stem.other_volume, muted: stem.other_muted },
  }
}
