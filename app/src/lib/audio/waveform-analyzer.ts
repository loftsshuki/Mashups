/**
 * Audio Waveform Analyzer
 * Uses Web Audio API to extract waveform data from audio files
 */

export interface WaveformData {
  peaks: number[] // Amplitude values (0-1) for each bar
  duration: number // Audio duration in seconds
  sampleRate: number
  numberOfChannels: number
}

// Cache for waveform data to avoid re-analyzing
const waveformCache = new Map<string, WaveformData>()

/**
 * Analyze audio file and extract waveform data
 */
export async function analyzeWaveform(
  audioUrl: string,
  barCount: number = 100
): Promise<WaveformData> {
  // Check cache first
  const cacheKey = `${audioUrl}-${barCount}`
  if (waveformCache.has(cacheKey)) {
    return waveformCache.get(cacheKey)!
  }

  try {
    // Fetch audio file
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // Create offline audio context for analysis
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Extract peaks
    const peaks = extractPeaks(audioBuffer, barCount)
    
    const result: WaveformData = {
      peaks,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
    }

    // Cache result
    waveformCache.set(cacheKey, result)
    
    // Close context
    audioContext.close()

    return result
  } catch (error) {
    console.error("[WaveformAnalyzer] Error analyzing audio:", error)
    // Return fallback data
    return generateFallbackWaveform(barCount)
  }
}

/**
 * Extract peaks from audio buffer
 */
function extractPeaks(audioBuffer: AudioBuffer, barCount: number): number[] {
  const rawData = audioBuffer.getChannelData(0) // Use first channel
  const samplesPerBar = Math.floor(rawData.length / barCount)
  const peaks: number[] = []

  for (let i = 0; i < barCount; i++) {
    const start = i * samplesPerBar
    const end = start + samplesPerBar
    
    // Find max amplitude in this slice
    let max = 0
    for (let j = start; j < end; j++) {
      const amplitude = Math.abs(rawData[j] || 0)
      if (amplitude > max) {
        max = amplitude
      }
    }
    
    peaks.push(max)
  }

  // Normalize peaks to 0-1 range
  const maxPeak = Math.max(...peaks, 0.001) // Avoid division by zero
  return peaks.map((p) => p / maxPeak)
}

/**
 * Generate fallback waveform when analysis fails
 */
function generateFallbackWaveform(barCount: number): WaveformData {
  const peaks = Array.from({ length: barCount }, (_, i) => {
    // Create a realistic-looking fake waveform
    const position = i / barCount
    const envelope = Math.sin(position * Math.PI) // Envelope shape
    const detail = Math.sin(i * 0.5) * 0.3 + Math.cos(i * 0.7) * 0.2
    const noise = Math.sin(i * 2.3) * 0.1
    return Math.max(0.1, Math.min(0.9, envelope * 0.6 + detail + noise))
  })

  return {
    peaks,
    duration: 180,
    sampleRate: 44100,
    numberOfChannels: 2,
  }
}

/**
 * Clear waveform cache
 */
export function clearWaveformCache(): void {
  waveformCache.clear()
}

/**
 * Get cache size
 */
export function getWaveformCacheSize(): number {
  return waveformCache.size
}

/**
 * Pre-analyze multiple audio files
 */
export async function preAnalyzeWaveforms(
  urls: string[],
  barCount: number = 100,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = urls.length
  
  for (let i = 0; i < total; i++) {
    try {
      await analyzeWaveform(urls[i], barCount)
      onProgress?.(i + 1, total)
    } catch (error) {
      console.error(`[WaveformAnalyzer] Failed to analyze ${urls[i]}:`, error)
    }
  }
}

/**
 * Analyze a portion of audio (for clips)
 */
export async function analyzeWaveformSegment(
  audioUrl: string,
  startTime: number,
  duration: number,
  barCount: number = 100
): Promise<WaveformData> {
  try {
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Calculate sample positions
    const startSample = Math.floor(startTime * audioBuffer.sampleRate)
    const durationSamples = Math.floor(duration * audioBuffer.sampleRate)
    const endSample = Math.min(startSample + durationSamples, audioBuffer.length)
    
    // Extract segment
    const rawData = audioBuffer.getChannelData(0)
    const segmentData = rawData.slice(startSample, endSample)
    
    // Create temporary buffer for analysis
    const segmentBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      segmentData.length,
      audioBuffer.sampleRate
    )
    segmentBuffer.copyToChannel(segmentData, 0)
    
    const peaks = extractPeaks(segmentBuffer, barCount)
    
    audioContext.close()
    
    return {
      peaks,
      duration: duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
    }
  } catch (error) {
    console.error("[WaveformAnalyzer] Error analyzing segment:", error)
    return generateFallbackWaveform(barCount)
  }
}
