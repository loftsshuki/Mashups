"use client"

import { useEffect, useState } from "react"
import { Lock, Unlock, Package, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VaultItem {
  id: string
  title: string
  description: string
  stemCount: number
  requirement: string
  requirementType: string
  threshold: number
  isUnlocked: boolean
  progress: number
}

interface VaultPanelProps {
  className?: string
}

export function VaultPanel({ className }: VaultPanelProps) {
  const [items, setItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/vault")
        if (response.ok) {
          const data = (await response.json()) as { items: VaultItem[] }
          setItems(data.items)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  const unlocked = items.filter((i) => i.isUnlocked)
  const locked = items.filter((i) => !i.isUnlocked)

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">The Vault</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {unlocked.length}/{items.length} unlocked
        </span>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Unlocked</p>
          {unlocked.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {item.stemCount} stems
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <Button size="sm" variant="outline">Browse Stems</Button>
            </div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Locked</p>
          {locked.map((item) => {
            const progress = Math.min((item.progress / item.threshold) * 100, 100)
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-2 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {item.stemCount} stems
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{item.requirement}</span>
                    <span>{item.progress}/{item.threshold}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground/30"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
