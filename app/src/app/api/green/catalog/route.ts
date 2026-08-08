import { NextResponse } from "next/server"

import { getPublicGreenCatalog } from "@/lib/green-room/service"

export const dynamic = "force-dynamic"

export async function GET() {
  const catalog = await getPublicGreenCatalog()
  return NextResponse.json(catalog, { headers: { "Cache-Control": catalog.mode === "live" ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store" } })
}
