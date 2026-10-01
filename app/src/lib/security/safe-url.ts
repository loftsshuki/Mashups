/**
 * Server-side guard for URLs that our code will fetch or hand to a paid vendor
 * (Demucs/Modal, Replicate, fingerprinting).
 *
 * Only absolute https URLs on our own storage hosts are allowed:
 *   - Vercel Blob (`*.blob.vercel-storage.com`)
 *   - this project's Supabase host (from NEXT_PUBLIC_SUPABASE_URL)
 *
 * Never resolve user input against request.url — that enabled SSRF against
 * internal and cloud-metadata endpoints.
 */

function supabaseHost(): string | null {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.toLowerCase()
      : null
  } catch {
    return null
  }
}

/** Returns the normalized URL if it is safe to fetch, otherwise null. */
export function resolveSafeStorageUrl(raw: string): string | null {
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
