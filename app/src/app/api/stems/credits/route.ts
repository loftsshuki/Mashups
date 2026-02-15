import { NextRequest, NextResponse } from "next/server"
import { getStemsForMashup } from "@/lib/data/stems-registry"

export async function GET(request: NextRequest) {
  const mashupId = request.nextUrl.searchParams.get("mashupId")
  if (!mashupId) {
    return NextResponse.json({ error: "mashupId is required" }, { status: 400 })
  }

  const stems = await getStemsForMashup(mashupId)

  const credits = stems.map((stem) => ({
    stemTitle: stem.title,
    instrument: stem.instrument ?? "other",
    creatorUsername: stem.creator?.username ?? stem.creator_id,
    creatorDisplayName: stem.creator?.display_name ?? stem.creator_id,
    creatorAvatar: stem.creator?.avatar_url ?? `https://placehold.co/100x100/333/white?text=${stem.creator_id.slice(0, 2).toUpperCase()}`,
  }))

  return NextResponse.json({ credits })
}
