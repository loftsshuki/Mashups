import { NextResponse } from "next/server"

import { getWeeklyViralPackFromServer } from "@/lib/data/viral-packs-server"

export async function GET() {
  try {
    const pack = await getWeeklyViralPackFromServer()
    return NextResponse.json({ pack })
  } catch {
    return NextResponse.json({ error: "Failed to load weekly viral pack." }, { status: 500 })
  }
}
