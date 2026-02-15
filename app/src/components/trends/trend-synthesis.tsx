"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Music, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TrendRecipe {
  id: string
  pattern: string
  description: string
  engagementMultiplier: string
  matchedStems: { title: string; instrument: string; bpm: number }[]
}

interface TrendSynthesisProps {
  className?: string
}

const instrumentColors: Record<string, string> = {
  bass: "text-emerald-400",
  vocal: "text-pink-400",
  drums: "text-amber-400",
  synth: "text-violet-400",
  guitar: "text-red-400",
  texture: "text-cyan-400",
}

export function TrendSynthesis({ className }: TrendSynthesisProps) {
  const [recipes, setRecipes] = useState<TrendRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/trends/synthesis")
        if (response.ok) {
          const data = (await response.json()) as { recipes: TrendRecipe[] }
          setRecipes(data.recipes)
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
        <div className="h-24 rounded-lg bg-muted/30 animate-pulse" />
        <div className="h-24 rounded-lg bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">What&apos;s Working Now</h3>
      </div>

      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">{recipe.pattern}</p>
            <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
              <TrendingUp className="h-3 w-3" />
              {recipe.engagementMultiplier}
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">{recipe.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {recipe.matchedStems.map((stem) => (
              <span
                key={stem.title}
                className="flex items-center gap-1 rounded-full bg-muted/30 px-2 py-0.5 text-[9px]"
              >
                <Music className={cn("h-2.5 w-2.5", instrumentColors[stem.instrument] ?? "text-muted-foreground")} />
                <span className="text-foreground">{stem.title}</span>
              </span>
            ))}
          </div>

          <Button size="sm" variant="outline" className="w-full h-7 text-xs" asChild>
            <Link href="/create">
              Start Creating
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
