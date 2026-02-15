import { NextRequest, NextResponse } from "next/server"
import { getEmergingCreators } from "@/lib/growth/ai-ar"

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10")
  const creators = await getEmergingCreators(limit)
  return NextResponse.json({ creators })
}
