import assert from "node:assert/strict"
import { test } from "node:test"
import { ANALYSIS_SAMPLE_RATE as sr, analyzeSamples, type SectionAnalysis } from "../src/lib/audio/blend-analysis.ts"
import { assessBlend } from "../src/lib/audio/blend-fit.ts"
import { sectionSamples } from "../src/lib/audio/blend-audio-client.ts"

function clicks(bpm: number, duration = 16) {
  const samples = new Float32Array(sr * duration)
  for (let at = 0.3; at < duration; at += 60 / bpm) {
    for (let i = 0; i < sr * 0.05; i++) samples[Math.floor(at * sr) + i] = Math.sin(i * 1.9) * Math.exp(-i / (sr * 0.008)) * 0.6
  }
  return samples
}

function melody(transpose = 0) {
  const samples = new Float32Array(sr * 24)
  // Original diatonic phrase with tonic cadences; repeated to span four analysis windows.
  const notes = [60, 64, 67, 72, 71, 69, 67, 65, 64, 62, 60, 60]
  for (let n = 0; n < 48; n++) {
    const hz = 440 * 2 ** ((notes[n % notes.length] + transpose - 69) / 12)
    for (let i = 0; i < sr / 2; i++) {
      const t = i / sr, env = Math.min(1, t * 70) * Math.min(1, (0.5 - t) * 30)
      samples[Math.floor(n * sr / 2) + i] = 0.3 * env * Math.sin(2 * Math.PI * hz * t)
    }
  }
  return samples
}

test("measures known click tempos without snapping to a preferred BPM", () => {
  for (const bpm of [90, 101, 120, 130, 157]) {
    const measured = analyzeSamples(clicks(bpm)).tempo
    assert.ok(measured.bpm !== null, `${bpm}: no tempo: ${JSON.stringify(measured)}`)
    assert.ok(Math.abs(measured.bpm - bpm) < 0.8, `${bpm}: got ${measured.bpm}`)
  }
})

test("silence and stationary noise do not acquire a made-up key or tempo", () => {
  const silence = analyzeSamples(new Float32Array(sr * 12))
  assert.equal(silence.tempo.bpm, null); assert.equal(silence.tonal.key, null)
  assert.equal(silence.signal.rmsDb, null)
  let seed = 17
  const noise = Float32Array.from({ length: sr * 16 }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return (seed / 2 ** 32 - 0.5) * 0.5
  })
  const result = analyzeSamples(noise)
  assert.equal(result.tonal.key, null)
  assert.equal(result.tempo.bpm, null)
  assert.equal(analyzeSamples(clicks(120)).tonal.key, null)
})

test("tonal evidence follows an actual transposition, not amplitude or sample order", () => {
  const original = analyzeSamples(melody())
  const shifted = analyzeSamples(melody(2))
  const quiet = analyzeSamples(melody().map((v) => v * 0.25))
  assert.ok(original.tonal.candidates.some((key) => key.tonic === 0 && key.mode === "major"), JSON.stringify(original.tonal))
  assert.equal(original.tonal.key?.tonic, 0, JSON.stringify(original.tonal))
  assert.equal(original.tonal.key?.mode, "major")
  assert.equal(shifted.tonal.candidates[0].tonic, (original.tonal.candidates[0].tonic + 2) % 12)
  assert.equal(quiet.tonal.candidates[0].tonic, original.tonal.candidates[0].tonic)
  assert.equal(quiet.tonal.candidates[0].mode, original.tonal.candidates[0].mode)
})

const measured = (): SectionAnalysis => ({
  version: "test", duration: 20,
  signal: { rmsDb: -18, peakDb: -3, nearFullScaleFraction: 0, silent: false },
  tempo: { bpm: 120, strength: 0.8, alternatives: [120], reason: "fixture" },
  tonal: { key: { tonic: 0, mode: "major", correlation: 0.9 }, candidates: [], chroma: [], agreement: 1, reason: "fixture" },
})

test("promising measured checks never mark timing, phrasing or artifacts as verified", () => {
  const result = assessBlend(measured(), measured(), { targetBpm: 122 })
  assert.equal(result.status, "Promising")
  for (const id of ["alignment", "phrasing", "audio"]) assert.equal(result.factors.find((f) => f.id === id)?.state, "unknown")
  assert.equal("score" in result, false)
  assert.equal("probability" in result, false)
})

test("a severe tempo change cannot average away; tempo changes are ratios, not pitch shifts", () => {
  const result = assessBlend(measured(), measured(), { targetBpm: 150, leadBpm: 101, backingBpm: 130 })
  assert.equal(result.status, "Difficult pairing")
  assert.ok(Math.abs(result.tempoChanges.lead! - (150 / 101 - 1) * 100) < 1e-9)
  const audition = assessBlend(measured(), measured(), { targetBpm: 114, leadBpm: 101, backingBpm: 130 })
  assert.equal(audition.status, "Needs adjustment")
  assert.ok(audition.factors[0].detail.includes("entered by you"))
})

test("unknown tonal evidence stays uncertain and does not prescribe a transposition", () => {
  const lead = measured(); lead.tonal.key = null
  const result = assessBlend(lead, measured(), { targetBpm: 120 })
  assert.equal(result.status, "Uncertain")
  assert.equal(result.factors.find((f) => f.id === "harmony")?.state, "unknown")
  assert.match(result.factors[1].action, /no pitch shift is recommended/)
})

test("relative key comparison is symmetric and half tempo needs confirmation", () => {
  const major = measured(), minor = measured()
  minor.tonal.key = { tonic: 9, mode: "minor", correlation: 0.9 }
  assert.equal(assessBlend(major, minor, { targetBpm: 120 }).factors[1].state, "supportive")
  assert.equal(assessBlend(minor, major, { targetBpm: 120 }).factors[1].state, "supportive")
  minor.tempo.bpm = 60
  const result = assessBlend(major, minor, { targetBpm: 120 })
  assert.equal(result.status, "Needs adjustment")
  assert.match(result.factors[0].detail, /double tempo needs confirmation/)
})

test("invalid and silent sections cannot produce a promising result", () => {
  assert.throws(() => analyzeSamples(new Float32Array(100)), /8–30/)
  assert.throws(() => analyzeSamples(new Float32Array(sr * 12).fill(NaN)), /invalid samples/)
  assert.throws(() => assessBlend(measured(), measured(), { targetBpm: NaN }), /Tempo/)
  assert.equal(assessBlend(analyzeSamples(new Float32Array(sr * 12)), measured(), { targetBpm: 120, leadBpm: 120 }).status, "Difficult pairing")
})

test("section extraction uses the chosen bounds and preserves anti-phase stereo evidence", () => {
  const channel = new Float32Array(sr * 24)
  channel.set(clicks(101, 12), sr * 12)
  const buffer = { sampleRate: sr, duration: 24, numberOfChannels: 2, getChannelData: (c: number) => c ? channel.map((v) => -v) : channel } as AudioBuffer
  assert.equal(analyzeSamples(sectionSamples(buffer, 0, 12)).signal.silent, true)
  assert.ok(Math.abs(analyzeSamples(sectionSamples(buffer, 12, 12)).tempo.bpm! - 101) < 0.8)
  assert.throws(() => sectionSamples(buffer, 20, 12), /within the file/)
})
