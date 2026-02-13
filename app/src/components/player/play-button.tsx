"use client"

import { Play, Pause } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/lib/audio/audio-context"

const sizeConfig = {
  sm: { button: "h-8 w-8", icon: "size-3.5" },
  md: { button: "h-10 w-10", icon: "size-4" },
  lg: { button: "h-12 w-12", icon: "size-5" },
} as const

interface PlayButtonProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PlayButton({ size = "md", className }: PlayButtonProps) {
  const { state, toggle } = useAudio()

  const config = sizeConfig[size]
  const Icon = state.isPlaying ? Pause : Play
  const label = state.isPlaying ? "Pause" : "Play"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      disabled={!state.currentTrack}
      onClick={toggle}
      className={cn(config.button, className)}
    >
      <Icon className={config.icon} />
    </Button>
  )
}
