"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { REACTION_EMOJIS, toggleCommentReaction } from "@/lib/data/comments-v2"

interface CommentReactionsProps {
  commentId: string
  reactions: Array<{ emoji: string; count: number; reacted: boolean }>
  onReactionToggle?: (emoji: string, reacted: boolean) => void
}

export function CommentReactions({ commentId, reactions, onReactionToggle }: CommentReactionsProps) {
  const [localReactions, setLocalReactions] = useState(reactions)
  const [showPicker, setShowPicker] = useState(false)

  async function handleToggle(emoji: string) {
    // Optimistic update
    setLocalReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji)
      if (existing) {
        if (existing.reacted) {
          // Un-react
          const newCount = existing.count - 1
          return newCount <= 0 ? prev.filter(r => r.emoji !== emoji) : prev.map(r => r.emoji === emoji ? { ...r, count: newCount, reacted: false } : r)
        } else {
          return prev.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r)
        }
      } else {
        return [...prev, { emoji, count: 1, reacted: true }]
      }
    })

    const result = await toggleCommentReaction(commentId, emoji)
    onReactionToggle?.(emoji, result.reacted)
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {localReactions.map(r => (
        <button
          key={r.emoji}
          onClick={() => handleToggle(r.emoji)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            r.reacted
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30"
          )}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/50 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
        >
          +
        </button>
        {showPicker && (
          <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-md">
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => { handleToggle(emoji); setShowPicker(false) }}
                className="rounded p-1 text-sm hover:bg-accent transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
