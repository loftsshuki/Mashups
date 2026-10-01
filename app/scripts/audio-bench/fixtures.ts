import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import { buildListeningBench, transformAudio } from "./runner.ts"

export async function writeSignal(path: string, seconds: number, sample: (time: number, channel: number) => number) {
  const rate = 44100
  const frames = Math.round(seconds * rate)
  const buffer = Buffer.alloc(44 + frames * 4)
  buffer.write("RIFF", 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8)
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22)
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 4, 28); buffer.writeUInt16LE(4, 32)
  buffer.writeUInt16LE(16, 34); buffer.write("data", 36); buffer.writeUInt32LE(frames * 4, 40)
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < 2; channel++) {
      buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample(frame / rate, channel))) * 32767), 44 + frame * 4 + channel * 2)
    }
  }
  await writeFile(path, buffer, { flag: "wx" })
}

// An original calibration signal. No catalog audio, samples, trained model,
// third-party recording, or Green Catalog export entitlement is involved.
export async function writeOriginalLoop(path: string) {
  const notes = [72, 75, 79, 75, 70, 67, 75, 79, 72, 79, 82, 79, 75, 70, 67, 70]
  const roots = [48, 44, 46, 43]
  let noiseSeed = 120316
  const noise = () => { noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) | 0; return noiseSeed / 2147483648 }
  const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
  await writeSignal(path, 8, (time, channel) => {
    const beat = Math.floor(time * 2)
    const tick = time % 0.5
    const eighth = time % 0.25
    const kick = Math.sin(2 * Math.PI * (48 * tick + 7 * (1 - Math.exp(-tick * 45)))) * Math.exp(-tick * 18) * 0.28
    const snare = beat % 2 ? noise() * Math.exp(-tick * 35) * 0.14 : 0
    const hat = noise() * Math.exp(-eighth * 100) * 0.045
    const bass = Math.sin(2 * Math.PI * frequency(roots[Math.floor(beat / 4)]) * time) * Math.min(1, tick * 150) * Math.exp(-tick * 7) * 0.18
    const note = frequency(notes[beat])
    const envelope = Math.min(1, eighth * 180) * Math.exp(-eighth * 9)
    const lead = (Math.sin(2 * Math.PI * note * time + channel * .12) + .18 * Math.sin(4 * Math.PI * note * time)) * envelope * .15
    return (kick + snare + hat + bass + lead) * Math.min(1, time * 40, (8 - time) * 30)
  })
}

export async function createDemo(root: string) {
  await mkdir(root) // Refuse an existing run instead of overwriting audio.
  const source = resolve(root, "original-loop.wav")
  await writeOriginalLoop(source)
  const coupled = resolve(root, "rate-changed.wav")
  const independent = resolve(root, "pitch-preserved.wav")
  await transformAudio(source, coupled, "asetrate=48510,aresample=44100")
  await transformAudio(source, independent, "rubberband=tempo=1.1:pitch=1:formant=preserved:channels=together")
  const manifest = {
    version: 1,
    title: "Same loop. Different processing.",
    description: "Two versions of an original test loop, sped up from 120 to 132 BPM. Listen for changes in tone, timing, and clarity. This checks the comparison tool; real-song and stem-quality trials are still ahead.",
    targetLufs: -20,
    peakCeilingDbtp: -1,
    cases: [{ id: "tempo-calibration", title: "Which version would you keep?", prompt: "Switch between A and B at the same point. Take your time, then choose below.", durationSeconds: 7,
      variants: [
        { id: "coupled-rate", method: "FFmpeg asetrate at 1.1x; speed and pitch change together", path: coupled },
        { id: "independent-tempo", method: "FFmpeg Rubber Band filter at tempo 1.1, pitch 1, formants preserved, channels together; default engine", path: independent },
      ] }],
  }
  const manifestPath = resolve(root, "manifest.json")
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  return buildListeningBench(manifestPath, resolve(root, "comparison"))
}
