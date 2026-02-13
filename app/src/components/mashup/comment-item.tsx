import { X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CommentUser {
  username?: string
  display_name?: string | null
  avatar_url?: string | null
}

interface CommentItemProps {
  comment: {
    id: string
    content: string
    created_at: string
    user?: CommentUser
  }
  onDelete?: (id: string) => void
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

export function CommentItem({ comment, onDelete }: CommentItemProps) {
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
