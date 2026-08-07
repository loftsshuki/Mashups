import assert from "node:assert/strict"
import { test } from "node:test"

import { assessTrust, calculateIncrementalLift, priceCampaign, qualifyLaunchProtection, scoreArIntelligence, scoreMashupsIndex } from "../src/lib/domination/engines.ts"

const lift = calculateIncrementalLift({ metric: "save_rate", treatmentVisitors: 5200, treatmentConversions: 624, controlVisitors: 1800, controlConversions: 92 })

test("truth engine calculates credible incremental lift against control", () => {
  assert.equal(lift.treatmentRate, 0.12)
  assert.ok(lift.relativeLift > 1.3)
  assert.ok(lift.confidence >= 0.99)
  assert.equal(lift.credible, true)
})

test("truth engine refuses credibility for tiny samples", () => {
  const tiny = calculateIncrementalLift({ metric: "follow_rate", treatmentVisitors: 10, treatmentConversions: 8, controlVisitors: 10, controlConversions: 1 })
  assert.equal(tiny.credible, false)
})

test("trust assessment blocks suspicious rights and save behavior", () => {
  const result = assessTrust({ rightsVerified: false, audienceOverlap: 0.8, engagementAnomaly: 0.9, duplicateContentRate: 0.7, suspiciousSaveRate: 0.8, payoutDisputes: 4 })
  assert.equal(result.level, "restricted")
  assert.ok(result.score < 55)
})

test("campaign quote keeps pass-through budgets distinct from fees", () => {
  const quote = priceCampaign({ tier: "pilot", targetCreators: 50, mediaBudgetCents: 0, creatorRewardCents: 5000 })
  assert.equal(quote.platformFeeCents, 250000)
  assert.equal(quote.creatorBudgetCents, 250000)
  assert.equal(quote.operationsFeeCents, 37500)
  assert.equal(quote.totalCents, 537500)
})

test("launch protection requires every operational condition", () => {
  const protectedLaunch = qualifyLaunchProtection({ platformFeeCents: 250000, rightsVerified: true, trustScore: 92, treatmentSample: 500, controlSample: 200, artistContractAccepted: true, measurementConnected: true })
  assert.equal(protectedLaunch.status, "eligible")
  assert.equal(protectedLaunch.serviceCreditCents, 250000)
  assert.match(protectedLaunch.terms, /not insurance/i)
})

test("A&R intelligence combines lift, reproduction, trust, and completion", () => {
  const result = scoreArIntelligence({ lift, creatorKFactor: 1.42, trustScore: 94, completionRate: 0.84, strongestHookSec: 42, niche: "Nightlife", city: "Miami", costPerQualifiedActivationCents: 740 })
  assert.ok(result.breakoutProbability >= 80)
  assert.ok(result.paidReadiness >= 85)
})

test("Mashups Index excludes campaigns without credible lift or accepted rights", () => {
  const qualified = scoreMashupsIndex({ lift, creatorKFactor: 1.42, trustScore: 94, qualifiedPosts: 61, verifiedSaves: 2480, rightsAccepted: true })
  const rightsBlocked = scoreMashupsIndex({ lift, creatorKFactor: 1.42, trustScore: 94, qualifiedPosts: 61, verifiedSaves: 2480, rightsAccepted: false })
  assert.equal(qualified.qualified, true)
  assert.ok(qualified.score > 85)
  assert.equal(rightsBlocked.qualified, false)
  assert.ok(rightsBlocked.score < qualified.score)
})
