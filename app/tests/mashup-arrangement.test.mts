import assert from "node:assert/strict"
import test from "node:test"

import {
  buildMashupArrangementPlan,
  estimateTempoGridFromPcm,
  findStrongPhraseStart,
} from "../src/lib/audio/mashup-arrangement.ts"

test("uses direct beat matching for nearby tempos", () => {
  const plan = buildMashupArrangementPlan(126, 128)

  assert.equal(plan.compatible, true)
  assert.equal(plan.mode, "direct")
  assert.ok(Math.abs(plan.vocalPlaybackRate - 128 / 126) < 0.0001)
  assert.equal(plan.totalBars, 16)
  assert.equal(plan.bodyBars, 12)
})

test("maps three source beats over four destination beats for hostile 4:3 tempos", () => {
  const plan = buildMashupArrangementPlan(99.384, 129.199)

  assert.equal(plan.compatible, true)
  assert.equal(plan.mode, "three-over-four")
  assert.equal(plan.sourceBodyBars, 9)
  assert.ok(Math.abs(plan.vocalPlaybackRate - 0.975) < 0.002)
  assert.ok(Math.abs(plan.totalDuration - 29.72) < 0.05)
})

test("rejects relationships that still require destructive warping", () => {
  const plan = buildMashupArrangementPlan(90, 150)

  assert.equal(plan.compatible, false)
  assert.equal(plan.mode, "unsupported")
})

test("detects tempo and beat offset from a synthetic click track", () => {
  const sampleRate = 8_000
  const bpm = 129.2
  const offset = 0.2
  const duration = 30
  const samples = new Float32Array(sampleRate * duration)
  const beatInterval = 60 / bpm

  for (let beat = 0, time = offset; time < duration; beat += 1, time += beatInterval) {
    const start = Math.floor(time * sampleRate)
    const amplitude = beat % 4 === 0 ? 1 : 0.55
    for (let sample = start; sample < Math.min(samples.length, start + 80); sample += 1) {
      samples[sample] = amplitude * Math.exp(-(sample - start) / 18)
    }
  }

  const analysis = estimateTempoGridFromPcm([samples], sampleRate)

  assert.ok(Math.abs(analysis.bpm - bpm) < 2)
  assert.ok(analysis.confidence > 0.2)
  assert.ok(analysis.downbeatOffset >= analysis.beatOffset)
})

test("selects the strongest complete phrase on the downbeat grid", () => {
  const sampleRate = 200
  const duration = 60
  const samples = new Float32Array(sampleRate * duration)
  for (let sample = 20 * sampleRate; sample < 36 * sampleRate; sample += 1) {
    samples[sample] = 0.5
  }

  const start = findStrongPhraseStart(
    [samples],
    sampleRate,
    { bpm: 120, downbeatOffset: 0 },
    8,
  )

  assert.ok(start >= 19 && start <= 21)
})
