import { NextRequest, NextResponse } from "next/server"
import { separateStems, isReplicateConfigured, getEstimatedProcessingTime } from "@/lib/audio/replicate"

export async function POST(request: NextRequest) {
  try {
    // Check if Replicate is configured
    if (!isReplicateConfigured()) {
      return NextResponse.json(
        { 
          error: "Stem separation is not configured. Please set REPLICATE_API_TOKEN.",
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

    console.log("[API /audio/separate] Processing:", audioUrl)

    // Start stem separation
    const startTime = Date.now()
    const stems = await separateStems(audioUrl)
    const processingTime = (Date.now() - startTime) / 1000

    console.log(`[API /audio/separate] Complete in ${processingTime.toFixed(1)}s`)

    return NextResponse.json({
      success: true,
      stems,
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
    configured: isReplicateConfigured(),
    model: "cjwbw/demucs",
    stems: ["vocals", "drums", "bass", "other"],
  })
}
