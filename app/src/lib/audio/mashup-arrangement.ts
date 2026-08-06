export type TempoRelationMode =
  | "direct"
  | "three-over-four"
  | "four-over-three"

export interface TempoGridAnalysis {
  bpm: number
  confidence: number
  beatOffset: number
  downbeatOffset: number
  beatInterval: number
}

export interface MashupArrangementPlan {
  compatible: boolean
  mode: TempoRelationMode | "unsupported"
  targetBpm: number
  vocalPlaybackRate: number
  beatPlaybackRate: number
  totalBars: number
  introBars: number
  bodyBars: number
  outroBars: number
  sourceBodyBars: number
  totalDuration: number
  introDuration: number
  bodyDuration: number
  reason: string
}

const MIN_ANALYSIS_BPM = 70
const MAX_ANALYSIS_BPM = 180
const MAX_PLAYBACK_RATE_DELTA = 0.12

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function normalizeMashupBpm(bpm: number): number {
  if (!Number.isFinite(bpm) || bpm <= 0) return 120

  let normalized = bpm
  while (normalized < 80) normalized *= 2
  while (normalized > 160) normalized /= 2
  return normalized
}

export function buildMashupArrangementPlan(
  vocalBpmInput: number,
  beatBpmInput: number,
): MashupArrangementPlan {
  const vocalBpm = normalizeMashupBpm(vocalBpmInput)
  const targetBpm = normalizeMashupBpm(beatBpmInput)
  const totalBars = 16
  const introBars = 2
  const bodyBars = 12
  const outroBars = totalBars - introBars - bodyBars

  const candidates: Array<{
    mode: TempoRelationMode
    rate: number
    sourceBodyBars: number
    reason: string
  }> = [
    {
      mode: "direct",
      rate: targetBpm / vocalBpm,
      sourceBodyBars: bodyBars,
      reason: "Direct beat matching",
    },
    {
      mode: "three-over-four",
      rate: (3 * targetBpm) / (4 * vocalBpm),
      sourceBodyBars: (bodyBars * 3) / 4,
      reason: "Three source beats mapped across four destination beats",
    },
    {
      mode: "four-over-three",
      rate: (4 * targetBpm) / (3 * vocalBpm),
      sourceBodyBars: (bodyBars * 4) / 3,
      reason: "Four source beats mapped across three destination beats",
    },
  ]

  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      delta: Math.abs(candidate.rate - 1),
    }))
    .sort((left, right) => left.delta - right.delta)
  const selected = ranked[0]
  const compatible = selected.delta <= MAX_PLAYBACK_RATE_DELTA
  const secondsPerBar = (60 / targetBpm) * 4

  return {
    compatible,
    mode: compatible ? selected.mode : "unsupported",
    targetBpm,
    vocalPlaybackRate: selected.rate,
    beatPlaybackRate: 1,
    totalBars,
    introBars,
    bodyBars,
    outroBars,
    sourceBodyBars: selected.sourceBodyBars,
    totalDuration: totalBars * secondsPerBar,
    introDuration: introBars * secondsPerBar,
    bodyDuration: bodyBars * secondsPerBar,
    reason: compatible
      ? selected.reason
      : `Tempo relationship requires ${Math.round(selected.delta * 100)}% vocal warping`,
  }
}

export function estimateTempoGridFromPcm(
  channels: readonly Float32Array[],
  sampleRate: number,
): TempoGridAnalysis {
  if (channels.length === 0 || channels[0].length < sampleRate * 4) {
    return fallbackTempoGrid()
  }

  const decimation = Math.max(1, Math.round(sampleRate / 11_025))
  const analysisRate = sampleRate / decimation
  const blockSize = 128
  const hopSize = blockSize * decimation
  const frameCount = Math.floor(channels[0].length / hopSize)
  if (frameCount < 32) return fallbackTempoGrid()

  // Multiband spectral flux suppresses vocal syllable periodicity that often
  // fools whole-waveform peak counters into returning a false tempo.
  const crossoverFrequencies = [80, 160, 320, 640, 1_280, 2_560, 5_000]
  const coefficients = crossoverFrequencies.map(
    (frequency) => 1 - Math.exp((-2 * Math.PI * frequency) / analysisRate),
  )
  const lowpassStates = new Float64Array(crossoverFrequencies.length)
  const bandEnergy = new Float64Array(crossoverFrequencies.length + 1)
  const previousLogEnergy = new Float64Array(bandEnergy.length)
  previousLogEnergy.fill(-20)
  const onsets = new Float64Array(frameCount)
  let maxOnset = 0

  for (let frame = 0; frame < frameCount; frame += 1) {
    const start = frame * hopSize
    for (
      let sample = start;
      sample < start + hopSize;
      sample += decimation
    ) {
      let mono = 0
      for (let offset = 0; offset < decimation; offset += 1) {
        for (const channel of channels) mono += channel[sample + offset] ?? 0
      }
      mono /= channels.length * decimation

      let previousLowpass = 0
      for (let band = 0; band < lowpassStates.length; band += 1) {
        lowpassStates[band] += coefficients[band] * (mono - lowpassStates[band])
        const bandSample = lowpassStates[band] - previousLowpass
        bandEnergy[band] += bandSample * bandSample
        previousLowpass = lowpassStates[band]
      }
      const highBand = mono - lowpassStates[lowpassStates.length - 1]
      bandEnergy[bandEnergy.length - 1] += highBand * highBand
    }

    let flux = 0
    for (let band = 0; band < bandEnergy.length; band += 1) {
      const logEnergy = Math.log(1e-10 + bandEnergy[band] / blockSize)
      const increase = Math.max(0, logEnergy - previousLogEnergy[band])
      flux += increase * (band < 4 ? 1 : 0.5)
      previousLogEnergy[band] = logEnergy
      bandEnergy[band] = 0
    }
    onsets[frame] = flux
    maxOnset = Math.max(maxOnset, flux)
  }

  if (maxOnset <= 1e-8) return fallbackTempoGrid()
  for (let index = 0; index < onsets.length; index += 1) {
    onsets[index] /= maxOnset
  }

  const envelopeRate = sampleRate / hopSize
  const minLag = Math.ceil((envelopeRate * 60) / MAX_ANALYSIS_BPM)
  const maxLag = Math.floor((envelopeRate * 60) / MIN_ANALYSIS_BPM)
  let bestLag = minLag
  let bestScore = -Infinity

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let dot = 0
    let leftEnergy = 0
    let rightEnergy = 0
    for (let index = lag; index < onsets.length; index += 1) {
      const left = onsets[index]
      const right = onsets[index - lag]
      dot += left * right
      leftEnergy += left * left
      rightEnergy += right * right
    }
    const score = dot / Math.sqrt(Math.max(1e-12, leftEnergy * rightEnergy))
    if (score > bestScore) {
      bestScore = score
      bestLag = lag
    }
  }

  const bpm = clamp((60 * envelopeRate) / bestLag, MIN_ANALYSIS_BPM, MAX_ANALYSIS_BPM)
  let beatPhase = 0
  let beatPhaseScore = -Infinity
  for (let phase = 0; phase < bestLag; phase += 1) {
    let score = 0
    for (let index = phase; index < onsets.length; index += bestLag) {
      score += onsets[index]
    }
    if (score > beatPhaseScore) {
      beatPhaseScore = score
      beatPhase = phase
    }
  }

  const beatOnsets: number[] = []
  for (let index = beatPhase; index < onsets.length; index += bestLag) {
    beatOnsets.push(onsets[index])
  }
  let downbeatPhase = 0
  let downbeatScore = -Infinity
  for (let phase = 0; phase < 4; phase += 1) {
    let score = 0
    let count = 0
    for (let index = phase; index < beatOnsets.length; index += 4) {
      score += beatOnsets[index]
      count += 1
    }
    score /= Math.max(1, count)
    if (score > downbeatScore) {
      downbeatScore = score
      downbeatPhase = phase
    }
  }

  const beatInterval = 60 / bpm
  const beatOffset = (beatPhase * hopSize) / sampleRate
  return {
    bpm: Math.round(bpm * 10) / 10,
    confidence: clamp(bestScore, 0, 1),
    beatOffset,
    downbeatOffset: beatOffset + downbeatPhase * beatInterval,
    beatInterval,
  }
}

export function findStrongPhraseStart(
  channels: readonly Float32Array[],
  sampleRate: number,
  analysis: Pick<TempoGridAnalysis, "bpm" | "downbeatOffset">,
  bars: number,
): number {
  if (channels.length === 0 || channels[0].length === 0) return 0

  const duration = channels[0].length / sampleRate
  const barDuration = (60 / normalizeMashupBpm(analysis.bpm)) * 4
  const phraseDuration = bars * barDuration
  const maxStart = Math.max(0, duration - phraseDuration)
  if (maxStart === 0) return 0

  const minimumStart = Math.min(maxStart, duration * 0.05)
  const skippedBars = Math.max(
    0,
    Math.ceil((minimumStart - analysis.downbeatOffset) / barDuration),
  )
  const firstCandidate = Math.min(
    maxStart,
    analysis.downbeatOffset + skippedBars * barDuration,
  )
  const stride = Math.max(1, Math.floor(sampleRate / 120))
  let bestStart = clamp(firstCandidate, 0, maxStart)
  let bestScore = -Infinity

  for (let start = firstCandidate; start <= maxStart; start += barDuration) {
    const startSample = Math.floor(start * sampleRate)
    const endSample = Math.min(
      channels[0].length,
      Math.floor((start + phraseDuration) * sampleRate),
    )
    let sumSquares = 0
    let active = 0
    let count = 0
    for (let sample = startSample; sample < endSample; sample += stride) {
      let mono = 0
      for (const channel of channels) mono += channel[sample] ?? 0
      mono /= channels.length
      sumSquares += mono * mono
      if (Math.abs(mono) > 0.012) active += 1
      count += 1
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, count))
    const density = active / Math.max(1, count)
    const score = rms * (0.65 + density)
    if (score > bestScore) {
      bestScore = score
      bestStart = start
    }
  }

  return clamp(bestStart, 0, maxStart)
}

function fallbackTempoGrid(): TempoGridAnalysis {
  return {
    bpm: 120,
    confidence: 0,
    beatOffset: 0,
    downbeatOffset: 0,
    beatInterval: 0.5,
  }
}
