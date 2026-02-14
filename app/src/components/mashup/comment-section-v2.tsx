"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { MessageCircle, Send, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CommentThread } from "./comment-thread"
import { getCommentsV2, addCommentV2, getTimestampedComments } from "@/lib/data/comments-v2"
import type { CommentV2 } from "@/lib/data/types"

interface CommentSectionV2Props {
  mashupId: string
  duration?: number
  onSeek?: (seconds: number) => void
  currentTime?: number
}

export function CommentSectionV2({ mashupId, duration, onSeek, currentTime }: CommentSectionV2Props) {
  const [comments, setComments] = useState<CommentV2[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [attachTimestamp, setAttachTimestamp] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const data = await getCommentsV2(mashupId)
      if (!cancelled) {
        setComments(data)
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mashupId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return
    setError(null)

    startTransition(async () => {
      const result = await addCommentV2(mashupId, text, {
        parentId: replyTo ?? undefined,
        timestampSec: attachTimestamp && currentTime != null ? Math.floor(currentTime) : undefined,
      })
      if (result.error) {
        setError(result.error === "Not authenticated" ? "Log in to comment" : result.error)
        return
      }
      if (result.comment) {
        if (replyTo) {
          // Update reply count on parent
          setComments(prev => prev.map(c => c.id === replyTo ? { ...c, reply_count: (c.reply_count ?? 0) + 1 } : c))
        } else {
          setComments(prev => [result.comment!, ...prev])
        }
        setContent("")
        setReplyTo(null)
        setAttachTimestamp(false)
      }
    })
  }

  function handleReply(parentId: string) {
    setReplyTo(parentId)
    textareaRef.current?.focus()
  }

  const replyingToComment = replyTo ? comments.find(c => c.id === replyTo) : null

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {replyTo && replyingToComment && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Replying to <span className="font-medium text-foreground">{replyingToComment.user?.display_name || replyingToComment.user?.username}</span></span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-primary hover:underline">Cancel</button>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          placeholder={replyTo ? "Write a reply..." : "Share your thoughts on this mashup..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
          rows={2}
          className="resize-none"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentTime != null && duration != null && (
              <Button
                type="button"
                variant={attachTimestamp ? "default" : "outline"}
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setAttachTimestamp(!attachTimestamp)}
              >
                <Clock className="h-3 w-3" />
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}
              </Button>
            )}
          </div>
          <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
            <Send className="h-4 w-4" />
            {isPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>

      <Separator />

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
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
          <p className="mt-3 text-sm text-muted-foreground">No comments yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Be the first to share your thoughts on this mashup</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map(comment => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onTimestampClick={onSeek}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
