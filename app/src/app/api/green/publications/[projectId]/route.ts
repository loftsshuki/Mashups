import { NextResponse } from "next/server"
import { z } from "zod"

import { getGreenPublication } from "@/lib/green-room/publication"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  if (!z.uuid().safeParse(projectId).success) {
    return NextResponse.json({ error: "Invalid publication ID." }, { status: 400 })
  }

  const publication = await getGreenPublication(projectId)
  if (!publication) {
    return NextResponse.json({ error: "Publication not found." }, { status: 404 })
  }

  return NextResponse.json(
    { publication },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  )
}
