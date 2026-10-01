import { ANALYSIS_SAMPLE_RATE, MAX_SECTION_SECONDS, MIN_SECTION_SECONDS, type SectionAnalysis } from "./blend-analysis"

export const MAX_FILE_BYTES = 25 * 1024 * 1024
export type DecodedIngredient = { buffer: AudioBuffer; file: File }

export async function decodeIngredient(file: File, signal: AbortSignal): Promise<DecodedIngredient> {
  if (file.size > MAX_FILE_BYTES) throw new Error("Choose a file under 25 MB, or export a shorter excerpt.")
  signal.throwIfAborted()
  const bytes = await file.arrayBuffer()
  signal.throwIfAborted()
  // Offline decoding avoids opening an audio device and resamples with the browser's anti-alias filter.
  const context = new OfflineAudioContext(2, 1, ANALYSIS_SAMPLE_RATE)
  let buffer: AudioBuffer
  try { buffer = await context.decodeAudioData(bytes) }
  catch { throw new Error("This browser could not read that audio. Try a WAV or MP3 file.") }
  signal.throwIfAborted()
  if (buffer.duration < MIN_SECTION_SECONDS) throw new Error("Choose at least 8 seconds of audio so the check has enough context.")
  if (buffer.duration > 600) throw new Error("Choose an excerpt under 10 minutes.")
  return { buffer, file }
}

export function sectionSamples(buffer: AudioBuffer, start: number, duration: number) {
  if (!Number.isFinite(start) || !Number.isFinite(duration) || start < 0 || duration < MIN_SECTION_SECONDS || duration > MAX_SECTION_SECONDS || start + duration > buffer.duration + 0.005) throw new Error("Choose an 8–30 second section within the file.")
  const offset = Math.round(start * buffer.sampleRate), length = Math.round(duration * buffer.sampleRate)
  // Use the most energetic channel to avoid cancelling anti-phase stereo during mono analysis.
  let channel = 0, bestEnergy = -1
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const values = buffer.getChannelData(c)
    let energy = 0
    for (let i = offset; i < offset + length; i++) energy += (values[i] ?? 0) ** 2
    if (energy > bestEnergy) { channel = c; bestEnergy = energy }
  }
  return buffer.getChannelData(channel).slice(offset, offset + length)
}

export function analyzeSection(buffer: AudioBuffer, start: number, duration: number, signal: AbortSignal): Promise<SectionAnalysis> {
  signal.throwIfAborted()
  const samples = sectionSamples(buffer, start, duration)
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./blend-analysis.worker.ts", import.meta.url), { type: "module" })
    const finish = () => { worker.terminate(); clearTimeout(timer); signal.removeEventListener("abort", abort) }
    const abort = () => { finish(); reject(new DOMException("Analysis cancelled", "AbortError")) }
    const timer = setTimeout(() => { finish(); reject(new Error("Analysis took too long. Try a shorter section.")) }, 45_000)
    signal.addEventListener("abort", abort, { once: true })
    worker.onmessage = (event: MessageEvent<{ result?: SectionAnalysis; error?: string }>) => {
      finish()
      if (event.data.result) resolve(event.data.result)
      else reject(new Error(event.data.error ?? "Audio analysis failed."))
    }
    worker.onerror = () => { finish(); reject(new Error("The audio worker could not start. Reload and try again.")) }
    worker.postMessage({ samples, sampleRate: buffer.sampleRate }, [samples.buffer])
  })
}
