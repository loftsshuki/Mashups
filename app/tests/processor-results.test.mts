import assert from "node:assert/strict"
import test from "node:test"

import {
  parseGreenSampleScanStatus,
  preferSpecialistSampleScan,
  sampleScanStatusFromJobOutput,
} from "../src/lib/green-room/processor-results.ts"

test("sample-scan parsing accepts only supported specialist states", () => {
  assert.equal(parseGreenSampleScanStatus("clear"), "clear")
  assert.equal(parseGreenSampleScanStatus("flagged"), "flagged")
  assert.equal(parseGreenSampleScanStatus("unavailable"), "unavailable")
  assert.equal(parseGreenSampleScanStatus("unknown"), null)
  assert.equal(parseGreenSampleScanStatus(null), null)
})

test("specialist fingerprint output overrides analyzer uncertainty regardless of completion order", () => {
  assert.equal(
    preferSpecialistSampleScan("unavailable", { sampleScanStatus: "clear" }),
    "clear",
  )
  assert.equal(
    preferSpecialistSampleScan("unavailable", { sampleScanStatus: "flagged" }),
    "flagged",
  )
  assert.equal(
    preferSpecialistSampleScan("unavailable", {}),
    "unavailable",
  )
  assert.equal(
    sampleScanStatusFromJobOutput({ sampleScanStatus: "clear", providerReference: "pex-123" }),
    "clear",
  )
})
