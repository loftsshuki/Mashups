"use client"

import { useState } from "react"
import { MessageCircle, Clock, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommentReactions } from "./comment-reactions"
import { CommentThread } from "./comment-thread"
import type { Comment, CommentReactionGroup } from "@/lib/data/types"

interface CommentItemV2Props {
  comment: Comment
  onDelete?: (id: string) => void
  onReply?: (parentId: string) => void
  onTimestampClick?: (sec: number) => void
  onReactionsChange?: (commentId: string, reactions: CommentReactionGroup[]) => void
}

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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function renderContentWithMentions(content: string) {
  const parts = content.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="font-medium text-primary">
          {part}
        </span>
      )
    }
    return part
  })
}

export function CommentItemV2({
  comment,
  onDelete,
  onReply,
  onTimestampClick,
  onReactionsChange,
}: CommentItemV2Props) {
  const [showReplies, setShowReplies] = useState(false)

  const displayName =
    comment.user?.display_name || comment.user?.username || "Anonymous"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const hasTimestamp =
    comment.timestamp_sec !== null && comment.timestamp_sec !== undefined
  const replyCount = comment.reply_count ?? 0

  return (
    <div className="py-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.user?.avatar_url && (
            <AvatarImage src={comment.user.avatar_url} alt={displayName} />
          )}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {/* Header: name, timestamp badge, time ago, delete */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>

            {hasTimestamp && (
              <button
                onClick={() => onTimestampClick?.(comment.timestamp_sec!)}
                className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Clock className="h-2.5 w-2.5" />
                {formatTime(comment.timestamp_sec!)}
              </button>
            )}

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

          {/* Content with @mentions */}
          <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">
            {renderContentWithMentions(comment.content)}
          </p>

          {/* Reactions */}
          <div className="mt-1.5">
            <CommentReactions
              commentId={comment.id}
              reactions={comment.reactions ?? []}
              onReactionsChange={(reactions) =>
                onReactionsChange?.(comment.id, reactions)
              }
            />
          </div>

          {/* Reply button + reply count */}
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => onReply?.(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </button>

            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {showReplies
                  ? "Hide replies"
                  : `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>

          {/* Threaded replies */}
          {showReplies && (
            <div className="mt-2 border-l-2 border-border/50 pl-4">
              <CommentThread
                parentId={comment.id}
                onTimestampClick={onTimestampClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
