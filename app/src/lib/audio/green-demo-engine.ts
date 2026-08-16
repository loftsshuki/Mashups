import type { GreenArrangementId } from "@mashups/contracts"

import { buildGreenArrangementPlans, type GreenArrangementPlan } from "@/lib/audio/green-arrangements"
import { assessGreenPair, type GreenCatalogTrack } from "@/lib/catalog/green-catalog"

export type GreenMashupStyle = GreenArrangementId

export type GreenMashupRender = {
  style: GreenMashupStyle
  title: string
  description: string
  audioUrl: string
  audioBlob: Blob
  duration: number
  qualityScore: number
  plan: GreenArrangementPlan
  metrics: {
    peakDb: number
    rmsDb: number
    clippedSamples: number
  }
}

type StereoPcm = {
  left: Float32Array
  right: Float32Array
  sampleRate: number
}

type ScheduledLayers = {
  groove?: boolean
  chords?: boolean
  lead?: boolean
  level?: number
}

const SAMPLE_RATE = 22_050
const TWO_PI = Math.PI * 2

function midiToFrequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12)
}

function createPcm(duration: number): StereoPcm {
  const length = Math.ceil(duration * SAMPLE_RATE)
  return { left: new Float32Array(length), right: new Float32Array(length), sampleRate: SAMPLE_RATE }
}

function addStereo(pcm: StereoPcm, sample: number, value: number, pan = 0) {
  if (sample < 0 || sample >= pcm.left.length) return
  const leftGain = Math.sqrt((1 - pan) / 2)
  const rightGain = Math.sqrt((1 + pan) / 2)
  pcm.left[sample] += value * leftGain
  pcm.right[sample] += value * rightGain
}

function addKick(pcm: StereoPcm, at: number, level: number) {
  const length = Math.floor(pcm.sampleRate * 0.2)
  const start = Math.floor(at * pcm.sampleRate)
  let phase = 0
  for (let index = 0; index < length; index += 1) {
    const time = index / pcm.sampleRate
    const frequency = 45 + 105 * Math.exp(-time * 28)
    phase += TWO_PI * frequency / pcm.sampleRate
    const envelope = Math.exp(-time * 24)
    addStereo(pcm, start + index, Math.sin(phase) * envelope * level)
  }
}

function seededNoise(seed: number) {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) / 0xffffffff) * 2 - 1
  }
}

function addHat(pcm: StereoPcm, at: number, level: number, open: boolean, seed: number) {
  const duration = open ? 0.13 : 0.055
  const length = Math.floor(pcm.sampleRate * duration)
  const start = Math.floor(at * pcm.sampleRate)
  const noise = seededNoise(seed)
  let previous = 0
  for (let index = 0; index < length; index += 1) {
    const raw = noise()
    const highpassed = raw - previous * 0.86
    previous = raw
    const envelope = Math.exp(-(index / length) * (open ? 5 : 9))
    addStereo(pcm, start + index, highpassed * envelope * level, 0.22)
  }
}

function addClap(pcm: StereoPcm, at: number, level: number, seed: number) {
  for (let burst = 0; burst < 3; burst += 1) {
    const length = Math.floor(pcm.sampleRate * 0.075)
    const start = Math.floor((at + burst * 0.018) * pcm.sampleRate)
    const noise = seededNoise(seed + burst * 97)
    let lowpass = 0
    for (let index = 0; index < length; index += 1) {
      lowpass += 0.28 * (noise() - lowpass)
      const envelope = Math.exp(-(index / length) * 7)
      addStereo(pcm, start + index, lowpass * envelope * level / 3, -0.12)
    }
  }
}

function oscillatorValue(wave: OscillatorType, phase: number) {
  const cycle = phase / TWO_PI - Math.floor(phase / TWO_PI)
  if (wave === "square") return cycle < 0.5 ? 1 : -1
  if (wave === "sawtooth") return cycle * 2 - 1
  if (wave === "triangle") return 1 - 4 * Math.abs(Math.round(cycle) - cycle)
  return Math.sin(phase)
}

function envelopeAt(time: number, duration: number, attack: number, release: number) {
  const attackGain = Math.min(1, time / Math.max(0.001, attack))
  const releaseGain = Math.min(1, (duration - time) / Math.max(0.001, release))
  return Math.max(0, Math.min(attackGain, releaseGain))
}

function addBass(pcm: StereoPcm, at: number, duration: number, midi: number, level: number) {
  const length = Math.floor(pcm.sampleRate * duration)
  const start = Math.floor(at * pcm.sampleRate)
  const frequency = midiToFrequency(midi)
  for (let index = 0; index < length; index += 1) {
    const time = index / pcm.sampleRate
    const phase = TWO_PI * frequency * time
    const fundamental = Math.sin(phase)
    const upper = oscillatorValue("sawtooth", phase) * 0.22
    const envelope = envelopeAt(time, duration, 0.014, 0.1) * Math.exp(-time * 1.3)
    addStereo(pcm, start + index, (fundamental + upper) * envelope * level)
  }
}

function addTone(
  pcm: StereoPcm,
  at: number,
  duration: number,
  midi: number,
  wave: OscillatorType,
  level: number,
  pan: number,
) {
  const length = Math.floor(pcm.sampleRate * duration)
  const start = Math.floor(at * pcm.sampleRate)
  const frequency = midiToFrequency(midi)
  for (let index = 0; index < length; index += 1) {
    const time = index / pcm.sampleRate
    const phase = TWO_PI * frequency * time
    const body = oscillatorValue(wave, phase) * 0.8 + Math.sin(phase * 2) * 0.12
    const envelope = envelopeAt(time, duration, 0.045, 0.09)
    addStereo(pcm, start + index, body * envelope * level, pan)
  }
}

function scheduleTrack(
  pcm: StereoPcm,
  track: GreenCatalogTrack,
  start: number,
  duration: number,
  layers: ScheduledLayers,
  targetBpm = track.bpm,
) {
  const beat = 60 / targetBpm
  const level = layers.level ?? 1
  const localEnd = start + duration
  const seedBase = track.id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0)

  if (layers.groove) {
    for (let beatIndex = 0; start + beatIndex * beat < localEnd; beatIndex += 1) {
      const beatTime = start + beatIndex * beat
      addKick(pcm, beatTime, 0.7 * level)
      if (beatIndex % 4 === 1 || beatIndex % 4 === 3) {
        addClap(pcm, beatTime, 0.35 * level, seedBase + beatIndex)
      }
      const bassOffset = track.synth.bassPattern[beatIndex % track.synth.bassPattern.length] ?? 0
      addBass(pcm, beatTime + 0.045, beat * 0.56, track.synth.rootMidi + bassOffset, 0.19 * level)
      const offbeat = beatTime + beat / 2 + (beatIndex % 2 === 0 ? track.synth.swing : 0)
      if (offbeat < localEnd) addHat(pcm, offbeat, 0.075 * level, beatIndex % 4 === 3, seedBase * 31 + beatIndex)
    }
  }

  if (layers.chords) {
    const barDuration = beat * 4
    const third = track.key.includes("major") ? 4 : 3
    for (let bar = 0; start + bar * barDuration < localEnd; bar += 1) {
      const at = start + bar * barDuration
      const root = track.synth.rootMidi + 12 + (track.synth.progression[bar % track.synth.progression.length] ?? 0)
      const chordDuration = Math.min(barDuration * 0.9, localEnd - at)
      for (const [voice, interval] of [0, third, 7].entries()) {
        addTone(pcm, at, chordDuration, root + interval, "triangle", 0.042 * level, (voice - 1) * 0.34)
      }
    }
  }

  if (layers.lead) {
    const noteDuration = beat / 2
    for (let noteIndex = 0; start + noteIndex * noteDuration < localEnd; noteIndex += 1) {
      const interval = track.synth.leadPattern[noteIndex % track.synth.leadPattern.length]
      if (interval == null) continue
      const at = start + noteIndex * noteDuration + (noteIndex % 2 ? track.synth.swing : 0)
      addTone(
        pcm,
        at,
        Math.min(noteDuration * 0.72, localEnd - at),
        track.synth.rootMidi + interval,
        track.synth.leadWave,
        0.07 * level,
        -0.18,
      )
    }
  }
}

function addRiser(pcm: StereoPcm, at: number, duration: number, seed: number) {
  const length = Math.floor(pcm.sampleRate * duration)
  const start = Math.floor(at * pcm.sampleRate)
  const noise = seededNoise(seed)
  let smoothed = 0
  for (let index = 0; index < length; index += 1) {
    const progress = index / length
    const smoothing = 0.03 + progress * 0.42
    smoothed += smoothing * (noise() - smoothed)
    const envelope = Math.sin(progress * Math.PI) ** 1.4
    addStereo(pcm, start + index, smoothed * envelope * 0.16, progress * 0.5 - 0.25)
  }
}

function addImpact(pcm: StereoPcm, at: number, level: number, seed: number) {
  addKick(pcm, at, level)
  const noise = seededNoise(seed)
  const length = Math.floor(pcm.sampleRate * 0.7)
  const start = Math.floor(at * pcm.sampleRate)
  let lowpass = 0
  for (let index = 0; index < length; index += 1) {
    lowpass += 0.08 * (noise() - lowpass)
    const envelope = Math.exp(-(index / pcm.sampleRate) * 5.5)
    addStereo(pcm, start + index, lowpass * envelope * 0.2 * level)
  }
}

function applySidechainDucking(pcm: StereoPcm, bpm: number, duckDb: number) {
  const beatSamples = (60 / bpm) * pcm.sampleRate
  const minimumGain = 10 ** (duckDb / 20)
  const recoverySamples = Math.max(1, Math.floor(pcm.sampleRate * 0.16))
  for (let sample = 0; sample < pcm.left.length; sample += 1) {
    const beatPosition = sample % beatSamples
    if (beatPosition >= recoverySamples) continue
    const progress = beatPosition / recoverySamples
    const gain = minimumGain + (1 - minimumGain) * progress ** 0.55
    pcm.left[sample] *= gain
    pcm.right[sample] *= gain
  }
}

function masterPcm(pcm: StereoPcm, intensity: number) {
  let peak = 0
  for (let index = 0; index < pcm.left.length; index += 1) {
    peak = Math.max(peak, Math.abs(pcm.left[index]), Math.abs(pcm.right[index]))
  }
  const target = 0.82 + Math.min(100, Math.max(0, intensity)) * 0.001
  const gain = peak > 0 ? target / peak : 1
  const fadeLength = Math.min(Math.floor(pcm.sampleRate * 0.12), pcm.left.length)
  for (let index = 0; index < pcm.left.length; index += 1) {
    const fade = index >= pcm.left.length - fadeLength ? (pcm.left.length - index - 1) / fadeLength : 1
    pcm.left[index] = Math.tanh(pcm.left[index] * gain) * fade
    pcm.right[index] = Math.tanh(pcm.right[index] * gain) * fade
  }
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}

function pcmToWavBlob(pcm: StereoPcm) {
  const bytesPerSample = 2
  const channels = 2
  const dataLength = pcm.left.length * channels * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)
  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, "WAVE")
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, pcm.sampleRate, true)
  view.setUint32(28, pcm.sampleRate * channels * bytesPerSample, true)
  view.setUint16(32, channels * bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, "data")
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let index = 0; index < pcm.left.length; index += 1) {
    view.setInt16(offset, Math.max(-1, Math.min(1, pcm.left[index])) * 0x7fff, true)
    view.setInt16(offset + 2, Math.max(-1, Math.min(1, pcm.right[index])) * 0x7fff, true)
    offset += 4
  }
  return new Blob([buffer], { type: "audio/wav" })
}

function measurePcm(pcm: StereoPcm) {
  let peak = 0
  let sumSquares = 0
  let clippedSamples = 0
  for (let index = 0; index < pcm.left.length; index += 1) {
    const left = pcm.left[index]
    const right = pcm.right[index]
    peak = Math.max(peak, Math.abs(left), Math.abs(right))
    sumSquares += left * left + right * right
    if (Math.abs(left) >= 0.999 || Math.abs(right) >= 0.999) clippedSamples += 1
  }
  const rms = Math.sqrt(sumSquares / Math.max(1, pcm.left.length * 2))
  return {
    peakDb: Math.round(20 * Math.log10(Math.max(peak, 1e-9)) * 100) / 100,
    rmsDb: Math.round(20 * Math.log10(Math.max(rms, 1e-9)) * 100) / 100,
    clippedSamples,
  }
}

export async function renderGreenTrackPreview(track: GreenCatalogTrack) {
  const duration = (60 / track.bpm) * 4
  const pcm = createPcm(duration)
  scheduleTrack(pcm, track, 0, duration, { groove: true, chords: true, lead: true, level: 0.92 })
  masterPcm(pcm, track.energy)
  const audioBlob = pcmToWavBlob(pcm)
  return { audioUrl: URL.createObjectURL(audioBlob), audioBlob, duration }
}

export async function renderGreenMashup(
  left: GreenCatalogTrack,
  right: GreenCatalogTrack,
  style: GreenMashupStyle,
  intensity: number,
): Promise<GreenMashupRender> {
  const assessment = assessGreenPair(left, right)
  if (!assessment.compatible) throw new Error(assessment.summary)
  const plan = buildGreenArrangementPlans(left, right, assessment).find((candidate) => candidate.id === style)
  if (!plan) throw new Error(`Unknown Green Room arrangement: ${style}`)
  const targetBpm = plan.targetBpm
  const bar = (60 / targetBpm) * 4
  const duration = bar * plan.totalBars
  const pcm = createPcm(duration)

  for (const [segmentIndex, segment] of plan.segments.entries()) {
    const start = segment.startBar * bar
    const segmentDuration = segment.bars * bar
    const sectionLevel = segment.name === "drop" ? 1.04 : segment.name === "verse" ? 0.88 : segment.name === "outro" ? 0.66 : 0.76
    const source = (side: "a" | "b" | null) => side === "a" ? left : side === "b" ? right : null
    const groove = source(segment.grooveSource)
    const harmony = source(segment.harmonySource)
    const topline = source(segment.toplineSource)
    if (groove) scheduleTrack(pcm, groove, start, segmentDuration, { groove: true, level: sectionLevel }, targetBpm)
    if (harmony) scheduleTrack(pcm, harmony, start, segmentDuration, { chords: true, level: topline ? sectionLevel * 0.72 : sectionLevel * 0.9 }, targetBpm)
    if (topline) scheduleTrack(pcm, topline, start, segmentDuration, { lead: true, level: sectionLevel * 1.08 }, targetBpm)
    if (segment.transition === "riser") addRiser(pcm, start, segmentDuration, 7_201 + segmentIndex * 101)
    if (segment.transition === "impact") addImpact(pcm, start, 1, 8_413 + segmentIndex * 97)
  }

  applySidechainDucking(pcm, targetBpm, plan.sidechainDuckDb)
  masterPcm(pcm, intensity)
  const metrics = measurePcm(pcm)
  const audioBlob = pcmToWavBlob(pcm)
  return { style, title: plan.title, description: plan.description, audioUrl: URL.createObjectURL(audioBlob), audioBlob, duration, qualityScore: plan.qualityScore, plan, metrics }
}
