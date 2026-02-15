import Link from "next/link"
import { Box, Music, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Crate } from "@/lib/data/types"

interface CrateCardProps {
  crate: Crate
  className?: string
}

export function CrateCard({ crate, className }: CrateCardProps) {
  return (
    <Link
      href={`/crates/${crate.id}`}
      className={cn(
        "group block rounded-xl border border-border/70 bg-card/70 p-5 space-y-3 hover:border-primary/30 transition-colors",
        className
      )}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Box className="h-5 w-5 text-primary" />
      </div>

      {/* Title & description */}
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {crate.title}
      </h3>
      {crate.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {crate.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Music className="h-3 w-3" />
          {crate.stems?.length ?? 0} stems
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {crate.follower_count ?? 0} followers
        </span>
      </div>
    </Link>
  )
}
