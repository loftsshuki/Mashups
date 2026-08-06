import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { separateStems, isReplicateConfigured, getEstimatedProcessingTime } from "@/lib/audio/replicate"
import { separateStemsModal, isModalConfigured } from "@/lib/audio/modal-stems"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { parseExternalHttpUrl } from "@/lib/security/external-url"

// Demucs takes 30-60+ seconds — extend Vercel function timeout
export const maxDuration = 60

const requestSchema = z.object({
  audioUrl: z.string().min(1).max(2048),
  duration: z.number().min(1).max(3600).optional(),
})

/** Convert a data URI to a Blob, upload to Vercel Blob, return URL */
async function uploadDataUriToBlob(dataUri: string, stemName: string): Promise<string> {
  if (!dataUri || !dataUri.startsWith("data:")) return dataUri

  try {
    const { put } = await import("@vercel/blob")

    // Parse the data URI
    const [header, b64Data] = dataUri.split(",")
    const mimeMatch = header.match(/data:([^;]+)/)
    const mime = mimeMatch ? mimeMatch[1] : "audio/mpeg"
    const ext = mime.includes("wav") ? "wav" : "mp3"

    // Decode base64 to buffer
    const buffer = Buffer.from(b64Data, "base64")

    const blob = await put(
      `stems/${Date.now()}-${stemName}.${ext}`,
      buffer,
      { access: "public", contentType: mime }
    )

    return blob.url
  } catch (err) {
    console.warn(`[API /audio/separate] Failed to upload ${stemName} to Blob, using data URI:`, err)
    return dataUri
  }
}

export async function POST(request: NextRequest) {
  let usageEventId: string | null = null
  try {
    // Check if any provider is configured (Modal or Replicate)
    const useModal = isModalConfigured()
    const useReplicate = isReplicateConfigured()

    if (!useModal && !useReplicate) {
      return NextResponse.json(
        {
          error: "Stem separation is not configured. Please set MODAL_STEM_ENDPOINT or REPLICATE_API_TOKEN.",
          code: "NOT_CONFIGURED"
        },
        { status: 503 }
      )
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: "audioUrl is required", code: "MISSING_AUDIO_URL" },
        { status: 400 }
      )
    }

    const { audioUrl, duration } = parsed.data
    if (!parseExternalHttpUrl(audioUrl)) {
      return NextResponse.json(
        { error: "audioUrl must be a public HTTP(S) URL", code: "INVALID_URL" },
        { status: 400 }
      )
    }

    const tierCheck = await enforceTierLimit("stem_separations")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId

    const startTime = Date.now()
    let stems: { vocals: string; drums: string; bass: string; other: string }
    let provider: string

    // Try Modal first (priority), fall back to Replicate
    if (useModal) {
      console.log("[API /audio/separate] Using Modal provider")
      provider = "modal"
      try {
        const modalResult = await separateStemsModal(audioUrl)

        // Upload data URIs to Vercel Blob for smaller JSON response
        const [vocals, drums, bass, other] = await Promise.all([
          uploadDataUriToBlob(modalResult.vocals, "vocals"),
          uploadDataUriToBlob(modalResult.drums, "drums"),
          uploadDataUriToBlob(modalResult.bass, "bass"),
          uploadDataUriToBlob(modalResult.other, "other"),
        ])

        stems = { vocals, drums, bass, other }
      } catch (modalError) {
        console.warn("[API /audio/separate] Modal failed, trying Replicate fallback:", modalError)
        if (useReplicate) {
          provider = "replicate"
          stems = await separateStems(audioUrl)
        } else {
          throw modalError
        }
      }
    } else {
      console.log("[API /audio/separate] Using Replicate provider")
      provider = "replicate"
      stems = await separateStems(audioUrl)
    }

    const processingTime = (Date.now() - startTime) / 1000
    console.log(`[API /audio/separate] Complete via ${provider} in ${processingTime.toFixed(1)}s`)

    await finalizeUsage(usageEventId, "completed", {
      operation: "stem_separation",
      provider,
      processingTime,
    })

    return NextResponse.json({
      success: true,
      stems,
      provider,
      processingTime,
      estimatedDuration: getEstimatedProcessingTime(duration || 180),
    })

  } catch (error) {
    console.error("[API /audio/separate] Error:", error)

    const message = error instanceof Error ? error.message : "Unknown error"
    await finalizeUsage(usageEventId, "failed", {
      operation: "stem_separation",
      message,
    })

    return NextResponse.json(
      {
        error: "Stem separation failed",
        details: message,
        code: "SEPARATION_FAILED"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    modal: isModalConfigured(),
    replicate: isReplicateConfigured(),
    provider: isModalConfigured() ? "modal" : isReplicateConfigured() ? "replicate" : "none",
    model: "htdemucs",
    stems: ["vocals", "drums", "bass", "other"],
  })
}
