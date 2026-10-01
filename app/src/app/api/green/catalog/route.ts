import { NextResponse } from "next/server"

import { getPublicGreenCatalog } from "@/lib/green-room/service"

export const dynamic = "force-dynamic"

export async function GET() {
  const catalog = await getPublicGreenCatalog()
  const verifiedStatic = catalog.mode === "prototype" && catalog.verification?.verified
  return NextResponse.json(catalog, { headers: {
    "Cache-Control": catalog.mode === "live" || verifiedStatic ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store",
    ...(catalog.verification?.digest ? { ETag: `\"${catalog.verification.digest}\"` } : {}),
  } })
}
