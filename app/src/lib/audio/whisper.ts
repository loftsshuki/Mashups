// OpenAI Whisper integration for real audio transcription
import type { CaptionSegment } from "@/lib/data/auto-caption"

/**
 * Transcribe audio using OpenAI Whisper API.
 * Requires OPENAI_API_KEY environment variable.
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  language: string = "en",
): Promise<CaptionSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured")

  const formData = new FormData()
  formData.append("file", audioBlob, "audio.mp3")
  formData.append("model", "whisper-1")
  formData.append("response_format", "verbose_json")
  formData.append("timestamp_granularities[]", "segment")
  if (language) formData.append("language", language)

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Whisper API error ${response.status}: ${errorBody}`)
  }

  const result = await response.json()

  // Map Whisper segments to our CaptionSegment format
  const segments: CaptionSegment[] = (result.segments ?? []).map(
    (seg: { id: number; start: number; end: number; text: string; avg_logprob?: number }, i: number) => ({
      id: `seg_${i}`,
      startTime: seg.start,
      endTime: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob != null
        ? Math.round(Math.min(100, Math.max(0, (1 + seg.avg_logprob) * 100)))
        : 85,
    }),
  )

  return segments
}
