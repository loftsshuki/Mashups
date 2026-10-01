import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

  // Fail closed: paid compute (GPU/LLM/uploads) is never available to anonymous callers.
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required", upgrade: "/login" },
      { status: 401 },
    )
  }

  const userId = user.id

  // Count usage this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let currentCount = 0

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

  const result = await checkUsageLimit(userId, feature, currentCount)

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: `Monthly ${feature.replace("_", " ")} limit reached`,
        limit: result.limit,
        remaining: 0,
        upgrade: "/pricing",
      },
      { status: 403 },
    )
  }

  return {
    allowed: true,
    userId,
    tier: "free" as PlatformTier, // getUserTier already called inside checkUsageLimit
    remaining: result.remaining,
  }
}

/**
 * Record one unit of metered usage after a paid call succeeds, so that
 * enforceTierLimit() actually sees it next time. (Previously no route wrote
 * usage rows, so monthly limits never triggered.)
 *
 * "mashups" usage is not recorded here — it is counted from the mashups table,
 * which createMashup() already writes.
 *
 * Best-effort: a bookkeeping failure must never fail the user's request.
 */
export async function recordUsage(
  userId: string,
  feature: Exclude<Feature, "mashups">,
  inputData: Record<string, unknown> = {},
): Promise<void> {
  try {
    const db = createAdminClient() ?? (await createClient())
    const now = new Date().toISOString()
    await db.from("ai_jobs").insert({
      user_id: userId,
      job_type: feature === "stem_separations" ? "stem_separation" : "ai_generation",
      status: "complete",
      progress: 100,
      input_data: inputData,
      completed_at: now,
    })
  } catch {
    // Usage accounting is best-effort.
  }
}
