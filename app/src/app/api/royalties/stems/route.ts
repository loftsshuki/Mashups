import { NextRequest, NextResponse } from "next/server"
import { getStemRoyalties } from "@/lib/data/stem-royalties"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? "mock-user"
  const summary = await getStemRoyalties(userId)
  return NextResponse.json({ summary })
}
