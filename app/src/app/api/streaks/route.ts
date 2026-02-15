import { NextRequest, NextResponse } from "next/server"
import { getCreativeStreak } from "@/lib/data/creative-streaks"

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 })
  }

  const streak = await getCreativeStreak(username)
  return NextResponse.json({ streak })
}
