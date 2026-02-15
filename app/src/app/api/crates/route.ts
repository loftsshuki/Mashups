import { NextRequest, NextResponse } from "next/server"
import { getCrates, getCrateById } from "@/lib/data/crates"

export async function GET(request: NextRequest) {
  const crateId = request.nextUrl.searchParams.get("id")

  if (crateId) {
    const crate = await getCrateById(crateId)
    return NextResponse.json({ crate })
  }

  const crates = await getCrates()
  return NextResponse.json({ crates })
}
