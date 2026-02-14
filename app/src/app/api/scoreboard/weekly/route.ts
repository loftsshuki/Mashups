import { NextResponse } from "next/server"

import { getCreatorScoreboardRowsFromServer } from "@/lib/data/scoreboard-server"

export async function GET() {
  try {
    const rows = await getCreatorScoreboardRowsFromServer()
    return NextResponse.json({ rows })
  } catch {
    return NextResponse.json({ error: "Failed to load creator scoreboard." }, { status: 500 })
  }
}
