"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import { getComments, deleteComment } from "@/lib/data/comments"
import type { Comment } from "@/lib/data/types"
import { MessageCircle } from "lucide-react"

interface CommentSectionProps {
  mashupId: string
}

export function CommentSection({ mashupId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const data = await getComments(mashupId)
      if (!cancelled) {
        setComments(data)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mashupId])

  function handleCommentAdded(comment: Comment) {
    setComments((prev) => [comment, ...prev])
  }

  async function handleDelete(commentId: string) {
    // Optimistic removal
    const prev = comments
    setComments((c) => c.filter((item) => item.id !== commentId))

    const result = await deleteComment(commentId)
    if (result.error) {
      // Revert
      setComments(prev)
    }
  }

  return (
    <div className="space-y-4">
      <CommentForm mashupId={mashupId} onCommentAdded={handleCommentAdded} />

      <Separator />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            No comments yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Be the first to share your thoughts on this mashup
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
