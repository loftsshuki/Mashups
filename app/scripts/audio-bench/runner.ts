import { execFile } from "node:child_process"
import { createHash, randomInt, randomUUID } from "node:crypto"
import { createReadStream } from "node:fs"
import { mkdir, readFile, realpath, rename, stat, writeFile } from "node:fs/promises"
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path"
import { promisify } from "node:util"

import { manifestSchema, parseLoudness, sharedLoudnessTarget, validateMatchedAudio, type Metrics, type PublicPack } from "./core.ts"
import { renderListeningPage } from "./report.ts"

const execute = promisify(execFile)
const sampleRate = 44100
const appRoot = resolve(import.meta.dirname, "../..")
const mediaExtensions = new Set([".wav", ".flac", ".aif", ".aiff", ".mp3", ".m4a", ".aac", ".ogg", ".opus"])
const ffmpeg = process.env.AUDIO_BENCH_FFMPEG || "ffmpeg"
const ffprobe = process.env.AUDIO_BENCH_FFPROBE || "ffprobe"

export async function runMedia(command: string, args: string[]) {
  return execute(command, args, { windowsHide: true, timeout: 180_000, maxBuffer: 4 * 1024 * 1024, encoding: "utf8" })
}

export async function transformAudio(input: string, output: string, filter: string, duration?: number, start = 0) {
  const args = ["-hide_banner", "-nostdin", "-nostats", "-n", "-protocol_whitelist", "file,pipe", "-i", input,
    "-map", "0:a:0", "-vn", "-sn", "-dn", "-map_metadata", "-1", "-ss", String(start)]
  if (duration != null) args.push("-t", String(duration))
  args.push("-af", filter, "-ar", String(sampleRate), "-ac", "2", "-c:a", "pcm_s24le", output)
  await runMedia(ffmpeg, args)
}

export async function measureAudio(input: string): Promise<Metrics> {
  const { stderr } = await runMedia(ffmpeg, ["-hide_banner", "-nostdin", "-nostats", "-protocol_whitelist", "file,pipe", "-i", input,
    "-map", "0:a:0", "-vn", "-sn", "-dn", "-af", "loudnorm=I=-20:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
  return parseLoudness(stderr)
}

export async function probeAudio(input: string) {
  const { stdout } = await runMedia(ffprobe, ["-v", "error", "-protocol_whitelist", "file,pipe", "-select_streams", "a:0",
    "-show_entries", "stream=sample_rate,channels,duration:format=duration", "-of", "json", input])
  const data = JSON.parse(stdout)
  const stream = data.streams?.[0]
  const streamDuration = Number(stream?.duration)
  const duration = Number.isFinite(streamDuration) ? streamDuration : Number(data.format?.duration)
  if (!stream || !Number.isFinite(duration) || duration <= 0 || ![1, 2].includes(stream.channels)) {
    throw new Error("Input must contain measurable mono or stereo audio.")
  }
  return { durationSeconds: duration, sampleRate: Number(stream.sample_rate), channels: Number(stream.channels) }
}

export async function hashFile(path: string) {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest("hex")
}

function inside(path: string, parent: string) {
  const rel = relative(parent, path)
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
}

export async function reservePrivateOutput(requested: string) {
  const output = resolve(requested)
  await mkdir(dirname(output), { recursive: true })
  const physical = resolve(await realpath(dirname(output)), basename(output))
  for (const name of ["public", "src", ".next", ".git"]) {
    const forbidden = resolve(appRoot, name === ".git" ? "../.git" : name)
    if (inside(physical, forbidden)) throw new Error("Private benchmark output cannot be written into a published or source directory.")
  }
  // Atomic reservation: existing files/directories are never overwritten.
  await mkdir(physical)
  return physical
}

function shuffled<T>(values: T[]) {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function buildListeningBench(manifestPath: string, requestedOutput: string) {
  const manifest = manifestSchema.parse(JSON.parse((await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "")))
  const resolvedCases = []
  // Validate all sources before processing anything. Absolute/relative local
  // files work; protocols, playlists, device inputs and non-audio files do not.
  for (const entry of manifest.cases) {
    const variants = []
    for (const variant of entry.variants) {
      if (/^[a-z]+:\/\//i.test(variant.path) || !mediaExtensions.has(extname(variant.path).toLowerCase())) {
        throw new Error("Provide local audio files, not URLs or playlists.")
      }
      const path = await realpath(resolve(dirname(manifestPath), variant.path))
      if (!(await stat(path)).isFile()) throw new Error("Audio input must be a regular file.")
      const probe = await probeAudio(path)
      if (variant.startSeconds + entry.durationSeconds > probe.durationSeconds + 0.025) {
        throw new Error(`Requested excerpt exceeds a source in case ${entry.id}.`)
      }
      variants.push({ ...variant, path, probe, sourceSha256: await hashFile(path) })
    }
    resolvedCases.push({ ...entry, variants })
  }
  const output = await reservePrivateOutput(requestedOutput)
  const working = resolve(output, "working")
  const staging = resolve(output, "pending-bundle")
  await mkdir(working)
  await mkdir(resolve(staging, "audio"), { recursive: true })
  const { stdout: version } = await runMedia(ffmpeg, ["-version"])
  const pack: PublicPack = { version: 1, id: randomUUID(), title: manifest.title, description: manifest.description, createdAt: new Date().toISOString(), cases: [] }
  const operatorCases = []
  try {
    for (const entry of resolvedCases) {
      const candidates = []
      for (const source of shuffled(entry.variants)) {
        const id = randomUUID()
        const clip = resolve(working, `${id}.wav`)
        await transformAudio(source.path, clip, "anull", entry.durationSeconds, source.startSeconds)
        const metrics = await measureAudio(clip)
        candidates.push({ source, id, clip, metrics })
      }
      const target = sharedLoudnessTarget(candidates.map(c => c.metrics), manifest.targetLufs, manifest.peakCeilingDbtp)
      const samples = []
      const operatorSamples = []
      for (const [index, candidate] of candidates.entries()) {
        const url = `audio/${candidate.id}.wav`
        const destination = resolve(staging, url)
        const gainDb = target - candidate.metrics.integratedLufs
        await transformAudio(candidate.clip, destination, `volume=${gainDb.toFixed(6)}dB`)
        const metrics = await measureAudio(destination)
        const probe = await probeAudio(destination)
        if (Math.abs(probe.durationSeconds - entry.durationSeconds) > 0.025) throw new Error("Output excerpt duration does not match the case.")
        samples.push({ id: candidate.id, label: String.fromCharCode(65 + index), url, durationSeconds: probe.durationSeconds, metrics })
        operatorSamples.push({ sampleId: candidate.id, label: String.fromCharCode(65 + index), source: candidate.source,
          inputMetrics: candidate.metrics, playbackMetrics: metrics, gainDb, outputSha256: await hashFile(destination) })
      }
      validateMatchedAudio(samples.map(s => s.metrics), target, manifest.peakCeilingDbtp)
      pack.cases.push({ id: entry.id, title: entry.title, prompt: entry.prompt, targetLufs: target, samples })
      operatorCases.push({ id: entry.id, requestedTargetLufs: manifest.targetLufs, actualTargetLufs: target, samples: operatorSamples })
    }
    for (const entry of resolvedCases) {
      for (const source of entry.variants) {
        if (await hashFile(source.path) !== source.sourceSha256) throw new Error("A source changed during processing; discard this run.")
      }
    }
    await writeFile(resolve(output, "operator.json"), JSON.stringify({ version: 1, packId: pack.id, createdAt: pack.createdAt,
      ffmpegVersion: version.split(/\r?\n/)[0], sampleRate, peakCeilingDbtp: manifest.peakCeilingDbtp,
      matching: "Static gain only; shared target lowered to preserve peak headroom; no limiter", cases: operatorCases }, null, 2))
    await writeFile(resolve(staging, "index.html"), renderListeningPage(pack))
    await rename(staging, resolve(output, "bundle"))
    return { output, pack }
  } catch (error) {
    await writeFile(resolve(output, "FAILED.txt"), "This run failed validation. Do not serve pending-bundle or working files. Create a fresh output directory before retrying.\n")
    throw error
  }
}
