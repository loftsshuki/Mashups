"use client"

import { useEffect, useState } from "react"
import { Waves, Music, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface SonicNeighborhood {
  id: string
  name: string
  description: string
  characteristics: { label: string; value: number }[]
  color: string
  mashupCount: number
  stemCount: number
  topCreators: string[]
}

interface SonicNeighborhoodsProps {
  className?: string
}

export function SonicNeighborhoods({ className }: SonicNeighborhoodsProps) {
  const [neighborhoods, setNeighborhoods] = useState<SonicNeighborhood[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/discovery/neighborhoods")
        if (response.ok) {
          const data = (await response.json()) as { neighborhoods: SonicNeighborhood[] }
          setNeighborhoods(data.neighborhoods)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const selectedHood = neighborhoods.find((n) => n.id === selected)

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Waves className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Sonic Neighborhoods</h3>
      </div>

      {/* Neighborhood grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {neighborhoods.map((hood) => (
          <button
            key={hood.id}
            onClick={() => setSelected(selected === hood.id ? null : hood.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              selected === hood.id
                ? "border-current bg-current/5 ring-1 ring-current"
                : "border-border/50 bg-card/50 hover:border-border"
            )}
            style={{ color: selected === hood.id ? hood.color : undefined }}
          >
            <div
              className="h-2 w-8 rounded-full mb-2"
              style={{ background: hood.color }}
            />
            <p className="text-xs font-medium text-foreground">{hood.name}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{hood.mashupCount} mashups</p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selectedHood && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{selectedHood.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedHood.description}</p>
          </div>

          {/* Characteristics bars */}
          <div className="space-y-1.5">
            {selectedHood.characteristics.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-[10px]">
                <span className="w-14 text-muted-foreground">{c.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.value}%`, background: selectedHood.color }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{c.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Music className="h-2.5 w-2.5" />
              {selectedHood.stemCount} stems
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-2.5 w-2.5" />
              {selectedHood.topCreators.join(", ")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
