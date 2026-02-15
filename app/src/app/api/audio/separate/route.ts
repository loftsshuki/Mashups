import { NextRequest, NextResponse } from "next/server"
import { separateStems, isReplicateConfigured, getEstimatedProcessingTime } from "@/lib/audio/replicate"
import { separateStemsModal, isModalConfigured } from "@/lib/audio/modal-stems"
import { enforceTierLimit } from "@/lib/billing/enforce-tier"

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

    // Validate audio URL format
    try {
      new URL(audioUrl)
    } catch {
      return NextResponse.json(
        { error: "Invalid audioUrl format", code: "INVALID_URL" },
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
        const modalResult = await separateStemsModal(audioUrl)
        // Modal returns base64 WAV data — convert to data URIs for the client
        stems = {
          vocals: modalResult.vocals ? `data:audio/wav;base64,${modalResult.vocals}` : "",
          drums: modalResult.drums ? `data:audio/wav;base64,${modalResult.drums}` : "",
          bass: modalResult.bass ? `data:audio/wav;base64,${modalResult.bass}` : "",
          other: modalResult.other ? `data:audio/wav;base64,${modalResult.other}` : "",
        }
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
