"use client"

import { useState } from "react"
import { Music, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TranslationResult {
  originalGenre: string
  targetGenre: string
  newBpm: number
  newKey: string
  replacedStems: { original: string; replacement: string; reason: string }[]
  previewDescription: string
}

interface GenreTranslatorProps {
  mashupId: string
  currentGenre: string
  className?: string
}

const genres = [
  { id: "edm", label: "EDM", color: "bg-violet-500/20 text-violet-400" },
  { id: "jazz", label: "Jazz", color: "bg-amber-500/20 text-amber-400" },
  { id: "classical", label: "Classical", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "trap", label: "Trap", color: "bg-red-500/20 text-red-400" },
  { id: "lofi", label: "Lo-fi", color: "bg-cyan-500/20 text-cyan-400" },
  { id: "bossa-nova", label: "Bossa Nova", color: "bg-pink-500/20 text-pink-400" },
  { id: "reggaeton", label: "Reggaeton", color: "bg-orange-500/20 text-orange-400" },
  { id: "synthwave", label: "Synthwave", color: "bg-indigo-500/20 text-indigo-400" },
]

export function GenreTranslator({ mashupId, currentGenre, className }: GenreTranslatorProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleTranslate() {
    if (!selected) return
    setLoading(true)
    try {
      const response = await fetch("/api/ai/translate-genre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mashupId, targetGenre: selected }),
      })
      if (response.ok) {
        const data = (await response.json()) as { translation: TranslationResult }
        setResult(data.translation)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("rounded-lg border border-border/70 bg-card/70 p-4 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Genre Translation</h3>
        <span className="text-xs text-muted-foreground ml-auto">Current: {currentGenre}</span>
      </div>

      {/* Genre selector grid */}
      <div className="grid grid-cols-4 gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => { setSelected(genre.id); setResult(null) }}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition-all",
              selected === genre.id
                ? `${genre.color} ring-1 ring-current`
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {selected && !result && (
        <Button
          size="sm"
          onClick={handleTranslate}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Translating..." : `Translate to ${genres.find((g) => g.id === selected)?.label}`}
          <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      )}

      {result && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{result.previewDescription}</p>
          <div className="space-y-1.5">
            {result.replacedStems.map((stem, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground line-through">{stem.original}</span>
                <ArrowRight className="h-2.5 w-2.5 text-primary shrink-0" />
                <span className="text-foreground font-medium">{stem.replacement}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{result.newBpm} BPM</span>
            <span>·</span>
            <span>Key: {result.newKey}</span>
          </div>
          <Button size="sm" variant="outline" className="w-full">
            <Check className="mr-2 h-3 w-3" />
            Save as New Mashup
          </Button>
        </div>
      )}
    </div>
  )
}
