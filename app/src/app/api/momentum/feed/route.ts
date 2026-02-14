import { NextResponse } from "next/server"

import { getMomentumFeed } from "@/lib/data/momentum-feed"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = Number(searchParams.get("limit") ?? "8")
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(40, limitParam)) : 8

    const items = await getMomentumFeed(limit)
    const sponsoredEligible = items.filter((item) => item.sponsoredEligible)

    return NextResponse.json({
      items,
      feedHealth: {
        risingCount: items.length,
        sponsoredEligibleCount: sponsoredEligible.length,
        qualityThreshold: 65,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to load momentum feed." }, { status: 500 })
  }
}
