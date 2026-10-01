import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"

interface FingerprintRequestBody {
  trackId?: string
  audioUrl?: string
}

function hashHex(value: Uint8Array | string): string {
  return createHash("sha256").update(value).digest("hex")
}

function supabaseHost(): string | null {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.toLowerCase()
      : null
  } catch {
    return null
  }
}

/**
 * Only fetch audio from our own storage hosts, and only from absolute https URLs.
 * Never resolve the input against request.url — that allowed SSRF against internal
 * and cloud-metadata hosts.
 */
function resolveSafeAudioUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null
  const host = url.hostname.toLowerCase()
  const allowed = host.endsWith(".blob.vercel-storage.com") || host === supabaseHost()
  return allowed ? url.toString() : null
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
    const rate = consumeRateLimit({
      key: resolveRateLimitKey(request, "fingerprint.generate"),
      limit: 40,
      windowMs: 60_000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    const body = (await request.json()) as FingerprintRequestBody
    if (!body.trackId && !body.audioUrl) {
      return NextResponse.json({ error: "trackId or audioUrl is required" }, { status: 400 })
    }

    const seed = `${body.trackId ?? "unknown"}|${body.audioUrl ?? "none"}`
    let fingerprint = hashHex(seed)
    let engine = "deterministic-seed-v1"
    let byteLength = 0

    const fetchUrl = body.audioUrl ? resolveSafeAudioUrl(body.audioUrl) : null
    if (fetchUrl) {
      try {
        const response = await fetch(fetchUrl, { cache: "no-store" })
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
