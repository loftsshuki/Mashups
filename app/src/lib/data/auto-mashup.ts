// Auto-Mashup AI - "Surprise me" full auto-mashup generation

export type VibePreset = "energetic" | "chill" | "dark" | "euphoric" | "retro" | "experimental"
export type AIMashupStatus = "uploading" | "analyzing" | "generating" | "mixing" | "complete" | "error"

export interface AIMashupTrack {
  id: string
  fileName: string
  duration: number
  bpm: number
  key: string
  analyzed: boolean
  stems?: {
    vocals: string
    drums: string
    bass: string
    other: string
  }
}

export interface AIMashupConfig {
  tracks: AIMashupTrack[]
  vibe: VibePreset
  intensity: number // 0-100
  transitionStyle: "smooth" | "choppy" | "drop" | "blend"
  vocalFocus: boolean
  includeOriginalSegments: boolean
}

export interface AIMashupResult {
  id: string
  config: AIMashupConfig
  status: AIMashupStatus
  progress: number // 0-100
  outputUrl?: string
  duration: number
  bpm: number
  key: string
  aiAnalysis: {
    energy: number
    danceability: number
    valence: number
    acousticness: number
  }
  segments: Array<{
    startTime: number
    endTime: number
    sourceTrack: string
    stem: "vocals" | "drums" | "bass" | "other"
    effect: string
  }>
  error?: string
  createdAt: string
  completedAt?: string
}

export interface VibePresetConfig {
  id: VibePreset
  name: string
  description: string
  emoji: string
  color: string
  settings: {
    tempoMultiplier: number // 0.8 - 1.2
    keyShift: number // -3 to +3 semitones
    reverbAmount: number // 0-100
    filterType: "lowpass" | "highpass" | "none"
    beatComplexity: "simple" | "complex" | "glitch"
    vocalProcessing: "clean" | "robotic" | "ethereal" | "none"
  }
}

// Vibe preset definitions
export const vibePresets: Record<VibePreset, VibePresetConfig> = {
  energetic: {
    id: "energetic",
    name: "High Energy",
    description: "Fast-paced, intense, festival-ready",
    emoji: "⚡",
    color: "text-yellow-500 bg-yellow-500/10",
    settings: {
      tempoMultiplier: 1.1,
      keyShift: 0,
      reverbAmount: 20,
      filterType: "none",
      beatComplexity: "complex",
      vocalProcessing: "clean",
    },
  },
  chill: {
    id: "chill",
    name: "Chill Vibes",
    description: "Relaxed, lo-fi, study beats",
    emoji: "🌊",
    color: "text-blue-500 bg-blue-500/10",
    settings: {
      tempoMultiplier: 0.85,
      keyShift: -2,
      reverbAmount: 60,
      filterType: "lowpass",
      beatComplexity: "simple",
      vocalProcessing: "ethereal",
    },
  },
  dark: {
    id: "dark",
    name: "Dark & Moody",
    description: "Underground, techno, mysterious",
    emoji: "🌑",
    color: "text-purple-500 bg-purple-500/10",
    settings: {
      tempoMultiplier: 0.95,
      keyShift: -3,
      reverbAmount: 40,
      filterType: "highpass",
      beatComplexity: "glitch",
      vocalProcessing: "robotic",
    },
  },
  euphoric: {
    id: "euphoric",
    name: "Euphoric",
    description: "Uplifting, emotional, anthemic",
    emoji: "✨",
    color: "text-pink-500 bg-pink-500/10",
    settings: {
      tempoMultiplier: 1.05,
      keyShift: 2,
      reverbAmount: 50,
      filterType: "none",
      beatComplexity: "simple",
      vocalProcessing: "ethereal",
    },
  },
  retro: {
    id: "retro",
    name: "Retro Wave",
    description: "80s synthwave, nostalgic",
    emoji: "🕹️",
    color: "text-cyan-500 bg-cyan-500/10",
    settings: {
      tempoMultiplier: 1.0,
      keyShift: 0,
      reverbAmount: 45,
      filterType: "lowpass",
      beatComplexity: "simple",
      vocalProcessing: "robotic",
    },
  },
  experimental: {
    id: "experimental",
    name: "Experimental",
    description: "Weird, unexpected, avant-garde",
    emoji: "🧪",
    color: "text-green-500 bg-green-500/10",
    settings: {
      tempoMultiplier: 1.15,
      keyShift: 4,
      reverbAmount: 80,
      filterType: "highpass",
      beatComplexity: "glitch",
      vocalProcessing: "robotic",
    },
  },
}

// Mock AI analysis
export async function analyzeTracks(files: File[]): Promise<AIMashupTrack[]> {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return files.map((file, i) => ({
    id: `track_${i}`,
    fileName: file.name,
    duration: 180 + Math.floor(Math.random() * 120),
    bpm: 110 + Math.floor(Math.random() * 40),
    key: ["C", "G", "D", "A", "F", "Am", "Em"][Math.floor(Math.random() * 7)],
    analyzed: true,
  }))
}

// Generate auto-mashup
export async function generateAutoMashup(
  config: AIMashupConfig
): Promise<AIMashupResult> {
  const result: AIMashupResult = {
    id: `ai_${Date.now()}`,
    config,
    status: "analyzing",
    progress: 0,
    duration: 0,
    bpm: 0,
    key: "",
    aiAnalysis: {
      energy: 0,
      danceability: 0,
      valence: 0,
      acousticness: 0,
    },
    segments: [],
    createdAt: new Date().toISOString(),
  }
  
  // Simulate generation process
  await simulateGeneration(result)
  
  return result
}

async function simulateGeneration(result: AIMashupResult): Promise<void> {
  const stages: AIMashupStatus[] = ["analyzing", "generating", "mixing", "complete"]
  const delays = [1500, 3000, 2000, 500]
  
  for (let i = 0; i < stages.length; i++) {
    result.status = stages[i]
    result.progress = (i / (stages.length - 1)) * 100
    
    await new Promise(resolve => setTimeout(resolve, delays[i]))
    
    if (i === stages.length - 1) {
      // Complete
      const vibe = vibePresets[result.config.vibe]
      const baseBpm = result.config.tracks[0]?.bpm || 120
      
      result.bpm = Math.round(baseBpm * vibe.settings.tempoMultiplier)
      result.key = result.config.tracks[0]?.key || "C"
      result.duration = 180 // 3 minutes
      result.outputUrl = `/audio/ai_mashup_${result.id}.mp3`
      result.completedAt = new Date().toISOString()
      result.aiAnalysis = {
        energy: 50 + Math.random() * 50,
        danceability: 50 + Math.random() * 50,
        valence: 30 + Math.random() * 70,
        acousticness: Math.random() * 40,
      }
      
      // Generate segments
      const segmentCount = 8 + Math.floor(Math.random() * 8)
      for (let j = 0; j < segmentCount; j++) {
        result.segments.push({
          startTime: j * (result.duration / segmentCount),
          endTime: (j + 1) * (result.duration / segmentCount),
          sourceTrack: result.config.tracks[j % result.config.tracks.length]?.id || "track_0",
          stem: ["vocals", "drums", "bass", "other"][Math.floor(Math.random() * 4)] as any,
          effect: ["reverb", "delay", "filter", "none"][Math.floor(Math.random() * 4)],
        })
      }
    }
  }
}

// Get generation status
export async function getMashupStatus(id: string): Promise<AIMashupResult | null> {
  // Mock - would fetch from API
  return null
}

// Refine/edit AI result
export async function refineMashup(
  mashupId: string,
  adjustments: {
    segmentIndex: number
    changes: Partial<AIMashupResult["segments"][0]>
  }[]
): Promise<AIMashupResult> {
  // Simulate refinement
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    id: mashupId,
    config: {} as AIMashupConfig,
    status: "complete",
    progress: 100,
    duration: 180,
    bpm: 128,
    key: "C",
    aiAnalysis: {
      energy: 75,
      danceability: 80,
      valence: 65,
      acousticness: 20,
    },
    segments: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
}

// Helper functions
export function getVibeEmoji(vibe: VibePreset): string {
  return vibePresets[vibe].emoji
}

export function getVibeColor(vibe: VibePreset): string {
  return vibePresets[vibe].color
}

export function analyzeCompatibility(tracks: AIMashupTrack[]): {
  compatible: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  if (tracks.length < 2) {
    issues.push("Need at least 2 tracks for a mashup")
    return { compatible: false, issues, suggestions }
  }
  
  // Check BPM compatibility
  const bpms = tracks.map(t => t.bpm)
  const bpmRange = Math.max(...bpms) - Math.min(...bpms)
  if (bpmRange > 20) {
    issues.push("Large BPM difference detected")
    suggestions.push("Consider using 'Energetic' or 'Experimental' vibe for better tempo matching")
  }
  
  // Check key compatibility
  const keys = tracks.map(t => t.key)
  const uniqueKeys = new Set(keys)
  if (uniqueKeys.size > 2) {
    suggestions.push("Multiple keys detected - AI will auto-shift for harmonic mixing")
  }
  
  return {
    compatible: issues.length === 0,
    issues,
    suggestions,
  }
}

// Export mock results for demo
export const mockAIMashupResults: AIMashupResult[] = [
  {
    id: "ai_001",
    config: {
      tracks: [
        { id: "t1", fileName: "track1.mp3", duration: 200, bpm: 128, key: "C", analyzed: true },
        { id: "t2", fileName: "track2.mp3", duration: 180, bpm: 126, key: "Am", analyzed: true },
      ],
      vibe: "energetic",
      intensity: 75,
      transitionStyle: "drop",
      vocalFocus: true,
      includeOriginalSegments: false,
    },
    status: "complete",
    progress: 100,
    outputUrl: "/audio/ai_demo_1.mp3",
    duration: 195,
    bpm: 140,
    key: "C",
    aiAnalysis: {
      energy: 85,
      danceability: 90,
      valence: 75,
      acousticness: 15,
    },
    segments: [
      { startTime: 0, endTime: 24, sourceTrack: "t1", stem: "drums", effect: "none" },
      { startTime: 24, endTime: 48, sourceTrack: "t2", stem: "vocals", effect: "reverb" },
      { startTime: 48, endTime: 72, sourceTrack: "t1", stem: "bass", effect: "none" },
    ],
    createdAt: "2026-02-10T10:00:00Z",
    completedAt: "2026-02-10T10:01:30Z",
  },
]
