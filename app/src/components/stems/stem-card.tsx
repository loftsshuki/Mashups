import { Play, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StemCardProps {
  stem: {
    id: string
    title: string
    instrument: string | null
    bpm: number | null
    key: string | null
    usage_count: number
    total_plays: number
    creator_name: string
  }
  onClick?: () => void
  className?: string
}

const instrumentColors: Record<string, string> = {
  vocal: "bg-pink-500/20 text-pink-400",
  vocals: "bg-pink-500/20 text-pink-400",
  drums: "bg-amber-500/20 text-amber-400",
  bass: "bg-emerald-500/20 text-emerald-400",
  synth: "bg-violet-500/20 text-violet-400",
  guitar: "bg-red-500/20 text-red-400",
  texture: "bg-cyan-500/20 text-cyan-400",
  other: "bg-slate-500/20 text-slate-400",
}

export function StemCard({ stem, onClick, className }: StemCardProps) {
  const colorClass = instrumentColors[stem.instrument ?? "other"] ?? instrumentColors.other
  const isLegendary = stem.usage_count >= 50 && stem.total_plays >= 100000

  return (
    <button
      onClick={onClick}
      className={cn(
        "group block w-full rounded-xl border border-border/50 bg-card/50 p-4 text-left space-y-2 hover:border-primary/30 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/30 group-hover:bg-primary/10 transition-colors">
            <Play className="h-3.5 w-3.5 ml-0.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {stem.title}
            </p>
            <p className="text-[10px] text-muted-foreground">by {stem.creator_name}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", colorClass)}>
          {stem.instrument ?? "other"}
        </span>
      </div>

      {/* Waveform placeholder */}
      <div className="flex items-end gap-px h-8">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-primary/20 group-hover:bg-primary/30 transition-colors"
            style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          {stem.bpm && <span>{stem.bpm} BPM</span>}
          {stem.key && <span>{stem.key}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-0.5">
            <Music className="h-2.5 w-2.5" />
            Used in {stem.usage_count} mashups
          </span>
          <span>{stem.total_plays.toLocaleString()} plays</span>
        </div>
      </div>

      {isLegendary && (
        <Badge variant="default" className="text-[9px]">Legendary Stem</Badge>
      )}
    </button>
  )
}
