"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CommentReactions } from "./comment-reactions"
import { getCommentReplies } from "@/lib/data/comments-v2"
import type { CommentV2 } from "@/lib/data/types"

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
  return `${days}d ago`
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface CommentThreadProps {
  comment: CommentV2
  onTimestampClick?: (seconds: number) => void
  onReply?: (parentId: string) => void
}

export function CommentThread({ comment, onTimestampClick, onReply }: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<CommentV2[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const displayName = comment.user?.display_name || comment.user?.username || "Anonymous"
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  async function handleToggleReplies() {
    if (showReplies) {
      setShowReplies(false)
      return
    }
    if (replies.length === 0) {
      setLoadingReplies(true)
      const data = await getCommentReplies(comment.id)
      setReplies(data)
      setLoadingReplies(false)
    }
    setShowReplies(true)
  }

  // Render content with @mention highlighting
  function renderContent(content: string) {
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="font-medium text-primary">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <div className="py-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.user?.avatar_url && <AvatarImage src={comment.user.avatar_url} alt={displayName} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            {comment.timestamp_sec !== null && comment.timestamp_sec !== undefined && (
              <button
                onClick={() => onTimestampClick?.(comment.timestamp_sec!)}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {formatTimestamp(comment.timestamp_sec)}
              </button>
            )}
            {comment.edited_at && (
              <span className="text-[10px] text-muted-foreground">(edited)</span>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">
            {renderContent(comment.content)}
          </p>

          {comment.reactions && comment.reactions.length > 0 && (
            <CommentReactions commentId={comment.id} reactions={comment.reactions} />
          )}

          <div className="mt-1 flex items-center gap-2">
            {onReply && (
              <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground" onClick={() => onReply(comment.id)}>
                <Reply className="h-3 w-3" /> Reply
              </Button>
            )}
            {(comment.reply_count ?? 0) > 0 && (
              <button onClick={handleToggleReplies} className="flex items-center gap-1 text-xs text-primary hover:underline">
                {showReplies ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && (
        <div className="ml-11 mt-2 space-y-0 border-l-2 border-border/30 pl-4">
          {loadingReplies ? (
            <p className="py-2 text-xs text-muted-foreground">Loading replies...</p>
          ) : (
            replies.map(reply => {
              const replyName = reply.user?.display_name || reply.user?.username || "Anonymous"
              const replyInitials = replyName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
              return (
                <div key={reply.id} className="flex gap-2 py-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    {reply.user?.avatar_url && <AvatarImage src={reply.user.avatar_url} alt={replyName} />}
                    <AvatarFallback className="text-[10px]">{replyInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{replyName}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/80">{renderContent(reply.content)}</p>
                    {reply.reactions && reply.reactions.length > 0 && (
                      <CommentReactions commentId={reply.id} reactions={reply.reactions} />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
