import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Season } from "@/lib/data/types"

interface SeasonBannerProps {
  season: Season
  className?: string
}

export function SeasonBanner({ season, className }: SeasonBannerProps) {
  return (
    <div className={cn("rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wider">Season {season.id.slice(-1)}</p>
            <h3 className="text-sm font-semibold text-foreground">{season.name}</h3>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/season">
            Explore
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
