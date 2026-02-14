"use client"

import { useState, useCallback } from "react"
import { Zap, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBeatAnalysis, useTrackCompatibility, useBPMTap } from "@/lib/hooks/use-beat-analysis"
import { BeatIndicator, CompatibilityBadge } from "./beat-grid"
import type { TrackAnalysis } from "@/lib/audio/beat-detector"

interface SmartMatchPanelProps {
  primaryTrackUrl: string | null
  secondaryTrackUrls: string[]
  onSelectTrack?: (url: string) => void
  className?: string
}

export function SmartMatchPanel({
  primaryTrackUrl,
  secondaryTrackUrls,
  onSelectTrack,
  className,
}: SmartMatchPanelProps) {
  const { analysis: primaryAnalysis, isLoading: primaryLoading } = useBeatAnalysis(primaryTrackUrl)
  const [selectedSecondary, setSelectedSecondary] = useState<string | null>(null)
  
  const { compatibility, track2Analysis } = useTrackCompatibility(
    primaryTrackUrl,
    selectedSecondary
  )

  // BPM Tap tool
  const { bpm: tappedBPM, tap, reset, taps } = useBPMTap()

  const handleSelectSecondary = useCallback((url: string) => {
    setSelectedSecondary(url)
    onSelectTrack?.(url)
  }, [onSelectTrack])

  if (!primaryTrackUrl) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Smart Beat Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload a track to see BPM, key, and compatibility analysis.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Smart Beat Match
          </span>
          {primaryLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Track Analysis */}
        {primaryAnalysis && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Primary Track</p>
            <BeatIndicator
              bpm={primaryAnalysis.bpm.bpm}
              confidence={primaryAnalysis.bpm.confidence}
              key={primaryAnalysis.key.key}
              scale={primaryAnalysis.key.scale}
            />
          </div>
        )}

        {/* Manual BPM Tap */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">Manual BPM Tap</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex-1"
              onClick={tap}
            >
              {tappedBPM ? `${tappedBPM} BPM` : "Tap Beat"}
            </Button>
            {tappedBPM && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Reset
              </Button>
            )}
          </div>
          {taps > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {taps} tap{taps !== 1 ? "s" : ""} recorded
            </p>
          )}
        </div>

        {/* Compatibility with selected track */}
        {selectedSecondary && compatibility && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Compatibility
            </p>
            <CompatibilityBadge
              score={compatibility.score}
              bpmCompatible={compatibility.bpmCompatible}
              keyCompatible={compatibility.keyCompatible}
            />
            
            {!compatibility.bpmCompatible && compatibility.recommendedPitch !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Suggested pitch: {compatibility.recommendedPitch > 0 ? "+" : ""}
                {compatibility.recommendedPitch.toFixed(1)}%
              </p>
            )}

            {track2Analysis && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Secondary Track</p>
                <BeatIndicator
                  bpm={track2Analysis.bpm.bpm}
                  confidence={track2Analysis.bpm.confidence}
                  key={track2Analysis.key.key}
                  scale={track2Analysis.key.scale}
                />
              </div>
            )}
          </div>
        )}

        {/* Track suggestions */}
        {secondaryTrackUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Compare With
            </p>
            <div className="space-y-1">
              {secondaryTrackUrls.map((url, index) => (
                <Button
                  key={url}
                  variant={selectedSecondary === url ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => handleSelectSecondary(url)}
                >
                  Track {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs font-medium text-primary mb-1">Tips</p>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• Tracks within ±3 BPM work best</li>
            <li>• Same key or relative major/minor = harmonic mix</li>
            <li>• Half/double tempo can also work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

interface TrackAnalysisCardProps {
  analysis: TrackAnalysis
  title: string
  isPrimary?: boolean
  className?: string
}

export function TrackAnalysisCard({
  analysis,
  title,
  isPrimary = false,
  className,
}: TrackAnalysisCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        isPrimary
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/30 border-border",
        className
      )}
    >
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      
      <BeatIndicator
        bpm={analysis.bpm.bpm}
        confidence={analysis.bpm.confidence}
        key={analysis.key.key}
        scale={analysis.key.scale}
      />

      <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span>Duration: {formatDuration(analysis.duration)}</span>
        <span>Loudness: {analysis.loudness} LUFS</span>
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
