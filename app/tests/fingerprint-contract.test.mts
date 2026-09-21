import assert from "node:assert/strict"
import test from "node:test"

import {
  assertFingerprintSource,
  normalizeGreenFingerprintEvidence,
} from "../src/lib/green-room/fingerprint-contract.ts"

const source="a".repeat(64)

test("provider-neutral fingerprint results normalize without claiming rights clearance", () => {
  assert.deepEqual(
    normalizeGreenFingerprintEvidence(source,{reference:"scan-clear",matches:0}),
    {sourceSha256:source,sampleScanStatus:"clear",providerReference:"scan-clear",matchCount:0},
  )
  assert.equal(
    normalizeGreenFingerprintEvidence(source,{reference:"scan-hit",matches:2}).sampleScanStatus,
    "flagged",
  )
  assert.equal(
    normalizeGreenFingerprintEvidence(source,{reference:"scan-down",matches:0,unavailable:true}).sampleScanStatus,
    "unavailable",
  )
})

test("fingerprint evidence is bound to the exact source hash", () => {
  const evidence=normalizeGreenFingerprintEvidence(source,{reference:"scan-1",matches:0})
  assert.equal(assertFingerprintSource(evidence,source).providerReference,"scan-1")
  assert.throws(()=>assertFingerprintSource(evidence,"b".repeat(64)),/authorized source hash/)
})
