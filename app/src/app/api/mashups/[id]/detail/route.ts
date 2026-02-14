import { NextResponse } from "next/server"

import { getMashupDetailView } from "@/lib/data/mashup-detail"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const detail = await getMashupDetailView(id)
    return NextResponse.json(detail)
  } catch {
    return NextResponse.json({ error: "Mashup not found." }, { status: 404 })
  }
}
