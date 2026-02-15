/**
 * Modal stem separation client.
 *
 * Calls a Modal-deployed Demucs endpoint to split audio into
 * vocals / drums / bass / other.
 *
 * Set MODAL_STEM_ENDPOINT in .env.local to the URL Modal provides after deploy.
 */

export interface ModalStemResult {
  vocals: string // base64-encoded WAV
  drums: string
  bass: string
  other: string
}

/**
 * Check if Modal is configured
 */
export function isModalConfigured(): boolean {
  return !!process.env.MODAL_STEM_ENDPOINT
}

/**
 * Separate audio into stems via Modal-hosted Demucs.
 * Returns base64-encoded WAV strings for each stem.
 */
export async function separateStemsModal(audioUrl: string): Promise<ModalStemResult> {
  const endpoint = process.env.MODAL_STEM_ENDPOINT
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

  const result = (await response.json()) as ModalStemResult

  // Validate we got actual data
  if (!result.vocals && !result.drums && !result.bass && !result.other) {
    throw new Error("Modal returned empty stems")
  }

  console.log("[Modal] Stem separation complete")

  return result
}
