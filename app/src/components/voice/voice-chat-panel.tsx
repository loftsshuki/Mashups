"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Settings,
  Volume2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Local type definitions for Daily.co (optional dependency)
interface DailyCall {
  join(options: { url: string; token?: string }): Promise<void>
  leave(): Promise<void>
  destroy(): Promise<void>
  setLocalAudio(enabled: boolean): void
  setLocalVideo(enabled: boolean): void
  setAudioOutputDevice(deviceId: string): void
  setInputDevicesAsync(devices: { audioDeviceId?: string; videoDeviceId?: string }): Promise<void>
  participants(): Record<string, DailyParticipant>
  on(event: string, handler: (event: unknown) => void): void
  off(event: string, handler: (event: unknown) => void): void
}

interface DailyParticipant {
  user_id: string
  user_name: string
  audio: boolean
  video: boolean
  tracks: {
    audio: { state: string } | null
    video: { state: string } | null
  }
}

interface VoiceParticipant {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  isSpeaking: boolean
  isMuted: boolean
  isDeafened: boolean
  audioLevel: number
  joinedAt: string
}

interface VoiceChatPanelProps {
  roomUrl?: string
  roomName: string
  userId: string
  displayName: string
  avatarUrl?: string
  onLeave?: () => void
  className?: string
}

export function VoiceChatPanel({
  roomUrl,
  roomName,
  userId,
  displayName,
  avatarUrl = "",
  onLeave,
  className,
}: VoiceChatPanelProps) {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localAudioLevel, setLocalAudioLevel] = useState(0)
  const [inputVolume, setInputVolume] = useState(75)
  const [outputVolume, setOutputVolume] = useState(80)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>("")
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  const callRef = useRef<DailyCall | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>(0)

  // Initialize Daily.co call
  useEffect(() => {
    let isMounted = true

    async function initCall() {
      // Check if Daily.co is available (package needs to be installed)
      if (typeof window === "undefined") return

      try {
        // Dynamic import to avoid SSR issues
        const Daily = (await import("@daily-co/daily-js")).default

        if (!isMounted) return

        // Create call object
        const call = Daily.createCallObject({
          audioSource: true,
          videoSource: false, // Audio only
          dailyConfig: {
            micAudioMode: {
              bitrate: 32000,
              stereo: false,
            },
          },
        })

        callRef.current = call

        // Set up event handlers
        call.on("joined-meeting", () => {
          setIsConnected(true)
          setIsConnecting(false)
        })

        call.on("left-meeting", () => {
          setIsConnected(false)
          setParticipants([])
        })

        call.on("participant-joined", (event: unknown) => {
          const e = event as { participant: DailyParticipant }
          updateParticipants(call)
        })

        call.on("participant-left", (event: unknown) => {
          const e = event as { participant: DailyParticipant }
          updateParticipants(call)
        })

        call.on("active-speaker-change", (event: unknown) => {
          const e = event as { activeSpeaker: { peerId: string } }
          updateParticipants(call)
        })

        call.on("error", (event: unknown) => {
          const e = event as { errorMsg: string }
          setError(e.errorMsg || "Connection error")
          setIsConnecting(false)
        })

        // Join the room
        setIsConnecting(true)
        await call.join({
          url: roomUrl || `https://mashups.daily.co/${roomName}`,
        })

      } catch (err) {
        if (!isMounted) return
        console.error("Failed to initialize Daily.co:", err)
        setError("Daily.co not installed. Run: npm install @daily-co/daily-js")
        setIsConnecting(false)

        // Fallback: simulate connection for demo
        simulateConnection()
      }
    }

    initCall()

    // Get available devices
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInputs = devices.filter(d => d.kind === "audioinput")
      const audioOutputs = devices.filter(d => d.kind === "audiooutput")
      setAvailableDevices(devices)
      if (audioInputs[0]) setSelectedInputDevice(audioInputs[0].deviceId)
      if (audioOutputs[0]) setSelectedOutputDevice(audioOutputs[0].deviceId)
    })

    return () => {
      isMounted = false
      if (callRef.current) {
        callRef.current.destroy()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [roomUrl, roomName])

  // Simulate connection for demo (when Daily.co is not installed)
  const simulateConnection = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      setParticipants([
        {
          id: "user_001",
          userId: "user_001",
          displayName: "DJ Neon",
          avatarUrl: "https://placehold.co/100x100/ef4444/white?text=DN",
          isSpeaking: false,
          isMuted: false,
          isDeafened: false,
          audioLevel: 0,
          joinedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: "user_002",
          userId: "user_002",
          displayName: "BeatMaster",
          avatarUrl: "https://placehold.co/100x100/3b82f6/white?text=BM",
          isSpeaking: false,
          isMuted: true,
          isDeafened: false,
          audioLevel: 0,
          joinedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        },
      ])
    }, 1000)
  }

  // Update participants from Daily.co
  const updateParticipants = (call: DailyCall) => {
    const dailyParticipants = call.participants()
    const mappedParticipants: VoiceParticipant[] = Object.values(dailyParticipants)
      .filter((p): p is DailyParticipant => p !== null && p.user_id !== "local")
      .map(p => ({
        id: p.user_id,
        userId: p.user_id,
        displayName: p.user_name || "Anonymous",
        avatarUrl: "", // Could fetch from your user service
        isSpeaking: p.tracks.audio?.state === "playable" && !p.audio,
        isMuted: !p.audio,
        isDeafened: false, // Track separately if needed
        audioLevel: 0, // Would need analyser
        joinedAt: new Date().toISOString(),
      }))

    setParticipants(mappedParticipants)
  }

  // Monitor local audio level
  useEffect(() => {
    if (isMuted || !isConnected) {
      setLocalAudioLevel(0)
      return
    }

    async function initAudioMonitoring() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        analyser.fftSize = 256
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        audioContextRef.current = audioContext
        analyserRef.current = analyser

        const analyze = () => {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          const normalized = Math.min(100, Math.round((average / 128) * 100))
          setLocalAudioLevel(normalized)
          animationFrameRef.current = requestAnimationFrame(analyze)
        }

        analyze()
      } catch (err) {
        console.error("Failed to access microphone:", err)
      }
    }

    initAudioMonitoring()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioContextRef.current?.close()
    }
  }, [isMuted, isConnected])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (callRef.current) {
      callRef.current.setLocalAudio(isMuted)
    }
    setIsMuted(!isMuted)
  }, [isMuted])

  // Toggle deafen
  const toggleDeafen = useCallback(() => {
    setIsDeafened(!isDeafened)
    // In real implementation, would mute all remote audio
  }, [isDeafened])

  // Leave call
  const handleLeave = useCallback(async () => {
    if (callRef.current) {
      await callRef.current.leave()
    }
    onLeave?.()
  }, [onLeave])

  // Change input device
  const handleInputDeviceChange = useCallback((deviceId: string) => {
    setSelectedInputDevice(deviceId)
    if (callRef.current) {
      callRef.current.setInputDevicesAsync({ audioDeviceId: deviceId })
    }
  }, [])

  // Change output device
  const handleOutputDeviceChange = useCallback((deviceId: string) => {
    setSelectedOutputDevice(deviceId)
    if (callRef.current && 'setOutputDeviceAsync' in callRef.current) {
      // Daily.js uses setOutputDeviceAsync or setOutputDevice, depending on version. 
      // Checking for existence or treating as any to avoid complex type issues if version mismatch.
      // @ts-ignore
      callRef.current.setOutputDeviceAsync({ outputDeviceId: deviceId })
    }
  }, [])

  const allParticipants: VoiceParticipant[] = [
    ...participants,
    {
      id: "local",
      userId,
      displayName: `${displayName} (You)`,
      avatarUrl,
      isSpeaking: localAudioLevel > 20 && !isMuted,
      isMuted,
      isDeafened,
      audioLevel: localAudioLevel,
      joinedAt: new Date().toISOString(),
    },
  ]

  if (error) {
    return (
      <div className={cn("p-4 rounded-xl border border-destructive/50 bg-destructive/10", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Voice Chat Error</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setError(null)}
        >
          Dismiss
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Connection status */}
      {isConnecting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Connecting to voice room...
        </div>
      )}

      {/* Participants */}
      <div className="flex flex-wrap gap-3">
        {allParticipants.map(participant => (
          <VoiceParticipantCard
            key={participant.id}
            participant={participant}
            isLocal={participant.userId === userId}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={toggleMute}
          className="h-10 w-10"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          variant={isDeafened ? "destructive" : "outline"}
          size="icon"
          onClick={toggleDeafen}
          className="h-10 w-10"
          title={isDeafened ? "Undeafen" : "Deafen"}
        >
          {isDeafened ? <HeadphoneOff className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
        </Button>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              title="Voice Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Voice Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Device</label>
                <select
                  value={selectedInputDevice}
                  onChange={(e) => handleInputDeviceChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {availableDevices
                    .filter(d => d.kind === "audioinput")
                    .map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 4)}...`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Output Device</label>
                <select
                  value={selectedOutputDevice}
                  onChange={(e) => handleOutputDeviceChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {availableDevices
                    .filter(d => d.kind === "audiooutput")
                    .map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 4)}...`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Input Volume: {inputVolume}%
                </label>
                <Slider
                  value={[inputVolume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setInputVolume(v[0] ?? 75)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Output Volume: {outputVolume}%
                </label>
                <Slider
                  value={[outputVolume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setOutputVolume(v[0] ?? 80)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1" />

        <Button
          variant="destructive"
          size="sm"
          onClick={handleLeave}
          className="gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </Button>
      </div>
    </div>
  )
}

interface VoiceParticipantCardProps {
  participant: VoiceParticipant
  isLocal?: boolean
}

function VoiceParticipantCard({ participant, isLocal }: VoiceParticipantCardProps) {
  const isSpeaking = participant.isSpeaking && !participant.isMuted

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
        isSpeaking ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/50"
      )}
    >
      <div className="relative">
        <Avatar
          className={cn(
            "h-14 w-14 transition-all",
            isSpeaking && "scale-105"
          )}
        >
          <AvatarImage src={participant.avatarUrl} />
          <AvatarFallback className="bg-primary/10">
            {participant.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Status indicators */}
        <div className="absolute -bottom-1 -right-1 flex gap-0.5">
          {participant.isMuted && (
            <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
              <MicOff className="h-3 w-3 text-white" />
            </div>
          )}
          {participant.isDeafened && (
            <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
              <HeadphoneOff className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full ring-2 ring-primary animate-pulse" />
        )}
      </div>

      {/* Audio level bar */}
      {!participant.isMuted && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${participant.audioLevel}%` }}
          />
        </div>
      )}

      <span className="text-xs font-medium truncate max-w-[80px]">
        {participant.displayName}
      </span>
    </div>
  )
}

// Compact voice indicator for header/toolbar
interface VoiceIndicatorProps {
  participants?: VoiceParticipant[]
  isConnected?: boolean
  onClick?: () => void
}

export function VoiceIndicator({ participants = [], isConnected, onClick }: VoiceIndicatorProps) {
  const speakingCount = participants.filter(p => p.isSpeaking && !p.isMuted).length

  return (
    <Button
      variant={isConnected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <div className="relative">
        <Headphones className="h-4 w-4" />
        {speakingCount > 0 && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      {isConnected ? (
        <span>{participants.length + 1} in voice</span>
      ) : (
        <span>Join Voice</span>
      )}
    </Button>
  )
}
