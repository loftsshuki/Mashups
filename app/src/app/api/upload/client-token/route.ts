import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/mp4",
  "audio/ogg",
  "audio/x-m4a",
  "audio/aac",
]

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    let requestUserId: string | null = null
    if (body.type === "blob.generate-client-token") {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) return NextResponse.json({ error: "Sign in to upload audio." }, { status: 401 })
      const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "upload.token", user.id), limit: 12, windowMs: 60_000 })
      if (!rate.allowed) return NextResponse.json({ error: "Upload limit exceeded. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } })
      requestUserId = user.id
    } else {
      const payload = JSON.parse(body.payload.tokenPayload ?? "{}") as { userId?: string }
      requestUserId = payload.userId ?? null
    }
    if (!requestUserId) return NextResponse.json({ error: "Upload ownership is missing." }, { status: 403 })
    const userId = requestUserId
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("audio/") || pathname.includes("..")) {
          throw new Error("Invalid upload path.")
        }

        return {
          allowedContentTypes: ALLOWED_AUDIO_TYPES,
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        }
      },
      onUploadCompleted: async ({ tokenPayload }) => {
        const payload = JSON.parse(tokenPayload ?? "{}") as { userId?: string }
        if (payload.userId !== userId) {
          throw new Error("Upload ownership validation failed.")
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token generation failed"
    console.error("[ClientToken] Error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
