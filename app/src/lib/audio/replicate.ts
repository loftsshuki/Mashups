import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export interface StemSeparationResult {
  vocals: string
  drums: string
  bass: string
  other: string
}

/**
 * Separate audio into stems using Replicate's Demucs model
 * Model: https://replicate.com/cjwbw/demucs
 */
export async function separateStems(audioUrl: string): Promise<StemSeparationResult> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not configured")
  }

  console.log("[Replicate] Starting stem separation for:", audioUrl)

  const output = await replicate.run(
    "cjwbw/demucs:25a173108cff36ef9dd746a863b0d2e0e4adf2ea4e9b1d6e4294ddb545c1ae3a",
    {
      input: {
        audio: audioUrl,
        model: "htdemucs",
        split: true,
        overlap: 0.25,
        mp3: false,
        mp3_bitrate: 320,
        float32: false,
        clip_mode: "rescale",
      },
    }
  )

  // The output format is an object with stem URLs
  const result = output as {
    vocals: string
    drums: string
    bass: string
    other: string
  }

  console.log("[Replicate] Stem separation complete")

  return {
    vocals: result.vocals,
    drums: result.drums,
    bass: result.bass,
    other: result.other,
  }
}

/**
 * Check if replicate is configured
 */
export function isReplicateConfigured(): boolean {
  return !!process.env.REPLICATE_API_TOKEN
}

/**
 * Get estimated processing time for stem separation
 * Demucs typically takes 30-60 seconds depending on track length
 */
export function getEstimatedProcessingTime(audioDurationSeconds: number): number {
  // Base time + time per minute of audio
  const baseTime = 15 // seconds
  const timePerMinute = 20 // seconds per minute of audio
  return Math.ceil(baseTime + (audioDurationSeconds / 60) * timePerMinute)
}
