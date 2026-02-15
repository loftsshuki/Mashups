import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    mashupId?: string
    format?: string
  }

  if (!body.mashupId) {
    return NextResponse.json({ error: "mashupId is required" }, { status: 400 })
  }

  // In production this would render server-side using canvas/sharp.
  // For now, return metadata for client-side rendering.
  return NextResponse.json({
    success: true,
    format: body.format ?? "9:16",
    message: "Use the client-side BeforeAfterGenerator component for image generation.",
  })
}
