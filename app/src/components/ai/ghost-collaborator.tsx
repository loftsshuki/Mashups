"use client"

import { useEffect, useState } from "react"
import { Bot, Check, SkipForward, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Suggestion {
  id: string
  type: "structural" | "stem" | "effect"
  title: string
  description: string
  confidence: number
}

interface GhostCollaboratorProps {
  className?: string
}

const typeIcons: Record<string, string> = {
  structural: "bg-blue-500/20 text-blue-400",
  stem: "bg-green-500/20 text-green-400",
  effect: "bg-purple-500/20 text-purple-400",
}

export function GhostCollaborator({ className }: GhostCollaboratorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mashupState: {} }),
        })
        if (response.ok) {
          const data = (await response.json()) as { suggestions: Suggestion[] }
          setSuggestions(data.suggestions)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const current = suggestions[currentIndex]

  function handleAccept() {
    if (!current) return
    setAccepted((prev) => new Set(prev).add(current.id))
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  function handleSkip() {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border/70 bg-card/70 p-3", className)}>
        <p className="text-xs text-muted-foreground">AI collaborator thinking...</p>
      </div>
    )
  }

  if (!current) {
    return (
      <div className={cn("rounded-lg border border-border/70 bg-card/70 p-3 text-center", className)}>
        <Bot className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">No more suggestions right now.</p>
        <p className="text-[10px] text-muted-foreground">{accepted.size} suggestions accepted</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Ghost Collaborator</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {currentIndex + 1}/{suggestions.length}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize", typeIcons[current.type])}>
            {current.type}
          </span>
          <span className="text-xs font-medium text-foreground">{current.title}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{current.description}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Confidence: {Math.round(current.confidence * 100)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={handleAccept}>
          <Check className="mr-1 h-3 w-3" />
          Accept
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSkip}>
          <SkipForward className="mr-1 h-3 w-3" />
          Skip
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs">
          <Eye className="mr-1 h-3 w-3" />
          Show Me
        </Button>
      </div>
    </div>
  )
}
