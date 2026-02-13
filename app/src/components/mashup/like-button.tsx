"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/lib/data/likes"

interface LikeButtonProps {
  mashupId: string
  initialCount: number
  initialLiked?: boolean
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

export function LikeButton({
  mashupId,
  initialCount,
  initialLiked = false,
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // Optimistic update
    const wasLiked = liked
    const prevCount = count
    setLiked(!wasLiked)
    setCount(wasLiked ? prevCount - 1 : prevCount + 1)

    startTransition(async () => {
      try {
        const result = await toggleLike(mashupId)
        setLiked(result.liked)
        // If we got a real count back, use it; otherwise keep optimistic
        if (result.count > 0) {
          setCount(result.count)
        }
      } catch {
        // Revert on error
        setLiked(wasLiked)
        setCount(prevCount)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        "transition-colors",
        liked && "border-red-500/50 text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-current")}
      />
      {formatCount(count)}
    </Button>
  )
}
