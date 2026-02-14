"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CommentFormV2 } from "./comment-form-v2"
import { CommentItemV2 } from "./comment-item-v2"
import { TimestampCommentMarkers } from "./timestamp-comment-markers"
import {
  getCommentsV2,
  getTimestampedComments,
} from "@/lib/data/comments-v2"
import { deleteComment } from "@/lib/data/comments"
import { useAudio } from "@/lib/audio/audio-context"
import type { Comment, CommentReactionGroup } from "@/lib/data/types"

interface CommentSectionV2Props {
  mashupId: string
  duration?: number | null
}

export function CommentSectionV2({ mashupId, duration }: CommentSectionV2Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [timestampedComments, setTimestampedComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const { dispatch } = useAudio()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const [topLevel, timestamped] = await Promise.all([
        getCommentsV2(mashupId),
        getTimestampedComments(mashupId),
      ])
      if (!cancelled) {
        setComments(topLevel)
        setTimestampedComments(timestamped)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mashupId])

  function handleCommentAdded(comment: Comment) {
    if (comment.parent_id) {
      // Reply: increment reply_count on parent
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.parent_id
            ? { ...c, reply_count: (c.reply_count ?? 0) + 1 }
            : c
        )
      )
      setReplyingTo(null)
    } else {
      // Top-level comment
      setComments((prev) => [comment, ...prev])
    }

    // If timestamped, add to markers
    if (comment.timestamp_sec != null) {
      setTimestampedComments((prev) =>
        [...prev, comment].sort(
          (a, b) => (a.timestamp_sec ?? 0) - (b.timestamp_sec ?? 0)
        )
      )
    }
  }

  async function handleDelete(commentId: string) {
    const prev = comments
    setComments((c) => c.filter((item) => item.id !== commentId))
    setTimestampedComments((c) => c.filter((item) => item.id !== commentId))

    const result = await deleteComment(commentId)
    if (result.error) {
      setComments(prev)
    }
  }

  function handleTimestampClick(sec: number) {
    dispatch({ type: "SET_TIME", time: sec })
  }

  function handleReactionsChange(
    commentId: string,
    reactions: CommentReactionGroup[]
  ) {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, reactions } : c))
    )
  }

  return (
    <div className="space-y-4">
      {/* Timestamp markers overlay — rendered in parent via portal or prop */}
      {duration && timestampedComments.length > 0 && (
        <div className="relative h-3">
          <TimestampCommentMarkers
            comments={timestampedComments}
            duration={duration}
            onMarkerClick={handleTimestampClick}
          />
        </div>
      )}

      {/* Comment form */}
      <CommentFormV2
        mashupId={mashupId}
        onCommentAdded={handleCommentAdded}
      />

      <Separator />

      {/* Reply form (shown when replying to a top-level comment) */}
      {replyingTo && (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Replying to comment...
          </p>
          <CommentFormV2
            mashupId={mashupId}
            parentId={replyingTo}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setReplyingTo(null)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Comments list */}
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
            <CommentItemV2
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onReply={(parentId) => setReplyingTo(parentId)}
              onTimestampClick={handleTimestampClick}
              onReactionsChange={handleReactionsChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
