"use client"

import { useState, useTransition } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment } from "@/lib/data/comments"
import type { Comment } from "@/lib/data/types"

interface CommentFormProps {
  mashupId: string
  onCommentAdded: (comment: Comment) => void
}

export function CommentForm({ mashupId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return

    setError(null)

    startTransition(async () => {
      const result = await addComment(mashupId, text)

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
        placeholder="Share your thoughts on this mashup..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        rows={2}
        className="resize-none"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
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
