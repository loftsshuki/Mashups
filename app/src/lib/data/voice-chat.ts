// Voice Chat Integration - WebRTC-based voice communication

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export interface VoiceParticipant {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  isSpeaking: boolean
  isMuted: boolean
  isDeafened: boolean
  audioLevel: number // 0-100
  joinedAt: string
}

export interface VoiceRoom {
  id: string
  sessionId: string
  participants: VoiceParticipant[]
  createdAt: string
}

export interface VoiceSettings {
  inputDevice: string | null
  outputDevice: string | null
  inputVolume: number // 0-100
  outputVolume: number // 0-100
  noiseSuppression: boolean
  echoCancellation: boolean
  autoGainControl: boolean
}

// Audio context for voice processing
let audioContext: AudioContext | null = null

export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export async function requestMicrophoneAccess(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  })
}

export async function getAudioDevices(): Promise<{
  inputs: MediaDeviceInfo[]
  outputs: MediaDeviceInfo[]
}> {
  const devices = await navigator.mediaDevices.enumerateDevices()
  
  return {
    inputs: devices.filter(d => d.kind === "audioinput"),
    outputs: devices.filter(d => d.kind === "audiooutput"),
  }
}

// Voice room management
const voiceRooms: Map<string, VoiceRoom> = new Map()

export async function createVoiceRoom(sessionId: string): Promise<VoiceRoom> {
  const room: VoiceRoom = {
    id: `voice_${Date.now()}`,
    sessionId,
    participants: [],
    createdAt: new Date().toISOString(),
  }

  voiceRooms.set(room.id, room)

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

      const { data } = await supabase
        .from("voice_rooms")
        .insert({
          session_id: sessionId,
          status: "active",
          expires_at: expiresAt,
        })
        .select("id")
        .single()

      if (data) {
        room.id = (data as Record<string, unknown>).id as string
        voiceRooms.set(room.id, room)
      }
    } catch {
      // Continue with local-only room
    }
  }

  return room
}

// Get or create a voice room for a session
export async function getVoiceRoomForSession(sessionId: string): Promise<VoiceRoom | null> {
  if (!isSupabaseConfigured()) {
    // Check local rooms
    for (const room of voiceRooms.values()) {
      if (room.sessionId === sessionId) return room
    }
    return null
  }

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("voice_rooms")
      .select("*")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null

    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      sessionId: row.session_id as string,
      participants: [],
      createdAt: (row.created_at ?? "") as string,
    }
  } catch {
    return null
  }
}

export async function joinVoiceRoom(
  roomId: string,
  user: { id: string; displayName: string; avatarUrl: string }
): Promise<VoiceRoom | null> {
  const room = voiceRooms.get(roomId)
  if (!room) return null
  
  const existingIndex = room.participants.findIndex(p => p.userId === user.id)
  
  if (existingIndex >= 0) {
    room.participants[existingIndex].isSpeaking = false
  } else {
    room.participants.push({
      id: `voice_part_${Date.now()}`,
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isSpeaking: false,
      isMuted: false,
      isDeafened: false,
      audioLevel: 0,
      joinedAt: new Date().toISOString(),
    })
  }
  
  return room
}

export async function leaveVoiceRoom(roomId: string, userId: string): Promise<void> {
  const room = voiceRooms.get(roomId)
  if (!room) return
  
  room.participants = room.participants.filter(p => p.userId !== userId)
}

export async function toggleMute(roomId: string, userId: string): Promise<boolean> {
  const room = voiceRooms.get(roomId)
  if (!room) return false
  
  const participant = room.participants.find(p => p.userId === userId)
  if (participant) {
    participant.isMuted = !participant.isMuted
    return participant.isMuted
  }
  return false
}

export async function toggleDeafen(roomId: string, userId: string): Promise<boolean> {
  const room = voiceRooms.get(roomId)
  if (!room) return false
  
  const participant = room.participants.find(p => p.userId === userId)
  if (participant) {
    participant.isDeafened = !participant.isDeafened
    return participant.isDeafened
  }
  return false
}

// Voice activity detection
export function detectVoiceActivity(
  stream: MediaStream,
  callback: (isSpeaking: boolean, level: number) => void,
  threshold = 30
): () => void {
  const ctx = initAudioContext()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  
  analyser.fftSize = 256
  source.connect(analyser)
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  let isCurrentlySpeaking = false
  let rafId: number
  
  const analyze = () => {
    analyser.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
    const level = Math.min(100, Math.round((average / 128) * 100))
    
    const wasSpeaking = isCurrentlySpeaking
    isCurrentlySpeaking = level > threshold && !stream.getAudioTracks()[0]?.muted
    
    if (wasSpeaking !== isCurrentlySpeaking || level > 0) {
      callback(isCurrentlySpeaking, level)
    }
    
    rafId = requestAnimationFrame(analyze)
  }
  
  rafId = requestAnimationFrame(analyze)
  
  // Return cleanup function
  return () => {
    cancelAnimationFrame(rafId)
    source.disconnect()
  }
}

// Default voice settings
export const defaultVoiceSettings: VoiceSettings = {
  inputDevice: null,
  outputDevice: null,
  inputVolume: 75,
  outputVolume: 80,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
}

// Mock voice room participants
export const mockVoiceParticipants: VoiceParticipant[] = [
  {
    id: "voice_1",
    userId: "user_001",
    displayName: "DJ Neon",
    avatarUrl: "https://placehold.co/100x100/ef4444/white?text=DN",
    isSpeaking: true,
    isMuted: false,
    isDeafened: false,
    audioLevel: 65,
    joinedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "voice_2",
    userId: "user_002",
    displayName: "BeatMaster",
    avatarUrl: "https://placehold.co/100x100/3b82f6/white?text=BM",
    isSpeaking: false,
    isMuted: true,
    isDeafened: false,
    audioLevel: 0,
    joinedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
]
