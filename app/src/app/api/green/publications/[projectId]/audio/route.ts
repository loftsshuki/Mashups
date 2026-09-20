import { get } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getGreenPublicationAudioAsset } from "@/lib/green-room/publication"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  if (!z.uuid().safeParse(projectId).success) {
    return NextResponse.json({ error: "Invalid publication ID." }, { status: 400 })
  }

  const token =
    process.env.GREEN_ROOM_READ_WRITE_TOKEN ??
    process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: "Public playback storage is unavailable." },
      { status: 503 },
    )
  }

  const asset = await getGreenPublicationAudioAsset(projectId)
  if (!asset) {
    return NextResponse.json({ error: "Publication not found." }, { status: 404 })
  }

  const blob = await get(asset.blobUrl, { token, access: "private" })
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Audio unavailable." }, { status: 404 })
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
