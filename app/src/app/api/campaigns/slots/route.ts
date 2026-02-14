import { NextResponse } from "next/server"

import { buildCampaignFromTemplate } from "@/lib/campaigns/templates"
import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { getTrendingMashups } from "@/lib/data/mashups"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId") ?? "burst_launch"
    const rows = await getTrendingMashups(24)
    const mashups = rows.map((row) =>
      mapRowToMockMashup(row as unknown as Record<string, unknown>),
    )
    const slots = buildCampaignFromTemplate(mashups, templateId)
    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ error: "Failed to load campaign slots." }, { status: 500 })
  }
}
