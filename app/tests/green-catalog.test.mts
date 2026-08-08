import assert from "node:assert/strict"
import test from "node:test"

import {
  assessGreenPair,
  getGreenTrack,
  getRecommendedGreenPairs,
  GREEN_CATALOG,
} from "../src/lib/catalog/green-catalog.ts"

test("every public prototype source is green, sample-free, and narrowly scoped", () => {
  assert.ok(GREEN_CATALOG.length >= 4)

  for (const track of GREEN_CATALOG) {
    assert.equal(track.rights.status, "green")
    assert.equal(track.rights.sourceType, "mashups-original")
    assert.equal(track.rights.samples, "none")
    assert.deepEqual(track.rights.allowed, ["create", "share", "personal-export"])
    assert.equal(track.rights.paidMedia, false)
    assert.match(track.rights.passportId, /^MASH-GREEN-\d{4}$/)
  }
})

test("catalog IDs are unique and resolvable", () => {
  const ids = GREEN_CATALOG.map((track) => track.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.equal(getGreenTrack(id)?.id, id)
})

test("relative-key tracks produce a strong compatible pair", () => {
  const left = getGreenTrack("signal-bloom")
  const right = getGreenTrack("heat-map")
  assert.ok(left && right)

  const assessment = assessGreenPair(left, right)
  assert.equal(assessment.compatible, true)
  assert.equal(assessment.harmonicFit, "relative")
  assert.ok(assessment.score >= 90)
})

test("recommended pairs never include an incompatible source combination", () => {
  const pairs = getRecommendedGreenPairs(20)
  assert.ok(pairs.length > 0)
  assert.ok(pairs.every((pair) => pair.assessment.compatible))
})
