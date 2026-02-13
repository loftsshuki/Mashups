"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toggleFollow } from "@/lib/data/follows"

interface FollowButtonProps {
  targetUserId: string
  initialFollowing?: boolean
  initialCount?: number
  className?: string
}

export function FollowButton({
  targetUserId,
  initialFollowing = false,
  initialCount,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [isHovering, setIsHovering] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // Optimistic update
    const wasFollowing = isFollowing
    const prevCount = count
    setIsFollowing(!wasFollowing)
    if (count !== undefined) {
      setCount(wasFollowing ? count - 1 : count + 1)
    }

    startTransition(async () => {
      try {
        const result = await toggleFollow(targetUserId)
        setIsFollowing(result.following)
      } catch {
        // Revert
        setIsFollowing(wasFollowing)
        setCount(prevCount)
      }
    })
  }

  const showUnfollow = isFollowing && isHovering

  return (
    <Button
      variant={showUnfollow ? "destructive" : isFollowing ? "secondary" : "default"}
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn("min-w-[100px] transition-all", className)}
    >
      {showUnfollow ? "Unfollow" : isFollowing ? "Following" : "Follow"}
      {count !== undefined && (
        <span className="ml-1 text-xs opacity-70">
          {count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K` : count}
        </span>
      )}
    </Button>
  )
}
