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
  Upload,
  Link2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Phase 2: Enhanced Platform Export with one-click publishing

type Platform = "tiktok" | "instagram" | "youtube" | "twitter"
type AspectRatio = "9:16" | "1:1" | "16:9"
type ExportFormat = "mp4" | "mov" | "mp3" | "wav"
type ExportStatus = "idle" | "processing" | "uploading" | "published" | "error"

interface PlatformPreset {
  id: Platform
  name: string
  icon: React.ReactNode
  aspectRatio: AspectRatio
  maxDuration: number
  recommendedDuration: number
  description: string
  color: string
  uploadApi?: string
}

interface ViralMetrics {
  score: number // 0-100
  hookStrength: number
  trendAlignment: number
  shareability: number
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
    color: "bg-black",
    uploadApi: "/api/export/tiktok",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    maxDuration: 90,
    recommendedDuration: 15,
    description: "Vertical video, 9:16",
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    uploadApi: "/api/export/instagram",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    maxDuration: 60,
    recommendedDuration: 15,
    description: "Vertical video, 9:16",
    color: "bg-red-600",
    uploadApi: "/api/export/youtube",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: <Monitor className="h-4 w-4" />,
    aspectRatio: "16:9",
    maxDuration: 140,
    recommendedDuration: 30,
    description: "Landscape, 16:9",
    color: "bg-sky-500",
    uploadApi: "/api/export/twitter",
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

interface PlatformExportEnhancedProps {
  audioUrl: string
  totalDuration: number
  coverImage?: string
  viralMetrics?: ViralMetrics
  selectedHookStart?: number
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
  autoUpload: boolean
  captions?: string
  hashtags?: string[]
}

export function PlatformExportEnhanced({
  audioUrl,
  totalDuration,
  coverImage,
  viralMetrics,
  selectedHookStart,
  onExport,
  className,
}: PlatformExportEnhancedProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("tiktok")
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16")
  const [duration, setDuration] = useState(15)
  const [startTime, setStartTime] = useState(selectedHookStart ?? 0)
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle")
  const [exportProgress, setExportProgress] = useState(0)
  const [visualizerStyle, setVisualizerStyle] = useState<ExportSettings["visualizerStyle"]>("waveform")
  const [includeVisuals, setIncludeVisuals] = useState(true)
  const [autoUpload, setAutoUpload] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string>("")
  const [captions, setCaptions] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform)!

  // Update start time when hook is selected
  useEffect(() => {
    if (selectedHookStart !== undefined) {
      setStartTime(selectedHookStart)
    }
  }, [selectedHookStart])

  // Generate AI hashtags
  useEffect(() => {
    const platformHashtags: Record<Platform, string[]> = {
      tiktok: ["#viral", "#trending", "#mashup", "#remix", "#audio"],
      instagram: ["#reels", "#viral", "#mashup", "#music", "#remix"],
      youtube: ["#shorts", "#viral", "#mashup", "#music", "#remix"],
      twitter: ["#viral", "#music", "#mashup", "#remix", "#audio"],
    }
    setHashtags(platformHashtags[selectedPlatform])
  }, [selectedPlatform])

  // Calculate viral score for current selection
  const calculateViralScore = useCallback(() => {
    if (!viralMetrics) return null
    
    const durationScore = duration <= 15 ? 100 : duration <= 30 ? 80 : 60
    const platformScore = platform.recommendedDuration >= duration ? 100 : 80
    
    return Math.round(
      (viralMetrics.score * 0.4 +
        viralMetrics.hookStrength * 0.3 +
        durationScore * 0.2 +
        platformScore * 0.1)
    )
  }, [viralMetrics, duration, platform])

  // Handle export with upload
  const handleExport = useCallback(async () => {
    setExportStatus("processing")
    setExportProgress(0)

    const settings: ExportSettings = {
      platform: selectedPlatform,
      aspectRatio,
      duration,
      startTime,
      format: includeVisuals ? "mp4" : "mp3",
      includeVisuals,
      visualizerStyle,
      autoUpload,
      captions,
      hashtags,
    }

    // Simulate export progress
    for (let i = 0; i <= 50; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setExportProgress(i)
    }

    if (autoUpload) {
      setExportStatus("uploading")
      
      // Simulate upload to platform
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      for (let i = 50; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setExportProgress(i)
      }
      
      setUploadUrl(`https://${selectedPlatform}.com/preview/${Date.now()}`)
      setShowSuccessDialog(true)
      setExportStatus("published")
    } else {
      setExportStatus("idle")
    }

    onExport?.(settings)
  }, [
    selectedPlatform,
    aspectRatio,
    duration,
    startTime,
    includeVisuals,
    visualizerStyle,
    autoUpload,
    captions,
    hashtags,
    onExport,
  ])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const viralScore = calculateViralScore()

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" />
            One-Click Platform Export
            {viralScore && (
              <Badge 
                variant={viralScore >= 80 ? "default" : "secondary"} 
                className="text-[10px] ml-auto"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Viral Score: {viralScore}
              </Badge>
            )}
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
                  className={cn(
                    "h-auto py-2 justify-start relative overflow-hidden",
                    selectedPlatform === p.id && p.color
                  )}
                  onClick={() => setSelectedPlatform(p.id)}
                >
                  <div className="flex items-center gap-2 relative z-10">
                    {p.icon}
                    <div className="text-left">
                      <div className="text-xs font-medium">{p.name}</div>
                      <div className="text-[10px] opacity-80">{p.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Viral Score Indicator */}
          {viralMetrics && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Viral Potential
                </span>
                <span className={cn(
                  "font-bold",
                  viralScore && viralScore >= 80 ? "text-green-500" : 
                  viralScore && viralScore >= 60 ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {viralScore}/100
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    viralScore && viralScore >= 80 ? "bg-green-500" : 
                    viralScore && viralScore >= 60 ? "bg-yellow-500" : "bg-muted-foreground"
                  )}
                  style={{ width: `${viralScore ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="font-medium">Hook:</span> {viralMetrics.hookStrength}%
                </div>
                <div>
                  <span className="font-medium">Trend:</span> {viralMetrics.trendAlignment}%
                </div>
                <div>
                  <span className="font-medium">Share:</span> {viralMetrics.shareability}%
                </div>
              </div>
            </div>
          )}

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

          {/* Auto-Upload Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <div>
                <span className="text-xs font-medium">Auto-Upload to {platform.name}</span>
                <p className="text-[10px] text-muted-foreground">
                  Direct publish (requires connected account)
                </p>
              </div>
            </div>
            <Button
              variant={autoUpload ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs"
              onClick={() => setAutoUpload(!autoUpload)}
            >
              {autoUpload ? "On" : "Off"}
            </Button>
          </div>

          {/* Hashtags Preview */}
          {hashtags.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Suggested Hashtags</label>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
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
            disabled={exportStatus === "processing" || exportStatus === "uploading"}
          >
            {exportStatus === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing... {exportProgress}%
              </>
            ) : exportStatus === "uploading" ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-bounce" />
                Uploading to {platform.name}... {exportProgress}%
              </>
            ) : autoUpload ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Export & Upload to {platform.name}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export for {platform.name}
              </>
            )}
          </Button>

          {/* Progress bar */}
          {(exportStatus === "processing" || exportStatus === "uploading") && (
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Published Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your mashup has been exported and uploaded to {platform.name}.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Input value={uploadUrl} readOnly className="flex-1 text-xs" />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(uploadUrl)}
              >
                Copy
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.open(uploadUrl, "_blank")}>
                View on {platform.name}
              </Button>
              <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
