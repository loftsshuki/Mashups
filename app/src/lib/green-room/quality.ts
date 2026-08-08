import type { GreenAudioMetrics, GreenQualityGate, GreenRightsInput } from "./types.ts"

export function assessGreenRights(input: GreenRightsInput): GreenQualityGate {
  const reasons: string[] = []
  if (!input.masterControlConfirmed) reasons.push("Master control is not confirmed.")
  if (!input.compositionControlConfirmed) reasons.push("Composition control is not confirmed.")
  if (input.sampleStatus === "unknown") reasons.push("Sample status is unresolved.")
  if (!input.stemExtractionAllowed) reasons.push("Stem extraction is not licensed.")
  if (!input.crossTrackDerivativesAllowed) reasons.push("Cross-track derivative use is not licensed.")
  if (!input.inAppPlaybackAllowed) reasons.push("In-app playback is not licensed.")
  if (input.standaloneAudioExportAllowed) reasons.push("Standalone audio export is forbidden during the pilot.")
  if (input.territories.length === 0) reasons.push("At least one territory is required.")
  if (input.endsAt && Date.parse(input.endsAt) <= Date.now()) reasons.push("The rights term has expired.")

  return { passed: reasons.length === 0, score: Math.max(0, 100 - reasons.length * 18), reasons }
}

export function assessGreenAudio(metrics: GreenAudioMetrics): GreenQualityGate {
  const reasons: string[] = []
  if (metrics.integratedLufs < -15 || metrics.integratedLufs > -13) reasons.push("Integrated loudness must be -14 LUFS +/- 1.")
  if (metrics.truePeakDb > -1) reasons.push("True peak must not exceed -1 dBTP.")
  if (metrics.separationSdrDb != null && metrics.separationSdrDb < 12) reasons.push("Stem separation SDR is below 12 dB.")
  if (metrics.vocalBleedDb != null && metrics.vocalBleedDb > -24) reasons.push("Vocal bleed is louder than -24 dB.")
  if (metrics.phraseConfidence < 0.85) reasons.push("Phrase alignment confidence is below 85%.")
  if (metrics.sampleScanStatus !== "clear") reasons.push("Sample scan is not clear.")

  return { passed: reasons.length === 0, score: Math.max(0, 100 - reasons.length * 16), reasons }
}

export function canPublishGreenTrack(rights: GreenQualityGate, audio: GreenQualityGate, listeningKeeps: number) {
  return rights.passed && audio.passed && listeningKeeps >= 2
}
