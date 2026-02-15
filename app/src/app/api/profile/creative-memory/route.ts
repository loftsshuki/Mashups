import { NextRequest, NextResponse } from "next/server"
import { getCreativeProfile } from "@/lib/data/creative-profile"

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 })
  }

  const profile = await getCreativeProfile(username)
  return NextResponse.json({ profile })
}
