"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceParticipant, mockVoiceParticipants, detectVoiceActivity } from "@/lib/data/voice-chat"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Settings } from "lucide-react"

interface VoicePanelProps {
  participants?: VoiceParticipant[]
  currentUserId?: string
  onMuteToggle?: () => void
  onDeafenToggle?: () => void
  onLeave?: () => void
  className?: string
}

export function VoicePanel({
  participants = mockVoiceParticipants,
  currentUserId = "user_current",
  onMuteToggle,
  onDeafenToggle,
  onLeave,
  className,
}: VoicePanelProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [localAudioLevel, setLocalAudioLevel] = useState(0)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Simulate local voice activity
  useEffect(() => {
    if (!isMuted) {
      const interval = setInterval(() => {
        setLocalAudioLevel(Math.random() * (isMuted ? 0 : 50))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isMuted])

  const handleMute = () => {
    setIsMuted(!isMuted)
    onMuteToggle?.()
  }

  const handleDeafen = () => {
    setIsDeafened(!isDeafened)
    onDeafenToggle?.()
  }

  const allParticipants = [
    ...participants,
    {
      id: "local",
      userId: currentUserId,
      displayName: "You",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=You",
      isSpeaking: localAudioLevel > 20,
      isMuted,
      isDeafened,
      audioLevel: localAudioLevel,
      joinedAt: new Date().toISOString(),
    },
  ]

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Participants */}
      <div className="flex flex-wrap gap-2">
        {allParticipants.map(participant => (
          <VoiceParticipantAvatar
            key={participant.id}
            participant={participant}
            isLocal={participant.userId === currentUserId}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={handleMute}
          className="h-10 w-10"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant={isDeafened ? "destructive" : "outline"}
          size="icon"
          onClick={handleDeafen}
          className="h-10 w-10"
          title={isDeafened ? "Undeafen" : "Deafen"}
        >
          {isDeafened ? (
            <HeadphoneOff className="h-4 w-4" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          title="Voice Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onLeave}
          className="gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </Button>
      </div>
    </div>
  )
}

interface VoiceParticipantAvatarProps {
  participant: VoiceParticipant
  isLocal?: boolean
}

function VoiceParticipantAvatar({ participant, isLocal }: VoiceParticipantAvatarProps) {
  const isSpeaking = participant.isSpeaking && !participant.isMuted
  
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
        isSpeaking && "bg-primary/10 ring-2 ring-primary"
      )}
    >
      <div className="relative">
        <Avatar
          className={cn(
            "h-12 w-12 transition-all",
            isSpeaking && "scale-110"
          )}
        >
          <AvatarImage src={participant.avatarUrl} />
          <AvatarFallback>
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

        {/* Speaking indicator ring */}
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
        {isLocal && " (You)"}
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
