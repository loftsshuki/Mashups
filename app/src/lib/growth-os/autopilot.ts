import type { AutopilotAction, GenomeSignal } from "@/lib/growth-os/types"

const PROMOTE_SAMPLE = 20
const RETIRE_SAMPLE = 30

export function signalScore(signal: GenomeSignal): number {
  const completion = clamp(signal.completionRate) * 30
  const share = clamp(signal.shareRate / 0.15) * 28
  const save = clamp(signal.saveRate / 0.1) * 27
  const efficiency = clamp(1 - signal.costPerQualifiedActivationCents / 2500) * 15
  return round(completion + share + save + efficiency)
}

export function opportunityScore(input: {
  performancePercentile: number
  reliability: number
  rightsStanding: number
  followerCount: number
}): number {
  const performance = clamp(input.performancePercentile / 100) * 45
  const reliability = clamp(input.reliability / 100) * 30
  const rights = clamp(input.rightsStanding / 100) * 25
  const followerPenalty = Math.min(5, Math.log10(Math.max(1, input.followerCount)) * 0.6)
  return round(Math.max(0, performance + reliability + rights - followerPenalty))
}

export function bountyMultiplier(input: {
  supplyRatio: number
  cityPriority: number
  nichePriority: number
  followerCount: number
}): number {
  const scarcityBoost = clamp(1 - input.supplyRatio) * 0.75
  const cityBoost = clamp(input.cityPriority) * 0.4
  const nicheBoost = clamp(input.nichePriority) * 0.35
  const discoveryBoost = input.followerCount < 5_000 ? 0.25 : 0
  return Math.min(3, Math.max(1, round(1 + scarcityBoost + cityBoost + nicheBoost + discoveryBoost)))
}

export function decideAutopilotActions(signals: GenomeSignal[]): AutopilotAction[] {
  return signals.flatMap((signal, index) => {
    const score = signalScore(signal)
    const actions: AutopilotAction[] = []
    const id = (suffix: string) => `${signal.genomeId}-${suffix}-${index}`

    if (signal.qualifiedActivations < PROMOTE_SAMPLE) {
      actions.push({
        id: id("hold"), type: "hold_for_signal", target: signal.name,
        reason: `${signal.qualifiedActivations}/${PROMOTE_SAMPLE} qualified activations; preserve the test budget until the sample is credible.`,
        confidence: 62, budgetDeltaCents: 0, status: "proposed",
      })
      return actions
    }

    if (score >= 74 && signal.shareRate >= 0.08) {
      actions.push({
        id: id("promote"), type: "promote_genome", target: signal.name,
        reason: `${score} signal score with ${(signal.shareRate * 100).toFixed(1)}% share intent; move into the next creator wave.`,
        confidence: Math.min(96, Math.round(70 + signal.qualifiedActivations / 4)),
        budgetDeltaCents: 50_000, status: "executed",
      })
    } else if (signal.qualifiedActivations >= RETIRE_SAMPLE && score < 48) {
      actions.push({
        id: id("retire"), type: "retire_genome", target: signal.name,
        reason: `${score} signal score after ${signal.qualifiedActivations} qualified activations; stop buying additional evidence.`,
        confidence: 88, budgetDeltaCents: -25_000, status: "executed",
      })
    } else {
      actions.push({
        id: id("hold"), type: "hold_for_signal", target: signal.name,
        reason: `${score} signal score is inconclusive; keep the cell live without increasing spend.`,
        confidence: 71, budgetDeltaCents: 0, status: "proposed",
      })
    }

    if (score >= 78 && signal.saveRate >= 0.06) {
      actions.push({
        id: id("media"), type: "handoff_paid_media", target: signal.name,
        reason: `Organic proof cleared the ${(signal.saveRate * 100).toFixed(1)}% save-rate threshold; request usage consent before paid amplification.`,
        confidence: 91, budgetDeltaCents: 75_000, status: "proposed",
      })
    }

    if (score >= 70 && signal.qualifiedActivations >= 25) {
      actions.push({
        id: id("city"), type: "expand_city", target: signal.city,
        reason: `${signal.city} produced repeatable lift in the ${signal.niche.toLowerCase()} cell; open a neighboring-city test.`,
        confidence: 82, budgetDeltaCents: 20_000, status: "proposed",
      })
    }
    return actions
  })
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
