import { NextRequest, NextResponse } from "next/server"
import { getMashups } from "@/lib/data/mashups"

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor")
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? "20"),
    50
  )

  const allMashups = await getMashups()

  // Sort by created_at descending (newest first)
  const sorted = [...allMashups].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Cursor-based pagination
  let startIndex = 0
  if (cursor) {
    const cursorIndex = sorted.findIndex((m) => m.id === cursor)
    if (cursorIndex >= 0) startIndex = cursorIndex + 1
  }

  const page = sorted.slice(startIndex, startIndex + limit)
  const nextCursor = page.length === limit ? page[page.length - 1]?.id : null

  return NextResponse.json({
    mashups: page,
    nextCursor,
    total: sorted.length,
  })
}
