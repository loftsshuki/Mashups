// AI Vocal Features - Voice transformation and effects

export type VocalEffect = 
  | "autotune" 
  | "harmony" 
  | "robotic" 
  | "ethereal" 
  | "vintage" 
  | "choir" 
  | "gender_shift" 
  | "formant"

export type PitchCorrectionMode = "scale" | "chromatic" | "off"
export type Scale = "major" | "minor" | "pentatonic" | "blues" | "custom"

export interface VocalEffectSettings {
  effect: VocalEffect
  intensity: number // 0-100
  enabled: boolean
}

export interface AutoTuneSettings {
  enabled: boolean
  mode: PitchCorrectionMode
  scale: Scale
  key: string
  speed: number // 0-100, how fast correction applies
  preserveExpression: boolean // keep natural vibrato
}

export interface VocalToMidiSettings {
  enabled: boolean
  outputInstrument: "piano" | "synth" | "bass" | "strings"
  velocitySensitive: boolean
  noteLength: "staccato" | "legato" | "original"
}

export interface VoiceCloneSettings {
  enabled: boolean
  sourceVoice: string // voice model ID
  consentVerified: boolean // required for ethical use
  similarity: number // 0-100
}

export interface AIProcessingResult {
  id: string
  originalUrl: string
  processedUrl: string
  effects: VocalEffect[]
  duration: number
  processingTime: number
  quality: "high" | "medium" | "low"
}

export interface VocalPreset {
  id: string
  name: string
  description: string
  category: "modern" | "retro" | "experimental" | "utility"
  icon: string
  effects: VocalEffectSettings[]
  autoTune: Partial<AutoTuneSettings>
}

// Vocal effect presets
export const vocalPresets: VocalPreset[] = [
  {
    id: "pop_star",
    name: "Pop Star",
    description: "Polished modern pop vocals",
    category: "modern",
    icon: "🎤",
    effects: [
      { effect: "autotune", intensity: 60, enabled: true },
      { effect: "harmony", intensity: 30, enabled: true },
    ],
    autoTune: { mode: "scale", scale: "major", speed: 70 },
  },
  {
    id: "trap_god",
    name: "Trap God",
    description: "Hard-hitting trap vocals",
    category: "modern",
    icon: "🔥",
    effects: [
      { effect: "autotune", intensity: 85, enabled: true },
      { effect: "robotic", intensity: 20, enabled: true },
    ],
    autoTune: { mode: "chromatic", speed: 90 },
  },
  {
    id: "vintage_soul",
    name: "Vintage Soul",
    description: "70s analog warmth",
    category: "retro",
    icon: "📻",
    effects: [
      { effect: "vintage", intensity: 75, enabled: true },
      { effect: "harmony", intensity: 40, enabled: true },
    ],
    autoTune: { mode: "off" },
  },
  {
    id: "robot_voice",
    name: "Cyborg",
    description: "Full robotic transformation",
    category: "experimental",
    icon: "🤖",
    effects: [
      { effect: "robotic", intensity: 100, enabled: true },
      { effect: "formant", intensity: 50, enabled: true },
    ],
    autoTune: { mode: "chromatic", speed: 50 },
  },
  {
    id: "dreamy",
    name: "Dreamscape",
    description: "Ethereal floating vocals",
    category: "experimental",
    icon: "☁️",
    effects: [
      { effect: "ethereal", intensity: 80, enabled: true },
      { effect: "harmony", intensity: 60, enabled: true },
      { effect: "choir", intensity: 40, enabled: true },
    ],
    autoTune: { mode: "scale", scale: "pentatonic", speed: 40 },
  },
  {
    id: "gender_bend",
    name: "Gender Shift",
    description: "Alter vocal characteristics",
    category: "utility",
    icon: "⚧",
    effects: [
      { effect: "gender_shift", intensity: 50, enabled: true },
      { effect: "formant", intensity: 30, enabled: true },
    ],
    autoTune: { mode: "scale", speed: 60 },
  },
]

// Music scales with intervals (semitones)
export const SCALES: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  custom: [], // User-defined
}

// Apply vocal effects
export async function applyVocalEffects(
  audioUrl: string,
  effects: VocalEffectSettings[],
  autoTune?: AutoTuneSettings,
  vocalToMidi?: VocalToMidiSettings
): Promise<AIProcessingResult> {
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const enabledEffects = effects.filter(e => e.enabled)
  
  return {
    id: `vocal_${Date.now()}`,
    originalUrl: audioUrl,
    processedUrl: audioUrl.replace(".mp3", "_processed.mp3"),
    effects: enabledEffects.map(e => e.effect),
    duration: 180,
    processingTime: 3.2,
    quality: "high",
  }
}

// Convert vocals to MIDI
export async function convertVocalToMidi(
  audioUrl: string,
  settings: VocalToMidiSettings
): Promise<{
  midiUrl: string
  notes: Array<{
    pitch: number
    velocity: number
    startTime: number
    duration: number
  }>
}> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock MIDI data
  const notes = []
  const basePitch = 60 // Middle C
  
  for (let i = 0; i < 16; i++) {
    notes.push({
      pitch: basePitch + [0, 4, 7, 12][i % 4],
      velocity: 80 + Math.floor(Math.random() * 40),
      startTime: i * 0.5,
      duration: 0.4,
    })
  }
  
  return {
    midiUrl: audioUrl.replace(".mp3", ".mid"),
    notes,
  }
}

// Clone voice (with consent verification)
export async function cloneVoice(
  sourceAudio: string,
  targetText: string,
  settings: VoiceCloneSettings
): Promise<{
  clonedUrl: string
  similarity: number
  processingTime: number
}> {
  if (!settings.consentVerified) {
    throw new Error("Consent must be verified before voice cloning")
  }
  
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  return {
    clonedUrl: sourceAudio.replace(".mp3", "_cloned.mp3"),
    similarity: settings.similarity,
    processingTime: 5.2,
  }
}

// Real-time preview (simulated)
export async function previewVocalEffect(
  audioUrl: string,
  effect: VocalEffect,
  intensity: number
): Promise<string> {
  // Would process a short segment in real-time
  await new Promise(resolve => setTimeout(resolve, 500))
  return audioUrl
}

// Analyze vocal characteristics
export async function analyzeVocals(audioUrl: string): Promise<{
  pitchRange: { min: number; max: number }
  averagePitch: number
  vibratoRate: number
  breathiness: number
  clarity: number
  sibilance: number
  estimatedKey: string
}> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    pitchRange: { min: 120, max: 600 },
    averagePitch: 350,
    vibratoRate: 5.5,
    breathiness: 30,
    clarity: 85,
    sibilance: 25,
    estimatedKey: "C major",
  }
}

// Helper functions
export function getEffectDisplayName(effect: VocalEffect): string {
  const names: Record<VocalEffect, string> = {
    autotune: "Auto-Tune",
    harmony: "Harmony",
    robotic: "Robotic",
    ethereal: "Ethereal",
    vintage: "Vintage",
    choir: "Choir",
    gender_shift: "Gender Shift",
    formant: "Formant Shift",
  }
  return names[effect] || effect
}

export function getEffectDescription(effect: VocalEffect): string {
  const descriptions: Record<VocalEffect, string> = {
    autotune: "Pitch correction with scale awareness",
    harmony: "Add harmonizing vocal layers",
    robotic: "Vocoder and synth-like effect",
    ethereal: "Reverb-drenched spacious vocals",
    vintage: "Analog tape warmth and saturation",
    choir: "Multi-voice ensemble effect",
    gender_shift: "Alter vocal characteristics",
    formant: "Change vocal timbre without pitch",
  }
  return descriptions[effect]
}

export function getCategoryColor(category: VocalPreset["category"]): string {
  const colors: Record<VocalPreset["category"], string> = {
    modern: "text-blue-500 bg-blue-500/10",
    retro: "text-amber-500 bg-amber-500/10",
    experimental: "text-purple-500 bg-purple-500/10",
    utility: "text-gray-500 bg-gray-500/10",
  }
  return colors[category]
}
