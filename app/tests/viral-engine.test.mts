import assert from "node:assert/strict"
import test from "node:test"

import {
  calculateCreatorKFactor,
  calculateGenomeScore,
  calculateUnlockProgress,
  isQualifiedActivation,
} from "../src/lib/viral/types.ts"

test("genome score rewards downstream propagation signals", () => {
  const score = calculateGenomeScore({
    completionRate: 0.8,
    shareRate: 0.2,
    saveRate: 0.1,
    forkRate: 0.15,
  })
  assert.equal(score, 31.5)
})

test("creator K-factor returns recruited creators per publisher", () => {
  assert.equal(calculateCreatorKFactor(100, 142), 1.42)
  assert.equal(calculateCreatorKFactor(0, 50), 0)
})

test("unlock progress is bounded at 100 percent", () => {
  assert.equal(calculateUnlockProgress({ id: "1", title: "Stems", action: "forks", target: 500, current: 600, reward: "Stems", unlocked: true }), 100)
})

test("qualified activations reject fraud and vanity-only views", () => {
  assert.equal(isQualifiedActivation({ rightsValid: true, attributed: true, fraudScore: 0.2, engagedViews: 500, meaningfulActions: 12 }), true)
  assert.equal(isQualifiedActivation({ rightsValid: true, attributed: true, fraudScore: 0.8, engagedViews: 50000, meaningfulActions: 120 }), false)
  assert.equal(isQualifiedActivation({ rightsValid: true, attributed: true, fraudScore: 0.1, engagedViews: 99, meaningfulActions: 30 }), false)
})
