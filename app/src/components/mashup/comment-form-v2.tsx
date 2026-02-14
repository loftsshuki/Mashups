"use client"

import { useState, useRef, useTransition } from "react"
import { Send, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MentionAutocomplete } from "./mention-autocomplete"
import { addCommentV2 } from "@/lib/data/comments-v2"
import { useAudio } from "@/lib/audio/audio-context"
import type { Comment } from "@/lib/data/types"

interface CommentFormV2Props {
  mashupId: string
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function CommentFormV2({
  mashupId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder,
}: CommentFormV2Props) {
  const [content, setContent] = useState("")
  const [timestampSec, setTimestampSec] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { state } = useAudio()
  const isPlaying = state.isPlaying && state.currentTrack

  function handleContentChange(value: string) {
    setContent(value)

    // Detect @mention typing
    const cursorPos = textareaRef.current?.selectionStart ?? value.length
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery("")
    }
  }

  function handleMentionSelect(username: string) {
    const cursorPos = textareaRef.current?.selectionStart ?? content.length
    const textBeforeCursor = content.slice(0, cursorPos)
    const textAfterCursor = content.slice(cursorPos)
    const mentionStart = textBeforeCursor.lastIndexOf("@")

    const newContent =
      textBeforeCursor.slice(0, mentionStart) +
      `@${username} ` +
      textAfterCursor

    setContent(newContent)
    setShowMentions(false)
    setMentionQuery("")

    // Refocus textarea
    setTimeout(() => {
      const newPos = mentionStart + username.length + 2
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(newPos, newPos)
    }, 0)
  }

  function handleAddTimestamp() {
    if (state.currentTime > 0) {
      setTimestampSec(Math.floor(state.currentTime))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return

    setError(null)

    startTransition(async () => {
      const result = await addCommentV2(mashupId, text, {
        parentId,
        timestampSec: timestampSec ?? undefined,
      })

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
        setTimestampSec(null)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={
            placeholder ??
            (parentId
              ? "Write a reply..."
              : "Share your thoughts on this mashup...")
          }
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={isPending}
          rows={2}
          className="resize-none"
        />

        {showMentions && (
          <MentionAutocomplete
            query={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
          />
        )}
      </div>

      {/* Timestamp chip */}
      {timestampSec !== null && (
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Clock className="h-3 w-3" />
            {formatTime(timestampSec)}
          </span>
          <button
            type="button"
            onClick={() => setTimestampSec(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPlaying && timestampSec === null && !parentId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddTimestamp}
              className="text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              Add timestamp
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim()}
        >
          <Send className="h-4 w-4" />
          {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  )
}
