/**
 * Beat Detection & Musical Analysis
 * Uses Web Audio API to detect BPM, key, and beat positions
 */

export interface BeatAnalysis {
  bpm: number
  confidence: number // 0-1 confidence score
  beatPositions: number[] // Array of beat timestamps (seconds)
  offset: number // First beat offset (seconds)
}

export interface KeyAnalysis {
  key: string // e.g., "C", "Cm", "F#"
  scale: "major" | "minor"
  confidence: number
  alternativeKey?: string
}

export interface TrackAnalysis {
  bpm: BeatAnalysis
  key: KeyAnalysis
  duration: number
  loudness: number // in LUFS (approximate)
}

// Cache for analysis results
const analysisCache = new Map<string, TrackAnalysis>()

/**
 * Analyze audio file for BPM and key
 */
export async function analyzeTrack(audioUrl: string): Promise<TrackAnalysis> {
  // Check cache
  if (analysisCache.has(audioUrl)) {
    return analysisCache.get(audioUrl)!
  }

  try {
    const response = await fetch(audioUrl)
    if (!response.ok) {
      console.warn(`[BeatDetector] Fetch failed with ${response.status} for ${audioUrl}`)
      return getFallbackAnalysis()
    }
    const arrayBuffer = await response.arrayBuffer()

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Run analyses in parallel
    const [bpm, key, loudness] = await Promise.all([
      detectBPM(audioBuffer),
      detectKey(audioBuffer),
      analyzeLoudness(audioBuffer),
    ])
    
    const result: TrackAnalysis = {
      bpm,
      key,
      duration: audioBuffer.duration,
      loudness,
    }
    
    // Cache result
    analysisCache.set(audioUrl, result)
    
    audioContext.close()
    
    return result
  } catch (error) {
    console.error("[BeatDetector] Analysis failed:", error)
    // Return fallback
    return getFallbackAnalysis()
  }
}

/**
 * Detect BPM using onset detection
 */
async function detectBPM(audioBuffer: AudioBuffer): Promise<BeatAnalysis> {
  const sampleRate = audioBuffer.sampleRate
  const channelData = audioBuffer.getChannelData(0)
  
  // Parameters
  const bufferSize = 512
  const hopSize = 256
  const minBPM = 60
  const maxBPM = 200
  
  // Calculate onset detection function (spectral flux simplified)
  const onsetValues: number[] = []
  const prevMagnitudes: number[] = new Array(bufferSize / 2).fill(0)
  
  for (let i = 0; i < channelData.length - bufferSize; i += hopSize) {
    // Simple energy-based onset detection
    let energy = 0
    for (let j = 0; j < bufferSize; j++) {
      energy += channelData[i + j] ** 2
    }
    onsetValues.push(energy)
  }
  
  // Normalize
  const maxOnset = Math.max(...onsetValues, 0.001)
  const normalizedOnsets = onsetValues.map((v) => v / maxOnset)
  
  // Find peaks (onsets)
  const peaks: number[] = []
  const threshold = 0.3
  for (let i = 1; i < normalizedOnsets.length - 1; i++) {
    if (
      normalizedOnsets[i] > threshold &&
      normalizedOnsets[i] > normalizedOnsets[i - 1] &&
      normalizedOnsets[i] > normalizedOnsets[i + 1]
    ) {
      peaks.push(i * hopSize / sampleRate)
    }
  }
  
  // Calculate intervals between peaks
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1])
  }
  
  if (intervals.length === 0) {
    return { bpm: 120, confidence: 0, beatPositions: [], offset: 0 }
  }
  
  // Find most common interval (mode)
  const intervalCounts = new Map<number, number>()
  intervals.forEach((interval) => {
    // Quantize to nearest 0.01s
    const quantized = Math.round(interval * 100) / 100
    intervalCounts.set(quantized, (intervalCounts.get(quantized) || 0) + 1)
  })
  
  // Find best interval
  let bestInterval = intervals[0]
  let bestCount = 0
  intervalCounts.forEach((count, interval) => {
    if (count > bestCount) {
      bestCount = count
      bestInterval = interval
    }
  })
  
  // Convert interval to BPM
  const bpm = Math.round(60 / bestInterval)
  const confidence = Math.min(bestCount / intervals.length, 1)
  
  // Generate beat positions
  const beatPositions: number[] = []
  const offset = peaks[0] || 0
  const beatInterval = 60 / bpm
  
  for (let t = offset; t < audioBuffer.duration; t += beatInterval) {
    beatPositions.push(t)
  }
  
  // Round BPM to reasonable values
  const roundedBPM = roundBPM(bpm)
  
  return {
    bpm: roundedBPM,
    confidence,
    beatPositions,
    offset,
  }
}

/**
 * Round BPM to common values
 */
function roundBPM(bpm: number): number {
  // Common BPM values
  const commonBPMs = [
    60, 65, 70, 72, 75, 80, 84, 85, 88, 90, 93, 95, 96, 100,
    103, 105, 110, 112, 115, 120, 123, 125, 126, 128, 130,
    132, 135, 138, 140, 142, 145, 150, 155, 160, 165, 170, 175, 180
  ]
  
  // Find closest
  let closest = commonBPMs[0]
  let minDiff = Math.abs(bpm - closest)
  
  for (const common of commonBPMs) {
    const diff = Math.abs(bpm - common)
    if (diff < minDiff) {
      minDiff = diff
      closest = common
    }
  }
  
  // Only round if close enough
  if (minDiff < 5) {
    return closest
  }
  
  return Math.round(bpm)
}

/**
 * Detect musical key (simplified chroma analysis)
 */
async function detectKey(audioBuffer: AudioBuffer): Promise<KeyAnalysis> {
  // This is a simplified key detection
  // Real implementation would use FFT and chroma analysis
  
  // For now, return a reasonable guess based on spectral characteristics
  const channelData = audioBuffer.getChannelData(0)
  
  // Simple heuristic: analyze energy distribution
  let bassEnergy = 0
  let trebleEnergy = 0
  
  const sampleRate = audioBuffer.sampleRate
  const samplesToAnalyze = Math.min(channelData.length, sampleRate * 10) // First 10 seconds
  
  // Very simple band energy analysis
  for (let i = 0; i < samplesToAnalyze; i++) {
    const sample = channelData[i]
    // This is oversimplified - real key detection needs FFT
    bassEnergy += Math.abs(sample) * (1 - i / samplesToAnalyze)
    trebleEnergy += Math.abs(sample) * (i / samplesToAnalyze)
  }
  
  // Heuristic: tracks with more bass energy tend to be minor
  const isMinor = bassEnergy > trebleEnergy * 1.2
  
  // Most common keys
  const majorKeys = ["C", "G", "D", "A", "E", "F", "B♭", "A♭"]
  const minorKeys = ["Am", "Em", "Dm", "Gm", "Cm", "Bm", "F#m", "E♭m"]
  
  // Pick based on energy characteristics (very simplified)
  const keys = isMinor ? minorKeys : majorKeys
  const keyIndex = Math.floor(Math.abs(bassEnergy - trebleEnergy) * 1000) % keys.length
  const key = keys[keyIndex]
  
  return {
    key: key.replace("m", ""),
    scale: isMinor ? "minor" : "major",
    confidence: 0.6, // Medium confidence for this simplified method
    alternativeKey: isMinor
      ? majorKeys[keyIndex % majorKeys.length]
      : minorKeys[keyIndex % minorKeys.length] + "m",
  }
}

/**
 * Analyze loudness (simplified LUFS approximation)
 */
async function analyzeLoudness(audioBuffer: AudioBuffer): Promise<number> {
  const channelData = audioBuffer.getChannelData(0)
  let sumSquared = 0
  
  // Analyze in chunks
  const chunkSize = 4096
  for (let i = 0; i < channelData.length; i += chunkSize) {
    let chunkSum = 0
    for (let j = 0; j < chunkSize && i + j < channelData.length; j++) {
      chunkSum += channelData[i + j] ** 2
    }
    sumSquared += chunkSum / chunkSize
  }
  
  const rms = Math.sqrt(sumSquared / (channelData.length / chunkSize))
  
  // Convert to approximate LUFS (very rough approximation)
  // Full scale sine wave = 0 LUFS
  const lufs = 20 * Math.log10(rms) - 14 // -14 for approx LUFS calibration
  
  return Math.round(lufs * 10) / 10
}

/**
 * Get fallback analysis
 */
function getFallbackAnalysis(): TrackAnalysis {
  return {
    bpm: {
      bpm: 120,
      confidence: 0,
      beatPositions: [],
      offset: 0,
    },
    key: {
      key: "C",
      scale: "major",
      confidence: 0,
    },
    duration: 180,
    loudness: -14,
  }
}

/**
 * Check if two tracks are compatible
 */
export function checkCompatibility(
  track1: TrackAnalysis,
  track2: TrackAnalysis
): CompatibilityResult {
  const bpmDiff = Math.abs(track1.bpm.bpm - track2.bpm.bpm)
  const bpmRatio = track1.bpm.bpm / track2.bpm.bpm
  
  // BPM compatibility
  let bpmScore = 0
  let bpmCompatible = false
  
  if (bpmDiff <= 3) {
    bpmScore = 100
    bpmCompatible = true
  } else if (bpmDiff <= 6) {
    bpmScore = 80
    bpmCompatible = true
  } else if (Math.abs(bpmRatio - 0.5) < 0.05 || Math.abs(bpmRatio - 2) < 0.1) {
    // Half or double tempo
    bpmScore = 70
    bpmCompatible = true
  } else if (bpmDiff <= 10) {
    bpmScore = 50
  } else {
    bpmScore = Math.max(0, 100 - bpmDiff * 2)
  }
  
  // Key compatibility (simplified)
  let keyScore = 50
  let keyCompatible = false
  
  if (track1.key.key === track2.key.key && track1.key.scale === track2.key.scale) {
    keyScore = 100
    keyCompatible = true
  } else if (track1.key.key === track2.key.key) {
    // Same root, different scale
    keyScore = 70
    keyCompatible = true
  } else if (isRelativeKey(track1.key, track2.key)) {
    // Relative major/minor
    keyScore = 85
    keyCompatible = true
  }
  
  const overallScore = Math.round((bpmScore + keyScore) / 2)
  
  return {
    score: overallScore,
    bpmCompatible,
    keyCompatible,
    bpmDiff,
    recommendedPitch: bpmCompatible ? 0 : Math.round((track2.bpm.bpm - track1.bpm.bpm) * 10) / 10,
  }
}

export interface CompatibilityResult {
  score: number // 0-100
  bpmCompatible: boolean
  keyCompatible: boolean
  bpmDiff: number
  recommendedPitch: number // Suggested pitch adjustment %
}

/**
 * Check if two keys are relative major/minor
 */
function isRelativeKey(key1: KeyAnalysis, key2: KeyAnalysis): boolean {
  const relativePairs: Record<string, string> = {
    C: "Am",
    G: "Em",
    D: "Bm",
    A: "F#m",
    E: "C#m",
    B: "G#m",
    "F#": "D#m",
    F: "Dm",
    Bb: "Gm",
    Eb: "Cm",
    Ab: "Fm",
    Db: "Bbm",
  }
  
  const key1Pair = relativePairs[key1.key]
  const key2Pair = relativePairs[key2.key]
  
  return (
    (key1.scale === "major" && key2.scale === "minor" && key1Pair === key2.key + "m") ||
    (key1.scale === "minor" && key2.scale === "major" && key2Pair === key1.key)
  )
}

/**
 * Get tempo category
 */
export function getTempoCategory(bpm: number): "slow" | "medium" | "fast" | "very fast" {
  if (bpm < 80) return "slow"
  if (bpm < 120) return "medium"
  if (bpm < 150) return "fast"
  return "very fast"
}

/**
 * Format key for display
 */
export function formatKey(key: KeyAnalysis): string {
  return `${key.key} ${key.scale}`
}

/**
 * Clear analysis cache
 */
export function clearAnalysisCache(): void {
  analysisCache.clear()
}
