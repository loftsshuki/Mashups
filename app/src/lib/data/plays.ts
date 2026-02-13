import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Increment the play count for a mashup.
 * No-op if Supabase is not configured.
 */
export async function incrementPlayCount(mashupId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    const supabase = createClient()
    await supabase.rpc("increment_play_count", { mashup_id: mashupId })
  } catch {
    // Silently fail — play count is not critical
    console.error("Failed to increment play count for", mashupId)
  }
}
