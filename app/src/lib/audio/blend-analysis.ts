/** Local, deterministic signal measurements. Confidence values are heuristic evidence,
 * never listener success probabilities. See docs/BLEND_FIT.md for limits. */
export const BLEND_ANALYSIS_VERSION = "blend-fit-1"
export const ANALYSIS_SAMPLE_RATE = 11_025
export const MIN_SECTION_SECONDS = 8
export const MAX_SECTION_SECONDS = 30

export type KeyCandidate = { tonic: number; mode: "major" | "minor"; correlation: number }
export type SectionAnalysis = {
  version: string
  duration: number
  signal: { rmsDb: number | null; peakDb: number | null; nearFullScaleFraction: number; silent: boolean }
  tempo: { bpm: number | null; strength: number; alternatives: number[]; reason: string }
  tonal: { key: KeyCandidate | null; candidates: KeyCandidate[]; chroma: number[]; agreement: number; reason: string }
}

const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
const NOTES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"]
export const keyName = (key: KeyCandidate | null) => key ? `${NOTES[key.tonic]} ${key.mode}` : "Uncertain"
const round = (n: number) => Math.round(n * 100) / 100

function correlation(a: number[], b: number[]) {
  const am = a.reduce((x, y) => x + y, 0) / a.length
  const bm = b.reduce((x, y) => x + y, 0) / b.length
  let cross = 0, aa = 0, bb = 0
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - am, y = b[i] - bm
    cross += x * y; aa += x * x; bb += y * y
  }
  return aa * bb > 1e-20 ? cross / Math.sqrt(aa * bb) : 0
}

export function rankKeys(chroma: number[]): KeyCandidate[] {
  const ranked: KeyCandidate[] = []
  for (let tonic = 0; tonic < 12; tonic++) {
    for (const mode of ["major", "minor"] as const) {
      const profile = mode === "major" ? MAJOR : MINOR
      ranked.push({ tonic, mode, correlation: correlation(chroma, chroma.map((_, i) => profile[(i - tonic + 12) % 12])) })
    }
  }
  return ranked.sort((a, b) => b.correlation - a.correlation)
}

// In-place radix-2 FFT; no network/model dependency in a worker.
function fft(real: Float64Array, imag: Float64Array) {
  const n = real.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]]
      ;[imag[i], imag[j]] = [imag[j], imag[i]]
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    const angle = -2 * Math.PI / size
    const wrStep = Math.cos(angle), wiStep = Math.sin(angle)
    for (let start = 0; start < n; start += size) {
      let wr = 1, wi = 0
      for (let j = 0; j < size / 2; j++) {
        const a = start + j, b = a + size / 2
        const tr = wr * real[b] - wi * imag[b], ti = wr * imag[b] + wi * real[b]
        real[b] = real[a] - tr; imag[b] = imag[a] - ti
        real[a] += tr; imag[a] += ti
        const nextWr = wr * wrStep - wi * wiStep
        wi = wr * wiStep + wi * wrStep; wr = nextWr
      }
    }
  }
}

function tonalAnalysis(samples: Float32Array, sr: number): SectionAnalysis["tonal"] {
  const n = 4096, hop = 1024
  const real = new Float64Array(n), imag = new Float64Array(n)
  const power = new Float64Array(n / 2)
  const window = Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)))
  const blocks = Array.from({ length: 4 }, () => Array<number>(12).fill(0))
  let accepted = 0, frames = 0
  for (let start = 0; start + n <= samples.length; start += hop) {
    for (let i = 0; i < n; i++) { real[i] = samples[start + i] * window[i]; imag[i] = 0 }
    fft(real, imag)
    let total = 0, logPower = 0, bins = 0
    const lo = Math.ceil(65 * n / sr), hi = Math.min(n / 2 - 2, Math.floor(2000 * n / sr))
    for (let k = lo; k <= hi; k++) {
      power[k] = real[k] ** 2 + imag[k] ** 2
      total += power[k]; logPower += Math.log(power[k] + 1e-12); bins++
    }
    frames++
    if (total < 1e-4 || Math.exp(logPower / bins) / (total / bins) > 0.25) continue
    const chroma = Array<number>(12).fill(0)
    let peakEnergy = 0
    for (let k = lo + 1; k < hi; k++) {
      if (power[k] <= power[k - 1] || power[k] <= power[k + 1] || power[k] < total * 0.008) continue
      const a = Math.log(power[k - 1] + 1e-12), b = Math.log(power[k] + 1e-12), c = Math.log(power[k + 1] + 1e-12)
      const correction = Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / (a - 2 * b + c)))
      const midi = 69 + 12 * Math.log2((k + correction) * sr / n / 440)
      // Reject frequencies far from equal-tempered A=440 bins; do not guess a tuning correction.
      if (!Number.isFinite(midi) || Math.abs(midi - Math.round(midi)) > 0.3) continue
      chroma[((Math.round(midi) % 12) + 12) % 12] += power[k]
      peakEnergy += power[k]
    }
    if (peakEnergy < total * 0.3) continue
    accepted++
    const block = Math.min(3, Math.floor(4 * start / samples.length))
    for (let i = 0; i < 12; i++) blocks[block][i] += chroma[i] / peakEnergy
  }
  const chroma = Array.from({ length: 12 }, (_, i) => blocks.reduce((sum, block) => sum + block[i], 0))
  const sum = chroma.reduce((a, b) => a + b, 0)
  const normalized = chroma.map((v) => sum ? v / sum : 0)
  const ranked = rankKeys(normalized)
  const top = ranked[0]
  const agreement = blocks.filter((block) => {
    const best = rankKeys(block)[0]
    return block.some((v) => v > 0) && best.tonic === top.tonic && best.mode === top.mode
  }).length / 4
  const enoughNotes = normalized.filter((v) => v > 0.045).length >= 4
  const reliable = enoughNotes && accepted / Math.max(1, frames) >= 0.45 && top.correlation >= 0.65 && top.correlation - ranked[1].correlation >= 0.08 && agreement >= 0.75
  return {
    key: reliable ? top : null,
    candidates: sum ? ranked.slice(0, 2) : [],
    chroma: normalized,
    agreement,
    reason: reliable ? "A consistent key estimate across this section. Chord-by-chord fit still needs listening." : "No stable key estimate. Sparse melody, rap, noise, tuning or changing harmony can make this inconclusive.",
  }
}

function tempoAnalysis(samples: Float32Array, sr: number): SectionAnalysis["tempo"] {
  const hop = Math.round(sr / 100)
  const envelope: number[] = []
  let previous = 0
  for (let start = 0; start + hop <= samples.length; start += hop) {
    let energy = 0
    for (let i = 0; i < hop; i++) energy += samples[start + i] ** 2
    const rms = Math.sqrt(energy / hop)
    envelope.push(Math.max(0, rms - previous)); previous = rms
  }
  const fps = sr / hop
  const avg = envelope.reduce((a, b) => a + b, 0) / envelope.length
  const values = envelope.map((v) => v - avg)
  const lo = Math.ceil(fps * 60 / 180), hi = Math.floor(fps * 60 / 60)
  const ac: number[] = Array(hi + 2).fill(0)
  for (let lag = lo - 1; lag <= hi + 1; lag++) {
    let cross = 0, a = 0, b = 0
    for (let i = lag; i < values.length; i++) { cross += values[i] * values[i - lag]; a += values[i] ** 2; b += values[i - lag] ** 2 }
    ac[lag] = a * b > 1e-15 ? cross / Math.sqrt(a * b) : 0
  }
  const candidates: { bpm: number; strength: number }[] = []
  for (let lag = lo; lag <= hi; lag++) {
    if (ac[lag] <= ac[lag - 1] || ac[lag] < ac[lag + 1]) continue
    const adjustment = Math.max(-0.5, Math.min(0.5, 0.5 * (ac[lag - 1] - ac[lag + 1]) / (ac[lag - 1] - 2 * ac[lag] + ac[lag + 1])))
    candidates.push({ bpm: round(60 * fps / (lag + adjustment)), strength: ac[lag] })
  }
  candidates.sort((a, b) => b.strength - a.strength)
  const best = candidates[0]
  const strongOnsets = envelope.filter((v, i) => v > avg * 3 && v > (envelope[i - 1] ?? 0) && v >= (envelope[i + 1] ?? 0)).length
  const competing = best && candidates.some((c) => c !== best && c.strength > best.strength * 0.85 && Math.abs(Math.log2(c.bpm / best.bpm) - Math.round(Math.log2(c.bpm / best.bpm))) > 0.08)
  const reliable = best && best.strength >= 0.4 && strongOnsets >= 8 && !competing
  return {
    bpm: reliable ? best.bpm : null,
    strength: best?.strength ?? 0,
    alternatives: candidates.filter((c) => c.strength >= 0.3).slice(0, 3).map((c) => c.bpm),
    reason: reliable ? "A repeating pulse was measured. Confirm half/double tempo and the first beat by ear." : "No clear repeating pulse. A vocal alone may need a tempo checked against the original track.",
  }
}

export function analyzeSamples(samples: Float32Array, sampleRate = ANALYSIS_SAMPLE_RATE): SectionAnalysis {
  const duration = samples.length / sampleRate
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 96000 || duration < MIN_SECTION_SECONDS - 0.01 || duration > MAX_SECTION_SECONDS + 0.01) throw new Error("Choose an 8–30 second section.")
  let peak = 0, squares = 0, nearFull = 0
  for (const sample of samples) {
    if (!Number.isFinite(sample)) throw new Error("Audio contains invalid samples.")
    peak = Math.max(peak, Math.abs(sample)); squares += sample * sample
    if (Math.abs(sample) >= 0.999) nearFull++
  }
  const rms = Math.sqrt(squares / samples.length)
  const silent = rms < 0.0001
  return {
    version: BLEND_ANALYSIS_VERSION, duration,
    signal: { rmsDb: rms ? round(20 * Math.log10(rms)) : null, peakDb: peak ? round(20 * Math.log10(peak)) : null, nearFullScaleFraction: nearFull / samples.length, silent },
    tempo: silent ? { bpm: null, strength: 0, alternatives: [], reason: "Too little audible signal to estimate tempo." } : tempoAnalysis(samples, sampleRate),
    tonal: silent ? { key: null, candidates: [], chroma: Array(12).fill(0), agreement: 0, reason: "Too little audible signal to estimate harmony." } : tonalAnalysis(samples, sampleRate),
  }
}
