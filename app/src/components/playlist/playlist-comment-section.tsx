"use client"

import { useState, useEffect, useTransition } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  getPlaylistComments,
  addPlaylistComment,
  deletePlaylistComment,
} from "@/lib/data/playlists"
import type { PlaylistComment } from "@/lib/data/types"
import { MessageCircle, Send, X } from "lucide-react"

// ---------------------------------------------------------------------------
// timeAgo helper (mirrors comment-item.tsx pattern)
// ---------------------------------------------------------------------------

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

// ---------------------------------------------------------------------------
// CommentForm (inline, mirrors mashup CommentForm pattern)
// ---------------------------------------------------------------------------

interface CommentFormProps {
  playlistId: string
  onCommentAdded: (comment: PlaylistComment) => void
}

function PlaylistCommentForm({ playlistId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return

    setError(null)

    startTransition(async () => {
      const result = await addPlaylistComment(playlistId, text)

      if (result.error) {
        if (result.error === "Not authenticated") {
          setError("Log in to comment")
        } else {
          setError(result.error)
        }
        return
      }

      if (result.comment) {
        onCommentAdded(result.comment)
        setContent("")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Share your thoughts on this playlist..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        rows={2}
        className="resize-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim()}
        >
          <Send className="h-4 w-4" />
          {isPending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// CommentItem (inline, mirrors mashup CommentItem pattern)
// ---------------------------------------------------------------------------

interface CommentItemProps {
  comment: PlaylistComment
  onDelete?: (id: string) => void
}

function PlaylistCommentItem({ comment, onDelete }: CommentItemProps) {
  const displayName =
    comment.user?.display_name || comment.user?.username || "Anonymous"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8 shrink-0">
        {comment.user?.avatar_url && (
          <AvatarImage src={comment.user.avatar_url} alt={displayName} />
        )}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.created_at)}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="ml-auto h-5 w-5 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Delete comment</span>
            </Button>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">
          {comment.content}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PlaylistCommentSection (mirrors mashup CommentSection pattern)
// ---------------------------------------------------------------------------

interface PlaylistCommentSectionProps {
  playlistId: string
}

export function PlaylistCommentSection({
  playlistId,
}: PlaylistCommentSectionProps) {
  const [comments, setComments] = useState<PlaylistComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const data = await getPlaylistComments(playlistId)
      if (!cancelled) {
        setComments(data)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [playlistId])

  function handleCommentAdded(comment: PlaylistComment) {
    setComments((prev) => [comment, ...prev])
  }

  async function handleDelete(commentId: string) {
    // Optimistic removal
    const prev = comments
    setComments((c) => c.filter((item) => item.id !== commentId))

    const result = await deletePlaylistComment(commentId)
    if (result.error) {
      // Revert
      setComments(prev)
    }
  }

  return (
    <div className="space-y-4">
      <PlaylistCommentForm
        playlistId={playlistId}
        onCommentAdded={handleCommentAdded}
      />

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
            Be the first to share your thoughts on this playlist
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map((comment) => (
            <PlaylistCommentItem
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
