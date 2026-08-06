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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to upload audio." }, { status: 401 })
  }

  const rate = await consumeRateLimit({
    key: resolveRateLimitKey(request, "upload.token", user.id),
    limit: 12,
    windowMs: 60_000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Upload limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  try {
    const body = (await request.json()) as HandleUploadBody
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
          tokenPayload: JSON.stringify({ userId: user.id }),
        }
      },
      onUploadCompleted: async ({ tokenPayload }) => {
        const payload = JSON.parse(tokenPayload ?? "{}") as { userId?: string }
        if (payload.userId !== user.id) {
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
