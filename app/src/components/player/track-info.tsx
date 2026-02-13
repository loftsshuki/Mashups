"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useAudio } from "@/lib/audio/audio-context"

const sizeConfig = {
  sm: { image: 32, wrapper: "size-8", text: "text-xs", sub: "text-[10px]" },
  md: { image: 40, wrapper: "size-10", text: "text-sm", sub: "text-xs" },
} as const

interface TrackInfoProps {
  className?: string
  size?: "sm" | "md"
}

export function TrackInfo({ className, size = "md" }: TrackInfoProps) {
  const { state } = useAudio()
  const config = sizeConfig[size]
  const track = state.currentTrack

  if (!track) {
    return (
      <div className={cn("flex items-center gap-3 min-w-0", className)}>
        <div
          className={cn(
            "shrink-0 rounded-md bg-muted flex items-center justify-center",
            config.wrapper,
          )}
        >
          <span className="text-muted-foreground text-[10px]">--</span>
        </div>
        <p className={cn("truncate text-muted-foreground", config.text)}>
          No track playing
        </p>
      </div>
    )
  }

  return (
    <Link
      href={`/mashup/${track.id}`}
      className={cn(
        "flex items-center gap-3 min-w-0 group",
        className,
      )}
    >
      <div className={cn("shrink-0 overflow-hidden rounded-md", config.wrapper)}>
        <Image
          src={track.coverUrl}
          alt={track.title}
          width={config.image}
          height={config.image}
          unoptimized
          className="object-cover size-full"
        />
      </div>

      <div className="min-w-0 flex flex-col">
        <span
          className={cn(
            "truncate font-medium group-hover:underline",
            config.text,
          )}
        >
          {track.title}
        </span>
        <span className={cn("truncate text-muted-foreground", config.sub)}>
          {track.artist}
        </span>
      </div>
    </Link>
  )
}
