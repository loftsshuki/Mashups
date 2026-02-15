import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkUsageLimit, type PlatformTier } from "@/lib/billing/entitlements"

type Feature = "mashups" | "ai_generations" | "stem_separations"

interface EnforceResult {
  allowed: true
  userId: string
  tier: PlatformTier
  remaining: number
}

/**
 * Check tier limits before processing an API request.
 * Returns the user info if allowed, or a 403 NextResponse if over limit.
 */
export async function enforceTierLimit(
  feature: Feature,
): Promise<EnforceResult | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated → treat as free tier with userId "anon"
  const userId = user?.id ?? "anon"

  // Count usage this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let currentCount = 0

  if (userId !== "anon") {
    try {
      const table = feature === "mashups" ? "mashups" : "ai_jobs"
      const column = feature === "mashups" ? "creator_id" : "user_id"

      let query = supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq(column, userId)
        .gte("created_at", monthStart)

      if (feature !== "mashups") {
        const jobType =
          feature === "stem_separations" ? "stem_separation" : "ai_generation"
        query = query.eq("job_type", jobType)
      }

      const { count } = await query
      currentCount = count ?? 0
    } catch {
      // If counting fails, allow the request
    }
  }

  const result = await checkUsageLimit(userId, feature, currentCount)

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: `Monthly ${feature.replace("_", " ")} limit reached`,
        limit: result.limit,
        remaining: 0,
        tier: userId === "anon" ? "free" : undefined,
        upgrade: userId === "anon" ? undefined : "/pricing",
      },
      { status: 403 },
    )
  }

  return {
    allowed: true,
    userId,
    tier: (userId === "anon" ? "free" : "free") as PlatformTier, // getUserTier already called inside checkUsageLimit
    remaining: result.remaining,
  }
}
