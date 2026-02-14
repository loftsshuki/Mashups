// Attribution Watermark System - Audio fingerprinting and attribution

export interface AttributionSource {
  id: string
  title: string
  artist: string
  platform: "youtube" | "soundcloud" | "spotify" | "apple_music" | "bandcamp" | "other"
  url?: string
  isrc?: string // International Standard Recording Code
  duration: number // in seconds
  sampleUsed: {
    startTime: number
    endTime: number
  }
  licenseType: "cc" | "royalty_free" | "commercial" | "unknown" | "fair_use"
  licenseUrl?: string
}

export interface AudioFingerprint {
  id: string
  sourceId: string
  chromaprint: string // AcoustID fingerprint
  duration: number
  sampleRate: number
  fingerprintData: number[] // Simplified spectral features
}

export interface AttributionWatermark {
  id: string
  mashupId: string
  sources: AttributionSource[]
  fingerprint: AudioFingerprint
  embeddedAt: string
  version: string
}

export interface WatermarkDetectionResult {
  detected: boolean
  confidence: number // 0-100
  matchedSources: AttributionSource[]
  timestamp: string
}

// Generate a simplified audio fingerprint
// In production, this would use AcoustID/chromaprint
export async function generateFingerprint(
  audioBuffer: AudioBuffer
): Promise<AudioFingerprint> {
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  
  // Extract spectral features at regular intervals
  const features: number[] = []
  const windowSize = 4096
  const hopSize = 2048
  
  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    // Simple zero-crossing rate as a basic feature
    let zeroCrossings = 0
    for (let j = i; j < i + windowSize - 1; j++) {
      if ((channelData[j] >= 0 && channelData[j + 1] < 0) ||
          (channelData[j] < 0 && channelData[j + 1] >= 0)) {
        zeroCrossings++
      }
    }
    
    // RMS energy
    let sum = 0
    for (let j = i; j < i + windowSize; j++) {
      sum += channelData[j] * channelData[j]
    }
    const rms = Math.sqrt(sum / windowSize)
    
    features.push(zeroCrossings, Math.round(rms * 1000))
  }
  
  // Create a simplified hash
  const hash = features.slice(0, 100).join(",")
  
  return {
    id: `fp_${Date.now()}`,
    sourceId: "",
    chromaprint: hash,
    duration: audioBuffer.duration,
    sampleRate,
    fingerprintData: features.slice(0, 500), // Limit for storage
  }
}

// Embed watermark into audio (metadata approach)
export async function embedWatermark(
  audioBlob: Blob,
  sources: AttributionSource[]
): Promise<Blob> {
  // In production, this would embed into ID3 tags, Vorbis comments, or use audio steganography
  // For now, we'll create a metadata JSON blob alongside
  
  const watermark: AttributionWatermark = {
    id: `wm_${Date.now()}`,
    mashupId: sources.map(s => s.id).join("_"),
    sources,
    fingerprint: await generateFingerprint(
      await new AudioContext().decodeAudioData(await audioBlob.arrayBuffer())
    ),
    embeddedAt: new Date().toISOString(),
    version: "1.0",
  }
  
  // Create a combined blob with metadata header
  const metadata = JSON.stringify(watermark)
  const metadataBlob = new Blob([metadata], { type: "application/json" })
  
  // In real implementation, this would properly embed into audio format
  return new Blob([audioBlob, metadataBlob], { type: audioBlob.type })
}

// Detect watermark in audio
export async function detectWatermark(audioBlob: Blob): Promise<WatermarkDetectionResult> {
  try {
    // Try to extract embedded metadata
    const text = await audioBlob.text()
    
    // Look for JSON metadata at the end of the blob
    const jsonMatch = text.match(/\{[^}]*"id"[^}]*"wm_[^"]*"[^}]*\}$/)
    
    if (jsonMatch) {
      const watermark: AttributionWatermark = JSON.parse(jsonMatch[0])
      
      return {
        detected: true,
        confidence: 95,
        matchedSources: watermark.sources,
        timestamp: new Date().toISOString(),
      }
    }
    
    // Fallback: try audio fingerprint matching
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    const fingerprint = await generateFingerprint(audioBuffer)
    
    // Compare against database (mock)
    const mockMatch = await queryFingerprintDatabase(fingerprint)
    
    return {
      detected: mockMatch.confidence > 70,
      confidence: mockMatch.confidence,
      matchedSources: mockMatch.sources,
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.error("Watermark detection failed:", err)
    return {
      detected: false,
      confidence: 0,
      matchedSources: [],
      timestamp: new Date().toISOString(),
    }
  }
}

// Query fingerprint database (mock)
async function queryFingerprintDatabase(
  fingerprint: AudioFingerprint
): Promise<{ confidence: number; sources: AttributionSource[] }> {
  // Mock database query
  // In production, this would query AcoustID or internal database
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    confidence: 0,
    sources: [],
  }
}

// Validate attribution completeness
export function validateAttribution(
  sources: AttributionSource[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (sources.length === 0) {
    errors.push("At least one source must be attributed")
  }
  
  sources.forEach((source, index) => {
    if (!source.title) {
      errors.push(`Source ${index + 1}: Title is required`)
    }
    if (!source.artist) {
      errors.push(`Source ${index + 1}: Artist is required`)
    }
    if (source.sampleUsed.endTime <= source.sampleUsed.startTime) {
      errors.push(`Source ${index + 1}: Invalid sample time range`)
    }
    if (source.licenseType === "unknown") {
      errors.push(`Source ${index + 1}: License type should be specified`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Generate attribution text for platforms
export function generateAttributionText(
  sources: AttributionSource[],
  format: "short" | "full" | "json" = "full"
): string {
  switch (format) {
    case "short":
      return sources.map(s => `${s.title} by ${s.artist}`).join(" | ")
    
    case "json":
      return JSON.stringify({ sources }, null, 2)
    
    case "full":
    default:
      return sources.map(s => 
        `"${s.title}" by ${s.artist}\n` +
        `Sampled: ${formatTime(s.sampleUsed.startTime)} - ${formatTime(s.sampleUsed.endTime)}\n` +
        `License: ${s.licenseType}${s.licenseUrl ? ` (${s.licenseUrl})` : ""}`
      ).join("\n\n")
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Platform-specific metadata generators
export function generateYouTubeDescription(sources: AttributionSource[]): string {
  const attribution = sources.map(s => 
    `🎵 "${s.title}" by ${s.artist}\n` +
    `   License: ${s.licenseType.toUpperCase()}`
  ).join("\n\n")
  
  return `Mashup created using MashupPlatform\n\n` +
    `📝 ATTRIBUTION:\n${attribution}\n\n` +
    `This mashup may contain samples from third-party content. ` +
    `All rights belong to their respective owners.`
}

export function generateSoundCloudTags(sources: AttributionSource[]): string[] {
  const baseTags = ["mashup", "remix", "bootleg"]
  const artistTags = sources.map(s => s.artist.toLowerCase().replace(/\s+/g, ""))
  const titleTags = sources.map(s => s.title.toLowerCase().replace(/\s+/g, ""))
  
  return [...baseTags, ...artistTags, ...titleTags].slice(0, 10)
}

// Mock attribution sources for testing
export const mockAttributionSources: AttributionSource[] = [
  {
    id: "source_1",
    title: "Summer Vibes",
    artist: "Beach Boys Tribute",
    platform: "youtube",
    url: "https://youtube.com/watch?v=abc123",
    duration: 180,
    sampleUsed: { startTime: 0, endTime: 30 },
    licenseType: "cc",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  {
    id: "source_2",
    title: "Night Drive",
    artist: "Synthwave King",
    platform: "soundcloud",
    url: "https://soundcloud.com/synthwaveking/night-drive",
    duration: 240,
    sampleUsed: { startTime: 45, endTime: 75 },
    licenseType: "royalty_free",
  },
]
