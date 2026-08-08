import { NextRequest, NextResponse } from "next/server"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { isDemoMode } from "@/lib/config/runtime"

export async function POST(request: NextRequest) {
  let usageEventId: string | null = null
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/flac",
      "audio/mp4",
      "audio/ogg",
      "audio/x-m4a",
      "audio/aac",
    ]
    
    // Check by mime type or extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const validExtensions = ["mp3", "wav", "flac", "m4a", "ogg", "aac", "mp4"]
    
    const isValidType = validTypes.includes(file.type) || 
                       (fileExtension && validExtensions.includes(fileExtension))
    
    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: MP3, WAV, FLAC, M4A, OGG, AAC" },
        { status: 400 }
      )
    }

    // Validate size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      )
    }

    const tierCheck = await enforceTierLimit("mashups")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId

    // Upload to Vercel Blob
    try {
      const { put } = await import("@vercel/blob")
      const blob = await put(
        `audio/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        file,
        {
          access: "public",
          contentType: file.type || "audio/mpeg",
        }
      )
      
      await finalizeUsage(usageEventId, "completed", { operation: "audio_upload" })
      return NextResponse.json({ url: blob.url })
    } catch (blobError) {
      console.error("[Upload] Vercel Blob failed:", blobError)
      if (isDemoMode()) {
        const placeholderUrl = `/audio/dev-upload-${Date.now()}.mp3`
        await finalizeUsage(usageEventId, "completed", { operation: "audio_upload", mode: "demo" })
        return NextResponse.json({ url: placeholderUrl, mode: "demo" })
      }
      await finalizeUsage(usageEventId, "failed", { operation: "audio_upload" })
      return NextResponse.json({ error: "Audio storage is unavailable." }, { status: 503 })
    }

  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "audio_upload" })
    console.error("[Upload] Error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Upload endpoint. POST with multipart/form-data containing 'file' field.",
    maxSize: "50MB",
    supportedTypes: ["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4", "audio/ogg", "audio/x-m4a"],
  })
}
