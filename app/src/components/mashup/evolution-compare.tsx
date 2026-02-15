"use client"

import { useEffect, useState } from "react"
import { GitCompareArrows, Play, Pause, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MashupVersion {
  id: string
  version: number
  label: string
  createdAt: string
  duration: number
  stemCount: number
  bpm: number | null
  changesSummary: string
}

interface VersionAnalysis {
  durationChange: string
  bpmChange: string
  stemDelta: number
  dynamicRangeChange: string
  arrangementNote: string
  overallVerdict: string
}

interface EvolutionCompareProps {
  mashupId: string
  className?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function EvolutionCompare({ mashupId, className }: EvolutionCompareProps) {
  const [versions, setVersions] = useState<MashupVersion[]>([])
  const [analysis, setAnalysis] = useState<VersionAnalysis | null>(null)
  const [selectedV1, setSelectedV1] = useState<number>(1)
  const [selectedV2, setSelectedV2] = useState<number>(2)
  const [syncPlay, setSyncPlay] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/mashups/${mashupId}/versions`)
        if (response.ok) {
          const data = (await response.json()) as { versions: MashupVersion[] }
          setVersions(data.versions)
          if (data.versions.length >= 2) {
            setSelectedV1(data.versions[0].version)
            setSelectedV2(data.versions[data.versions.length - 1].version)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [mashupId])

  useEffect(() => {
    if (versions.length < 2) return
    async function compare() {
      const response = await fetch(
        `/api/mashups/${mashupId}/versions?compare=${selectedV1},${selectedV2}`
      )
      if (response.ok) {
        const data = (await response.json()) as { comparison: { analysis: VersionAnalysis } }
        setAnalysis(data.comparison.analysis)
      }
    }
    void compare()
  }, [mashupId, selectedV1, selectedV2, versions.length])

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border/70 bg-card/70 p-4", className)}>
        <p className="text-sm text-muted-foreground">Loading versions...</p>
      </div>
    )
  }

  if (versions.length < 2) {
    return (
      <div className={cn("rounded-lg border border-border/70 bg-card/70 p-4", className)}>
        <div className="flex items-center gap-2 mb-2">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Evolution</h3>
        </div>
        <p className="text-xs text-muted-foreground">Only one version exists. Save more versions to compare.</p>
      </div>
    )
  }

  const v1 = versions.find((v) => v.version === selectedV1)
  const v2 = versions.find((v) => v.version === selectedV2)

  return (
    <div className={cn("rounded-lg border border-border/70 bg-card/70 p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Version Evolution</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSyncPlay(!syncPlay)}
          className="gap-1.5"
        >
          {syncPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {syncPlay ? "Stop Sync" : "Sync Play"}
        </Button>
      </div>

      {/* Version timeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {versions.map((v, i) => (
          <div key={v.id} className="flex items-center shrink-0">
            <button
              onClick={() => {
                if (selectedV1 === v.version) return
                if (selectedV2 === v.version) return
                setSelectedV1(v.version)
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                v.version === selectedV1
                  ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                  : v.version === selectedV2
                    ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              V{v.version}
            </button>
            {i < versions.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* V1 */}
        {v1 && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
            <p className="text-xs font-medium text-blue-400">V{v1.version}: {v1.label}</p>
            {/* Mock waveform */}
            <div className="flex items-end gap-px h-12">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-blue-500/40"
                  style={{ height: `${20 + Math.sin(i * 0.4) * 30 + Math.random() * 20}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{formatDuration(v1.duration)}</span>
              <span>{v1.stemCount} stems</span>
              <span>{v1.bpm} BPM</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{v1.changesSummary}</p>
          </div>
        )}

        {/* V2 */}
        {v2 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
            <p className="text-xs font-medium text-green-400">V{v2.version}: {v2.label}</p>
            {/* Mock waveform */}
            <div className="flex items-end gap-px h-12">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-green-500/40"
                  style={{ height: `${25 + Math.cos(i * 0.35) * 30 + Math.random() * 20}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{formatDuration(v2.duration)}</span>
              <span>{v2.stemCount} stems</span>
              <span>{v2.bpm} BPM</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{v2.changesSummary}</p>
          </div>
        )}
      </div>

      {/* Auto-analysis */}
      {analysis && (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
          <p className="text-xs font-medium text-foreground">Auto-Analysis</p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
            <span>{analysis.durationChange}</span>
            <span>{analysis.bpmChange}</span>
            <span>{analysis.dynamicRangeChange}</span>
            <span>{analysis.arrangementNote}</span>
          </div>
          <p className="text-xs font-medium text-primary mt-1">{analysis.overallVerdict}</p>
        </div>
      )}
    </div>
  )
}
