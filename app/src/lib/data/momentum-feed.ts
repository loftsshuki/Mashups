import { scorePublishReadiness } from "@/lib/audio/quality-score"
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { computeMomentum, type MomentumMashup } from "@/lib/growth/momentum"
import { mockMashups } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export interface MomentumFeedItem extends MomentumMashup {
  qualityScore: number
  sponsoredEligible: boolean
  recentEventScore: number
}

const eventWeights: Record<string, number> = {
  impression: 1,
  play: 3,
  open: 2,
  like: 5,
  share: 8,
  skip: -3,
}

function enrichMomentumRows(rows: MomentumMashup[], eventScores: Map<string, number>) {
  const ranked = rows
    .map((row) => {
      const recentEventScore = eventScores.get(row.id) ?? 0
      const adjustedScore = row.momentumScore + recentEventScore * 12
      const quality = scorePublishReadiness({
        bpm: row.bpm,
        titleLength: row.title.length,
        descriptionLength: row.description.length,
        sourceTrackCount: row.sourceTracks.length,
        hasCover: Boolean(row.coverUrl),
      })

      return {
        ...row,
        momentumScore: adjustedScore,
        qualityScore: quality.viralReadiness,
        sponsoredEligible: quality.viralReadiness >= 65,
        recentEventScore,
      }
    })
    .sort((a, b) => b.momentumScore - a.momentumScore)

  return ranked
}

export async function getMomentumFeed(limit = 8): Promise<MomentumFeedItem[]> {
  const fallback = enrichMomentumRows(computeMomentum(mockMashups), new Map())
  if (!isSupabaseConfigured()) return fallback.slice(0, limit)

  try {
    const supabase = await createClient()
    const { data: mashupData, error: mashupError } = await supabase
      .from("mashups")
      .select(
        `
        *,
        creator:profiles!creator_id(*),
        source_tracks(*),
        like_count:likes(count),
        comment_count:comments(count)
      `,
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(Math.max(20, limit * 3))

    if (mashupError || !mashupData || mashupData.length === 0) {
      return fallback.slice(0, limit)
    }

    const mashups = (mashupData as Record<string, unknown>[]).map((row) =>
      mapRowToMockMashup(row),
    )
    const recentCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const ids = mashups.map((row) => row.id)
    const eventScores = new Map<string, number>()

    if (ids.length > 0) {
      const { data: eventData } = await supabase
        .from("recommendation_events")
        .select("mashup_id,event_type")
        .in("mashup_id", ids)
        .gte("created_at", recentCutoff)
        .limit(4000)

      for (const row of (eventData as Record<string, unknown>[] | null) ?? []) {
        const mashupId = typeof row.mashup_id === "string" ? row.mashup_id : null
        const eventType = typeof row.event_type === "string" ? row.event_type : null
        if (!mashupId || !eventType) continue
        const weight = eventWeights[eventType] ?? 0
        const current = eventScores.get(mashupId) ?? 0
        eventScores.set(mashupId, current + weight)
      }
    }

    return enrichMomentumRows(computeMomentum(mashups), eventScores).slice(0, limit)
  } catch {
    return fallback.slice(0, limit)
  }
}
