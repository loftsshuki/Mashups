import { NextResponse } from "next/server"

import { getForkContestsForMashupFromDb } from "@/lib/data/fork-contests"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mashupId: string }> },
) {
  try {
    const { mashupId } = await params
    const contests = await getForkContestsForMashupFromDb(mashupId)
    return NextResponse.json({ contests })
  } catch {
    return NextResponse.json({ error: "Failed to load fork contests." }, { status: 500 })
  }
}

