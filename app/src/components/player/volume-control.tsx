"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { Volume2, Volume1, VolumeX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/lib/audio/audio-context"

interface VolumeControlProps {
  className?: string
}

export function VolumeControl({ className }: VolumeControlProps) {
  const { state, setVolume, toggleMute } = useAudio()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const effectiveVolume = state.isMuted ? 0 : state.volume

  // Pick the right icon
  let VolumeIcon = Volume2
  if (state.isMuted || state.volume === 0) {
    VolumeIcon = VolumeX
  } else if (state.volume < 0.5) {
    VolumeIcon = Volume1
  }

  const getVolumeFromEvent = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0
    const rect = sliderRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handleSliderClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const vol = getVolumeFromEvent(e.clientX)
      setVolume(vol)
    },
    [getVolumeFromEvent, setVolume],
  )

  const handleSliderMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
      setVolume(getVolumeFromEvent(e.clientX))
    },
    [getVolumeFromEvent, setVolume],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setVolume(getVolumeFromEvent(e.clientX))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, getVolumeFromEvent, setVolume])

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={state.isMuted ? "Unmute" : "Mute"}
        onClick={toggleMute}
      >
        <VolumeIcon className="size-4" />
      </Button>

      {/* Volume slider */}
      <div
        ref={sliderRef}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={effectiveVolume}
        tabIndex={0}
        onClick={handleSliderClick}
        onMouseDown={handleSliderMouseDown}
        className="group relative h-1.5 w-20 cursor-pointer rounded-full bg-muted transition-all hover:h-2"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${effectiveVolume * 100}%` }}
        />
      </div>
    </div>
  )
}
