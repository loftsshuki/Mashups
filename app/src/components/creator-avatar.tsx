"use client"

import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface CreatorAvatarProps {
  username: string
  displayName: string
  avatarUrl: string
  followerCount?: number
  mashupCount?: number
  size?: "sm" | "lg"
  className?: string
}

function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
}

export function CreatorAvatar({
  username,
  displayName,
  avatarUrl,
  followerCount,
  mashupCount,
  size = "sm",
  className,
}: CreatorAvatarProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  if (size === "sm") {
    return (
      <Link
        href={`/profile/${username}`}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full transition-colors hover:text-primary",
          className
        )}
      >
        <Avatar size="sm">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground transition-colors group-hover:text-primary">
          {displayName}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/profile/${username}`}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-xl p-4 transition-colors hover:bg-muted/50",
        className
      )}
    >
      <Avatar size="lg" className="h-16 w-16">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground">@{username}</span>
      </div>

      {(followerCount !== undefined || mashupCount !== undefined) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {followerCount !== undefined && (
            <div className="flex flex-col items-center">
              <span className="font-semibold text-foreground">
                {formatCount(followerCount)}
              </span>
              <span>followers</span>
            </div>
          )}
          {mashupCount !== undefined && (
            <div className="flex flex-col items-center">
              <span className="font-semibold text-foreground">
                {formatCount(mashupCount)}
              </span>
              <span>mashups</span>
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
