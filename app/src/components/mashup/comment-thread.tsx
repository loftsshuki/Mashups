"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CommentItemV2 } from "./comment-item-v2"
import { getCommentReplies } from "@/lib/data/comments-v2"
import { deleteComment } from "@/lib/data/comments"
import type { Comment, CommentReactionGroup } from "@/lib/data/types"

interface CommentThreadProps {
  parentId: string
  onTimestampClick?: (sec: number) => void
}

export function CommentThread({
  parentId,
  onTimestampClick,
}: CommentThreadProps) {
  const [replies, setReplies] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const data = await getCommentReplies(parentId)
      if (!cancelled) {
        setReplies(data)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [parentId])

  async function handleDelete(commentId: string) {
    const prev = replies
    setReplies((r) => r.filter((c) => c.id !== commentId))

    const result = await deleteComment(commentId)
    if (result.error) {
      setReplies(prev)
    }
  }

  function handleReactionsChange(
    commentId: string,
    reactions: CommentReactionGroup[]
  ) {
    setReplies((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, reactions } : c))
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!replies.length) {
    return (
      <p className="py-2 text-xs text-muted-foreground">No replies yet</p>
    )
  }

  return (
    <div className="divide-y divide-border/30">
      {replies.map((reply) => (
        <CommentItemV2
          key={reply.id}
          comment={reply}
          onDelete={handleDelete}
          onTimestampClick={onTimestampClick}
          onReactionsChange={handleReactionsChange}
        />
      ))}
    </div>
  )
}
