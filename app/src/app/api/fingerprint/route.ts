import { createHash } from "node:crypto"
import { NextResponse } from "next/server"

interface FingerprintRequestBody {
  trackId?: string
  audioUrl?: string
}

function hashHex(value: Uint8Array | string): string {
  return createHash("sha256").update(value).digest("hex")
}

function toSegmentHash(bytes: Uint8Array): string {
  if (bytes.length === 0) return hashHex("empty")
  const chunkSize = Math.min(64 * 1024, Math.max(1024, Math.floor(bytes.length / 6)))
  const start = bytes.subarray(0, chunkSize)
  const midStart = Math.max(0, Math.floor(bytes.length / 2) - Math.floor(chunkSize / 2))
  const middle = bytes.subarray(midStart, Math.min(bytes.length, midStart + chunkSize))
  const endStart = Math.max(0, bytes.length - chunkSize)
  const end = bytes.subarray(endStart, bytes.length)

  const combined = new Uint8Array(start.length + middle.length + end.length)
  combined.set(start, 0)
  combined.set(middle, start.length)
  combined.set(end, start.length + middle.length)
  return hashHex(combined)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FingerprintRequestBody
    if (!body.trackId && !body.audioUrl) {
      return NextResponse.json({ error: "trackId or audioUrl is required" }, { status: 400 })
    }

    const seed = `${body.trackId ?? "unknown"}|${body.audioUrl ?? "none"}`
    let fingerprint = hashHex(seed)
    let engine = "deterministic-seed-v1"
    let byteLength = 0

    if (body.audioUrl) {
      try {
        const resolvedUrl = new URL(body.audioUrl, request.url).toString()
        const response = await fetch(resolvedUrl, { cache: "no-store" })
        if (response.ok) {
          const buffer = new Uint8Array(await response.arrayBuffer())
          byteLength = buffer.length
          const fullHash = hashHex(buffer)
          const segmentHash = toSegmentHash(buffer)
          fingerprint = hashHex(`${fullHash}:${segmentHash}:${byteLength}:${seed}`)
          engine = "audio-hash-v2"
        }
      } catch {
        // Fall back to deterministic seed hash.
      }
    }

    return NextResponse.json({
      status: "ok",
      fingerprint,
      engine,
      byteLength,
    })
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 })
  }
}
