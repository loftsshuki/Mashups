import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import test from "node:test"

import { manifestSchema, parseLoudness, sharedLoudnessTarget, validateMatchedAudio } from "../scripts/audio-bench/core.ts"
import { writeSignal } from "../scripts/audio-bench/fixtures.ts"
import { buildListeningBench, hashFile, reservePrivateOutput, transformAudio } from "../scripts/audio-bench/runner.ts"

const ffmpeg = process.env.AUDIO_BENCH_FFMPEG || "ffmpeg"
const ffprobe = process.env.AUDIO_BENCH_FFPROBE || "ffprobe"
function available(command: string, args = ["-version"]) {
  try { return execFileSync(command, args, { encoding: "utf8", windowsHide: true, timeout: 5000, stdio: ["ignore", "pipe", "pipe"] }) } catch { return "" }
}
const hasMedia = Boolean(available(ffmpeg) && available(ffprobe))
const hasRubberBand = hasMedia && available(ffmpeg, ["-hide_banner", "-filters"]).includes("rubberband")

test("loudness parsing uses measured input, not the filter's hypothetical output", () => {
  const metrics = parseLoudness('log text\n{"input_i":"-19.82","input_tp":"-4.20","input_lra":"4.00","output_i":"-14","output_tp":"-1"}')
  assert.deepEqual(metrics, { integratedLufs: -19.82, truePeakDbtp: -4.2, loudnessRangeLu: 4 })
  assert.throws(() => parseLoudness('{"input_i":"-inf","input_tp":"-inf","input_lra":"0"}'), /silent/)
  assert.throws(() => parseLoudness('{"input_i":null,"input_tp":"-1","input_lra":"0"}'), /silent/)
})

test("peak headroom lowers every candidate's target equally, without limiting", () => {
  const measured = [
    { integratedLufs: -26, truePeakDbtp: -2, loudnessRangeLu: 12 },
    { integratedLufs: -16, truePeakDbtp: -5, loudnessRangeLu: 2 },
  ]
  assert.equal(sharedLoudnessTarget(measured, -20, -1), -25.1)
  assert.throws(() => sharedLoudnessTarget([], -20, -1))
  assert.throws(() => validateMatchedAudio([{ integratedLufs: -19, truePeakDbtp: -2, loudnessRangeLu: 2 }], -20, -1), /matching failed/)
  assert.throws(() => validateMatchedAudio([{ integratedLufs: -20, truePeakDbtp: -.5, loudnessRangeLu: 2 }], -20, -1), /ceiling/)
})

test("manifest rejects ambiguous IDs and unsupported options", () => {
  const entry = { id: "case", title: "A case", prompt: "Pick one", durationSeconds: 3,
    variants: [{ id: "same", path: "a.wav", method: "one" }, { id: "same", path: "b.wav", method: "two" }] }
  assert.equal(manifestSchema.safeParse({ version: 1, title: "Test", description: "", cases: [entry] }).success, false)
  assert.equal(manifestSchema.safeParse({ version: 1, title: "Test", description: "", cases: [], publish: true }).success, false)
})

test("private output refuses published directories and existing directories", async () => {
  await assert.rejects(reservePrivateOutput(resolve(import.meta.dirname, "../public/bench-must-not-exist")), /published/)
  const existing = await mkdtemp(resolve(tmpdir(), "mashups-existing-"))
  await assert.rejects(reservePrivateOutput(existing), /EEXIST/)
})

test("real audio is level matched, input hashes preserved, identities withheld, and reruns refused", { skip: !hasMedia, timeout: 120_000 }, async () => {
  const root = await mkdtemp(resolve(tmpdir(), "mashups-bench-"))
  const quiet = resolve(root, "CANARY-private-source-a.wav")
  const loud = resolve(root, "CANARY-private-source-b.wav")
  await writeSignal(quiet, 4, t => Math.sin(2 * Math.PI * 440 * t) * .06)
  await writeSignal(loud, 4, t => Math.sin(2 * Math.PI * 440 * t) * .4)
  const hashes = await Promise.all([hashFile(quiet), hashFile(loud)])
  const manifest = { version: 1, title: '</script><img src=x onerror="alert(1)">', description: "Controlled test", cases: [{
    id: "tone", title: "Tone comparison", prompt: "Choose", durationSeconds: 3,
    variants: [{ id: "canary-a", path: quiet, method: "CANARY-method-a" }, { id: "canary-b", path: loud, method: "CANARY-method-b" }],
  }] }
  const manifestPath = resolve(root, "manifest.json")
  await writeFile(manifestPath, '\uFEFF' + JSON.stringify(manifest))
  const out = resolve(root, "result")
  const { pack } = await buildListeningBench(manifestPath, out)
  assert.deepEqual(await Promise.all([hashFile(quiet), hashFile(loud)]), hashes)
  const measurements = pack.cases[0].samples.map(s => s.metrics.integratedLufs)
  assert.ok(Math.abs(measurements[0] - measurements[1]) <= .1)
  const page = await readFile(resolve(out, "bundle/index.html"), "utf8")
  assert.equal(page.includes("CANARY"), false)
  assert.equal(page.includes("canary-a"), false)
  assert.equal(page.includes('<img src=x'), false)
  assert.equal(page.includes('\\u003c/script>'), true)
  const operator = JSON.parse(await readFile(resolve(out, "operator.json"), "utf8"))
  assert.equal(operator.packId, pack.id)
  assert.equal(operator.cases[0].samples.length, 2)
  assert.ok(operator.cases[0].samples.every((s: { source: { sourceSha256: string } }) => hashes.includes(s.source.sourceSha256)))
  await assert.rejects(buildListeningBench(manifestPath, out), /EEXIST/)
  manifest.cases[0].variants[0].path = "https://example.com/audio.wav"
  await writeFile(manifestPath, JSON.stringify(manifest))
  await assert.rejects(buildListeningBench(manifestPath, resolve(root, "url-run")), /local audio/)
})

test("silent audio never produces a released listener bundle", { skip: !hasMedia, timeout: 60_000 }, async () => {
  const root = await mkdtemp(resolve(tmpdir(), "mashups-silent-"))
  const path = resolve(root, "silence.wav")
  await writeSignal(path, 3, () => 0)
  const manifestPath = resolve(root, "manifest.json")
  await writeFile(manifestPath, JSON.stringify({ version: 1, title: "Silence", description: "", cases: [{
    id: "silent", title: "Silence", prompt: "Choose", durationSeconds: 3,
    variants: [{ id: "a", path, method: "a" }, { id: "b", path, method: "b" }],
  }] }))
  const output = resolve(root, "result")
  await assert.rejects(buildListeningBench(manifestPath, output), /silent/)
  await assert.rejects(stat(resolve(output, "bundle/index.html")), /ENOENT/)
  assert.ok(await stat(resolve(output, "FAILED.txt")))
})

// Count positive zero crossings in a central second of the resulting PCM WAV.
// A tone gives an independent observable of pitch, unrelated to model metadata.
async function frequencyOfWav(path: string) {
  const wav = await readFile(path)
  let offset = 12, dataOffset = 0, rate = 0, align = 0
  while (offset + 8 < wav.length) {
    const length = wav.readUInt32LE(offset + 4)
    const tag = wav.toString("ascii", offset, offset + 4)
    if (tag === "fmt ") { rate = wav.readUInt32LE(offset + 12); align = wav.readUInt16LE(offset + 20); assert.equal(wav.readUInt16LE(offset + 22), 24) }
    if (tag === "data") { dataOffset = offset + 8; break }
    offset += 8 + length + length % 2
  }
  assert.ok(dataOffset && rate && align)
  let crossings = 0
  let previous = wav.readIntLE(dataOffset + rate * align, 3)
  for (let i = rate + 1; i < rate * 2; i++) {
    const next = wav.readIntLE(dataOffset + i * align, 3)
    if (previous <= 0 && next > 0) crossings++
    previous = next
  }
  return crossings
}

test("tempo processing demonstrably preserves pitch while resampling shifts it", { skip: !hasRubberBand, timeout: 60_000 }, async () => {
  const root = await mkdtemp(resolve(tmpdir(), "mashups-pitch-"))
  const source = resolve(root, "440hz.wav")
  await writeSignal(source, 4, t => Math.sin(2 * Math.PI * 440 * t) * .2)
  const shifted = resolve(root, "shifted.wav"), preserved = resolve(root, "preserved.wav")
  await transformAudio(source, shifted, "asetrate=48510,aresample=44100")
  await transformAudio(source, preserved, "rubberband=tempo=1.1:pitch=1")
  assert.ok(Math.abs(await frequencyOfWav(shifted) - 484) < 2)
  assert.ok(Math.abs(await frequencyOfWav(preserved) - 440) < 2)
})
