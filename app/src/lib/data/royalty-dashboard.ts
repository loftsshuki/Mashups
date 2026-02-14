import { createClient } from "@/lib/supabase/client"
import type { RoyaltyStream, RoyaltyProjection, TaxDocument } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockStreams: RoyaltyStream[] = [
  {
    id: "rs-001",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    source: "play",
    platform: "web",
    amount_cents: 2,
    currency: "USD",
    metadata: { listener_country: "US" },
    streamed_at: "2026-02-14T10:00:00Z",
  },
  {
    id: "rs-002",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    source: "play",
    platform: "tiktok",
    amount_cents: 1,
    currency: "USD",
    metadata: { listener_country: "UK" },
    streamed_at: "2026-02-14T09:30:00Z",
  },
  {
    id: "rs-003",
    user_id: "mock-user",
    mashup_id: "mashup-002",
    source: "tip",
    platform: "web",
    amount_cents: 500,
    currency: "USD",
    metadata: { tipper: "beatfan99" },
    streamed_at: "2026-02-13T14:00:00Z",
  },
  {
    id: "rs-004",
    user_id: "mock-user",
    mashup_id: null,
    source: "subscription",
    platform: null,
    amount_cents: 850,
    currency: "USD",
    metadata: { subscriber_count: 1, tier: "premium" },
    streamed_at: "2026-02-13T00:00:00Z",
  },
  {
    id: "rs-005",
    user_id: "mock-user",
    mashup_id: "mashup-003",
    source: "marketplace_sale",
    platform: "web",
    amount_cents: 1274,
    currency: "USD",
    metadata: { listing_title: "Sunset Vocals" },
    streamed_at: "2026-02-12T16:00:00Z",
  },
  {
    id: "rs-006",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    source: "split",
    platform: null,
    amount_cents: 340,
    currency: "USD",
    metadata: { split_name: "Collab with DJ Shadow", share_pct: 42.5 },
    streamed_at: "2026-02-12T12:00:00Z",
  },
  {
    id: "rs-007",
    user_id: "mock-user",
    mashup_id: null,
    source: "referral",
    platform: null,
    amount_cents: 220,
    currency: "USD",
    metadata: { referred_user: "new_producer_42" },
    streamed_at: "2026-02-11T08:00:00Z",
  },
  {
    id: "rs-008",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    source: "play",
    platform: "youtube",
    amount_cents: 5,
    currency: "USD",
    metadata: { listener_country: "JP" },
    streamed_at: "2026-02-11T06:00:00Z",
  },
  {
    id: "rs-009",
    user_id: "mock-user",
    mashup_id: "mashup-002",
    source: "play",
    platform: "instagram",
    amount_cents: 1,
    currency: "USD",
    metadata: {},
    streamed_at: "2026-02-10T20:00:00Z",
  },
  {
    id: "rs-010",
    user_id: "mock-user",
    mashup_id: "mashup-001",
    source: "tip",
    platform: "web",
    amount_cents: 1000,
    currency: "USD",
    metadata: { tipper: "dj_shadow" },
    streamed_at: "2026-02-10T15:00:00Z",
  },
]

const mockProjections: RoyaltyProjection[] = [
  {
    id: "rp-001",
    user_id: "mock-user",
    month: "2026-02",
    projected_cents: 8500,
    actual_cents: 4193,
    source_breakdown: {
      play: 9,
      tip: 1500,
      subscription: 850,
      marketplace_sale: 1274,
      split: 340,
      referral: 220,
    },
    computed_at: "2026-02-14T00:00:00Z",
  },
  {
    id: "rp-002",
    user_id: "mock-user",
    month: "2026-01",
    projected_cents: 7200,
    actual_cents: 6850,
    source_breakdown: {
      play: 150,
      tip: 2300,
      subscription: 2100,
      marketplace_sale: 1800,
      split: 200,
      referral: 300,
    },
    computed_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "rp-003",
    user_id: "mock-user",
    month: "2025-12",
    projected_cents: 5500,
    actual_cents: 5120,
    source_breakdown: {
      play: 120,
      tip: 1800,
      subscription: 1700,
      marketplace_sale: 1000,
      split: 300,
      referral: 200,
    },
    computed_at: "2026-01-01T00:00:00Z",
  },
]

const mockTaxDocs: TaxDocument[] = [
  {
    id: "td-001",
    user_id: "mock-user",
    tax_year: 2025,
    document_type: "1099-MISC",
    total_earnings_cents: 48720,
    document_url: null,
    generated_at: "2026-01-31T00:00:00Z",
  },
]

export async function getRoyaltyStreams(
  userId: string,
  options?: {
    source?: string
    platform?: string
    mashupId?: string
    limit?: number
    offset?: number
  },
): Promise<RoyaltyStream[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockStreams]
    if (options?.source) results = results.filter((s) => s.source === options.source)
    if (options?.platform)
      results = results.filter((s) => s.platform === options.platform)
    if (options?.mashupId)
      results = results.filter((s) => s.mashup_id === options.mashupId)
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50
    return results.slice(offset, offset + limit)
  }

  try {
    const supabase = createClient()
    let query = supabase
      .from("royalty_streams")
      .select("*")
      .eq("user_id", userId)
      .order("streamed_at", { ascending: false })

    if (options?.source) query = query.eq("source", options.source)
    if (options?.platform) query = query.eq("platform", options.platform)
    if (options?.mashupId) query = query.eq("mashup_id", options.mashupId)

    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error || !data) return []
    return data as RoyaltyStream[]
  } catch {
    return []
  }
}

export async function getRoyaltyProjections(
  userId: string,
): Promise<RoyaltyProjection[]> {
  if (!isSupabaseConfigured()) return mockProjections

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("royalty_projections")
      .select("*")
      .eq("user_id", userId)
      .order("month", { ascending: false })

    if (error || !data) return []
    return data as RoyaltyProjection[]
  } catch {
    return []
  }
}

export async function getTaxDocuments(
  userId: string,
): Promise<TaxDocument[]> {
  if (!isSupabaseConfigured()) return mockTaxDocs

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tax_documents")
      .select("*")
      .eq("user_id", userId)
      .order("tax_year", { ascending: false })

    if (error || !data) return []
    return data as TaxDocument[]
  } catch {
    return []
  }
}

export function aggregateBySource(streams: RoyaltyStream[]) {
  const breakdown: Record<string, { count: number; totalCents: number }> = {}
  for (const stream of streams) {
    if (!breakdown[stream.source]) {
      breakdown[stream.source] = { count: 0, totalCents: 0 }
    }
    breakdown[stream.source].count++
    breakdown[stream.source].totalCents += stream.amount_cents
  }
  return breakdown
}

export function aggregateByPlatform(streams: RoyaltyStream[]) {
  const breakdown: Record<string, { count: number; totalCents: number }> = {}
  for (const stream of streams) {
    const platform = stream.platform ?? "direct"
    if (!breakdown[platform]) {
      breakdown[platform] = { count: 0, totalCents: 0 }
    }
    breakdown[platform].count++
    breakdown[platform].totalCents += stream.amount_cents
  }
  return breakdown
}

export function computeMonthlyTrend(projections: RoyaltyProjection[]) {
  return projections
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((p) => ({
      month: p.month,
      projected: p.projected_cents,
      actual: p.actual_cents,
      growth:
        p.actual_cents > 0 && projections.length > 1
          ? ((p.actual_cents - (projections[projections.indexOf(p) + 1]?.actual_cents ?? p.actual_cents)) /
              (projections[projections.indexOf(p) + 1]?.actual_cents || 1)) *
            100
          : 0,
    }))
}

export const REVENUE_SOURCES = [
  { value: "play", label: "Plays", color: "#3b82f6" },
  { value: "tip", label: "Tips", color: "#ec4899" },
  { value: "subscription", label: "Subscriptions", color: "#8b5cf6" },
  { value: "marketplace_sale", label: "Marketplace", color: "#f97316" },
  { value: "split", label: "Revenue Splits", color: "#22c55e" },
  { value: "referral", label: "Referrals", color: "#06b6d4" },
] as const

export const PLATFORMS = [
  { value: "web", label: "Web", color: "#6366f1" },
  { value: "tiktok", label: "TikTok", color: "#000000" },
  { value: "instagram", label: "Instagram", color: "#e4405f" },
  { value: "youtube", label: "YouTube", color: "#ff0000" },
  { value: "spotify", label: "Spotify", color: "#1db954" },
] as const
