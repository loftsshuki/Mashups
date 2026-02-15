import type { Stem } from "./types"
import { getStemsForMashup, mockStems } from "./stems-registry"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface RemixLoadResult {
  mashupId: string
  mashupTitle: string
  creatorName: string
  stems: Stem[]
}

/**
 * Load stems from an existing mashup for remixing.
 * Returns stem data that can be pre-loaded into the create flow.
 */
export async function loadStemsForRemix(mashupId: string): Promise<RemixLoadResult | null> {
  if (!isSupabaseConfigured()) {
    // Mock: simulate loading stems from any mashup
    return {
      mashupId,
      mashupTitle: "Sample Mashup",
      creatorName: "Creator",
      stems: mockStems.slice(0, 3),
    }
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Get mashup info
    const { data: mashup, error: mashupError } = await supabase
      .from("mashups")
      .select("id, title, creator:profiles!creator_id(display_name)")
      .eq("id", mashupId)
      .single()

    if (mashupError || !mashup) {
      return null
    }

    // Get stems linked to this mashup
    const stems = await getStemsForMashup(mashupId)

    const creator = mashup.creator as { display_name: string } | null

    return {
      mashupId,
      mashupTitle: mashup.title as string,
      creatorName: creator?.display_name ?? "Unknown",
      stems,
    }
  } catch {
    return null
  }
}
