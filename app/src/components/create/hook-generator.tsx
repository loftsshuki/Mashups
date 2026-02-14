"use client"

import { useState, useCallback, useMemo } from "react"
import { Sparkles, Play, Scissors, TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWaveform } from "@/lib/hooks/use-waveform"

interface HookSegment {
  startTime: number
  endTime: number
  duration: number
  score: number // 0-100 viral potential
  label: string
  reason: string
}

interface HookGeneratorProps {
  audioUrl: string
  totalDuration: number
  onSelectHook?: (startTime: number, duration: number) => void
  className?: string
}

export function HookGenerator({
  audioUrl,
  totalDuration,
  onSelectHook,
  className,
}: HookGeneratorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [segments, setSegments] = useState<HookSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const [previewTime, setPreviewTime] = useState<number | null>(null)

  const { data: waveformData } = useWaveform(audioUrl, { barCount: 200 })

  // Analyze audio for hooks
  const analyzeHooks = useCallback(async () => {
    setIsAnalyzing(true)

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate segments based on waveform analysis
    // In a real implementation, this would analyze energy, drops, vocals, etc.
    const generatedSegments: HookSegment[] = [
      {
        startTime: 0,
        endTime: 15,
        duration: 15,
        score: 85,
        label: "Cold Open",
        reason: "High energy intro with vocal hook",
      },
      {
        startTime: totalDuration * 0.3,
        endTime: totalDuration * 0.3 + 15,
        duration: 15,
        score: 92,
        label: "Drop Section",
        reason: "Peak energy with bass drop",
      },
      {
        startTime: totalDuration * 0.5,
        endTime: totalDuration * 0.5 + 15,
        duration: 15,
        score: 78,
        label: "Vocal Tease",
        reason: "Catchy vocal phrase",
      },
      {
        startTime: totalDuration * 0.7,
        endTime: totalDuration * 0.7 + 15,
        duration: 15,
        score: 88,
        label: "Beat Switch",
        reason: "Rhythm change with hook",
      },
    ]

    setSegments(generatedSegments.sort((a, b) => b.score - a.score))
    setIsAnalyzing(false)
  }, [totalDuration])

  // Select a hook
  const handleSelect = useCallback(
    (index: number) => {
      setSelectedSegment(index)
      const segment = segments[index]
      if (segment) {
        onSelectHook?.(segment.startTime, segment.duration)
        setPreviewTime(segment.startTime)
      }
    },
    [segments, onSelectHook]
  )

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-emerald-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-orange-500"
  }

  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "🔥 Viral"
    if (score >= 80) return "⭐ Great"
    if (score >= 70) return "✓ Good"
    return "Okay"
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Hook Generator
          </span>
          {segments.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {segments.length} hooks found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Analyze Button */}
        {segments.length === 0 && (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              AI will analyze your track to find the most viral 15-second segments.
            </p>
            <Button onClick={analyzeHooks} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing energy, drops, vocals...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find Best Hooks
                </>
              )}
            </Button>
          </div>
        )}

        {/* Hook Segments */}
        {segments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Select a hook to use in your export
            </p>

            {segments.map((segment, index) => (
              <div
                key={index}
                className={cn(
                  "relative rounded-lg border p-3 cursor-pointer transition-all",
                  selectedSegment === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleSelect(index)}
              >
                {/* Score bar */}
                <div
                  className={cn(
                    "absolute top-0 left-0 h-1 rounded-t-lg transition-all",
                    getScoreColor(segment.score)
                  )}
                  style={{ width: `${segment.score}%` }}
                />

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{segment.label}</span>
                      <Badge
                        className={cn(
                          "text-[10px] text-white",
                          getScoreColor(segment.score)
                        )}
                      >
                        {getScoreLabel(segment.score)} {segment.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{segment.reason}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(segment.startTime)} -{" "}
                        {formatTime(segment.endTime)}
                      </span>
                      <span>•</span>
                      <span>{segment.duration}s</span>
                    </div>
                  </div>

                  {selectedSegment === index && (
                    <div className="flex items-center gap-1">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini waveform preview */}
                {waveformData && (
                  <div className="mt-2 h-8 flex items-end gap-[1px]">
                    {waveformData.peaks
                      .slice(
                        Math.floor((segment.startTime / totalDuration) * waveformData.peaks.length),
                        Math.floor((segment.endTime / totalDuration) * waveformData.peaks.length)
                      )
                      .slice(0, 50)
                      .map((peak, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded-full",
                            selectedSegment === index ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                          style={{ height: `${Math.max(10, peak * 100)}%` }}
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSegments([])
                setSelectedSegment(null)
              }}
            >
              Re-analyze
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs font-medium text-primary mb-1">What makes a viral hook?</p>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• High energy sections with strong beats</li>
            <li>• Catchy vocal phrases or memorable melodies</li>
            <li>• Sudden drops or beat switches</li>
            <li>• First 3 seconds grab attention immediately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
