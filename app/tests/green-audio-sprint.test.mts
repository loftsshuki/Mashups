import assert from "node:assert/strict"
import { createPublicKey, verify } from "node:crypto"
import { readFileSync } from "node:fs"
import test from "node:test"

import { GREEN_ARRANGEMENT_IDS, buildGreenCreatePath, buildGreenNativeLink } from "@mashups/contracts"
import { buildGreenArrangementPlans } from "../src/lib/audio/green-arrangements.ts"
import { buildGreenBenchmarkCases, summarizeGreenBenchmark } from "../src/lib/audio/green-benchmark.ts"
import { selectGreenVideoMimeType } from "../src/lib/audio/green-video-export.ts"
import { assessGreenPair, getGreenTrack, validateGreenCatalogBinding } from "../src/lib/catalog/green-catalog.ts"
import { GREEN_CATALOG_MANIFEST, validateGreenCatalogManifest } from "../src/lib/catalog/catalog-manifest.ts"
import { signGreenProcessorCallback, verifyGreenProcessorCallback } from "../src/lib/green-room/processor-auth.ts"

test("portable contracts build canonical web and native creation links", () => {
  assert.equal(GREEN_ARRANGEMENT_IDS.length, 3)
  assert.equal(buildGreenCreatePath({ leftId: "signal-bloom", rightId: "heat-map" }), "/create?left=signal-bloom&right=heat-map")
  assert.equal(buildGreenNativeLink({ leftId: "signal-bloom", rightId: "heat-map", arrangement: "drop-swap" }), "mashups://create?left=signal-bloom&right=heat-map&arrangement=drop-swap")
})

test("signed static catalog is valid, bound to playable recipes, and forbids loose audio", () => {
  assert.equal(validateGreenCatalogManifest(GREEN_CATALOG_MANIFEST).valid, true)
  assert.equal(validateGreenCatalogBinding().valid, true)
  assert.ok(GREEN_CATALOG_MANIFEST.tracks.every((track) => track.standaloneAudioExport === false))
  const signatureEnvelope = JSON.parse(readFileSync(new URL("../public/catalog/green-pilot.v1.sig.json", import.meta.url), "utf8")) as { publicKey: string; signature: string }
  const payload = Buffer.from(JSON.stringify(GREEN_CATALOG_MANIFEST))
  assert.equal(verify(null, payload, createPublicKey(signatureEnvelope.publicKey), Buffer.from(signatureEnvelope.signature, "base64")), true)
  const tampered = Buffer.from(JSON.stringify({ ...GREEN_CATALOG_MANIFEST, issuer: "Mallory" }))
  assert.equal(verify(null, tampered, createPublicKey(signatureEnvelope.publicKey), Buffer.from(signatureEnvelope.signature, "base64")), false)
})

test("three arrangements use complete phrase-aligned 16-bar maps", () => {
  const left = getGreenTrack("signal-bloom")
  const right = getGreenTrack("heat-map")
  assert.ok(left && right)
  const assessment = assessGreenPair(left, right)
  const plans = buildGreenArrangementPlans(left, right, assessment)
  assert.deepEqual(plans.map((plan) => plan.id), [...GREEN_ARRANGEMENT_IDS])
  for (const plan of plans) {
    assert.equal(plan.totalBars, 16)
    assert.equal(plan.segments.reduce((bars, segment) => bars + segment.bars, 0), 16)
    assert.ok(plan.segments.every((segment) => segment.startBar >= 0 && segment.startBar + segment.bars <= 16))
  }
  const swap = plans.find((plan) => plan.id === "drop-swap")
  assert.equal(swap?.segments.find((segment) => segment.name === "drop")?.startBar, 8)
})

test("preflight rejects destructive tempo, key, and phrase relationships", () => {
  const baseLeft = getGreenTrack("signal-bloom")
  const baseRight = getGreenTrack("heat-map")
  assert.ok(baseLeft && baseRight)
  const tempo = assessGreenPair({ ...baseLeft, bpm: 90 }, { ...baseRight, bpm: 150 })
  assert.equal(tempo.compatible, false)
  assert.match(tempo.reasons.join(" "), /Tempo/i)
  const key = assessGreenPair({ ...baseLeft, camelot: "2A", key: "D# minor" }, baseRight)
  assert.equal(key.compatible, false)
  assert.match(key.reasons.join(" "), /Camelot/i)
  const phrase = assessGreenPair({ ...baseLeft, phraseConfidence: 0.5 }, baseRight)
  assert.equal(phrase.compatible, false)
  assert.match(phrase.reasons.join(" "), /phrase/i)
})

test("72-case benchmark accepts strong renders and treats safe refusal as correct", () => {
  const cases = buildGreenBenchmarkCases()
  const summary = summarizeGreenBenchmark(cases, "test")
  assert.equal(cases.length, 72)
  assert.equal(summary.renderEligible + summary.preflightRejected, 72)
  assert.equal(summary.failed, 0)
  assert.equal(summary.passRate, 100)
})

test("video export prefers MP4, falls back to WebM, and fails closed", () => {
  assert.equal(selectGreenVideoMimeType((mime) => mime.startsWith("video/mp4")), "video/mp4;codecs=h264,aac")
  assert.equal(selectGreenVideoMimeType((mime) => mime === "video/webm"), "video/webm")
  assert.equal(selectGreenVideoMimeType(() => false), null)
})

test("processor callbacks require a fresh body-bound signature", () => {
  const secret = "test-secret"
  const body = JSON.stringify({ jobId: "job-1", status: "succeeded" })
  const timestamp = Date.now()
  const signature = signGreenProcessorCallback(timestamp, body, secret)
  assert.equal(verifyGreenProcessorCallback(timestamp, body, signature, secret), true)
  assert.equal(verifyGreenProcessorCallback(timestamp, `${body} `, signature, secret), false)
  assert.equal(verifyGreenProcessorCallback(timestamp - 6 * 60_000, body, signature, secret), false)
})
