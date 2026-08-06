import { NextResponse } from "next/server"

import {
  getTierEntitlements,
  getUserTier,
  type PlatformTier,
} from "@/lib/billing/entitlements"
import { isDemoMode, isSupabaseConfigured } from "@/lib/config/runtime"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type MeteredFeature = "mashups" | "ai_generations" | "stem_separations"

interface EnforceResult {
  allowed: true
  userId: string
  tier: PlatformTier
  remaining: number
  usageEventId: string | null
}

function featureLimit(tier: PlatformTier, feature: MeteredFeature): number {
  const entitlements = getTierEntitlements(tier)
  if (feature === "mashups") return entitlements.maxMashupsPerMonth
  if (feature === "stem_separations") {
    return entitlements.maxStemSeparationsPerMonth
  }
  return entitlements.maxAiGenerationsPerMonth
}

/**
 * Authenticates the caller and atomically reserves one unit before paid work
 * starts. The database function serializes reservations per user and feature.
 */
export async function enforceTierLimit(
  feature: MeteredFeature,
): Promise<EnforceResult | NextResponse> {
  if (!isSupabaseConfigured()) {
    if (isDemoMode()) {
      return {
        allowed: true,
        userId: "demo-user",
        tier: "studio",
        remaining: -1,
        usageEventId: null,
      }
    }
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return NextResponse.json(
      { error: "Sign in to use this feature." },
      { status: 401 },
    )
  }

  const tier = await getUserTier(user.id)
  const limit = featureLimit(tier, feature)
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: "Usage metering is not configured." },
      { status: 503 },
    )
  }

  const { data, error } = await admin.rpc("reserve_usage_event", {
    p_user_id: user.id,
    p_feature: feature,
    p_limit: limit,
    p_metadata: { tier },
  })

  if (error) {
    console.error("[Usage] Reservation failed:", error.message)
    return NextResponse.json(
      { error: "Usage metering is temporarily unavailable." },
      { status: 503 },
    )
  }

  const usageEventId = typeof data === "string" ? data : null
  if (!usageEventId) {
    return NextResponse.json(
      {
        error: `Monthly ${feature.replace("_", " ")} limit reached.`,
        limit,
        remaining: 0,
        tier,
        upgrade: "/pricing",
      },
      { status: 403 },
    )
  }

  return {
    allowed: true,
    userId: user.id,
    tier,
    remaining: limit === -1 ? -1 : Math.max(0, limit - 1),
    usageEventId,
  }
}

export async function finalizeUsage(
  usageEventId: string | null,
  status: "completed" | "failed",
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (!usageEventId) return

  const admin = createAdminClient()
  if (!admin) return

  const { error } = await admin
    .from("usage_events")
    .update({
      status,
      metadata,
      completed_at: new Date().toISOString(),
    })
    .eq("id", usageEventId)

  if (error) {
    console.error("[Usage] Finalization failed:", error.message)
  }
}
