import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4", "audio/ogg", "audio/x-m4a", "audio/aac"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"]

export async function POST(request: Request) {
  const token = process.env.GREEN_ROOM_READ_WRITE_TOKEN ?? process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if (!token) return NextResponse.json({ error: "Private Green Room storage is not configured." }, { status: 503 })
  try {
    const body = await request.json() as HandleUploadBody
    let requestUserId: string | null = null
    if (body.type === "blob.generate-client-token") {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: "Sign in to submit a master." }, { status: 401 })
      const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "green.upload", user.id), limit: 6, windowMs: 60_000 })
      if (!rate.allowed) return NextResponse.json({ error: "Upload limit exceeded." }, { status: 429 })
      requestUserId = user.id
    } else {
      const payload = JSON.parse(body.payload.tokenPayload ?? "{}") as { userId?: string }
      requestUserId = payload.userId ?? null
    }
    if (!requestUserId) return NextResponse.json({ error: "Upload ownership is missing." }, { status: 403 })
    const userId = requestUserId
    const response = await handleUpload({
      token,
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const prefix = `green-room/${userId}/masters/`
        if (!pathname.startsWith(prefix) || pathname.includes("..")) throw new Error("Invalid private master path.")
        if (!AUDIO_EXTENSIONS.some((extension) => pathname.toLowerCase().endsWith(extension))) throw new Error("Unsupported audio file extension.")
        return { allowedContentTypes: AUDIO_TYPES, maximumSizeInBytes: 250 * 1024 * 1024, addRandomSuffix: true, tokenPayload: JSON.stringify({ userId }) }
      },
      onUploadCompleted: async ({ tokenPayload }) => {
        const payload = JSON.parse(tokenPayload ?? "{}") as { userId?: string }
        if (payload.userId !== userId) throw new Error("Upload ownership validation failed.")
      },
    })
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Private upload failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
