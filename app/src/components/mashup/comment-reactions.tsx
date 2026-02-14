"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { toggleCommentReaction } from "@/lib/data/comments-v2"
import type { CommentReactionGroup } from "@/lib/data/types"

const EMOJI_PALETTE = [
  { emoji: "\u{1F44D}", label: "Thumbs up" },
  { emoji: "\u{1F525}", label: "Fire" },
  { emoji: "\u{2764}\u{FE0F}", label: "Heart" },
  { emoji: "\u{1F92F}", label: "Mind blown" },
  { emoji: "\u{1F4AF}", label: "100" },
  { emoji: "\u{1F44F}", label: "Clap" },
]

interface CommentReactionsProps {
  commentId: string
  reactions: CommentReactionGroup[]
  onReactionsChange?: (reactions: CommentReactionGroup[]) => void
}

export function CommentReactions({
  commentId,
  reactions,
  onReactionsChange,
}: CommentReactionsProps) {
  const [showPalette, setShowPalette] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleToggle(emoji: string) {
    setShowPalette(false)

    // Optimistic update
    const existing = reactions.find((r) => r.emoji === emoji)
    let updated: CommentReactionGroup[]

    if (existing?.user_reacted) {
      if (existing.count <= 1) {
        updated = reactions.filter((r) => r.emoji !== emoji)
      } else {
        updated = reactions.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count - 1, user_reacted: false }
            : r
        )
      }
    } else if (existing) {
      updated = reactions.map((r) =>
        r.emoji === emoji
          ? { ...r, count: r.count + 1, user_reacted: true }
          : r
      )
    } else {
      updated = [...reactions, { emoji, count: 1, user_reacted: true }]
    }

    onReactionsChange?.(updated)

    startTransition(async () => {
      const result = await toggleCommentReaction(commentId, emoji)
      if (result.error) {
        // Revert on error
        onReactionsChange?.(reactions)
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggle(r.emoji)}
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            r.user_reacted
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted/50 text-xs text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Add reaction"
        >
          +
        </button>

        {showPalette && (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
            {EMOJI_PALETTE.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => handleToggle(emoji)}
                className="rounded p-1 text-base transition-colors hover:bg-muted"
                aria-label={label}
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
