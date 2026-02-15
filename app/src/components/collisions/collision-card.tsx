import Link from "next/link"
import { Zap, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlatformChallenge } from "@/lib/data/types"

interface CollisionCardProps {
  challenge: PlatformChallenge
  className?: string
}

export function CollisionCard({ challenge, className }: CollisionCardProps) {
  const genrePair = challenge.genre_pair ?? ["Genre A", "Genre B"]
  const isActive = challenge.status === "active"
  const endsAt = challenge.ends_at ? new Date(challenge.ends_at) : null
  const daysRemaining = endsAt
    ? Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={cn(
        "group block rounded-xl border border-border/70 bg-card/70 p-5 space-y-4 hover:border-pink-500/30 transition-colors",
        className
      )}
    >
      {/* Genre pair */}
      <div className="flex items-center justify-center gap-3">
        <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-sm font-bold text-blue-400">
          {genrePair[0]}
        </span>
        <Zap className="h-5 w-5 text-pink-500" />
        <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-sm font-bold text-amber-400">
          {genrePair[1]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground text-center group-hover:text-pink-400 transition-colors">
        {challenge.title}
      </h3>

      {challenge.description && (
        <p className="text-xs text-muted-foreground text-center line-clamp-2">
          {challenge.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {isActive && daysRemaining !== null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysRemaining}d left
          </span>
        )}
        {challenge.max_entries && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Max {challenge.max_entries}
          </span>
        )}
        {!isActive && (
          <span className="text-muted-foreground/70">{challenge.status}</span>
        )}
      </div>
    </Link>
  )
}
