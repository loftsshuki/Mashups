import { createHash } from "node:crypto"
import { NextResponse } from "next/server"

interface FingerprintRequestBody {
  trackId?: string
  audioUrl?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FingerprintRequestBody
    if (!body.trackId && !body.audioUrl) {
      return NextResponse.json(
        { error: "trackId or audioUrl is required" },
        { status: 400 },
      )
    }

    const seed = `${body.trackId ?? "unknown"}|${body.audioUrl ?? "none"}`
    const fingerprint = createHash("sha256").update(seed).digest("hex")

    return NextResponse.json({
      status: "ok",
      fingerprint,
      engine: "stub-v1",
      message:
        "Fingerprint generated from deterministic seed. Replace with acoustic fingerprint pipeline in production.",
    })
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 })
  }
}
