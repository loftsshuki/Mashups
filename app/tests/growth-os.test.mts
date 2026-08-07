import assert from "node:assert/strict"
import { test } from "node:test"

import { bountyMultiplier, decideAutopilotActions, opportunityScore, signalScore } from "../src/lib/growth-os/autopilot.ts"
import { decryptToken, encryptToken } from "../src/lib/security/token-vault.ts"
import { signOAuthState, verifyOAuthState } from "../src/lib/security/oauth-state.ts"

const winner = {
  genomeId: "g1", name: "Drop Confession", niche: "Nightlife", city: "Miami",
  qualifiedActivations: 72, completionRate: 0.84, shareRate: 0.128, saveRate: 0.074,
  costPerQualifiedActivationCents: 740, followerMedian: 3200,
}

test("autopilot promotes organic winners and prepares paid-media consent", () => {
  assert.ok(signalScore(winner) >= 74)
  const actions = decideAutopilotActions([winner])
  assert.ok(actions.some((action) => action.type === "promote_genome"))
  assert.ok(actions.some((action) => action.type === "handoff_paid_media"))
  assert.ok(actions.some((action) => action.type === "expand_city"))
})

test("autopilot retires weak genomes only after a credible sample", () => {
  const actions = decideAutopilotActions([{ ...winner, genomeId: "g2", qualifiedActivations: 34, completionRate: 0.22, shareRate: 0.01, saveRate: 0.005, costPerQualifiedActivationCents: 3000 }])
  assert.equal(actions[0]?.type, "retire_genome")
})

test("opportunity score does not reward follower count", () => {
  const small = opportunityScore({ performancePercentile: 88, reliability: 92, rightsStanding: 100, followerCount: 300 })
  const large = opportunityScore({ performancePercentile: 88, reliability: 92, rightsStanding: 100, followerCount: 3_000_000 })
  assert.ok(small >= large)
})

test("dynamic bounty raises rewards for underserved discovery cells", () => {
  assert.equal(bountyMultiplier({ supplyRatio: 0.2, cityPriority: 1, nichePriority: 0.8, followerCount: 1200 }), 2.53)
})

test("token vault encrypts and authenticates platform credentials", () => {
  const encrypted = encryptToken("refresh-secret", "unit-test-key")
  assert.notEqual(encrypted, "refresh-secret")
  assert.equal(decryptToken(encrypted, "unit-test-key"), "refresh-secret")
  assert.throws(() => decryptToken(`${encrypted}bad`, "unit-test-key"))
})

test("OAuth state is signed and expires", () => {
  const now = Date.now()
  const token = signOAuthState({ provider: "spotify", userId: "u1", returnTo: "/network", issuedAt: now }, "state-secret")
  assert.equal(verifyOAuthState(token, "state-secret", now).provider, "spotify")
  assert.throws(() => verifyOAuthState(token, "state-secret", now + 11 * 60_000))
})
