interface QualityInput {
  bpm?: number
  titleLength: number
  descriptionLength: number
  sourceTrackCount: number
  hasCover: boolean
}

export interface PublishQualityScore {
  audioQuality: number
  viralReadiness: number
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function scorePublishReadiness(input: QualityInput): PublishQualityScore {
  const bpmScore = input.bpm ? 100 - Math.min(60, Math.abs(input.bpm - 120) * 0.8) : 50
  const metaScore =
    Math.min(25, input.titleLength * 1.4) +
    Math.min(20, input.descriptionLength * 0.25) +
    Math.min(20, input.sourceTrackCount * 8) +
    (input.hasCover ? 15 : 0)

  const audioQuality = clamp100((bpmScore * 0.55 + metaScore * 0.45))
  const viralReadiness = clamp100(
    audioQuality * 0.6 +
      Math.min(25, input.titleLength) * 0.25 +
      Math.min(15, input.descriptionLength / 10) * 0.15,
  )

  return { audioQuality, viralReadiness }
}
