import { NextResponse } from "next/server"

import { isDemoRequest } from "@/lib/demo/runtime"
import { getPublicMashupsIndex } from "@/lib/domination/service"

export async function GET(request: Request) {
  return NextResponse.json({ entries: await getPublicMashupsIndex(isDemoRequest(request)), generatedAt: new Date().toISOString() })
}
