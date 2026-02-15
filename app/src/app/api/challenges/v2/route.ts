import { NextRequest, NextResponse } from "next/server"
import { getPlatformChallenges, getActiveChallenges } from "@/lib/data/platform-challenges"

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get("filter")

  const challenges = filter === "active"
    ? await getActiveChallenges()
    : await getPlatformChallenges()

  return NextResponse.json({ challenges })
}
