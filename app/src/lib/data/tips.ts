import { createClient } from "@/lib/supabase/client"
import type { Tip, TipThankYou, Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockTips: Tip[] = [
  {
    id: "tip-001",
    tipper_id: "user-002",
    creator_id: "user-001",
    mashup_id: "mashup-001",
    amount_cents: 500,
    currency: "USD",
    message: "This mashup is fire! Keep creating amazing stuff!",
    is_public: true,
    created_at: "2026-02-13T14:00:00Z",
    tipper: {
      id: "user-002",
      username: "beatfan99",
      display_name: "Beat Fan",
      avatar_url: "https://placehold.co/100x100/ec4899/white?text=BF",
      bio: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "tip-002",
    tipper_id: "user-003",
    creator_id: "user-001",
    mashup_id: null,
    amount_cents: 1000,
    currency: "USD",
    message: "Love your work, keep it up!",
    is_public: true,
    created_at: "2026-02-12T10:30:00Z",
    tipper: {
      id: "user-003",
      username: "synthwave_lover",
      display_name: "Synthwave Lover",
      avatar_url: "https://placehold.co/100x100/8b5cf6/white?text=SL",
      bio: null,
      created_at: "2026-01-05T00:00:00Z",
    },
  },
  {
    id: "tip-003",
    tipper_id: "user-004",
    creator_id: "user-001",
    mashup_id: "mashup-002",
    amount_cents: 2500,
    currency: "USD",
    message: null,
    is_public: true,
    created_at: "2026-02-11T16:45:00Z",
    tipper: {
      id: "user-004",
      username: "dj_shadow",
      display_name: "DJ Shadow",
      avatar_url: "https://placehold.co/100x100/06b6d4/white?text=DS",
      bio: null,
      created_at: "2026-01-10T00:00:00Z",
    },
  },
  {
    id: "tip-004",
    tipper_id: "user-005",
    creator_id: "user-001",
    mashup_id: "mashup-001",
    amount_cents: 300,
    currency: "USD",
    message: "Incredible transitions between the tracks!",
    is_public: true,
    created_at: "2026-02-10T09:20:00Z",
    tipper: {
      id: "user-005",
      username: "remix_queen",
      display_name: "Remix Queen",
      avatar_url: "https://placehold.co/100x100/f97316/white?text=RQ",
      bio: null,
      created_at: "2026-01-15T00:00:00Z",
    },
  },
]

const mockThankYous: TipThankYou[] = [
  {
    id: "ty-001",
    tip_id: "tip-001",
    creator_id: "user-001",
    message: "Thanks so much for the support! More mashups coming soon!",
    created_at: "2026-02-13T15:00:00Z",
  },
]

export const TIP_AMOUNTS = [100, 300, 500, 1000, 2500, 5000] as const

export async function getTipsForCreator(creatorId: string): Promise<Tip[]> {
  if (!isSupabaseConfigured()) return mockTips

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tips")
      .select("*, tipper:profiles!tipper_id(*)")
      .eq("creator_id", creatorId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Tip[]
  } catch {
    return []
  }
}

export async function getTipsForMashup(mashupId: string): Promise<Tip[]> {
  if (!isSupabaseConfigured())
    return mockTips.filter((t) => t.mashup_id === mashupId)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tips")
      .select("*, tipper:profiles!tipper_id(*)")
      .eq("mashup_id", mashupId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Tip[]
  } catch {
    return []
  }
}

export async function sendTip(params: {
  creatorId: string
  mashupId?: string
  amountCents: number
  message?: string
  isPublic?: boolean
}): Promise<Tip | null> {
  if (!isSupabaseConfigured()) {
    const mockTip: Tip = {
      id: `tip-${Date.now()}`,
      tipper_id: "mock-user",
      creator_id: params.creatorId,
      mashup_id: params.mashupId ?? null,
      amount_cents: params.amountCents,
      currency: "USD",
      message: params.message ?? null,
      is_public: params.isPublic ?? true,
      created_at: new Date().toISOString(),
    }
    return mockTip
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("tips")
      .insert({
        tipper_id: user.id,
        creator_id: params.creatorId,
        mashup_id: params.mashupId ?? null,
        amount_cents: params.amountCents,
        message: params.message ?? null,
        is_public: params.isPublic ?? true,
      })
      .select("*, tipper:profiles!tipper_id(*)")
      .single()

    if (error || !data) return null
    return data as Tip
  } catch {
    return null
  }
}

export async function getThankYousForCreator(
  creatorId: string,
): Promise<TipThankYou[]> {
  if (!isSupabaseConfigured()) return mockThankYous

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tip_thank_yous")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as TipThankYou[]
  } catch {
    return []
  }
}

export async function sendThankYou(
  tipId: string,
  message: string,
): Promise<TipThankYou | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: `ty-${Date.now()}`,
      tip_id: tipId,
      creator_id: "mock-user",
      message,
      created_at: new Date().toISOString(),
    }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("tip_thank_yous")
      .insert({ tip_id: tipId, creator_id: user.id, message })
      .select()
      .single()

    if (error || !data) return null
    return data as TipThankYou
  } catch {
    return null
  }
}

export function summarizeTips(tips: Tip[]) {
  const total = tips.reduce((sum, t) => sum + t.amount_cents, 0)
  const count = tips.length
  const topTipper = tips.reduce<{
    profile: Profile | undefined
    total: number
  } | null>((best, tip) => {
    if (!best || tip.amount_cents > best.total) {
      return { profile: tip.tipper, total: tip.amount_cents }
    }
    return best
  }, null)

  return { totalCents: total, count, topTipper }
}
