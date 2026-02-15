// Fan Subscriptions - Patreon-style creator membership system

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type SubscriptionTier = "basic" | "premium" | "vip"
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "paused"

export interface SubscriptionPlan {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  tier: SubscriptionTier
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  discordRole?: string
  exclusiveContent: boolean
  earlyAccess: boolean
  directMessaging: boolean
  subscriberCount: number
  maxSubscribers?: number
  isPopular: boolean
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  nextBillingDate: string
  totalPaid: number
  paymentMethod: {
    type: "card" | "paypal"
    last4?: string
    brand?: string
  }
  cancelAtPeriodEnd: boolean
}

export interface SubscriberBenefit {
  id: string
  title: string
  description: string
  type: "content" | "discord" | "download" | "event" | "merch"
  unlockedAt: string
  expiresAt?: string
}

// Default subscription tiers pricing
export const DEFAULT_TIER_PRICING: Record<SubscriptionTier, { price: number; yearlyDiscount: number }> = {
  basic: { price: 3, yearlyDiscount: 0.17 },
  premium: { price: 10, yearlyDiscount: 0.20 },
  vip: { price: 25, yearlyDiscount: 0.25 },
}

// Tier feature templates
export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basic: [
    "Exclusive subscriber badge",
    "Access to subscriber-only posts",
    "Early access to new mashups (24h)",
    "Discord community access",
  ],
  premium: [
    "Everything in Basic",
    "Early access to new mashups (1 week)",
    "Download stems & project files",
    "Monthly Q&A livestream",
    "Discord VIP channel",
    "Behind-the-scenes content",
  ],
  vip: [
    "Everything in Premium",
    "Early access to all content",
    "1-on-1 monthly video call",
    "Custom mashup request (1 per month)",
    "Producer feedback on your tracks",
    "Exclusive VIP Discord role",
    "Signed merch (annual subscribers)",
  ],
}

// ---------------------------------------------------------------------------
// Mock data (fallback)
// ---------------------------------------------------------------------------

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_001_basic",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "basic",
    name: "Supporter",
    description: "Support my work and get exclusive perks",
    price: 3,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.basic,
    discordRole: "Subscriber",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: false,
    subscriberCount: 245,
    isPopular: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "plan_001_premium",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "premium",
    name: "Producer",
    description: "For aspiring producers who want to learn",
    price: 10,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.premium,
    discordRole: "Producer",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: false,
    subscriberCount: 89,
    isPopular: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "plan_001_vip",
    creatorId: "user_001",
    creatorName: "DJ Neon",
    creatorAvatar: "https://placehold.co/100x100/7c3aed/white?text=DN",
    tier: "vip",
    name: "Inner Circle",
    description: "Direct access and personalized mentorship",
    price: 25,
    currency: "USD",
    interval: "month",
    features: TIER_FEATURES.vip,
    discordRole: "VIP",
    exclusiveContent: true,
    earlyAccess: true,
    directMessaging: true,
    subscriberCount: 12,
    maxSubscribers: 20,
    isPopular: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
]

const mockUserSubscriptions: Subscription[] = [
  {
    id: "sub_001",
    userId: "current_user",
    planId: "plan_001_premium",
    plan: mockSubscriptionPlans[1],
    status: "active",
    startDate: "2026-01-15T00:00:00Z",
    nextBillingDate: "2026-03-15T00:00:00Z",
    totalPaid: 20,
    paymentMethod: {
      type: "card",
      last4: "4242",
      brand: "visa",
    },
    cancelAtPeriodEnd: false,
  },
]

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function rowToPlan(
  row: Record<string, unknown>,
  profile: Record<string, unknown> | null,
  subscriberCount: number,
): SubscriptionPlan {
  const features = Array.isArray(row.features) ? (row.features as string[]) : []
  const tier = (row.tier as SubscriptionTier) ?? "basic"
  return {
    id: row.id as string,
    creatorId: row.creator_id as string,
    creatorName: (profile?.display_name ?? profile?.username ?? "Creator") as string,
    creatorAvatar: (profile?.avatar_url ?? "") as string,
    tier,
    name: (row.name ?? "") as string,
    description: (row.description ?? "") as string,
    price: typeof row.price_cents === "number" ? row.price_cents / 100 : 0,
    currency: (row.currency ?? "USD") as string,
    interval: (row.interval ?? "month") as "month" | "year",
    features,
    exclusiveContent: row.exclusive_content === true,
    earlyAccess: row.early_access !== false,
    directMessaging: row.direct_messaging === true,
    subscriberCount,
    maxSubscribers: typeof row.max_subscribers === "number" ? row.max_subscribers : undefined,
    isPopular: tier === "premium",
    createdAt: (row.created_at ?? "") as string,
  }
}

function rowToSubscription(
  row: Record<string, unknown>,
  plan: SubscriptionPlan,
): Subscription {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    planId: plan.id,
    plan,
    status: (row.status ?? "active") as SubscriptionStatus,
    startDate: (row.current_period_start ?? row.created_at ?? "") as string,
    endDate: row.status === "cancelled" ? (row.current_period_end as string) : undefined,
    nextBillingDate: (row.current_period_end ?? "") as string,
    totalPaid: typeof row.total_paid_cents === "number" ? row.total_paid_cents / 100 : 0,
    paymentMethod: { type: "card", last4: "····", brand: "card" },
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
  }
}

// ---------------------------------------------------------------------------
// Supabase-backed operations
// ---------------------------------------------------------------------------

export async function createSubscriptionPlan(
  creatorId: string,
  tier: SubscriptionTier,
  customPrice?: number,
  customFeatures?: string[],
): Promise<SubscriptionPlan> {
  const pricing = DEFAULT_TIER_PRICING[tier]
  const features = customFeatures || TIER_FEATURES[tier]
  const fallback: SubscriptionPlan = {
    id: `plan_${Date.now()}`,
    creatorId,
    creatorName: "",
    creatorAvatar: "",
    tier,
    name: tier === "basic" ? "Supporter" : tier === "premium" ? "Producer" : "Inner Circle",
    description: "",
    price: customPrice || pricing.price,
    currency: "USD",
    interval: "month",
    features,
    exclusiveContent: tier !== "basic",
    earlyAccess: true,
    directMessaging: tier === "vip",
    subscriberCount: 0,
    isPopular: false,
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) return fallback

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const priceCents = Math.round((customPrice || pricing.price) * 100)

    const { data, error } = await supabase
      .from("creator_subscription_tiers")
      .insert({
        creator_id: creatorId,
        tier,
        name: fallback.name,
        price_cents: priceCents,
        features,
        exclusive_content: tier !== "basic",
        early_access: true,
        direct_messaging: tier === "vip",
      })
      .select("*")
      .single()

    if (error || !data) return fallback
    return rowToPlan(data as Record<string, unknown>, null, 0)
  } catch {
    return fallback
  }
}

export async function subscribeToPlan(
  userId: string,
  planId: string,
  paymentMethod: { type: "card" | "paypal"; token: string },
): Promise<{ subscription: Subscription; success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const plan = mockSubscriptionPlans.find((p) => p.id === planId)
    if (!plan) {
      return { subscription: null as unknown as Subscription, success: false, error: "Plan not found" }
    }
    if (plan.maxSubscribers && plan.subscriberCount >= plan.maxSubscribers) {
      return { subscription: null as unknown as Subscription, success: false, error: "Plan is at capacity" }
    }
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      plan,
      status: "active",
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalPaid: plan.price,
      paymentMethod: { type: paymentMethod.type, last4: "4242", brand: "visa" },
      cancelAtPeriodEnd: false,
    }
    return { subscription, success: true }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("fan_subscriptions")
      .insert({
        user_id: userId,
        tier_id: planId,
        status: "active",
        current_period_end: periodEnd,
      })
      .select("*, creator_subscription_tiers(*)")
      .single()

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return { subscription: null as unknown as Subscription, success: false, error: "Already subscribed" }
      }
      return { subscription: null as unknown as Subscription, success: false, error: error.message }
    }
    if (!data) {
      return { subscription: null as unknown as Subscription, success: false, error: "Failed to create subscription" }
    }

    const row = data as Record<string, unknown>
    const tierRow = (row.creator_subscription_tiers ?? {}) as Record<string, unknown>
    const plan = rowToPlan(tierRow, null, 0)
    return { subscription: rowToSubscription(row, plan), success: true }
  } catch {
    return { subscription: null as unknown as Subscription, success: false, error: "Failed to subscribe" }
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const sub = mockUserSubscriptions.find((s) => s.id === subscriptionId)
    if (!sub) return false
    if (immediate) {
      sub.status = "cancelled"
      sub.endDate = new Date().toISOString()
    } else {
      sub.cancelAtPeriodEnd = true
    }
    return true
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const update = immediate
      ? { status: "cancelled" as const }
      : { cancel_at_period_end: true }

    const { error } = await supabase
      .from("fan_subscriptions")
      .update(update)
      .eq("id", subscriptionId)

    return !error
  } catch {
    return false
  }
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  if (!isSupabaseConfigured()) {
    return mockUserSubscriptions.filter((s) => s.userId === userId && s.status === "active")
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("fan_subscriptions")
      .select("*, creator_subscription_tiers(*)")
      .eq("user_id", userId)
      .eq("status", "active")

    if (error || !data) return []

    return (data as Record<string, unknown>[]).map((row) => {
      const tierRow = (row.creator_subscription_tiers ?? {}) as Record<string, unknown>
      const plan = rowToPlan(tierRow, null, 0)
      return rowToSubscription(row, plan)
    })
  } catch {
    return []
  }
}

export async function getCreatorSubscribers(creatorId: string): Promise<{
  totalSubscribers: number
  monthlyRevenue: number
  subscribers: Subscription[]
}> {
  if (!isSupabaseConfigured()) {
    const plans = mockSubscriptionPlans.filter((p) => p.creatorId === creatorId)
    const totalSubscribers = plans.reduce((sum: number, p) => sum + p.subscriberCount, 0)
    const monthlyRevenue = plans.reduce((sum: number, p) => sum + p.price * p.subscriberCount, 0)
    return { totalSubscribers, monthlyRevenue, subscribers: [] }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: tiers } = await supabase
      .from("creator_subscription_tiers")
      .select("id, price_cents")
      .eq("creator_id", creatorId)
      .eq("is_active", true)

    if (!tiers || tiers.length === 0) {
      return { totalSubscribers: 0, monthlyRevenue: 0, subscribers: [] }
    }

    const tierIds = (tiers as Record<string, unknown>[]).map((t) => t.id as string)

    const { data: subs, error } = await supabase
      .from("fan_subscriptions")
      .select("*")
      .in("tier_id", tierIds)
      .eq("status", "active")

    if (error || !subs) {
      return { totalSubscribers: 0, monthlyRevenue: 0, subscribers: [] }
    }

    const totalSubscribers = subs.length
    const monthlyRevenue = (subs as Record<string, unknown>[]).reduce((sum: number, sub) => {
      const tier = (tiers as Record<string, unknown>[]).find((t) => t.id === sub.tier_id)
      const priceCents = typeof tier?.price_cents === "number" ? tier.price_cents : 0
      return sum + priceCents / 100
    }, 0)

    return { totalSubscribers, monthlyRevenue, subscribers: [] }
  } catch {
    return { totalSubscribers: 0, monthlyRevenue: 0, subscribers: [] }
  }
}

export async function getCreatorPlans(creatorId: string): Promise<SubscriptionPlan[]> {
  if (!isSupabaseConfigured()) {
    return mockSubscriptionPlans.filter((p) => p.creatorId === creatorId)
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("creator_subscription_tiers")
      .select("*")
      .eq("creator_id", creatorId)
      .eq("is_active", true)
      .order("price_cents", { ascending: true })

    if (error || !data || data.length === 0) {
      return mockSubscriptionPlans.filter((p) => p.creatorId === creatorId)
    }

    // Get subscriber counts per tier
    const tierIds = (data as Record<string, unknown>[]).map((t) => t.id as string)
    const { data: counts } = await supabase
      .from("fan_subscriptions")
      .select("tier_id")
      .in("tier_id", tierIds)
      .eq("status", "active")

    const countMap = new Map<string, number>()
    if (counts) {
      for (const row of counts as Record<string, unknown>[]) {
        const tid = row.tier_id as string
        countMap.set(tid, (countMap.get(tid) ?? 0) + 1)
      }
    }

    return (data as Record<string, unknown>[]).map((row) =>
      rowToPlan(row, null, countMap.get(row.id as string) ?? 0),
    )
  } catch {
    return mockSubscriptionPlans.filter((p) => p.creatorId === creatorId)
  }
}

export async function hasActiveSubscription(
  userId: string,
  creatorId: string,
): Promise<{ hasSubscription: boolean; tier?: SubscriptionTier }> {
  if (!isSupabaseConfigured()) {
    const subs = mockUserSubscriptions.filter(
      (s) => s.userId === userId && s.plan.creatorId === creatorId && s.status === "active",
    )
    return { hasSubscription: subs.length > 0, tier: subs[0]?.plan.tier }
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    // Get creator's tier IDs first
    const { data: tiers } = await supabase
      .from("creator_subscription_tiers")
      .select("id, tier")
      .eq("creator_id", creatorId)

    if (!tiers || tiers.length === 0) return { hasSubscription: false }

    const tierIds = (tiers as Record<string, unknown>[]).map((t) => t.id as string)

    const { data } = await supabase
      .from("fan_subscriptions")
      .select("tier_id")
      .eq("user_id", userId)
      .in("tier_id", tierIds)
      .eq("status", "active")
      .limit(1)

    if (!data || data.length === 0) return { hasSubscription: false }

    const matchedTierId = (data[0] as Record<string, unknown>).tier_id as string
    const tierInfo = (tiers as Record<string, unknown>[]).find((t) => t.id === matchedTierId)
    return {
      hasSubscription: true,
      tier: tierInfo?.tier as SubscriptionTier,
    }
  } catch {
    return { hasSubscription: false }
  }
}

export async function getSubscriberBenefits(
  _subscriptionId: string,
): Promise<SubscriberBenefit[]> {
  return [
    {
      id: "benefit_001",
      title: "Exclusive Mashup: Midnight Mix",
      description: "Subscriber-only extended version",
      type: "content",
      unlockedAt: "2026-02-01T00:00:00Z",
    },
    {
      id: "benefit_002",
      title: "Discord VIP Access",
      description: "Join the exclusive subscriber channel",
      type: "discord",
      unlockedAt: "2026-02-01T00:00:00Z",
    },
  ]
}

// ---------------------------------------------------------------------------
// Helper functions (UI logic, no DB needed)
// ---------------------------------------------------------------------------

export function calculateCreatorEarnings(subscriptions: Subscription[]): {
  monthlyRecurring: number
  annualRecurring: number
  totalSubscribers: number
  churnRate: number
  averageRevenuePerUser: number
} {
  const monthly = subscriptions
    .filter((s) => s.plan.interval === "month")
    .reduce((sum: number, s) => sum + s.plan.price, 0)

  const annual = subscriptions
    .filter((s) => s.plan.interval === "year")
    .reduce((sum: number, s) => sum + s.plan.price / 12, 0)

  const total = subscriptions.length
  const arpu = total > 0 ? (monthly + annual) / total : 0

  return {
    monthlyRecurring: monthly + annual,
    annualRecurring: (monthly + annual) * 12,
    totalSubscribers: total,
    churnRate: 0.05,
    averageRevenuePerUser: arpu,
  }
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case "basic":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    case "premium":
      return "text-purple-500 bg-purple-500/10 border-purple-500/20"
    case "vip":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    default:
      return "text-gray-500 bg-gray-500/10"
  }
}

export function getTierBadge(tier: SubscriptionTier): string {
  switch (tier) {
    case "basic":
      return "🌟"
    case "premium":
      return "💎"
    case "vip":
      return "👑"
    default:
      return "⭐"
  }
}
