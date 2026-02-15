import { NextResponse } from "next/server"

import { getUserTier, getTierEntitlements } from "@/lib/billing/entitlements"
import { getEntitlementSummaryForUser } from "@/lib/data/billing"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const [entitlement, tier] = await Promise.all([
      getEntitlementSummaryForUser(user.id),
      getUserTier(user.id),
    ])

    const limits = getTierEntitlements(tier)

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      subscription: entitlement,
      tier,
      limits,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    )
  }
}
