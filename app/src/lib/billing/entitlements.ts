// Platform tier entitlement system
// Determines what features a user can access based on their subscription

import { createClient } from "@/lib/supabase/server"

export type PlatformTier = "free" | "pro" | "studio"

export interface TierEntitlements {
  tier: PlatformTier
  maxMashupsPerMonth: number
  maxAiGenerationsPerMonth: number
  maxStemSeparationsPerMonth: number
  maxCollaborators: number
  canExportStems: boolean
  canExportWav: boolean
  canUseAdvancedMixer: boolean
  canAccessAnalytics: boolean
  canPriorityDiscovery: boolean
  storageGb: number
}

const TIER_LIMITS: Record<PlatformTier, TierEntitlements> = {
  free: {
    tier: "free",
    maxMashupsPerMonth: 5,
    maxAiGenerationsPerMonth: 2,
    maxStemSeparationsPerMonth: 3,
    maxCollaborators: 1,
    canExportStems: false,
    canExportWav: false,
    canUseAdvancedMixer: false,
    canAccessAnalytics: false,
    canPriorityDiscovery: false,
    storageGb: 1,
  },
  pro: {
    tier: "pro",
    maxMashupsPerMonth: 50,
    maxAiGenerationsPerMonth: 20,
    maxStemSeparationsPerMonth: 30,
    maxCollaborators: 5,
    canExportStems: true,
    canExportWav: true,
    canUseAdvancedMixer: true,
    canAccessAnalytics: true,
    canPriorityDiscovery: true,
    storageGb: 25,
  },
  studio: {
    tier: "studio",
    maxMashupsPerMonth: -1, // unlimited
    maxAiGenerationsPerMonth: 100,
    maxStemSeparationsPerMonth: -1, // unlimited
    maxCollaborators: 25,
    canExportStems: true,
    canExportWav: true,
    canUseAdvancedMixer: true,
    canAccessAnalytics: true,
    canPriorityDiscovery: true,
    storageGb: 100,
  },
}

/**
 * Get the platform tier for a user based on their active subscription.
 * Queries the subscriptions table in Supabase.
 */
export async function getUserTier(userId: string): Promise<PlatformTier> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "free"
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return "free"

    const planId = (data as Record<string, unknown>).plan_id as string | null
    if (!planId) return "free"

    const normalized = planId.toLowerCase()
    if (normalized.includes("studio")) return "studio"
    if (normalized.includes("pro") || normalized.includes("creator")) return "pro"
    return "free"
  } catch {
    return "free"
  }
}

/**
 * Get the full entitlements for a platform tier.
 */
export function getTierEntitlements(tier: PlatformTier): TierEntitlements {
  return TIER_LIMITS[tier]
}

/**
 * Get entitlements for a user (combines getUserTier + getTierEntitlements).
 */
export async function getUserEntitlements(userId: string): Promise<TierEntitlements> {
  const tier = await getUserTier(userId)
  return getTierEntitlements(tier)
}

/**
 * Check if user has reached a specific limit.
 */
export async function checkUsageLimit(
  userId: string,
  feature: "mashups" | "ai_generations" | "stem_separations",
  currentCount: number,
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const entitlements = await getUserEntitlements(userId)

  let limit: number
  switch (feature) {
    case "mashups":
      limit = entitlements.maxMashupsPerMonth
      break
    case "ai_generations":
      limit = entitlements.maxAiGenerationsPerMonth
      break
    case "stem_separations":
      limit = entitlements.maxStemSeparationsPerMonth
      break
  }

  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 }
  }

  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount),
  }
}
