import { NextRequest, NextResponse } from "next/server"
import { separateStems, isReplicateConfigured, getEstimatedProcessingTime } from "@/lib/audio/replicate"
import { separateStemsModal, isModalConfigured } from "@/lib/audio/modal-stems"
import { enforceTierLimit, recordUsage } from "@/lib/billing/enforce-tier"
import { resolveSafeStorageUrl } from "@/lib/security/safe-url"

// Demucs takes 30-60+ seconds per track, plus GPU cold start. This route is now the
// only path to the GPU (the browser no longer calls Modal directly), so give it room.
// 300s is within the Fluid Compute limit on every Vercel plan.
export const maxDuration = 300

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
  try {
    // Check stem separation limit
    const tierCheck = await enforceTierLimit("stem_separations")
    if (tierCheck instanceof NextResponse) return tierCheck

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

    // Parse request body
    const body = await request.json()
    const { audioUrl, duration } = body

    if (!audioUrl || typeof audioUrl !== "string") {
      return NextResponse.json(
        { error: "audioUrl is required", code: "MISSING_AUDIO_URL" },
        { status: 400 }
      )
    }

    // Only hand our own storage URLs to the paid GPU vendors (SSRF / abuse guard).
    const safeAudioUrl = resolveSafeStorageUrl(audioUrl)
    if (!safeAudioUrl) {
      return NextResponse.json(
        { error: "audioUrl must be an uploaded track from Mashups storage", code: "INVALID_URL" },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let stems: { vocals: string; drums: string; bass: string; other: string }
    let provider: string

    // Try Modal first (priority), fall back to Replicate
    if (useModal) {
      console.log("[API /audio/separate] Using Modal provider")
      provider = "modal"
      try {
        const modalResult = await separateStemsModal(safeAudioUrl)

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
          stems = await separateStems(safeAudioUrl)
        } else {
          throw modalError
        }
      }
    } else {
      console.log("[API /audio/separate] Using Replicate provider")
      provider = "replicate"
      stems = await separateStems(safeAudioUrl)
    }

    const processingTime = (Date.now() - startTime) / 1000
    console.log(`[API /audio/separate] Complete via ${provider} in ${processingTime.toFixed(1)}s`)

    await recordUsage(tierCheck.userId, "stem_separations", { provider })

    return NextResponse.json({
      success: true,
      stems,
      provider,
      processingTime,
      estimatedDuration: getEstimatedProcessingTime(duration || 180),
    })

  } catch (error) {
    // Full vendor error stays in server logs; don't leak it to clients.
    console.error("[API /audio/separate] Error:", error)

    return NextResponse.json(
      {
        error: "Stem separation failed",
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
