import { NextResponse } from "next/server"

import { mapRowToMockMashup } from "@/lib/data/mashup-adapter"
import { getMashups } from "@/lib/data/mashups"

export async function GET() {
  try {
    const rows = await getMashups()
    const mashups = rows.map((row) =>
      mapRowToMockMashup(row as unknown as Record<string, unknown>),
    )
    return NextResponse.json({ mashups })
  } catch {
    return NextResponse.json({ error: "Failed to load discovery catalog." }, { status: 500 })
  }
}
