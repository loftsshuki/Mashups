import type { CaptionSegment } from "@/lib/data/auto-caption"

/**
 * Produces timestamped caption segments with the current transcription model.
 * The legacy export name is retained to avoid breaking existing callers.
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  language = "en",
): Promise<CaptionSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured")

  const formData = new FormData()
  formData.append("file", audioBlob, "audio.mp3")
  formData.append("model", "gpt-4o-transcribe-diarize")
  formData.append("response_format", "diarized_json")
  formData.append("chunking_strategy", "auto")
  if (language) formData.append("language", language)

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Transcription API error ${response.status}: ${errorBody}`)
  }

  const result = (await response.json()) as {
    segments?: Array<{
      start: number
      end: number
      text: string
      speaker?: string
    }>
  }

  return (result.segments ?? []).map((segment, index) => ({
    id: `seg_${index}`,
    startTime: segment.start,
    endTime: segment.end,
    text: segment.text.trim(),
    confidence: 90,
  }))
}
