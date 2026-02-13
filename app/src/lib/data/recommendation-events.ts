import { createClient } from "@/lib/supabase/client"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type RecommendationEventType =
  | "impression"
  | "play"
  | "skip"
  | "like"
  | "share"
  | "open"

interface RecommendationEventInput {
  mashupId?: string
  eventType: RecommendationEventType
  context?: string
}

interface LocalEvent {
  mashupId?: string
  eventType: RecommendationEventType
  context?: string
  at: string
}

export async function trackRecommendationEvent({
  mashupId,
  eventType,
  context,
}: RecommendationEventInput): Promise<void> {
  // Always retain local signal history for personalization fallback.
  try {
    if (typeof window !== "undefined") {
      const key = "mashups_reco_events"
      const raw = window.localStorage.getItem(key)
      const existing = raw ? (JSON.parse(raw) as LocalEvent[]) : []
      const next = [
        ...existing.slice(-199),
        { mashupId, eventType, context, at: new Date().toISOString() },
      ]
      window.localStorage.setItem(key, JSON.stringify(next))
    }
  } catch {
    // Ignore local storage errors.
  }

  if (!isSupabaseConfigured()) return

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from("recommendation_events").insert({
      user_id: user?.id ?? null,
      mashup_id: mashupId ?? null,
      event_type: eventType,
      context: context ?? null,
    })
  } catch {
    // non-blocking analytics path
  }
}

export function getLocalRecommendationEvents(): LocalEvent[] {
  try {
    if (typeof window === "undefined") return []
    const raw = window.localStorage.getItem("mashups_reco_events")
    return raw ? (JSON.parse(raw) as LocalEvent[]) : []
  } catch {
    return []
  }
}
