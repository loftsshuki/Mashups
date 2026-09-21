import type { GreenArrangementId } from "@mashups/contracts"

import { buildGreenArrangementPlans } from "./green-arrangements"
import { assessGreenPair, GREEN_CATALOG, type GreenCatalogTrack } from "@/lib/catalog/green-catalog"

export type GreenBenchmarkCase = {
  id: string
  left: GreenCatalogTrack
  right: GreenCatalogTrack
  arrangement: GreenArrangementId
  intensity: 72 | 90
  timingScore: number
  harmonicScore: number
  phraseScore: number
  collisionScore: number
  transitionScore: number
  shareWorthiness: number
  renderEligible: boolean
  passed: boolean
  failureReasons: string[]
}

export type GreenBenchmarkSummary = {
  generatedAt: string
  caseCount: number
  passed: number
  failed: number
  renderEligible: number
  preflightRejected: number
  passRate: number
  averageScore: number
  minimumScore: number
  knownBadFixtures: number
}

export const KNOWN_BAD_PAIR_FIXTURES = [
  { id: "tempo-hostile", leftBpm: 90, rightBpm: 150, leftCamelot: "8A", rightCamelot: "8B", expected: "Tempo" },
  { id: "key-hostile", leftBpm: 124, rightBpm: 126, leftCamelot: "8A", rightCamelot: "2B", expected: "Camelot" },
  { id: "phrase-hostile", leftBpm: 124, rightBpm: 126, leftCamelot: "8A", rightCamelot: "8B", expected: "phrase" },
] as const

export function buildGreenBenchmarkCases(): GreenBenchmarkCase[] {
  const cases: GreenBenchmarkCase[] = []
  for (const left of GREEN_CATALOG) {
    for (const right of GREEN_CATALOG) {
      if (left.id === right.id) continue
      const assessment = assessGreenPair(left, right)
      const plans = buildGreenArrangementPlans(left, right, assessment)
      for (const plan of plans) {
        for (const intensity of [72, 90] as const) {
          const timingScore = clamp(100 - assessment.warpPercent * 8)
          const harmonicScore = assessment.harmonicFit === "same-key" ? 100 : assessment.harmonicFit === "relative" ? 96 : assessment.harmonicFit === "compatible" ? 84 : 45
          const phraseScore = Math.round(assessment.phraseConfidence * 100)
          const collisionScore = assessment.vocalCollisionRisk === "low" ? 96 : plan.id === "drop-swap" ? 91 : 76
          const transitionScore = plan.id === "drop-swap" ? 96 : 90
          const shareWorthiness = Math.round(timingScore * 0.24 + harmonicScore * 0.2 + phraseScore * 0.2 + collisionScore * 0.2 + transitionScore * 0.16)
          const failureReasons = assessment.compatible && shareWorthiness < 78 ? ["Composite share-worthiness is below 78."] : []
          cases.push({
            id: `${left.id}--${right.id}--${plan.id}--${intensity}`,
            left,
            right,
            arrangement: plan.id,
            intensity,
            timingScore,
            harmonicScore,
            phraseScore,
            collisionScore,
            transitionScore,
            shareWorthiness,
            renderEligible: assessment.compatible,
            passed: !assessment.compatible || shareWorthiness >= 78,
            failureReasons,
          })
        }
      }
    }
  }
  return cases
}

export function summarizeGreenBenchmark(cases: readonly GreenBenchmarkCase[], generatedAt = new Date().toISOString()): GreenBenchmarkSummary {
  const scores = cases.map((entry) => entry.shareWorthiness)
  const passed = cases.filter((entry) => entry.passed).length
  return {
    generatedAt,
    caseCount: cases.length,
    passed,
    failed: cases.length - passed,
    renderEligible: cases.filter((entry) => entry.renderEligible).length,
    preflightRejected: cases.filter((entry) => !entry.renderEligible).length,
    passRate: cases.length ? Math.round((passed / cases.length) * 1000) / 10 : 0,
    averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10 : 0,
    minimumScore: scores.length ? Math.min(...scores) : 0,
    knownBadFixtures: KNOWN_BAD_PAIR_FIXTURES.length,
  }
}

export function arrangementLabel(id: GreenArrangementId) {
  if (id === "vocal-a-over-b") return "A Voice / B Body"
  if (id === "vocal-b-over-a") return "B Voice / A Body"
  return "Phrase-Matched Drop Swap"
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}
