/**
 * Modal stem separation client.
 *
 * Calls a Modal-deployed Demucs endpoint to split audio into
 * vocals / drums / bass / other.
 *
 * Set MODAL_STEM_ENDPOINT in .env.local to the URL Modal provides after deploy.
 */

export interface ModalStemResult {
  vocals: string // data URI (data:audio/mp3;base64,...) or empty
  drums: string
  bass: string
  other: string
}

/**
 * Server-only Modal endpoint. The browser must never call Modal directly
 * (that exposed an unauthenticated, unmetered GPU endpoint in the JS bundle).
 *
 * NEXT_PUBLIC_MODAL_STEM_ENDPOINT is read here only as a migration fallback for
 * deployments that configured the old public variable — this module is imported
 * exclusively by server code, so the value is never shipped to the client.
 * Prefer setting MODAL_STEM_ENDPOINT and removing the NEXT_PUBLIC_ one.
 */
function modalEndpoint(): string | undefined {
  return process.env.MODAL_STEM_ENDPOINT ?? process.env.NEXT_PUBLIC_MODAL_STEM_ENDPOINT
}

/**
 * Check if Modal is configured
 */
export function isModalConfigured(): boolean {
  return !!modalEndpoint()
}

/**
 * Separate audio into stems via Modal-hosted Demucs.
 * Returns data URIs for each stem (MP3 encoded).
 */
export async function separateStemsModal(audioUrl: string): Promise<ModalStemResult> {
  const endpoint = modalEndpoint()
  if (!endpoint) {
    throw new Error("MODAL_STEM_ENDPOINT is not configured")
  }

  console.log("[Modal] Starting stem separation for:", audioUrl)

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_url: audioUrl }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Modal stem separation failed (${response.status}): ${text}`)
  }

  const result = (await response.json()) as ModalStemResult & { error?: string }

  if (result.error) {
    throw new Error(`Modal error: ${result.error}`)
  }

  // Validate we got actual data
  if (!result.vocals && !result.drums && !result.bass && !result.other) {
    throw new Error("Modal returned empty stems")
  }

  console.log("[Modal] Stem separation complete")

  return result
}
