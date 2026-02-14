"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Download,
  Share2,
  Scissors,
  Image,
  Music,
  Video,
  Check,
  Loader2,
  Smartphone,
  Monitor,
  Square,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type Platform = "tiktok" | "instagram" | "youtube" | "twitter"
type AspectRatio = "9:16" | "1:1" | "16:9"
type ExportFormat = "mp4" | "mov" | "mp3" | "wav"

interface PlatformPreset {
  id: Platform
  name: string
  icon: React.ReactNode
  aspectRatio: AspectRatio
  maxDuration: number
  recommendedDuration: number
  description: string
}

const PLATFORMS: PlatformPreset[] = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    maxDuration: 180,
    recommendedDuration: 15,
    description: "Vertical video, 9:16",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    maxDuration: 90,
    recommendedDuration: 15,
    description: "Vertical video, 9:16",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    maxDuration: 60,
    recommendedDuration: 15,
    description: "Vertical video, 9:16",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: <Monitor className="h-4 w-4" />,
    aspectRatio: "16:9",
    maxDuration: 140,
    recommendedDuration: 30,
    description: "Landscape, 16:9",
  },
]

const ASPECT_RATIOS: { ratio: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { ratio: "9:16", label: "Vertical", icon: <Smartphone className="h-4 w-4" /> },
  { ratio: "1:1", label: "Square", icon: <Square className="h-4 w-4" /> },
  { ratio: "16:9", label: "Landscape", icon: <Monitor className="h-4 w-4" /> },
]

const DURATIONS = [
  { value: 15, label: "15s", description: "Hook" },
  { value: 30, label: "30s", description: "Short" },
  { value: 60, label: "60s", description: "Full" },
]

interface PlatformExportProps {
  audioUrl: string
  totalDuration: number
  coverImage?: string
  onExport?: (settings: ExportSettings) => void
  className?: string
}

export interface ExportSettings {
  platform: Platform
  aspectRatio: AspectRatio
  duration: number
  startTime: number
  format: ExportFormat
  includeVisuals: boolean
  visualizerStyle: "waveform" | "bars" | "circular" | "particles"
}

export function PlatformExport({
  audioUrl,
  totalDuration,
  coverImage,
  onExport,
  className,
}: PlatformExportProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("tiktok")
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16")
  const [duration, setDuration] = useState(15)
  const [startTime, setStartTime] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [visualizerStyle, setVisualizerStyle] = useState<ExportSettings["visualizerStyle"]>("waveform")
  const [includeVisuals, setIncludeVisuals] = useState(true)

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform)!

  // Update aspect ratio when platform changes
  useEffect(() => {
    setAspectRatio(platform.aspectRatio)
  }, [platform])

  // Generate preview URL
  const handleExport = useCallback(async () => {
    setIsExporting(true)
    setExportProgress(0)

    const settings: ExportSettings = {
      platform: selectedPlatform,
      aspectRatio,
      duration,
      startTime,
      format: includeVisuals ? "mp4" : "mp3",
      includeVisuals,
      visualizerStyle,
    }

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setExportProgress(i)
    }

    onExport?.(settings)
    setIsExporting(false)
  }, [
    selectedPlatform,
    aspectRatio,
    duration,
    startTime,
    includeVisuals,
    visualizerStyle,
    onExport,
  ])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4 text-primary" />
          Export for Social
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Platform</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <Button
                key={p.id}
                variant={selectedPlatform === p.id ? "default" : "outline"}
                size="sm"
                className="h-auto py-2 justify-start"
                onClick={() => setSelectedPlatform(p.id)}
              >
                <div className="flex items-center gap-2">
                  {p.icon}
                  <div className="text-left">
                    <div className="text-xs font-medium">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Aspect Ratio</label>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map(({ ratio, label, icon }) => (
              <Button
                key={ratio}
                variant={aspectRatio === ratio ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setAspectRatio(ratio)}
              >
                {icon}
                <span className="ml-1 text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map(({ value, label, description }) => (
              <Button
                key={value}
                variant={duration === value ? "default" : "outline"}
                size="sm"
                className="flex-1 h-auto py-1"
                onClick={() => setDuration(value)}
              >
                <div className="text-center">
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-[10px] text-muted-foreground">{description}</div>
                </div>
              </Button>
            ))}
          </div>
          <Slider
            value={[duration]}
            min={5}
            max={Math.min(platform.maxDuration, totalDuration)}
            step={1}
            onValueChange={(v) => setDuration(v[0] ?? 15)}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5s</span>
            <span>{Math.min(platform.maxDuration, totalDuration)}s max</span>
          </div>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Start Time: {formatTime(startTime)}
          </label>
          <Slider
            value={[startTime]}
            min={0}
            max={Math.max(0, totalDuration - duration)}
            step={0.5}
            onValueChange={(v) => setStartTime(v[0] ?? 0)}
          />
        </div>

        {/* Visuals Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">Include Visualizer</span>
          </div>
          <Button
            variant={includeVisuals ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs"
            onClick={() => setIncludeVisuals(!includeVisuals)}
          >
            {includeVisuals ? "On" : "Audio Only"}
          </Button>
        </div>

        {/* Visualizer Style */}
        {includeVisuals && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Visualizer Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(["waveform", "bars", "circular", "particles"] as const).map((style) => (
                <Button
                  key={style}
                  variant={visualizerStyle === style ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => setVisualizerStyle(style)}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Preview indicator */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Export Preview</span>
            <Badge variant="secondary" className="text-[10px]">
              {aspectRatio}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Scissors className="h-3 w-3" />
            <span>
              {formatTime(startTime)} - {formatTime(startTime + duration)}
            </span>
            <span>•</span>
            <span>{duration}s clip</span>
          </div>
        </div>

        {/* Export Button */}
        <Button
          className="w-full"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting... {exportProgress}%
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export for {platform.name}
            </>
          )}
        </Button>

        {/* Progress bar */}
        {isExporting && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
