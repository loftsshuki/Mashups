import assert from "node:assert/strict"
import test from "node:test"

import { assessGreenAudio, assessGreenRights, canPublishGreenTrack } from "../src/lib/green-room/quality.ts"

test("rights gate requires both rights sides and derivative permissions", () => {
  const result = assessGreenRights({ masterControlConfirmed: true, compositionControlConfirmed: false, sampleStatus: "sample_free", stemExtractionAllowed: true, crossTrackDerivativesAllowed: true, inAppPlaybackAllowed: true, shortVideoExportAllowed: true, standaloneAudioExportAllowed: false, paidMediaAllowed: false, territories: ["Worldwide"] })
  assert.equal(result.passed, false)
  assert.match(result.reasons.join(" "), /Composition control/)
})

test("audio gate enforces export-safe quality thresholds", () => {
  const result = assessGreenAudio({ integratedLufs: -14, truePeakDb: -1.2, vocalBleedDb: -27, separationSdrDb: 14, phraseConfidence: 0.92, sampleScanStatus: "clear" })
  assert.deepEqual(result, { passed: true, score: 100, reasons: [] })
})

test("publication needs rights, audio, and two listening keeps", () => {
  const pass = { passed: true, score: 100, reasons: [] }
  assert.equal(canPublishGreenTrack(pass, pass, 1), false)
  assert.equal(canPublishGreenTrack(pass, pass, 2), true)
})
