import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"

/**
 * Server route for client-side Vercel Blob uploads.
 * The browser calls this to get a client token, then uploads
 * directly to Blob storage — bypassing the serverless function
 * body size limit (4.5MB).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Require an authenticated user before minting a Blob upload token —
        // otherwise anyone can fill the paid Blob store / use it as a public file host.
        const { createClient } = await import("@/lib/supabase/server")
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error("Authentication required")
        }

        // Validate the upload pathname
        if (!pathname.startsWith("audio/")) {
          throw new Error("Invalid upload path")
        }

        return {
          allowedContentTypes: [
            "audio/mpeg",
            "audio/wav",
            "audio/flac",
            "audio/mp4",
            "audio/ogg",
            "audio/x-m4a",
            "audio/aac",
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        }
      },
      onUploadCompleted: async () => {
        // Optional: could log or track upload completion
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[ClientToken] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token generation failed" },
      { status: 400 }
    )
  }
}
