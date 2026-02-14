"use client"

import { useState, useCallback } from "react"
import { Sparkles, Upload, Loader2, Play, Download, Wand2, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  generateAutoMashup,
  analyzeTracks,
  analyzeCompatibility,
  vibePresets,
  type VibePreset,
  type AIMashupTrack,
  type AIMashupResult,
  type AIMashupConfig,
} from "@/lib/data/auto-mashup"

interface AutoMashupGeneratorProps {
  className?: string
  onComplete?: (result: AIMashupResult) => void
}

export function AutoMashupGenerator({
  className,
  onComplete,
}: AutoMashupGeneratorProps) {
  const [tracks, setTracks] = useState<AIMashupTrack[]>([])
  const [selectedVibe, setSelectedVibe] = useState<VibePreset>("energetic")
  const [intensity, setIntensity] = useState(75)
  const [transitionStyle, setTransitionStyle] = useState<AIMashupConfig["transitionStyle"]>("drop")
  const [vocalFocus, setVocalFocus] = useState(true)
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<AIMashupResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    if (files.length < 2) {
      setError("Please upload at least 2 tracks for a mashup")
      return
    }
    
    setError(null)
    setIsAnalyzing(true)
    
    try {
      const analyzed = await analyzeTracks(files)
      setTracks(analyzed)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleGenerate = async () => {
    if (tracks.length < 2) {
      setError("Need at least 2 tracks")
      return
    }
    
    setIsGenerating(true)
    setProgress(0)
    setError(null)
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 90))
    }, 500)
    
    try {
      const config: AIMashupConfig = {
        tracks,
        vibe: selectedVibe,
        intensity,
        transitionStyle,
        vocalFocus,
        includeOriginalSegments: false,
      }
      
      const mashup = await generateAutoMashup(config)
      clearInterval(progressInterval)
      setProgress(100)
      setResult(mashup)
      onComplete?.(mashup)
    } catch (err) {
      setError("Failed to generate mashup. Please try again.")
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
    }
  }

  const compatibility = analyzeCompatibility(tracks)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Auto-Mashup AI
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Section */}
        {tracks.length === 0 ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="ai-track-upload"
            />
            <label
              htmlFor="ai-track-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {isAnalyzing ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              )}
              <h3 className="font-semibold text-lg">
                {isAnalyzing ? "Analyzing tracks..." : "Upload 2+ tracks"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI will analyze BPM, key, and structure
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Tracks ({tracks.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTracks([])}
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {tracks.map((track, i) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {track.bpm} BPM • {track.key} • {formatDuration(track.duration)}
                    </p>
                  </div>
                  {i === 0 && (
                    <Badge variant="secondary">Primary</Badge>
                  )}
                </div>
              ))}
            </div>
            
            {/* Compatibility Warning */}
            {!compatibility.compatible && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                {compatibility.issues.join(", ")}
              </div>
            )}
            {compatibility.suggestions.length > 0 && (
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
                💡 {compatibility.suggestions.join(" ")}
              </div>
            )}
          </div>
        )}

        {/* Configuration */}
        {tracks.length >= 2 && (
          <div className="space-y-6 border-t pt-6">
            <h4 className="font-medium flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Generation Settings
            </h4>
            
            {/* Vibe Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(vibePresets) as VibePreset[]).map((vibe) => {
                const preset = vibePresets[vibe]
                return (
                  <button
                    key={vibe}
                    onClick={() => setSelectedVibe(vibe)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      selectedVibe === vibe
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <p className="font-medium mt-2">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                  </button>
                )
              })}
            </div>
            
            {/* Intensity Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Intensity</label>
                <span className="text-sm text-muted-foreground">{intensity}%</span>
              </div>
              <Slider
                value={[intensity]}
                onValueChange={([v]) => setIntensity(v)}
                max={100}
                step={5}
              />
            </div>
            
            {/* Transition Style */}
            <div>
              <label className="text-sm font-medium mb-2 block">Transition Style</label>
              <Select
                value={transitionStyle}
                onValueChange={(v) => setTransitionStyle(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth">Smooth Blend</SelectItem>
                  <SelectItem value="choppy">Choppy Cuts</SelectItem>
                  <SelectItem value="drop">Drop Transitions</SelectItem>
                  <SelectItem value="blend">Full Blend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Vocal Focus Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-medium">Vocal Focus</p>
                <p className="text-xs text-muted-foreground">
                  Prioritize vocals from source tracks
                </p>
              </div>
              <Button
                variant={vocalFocus ? "default" : "outline"}
                size="sm"
                onClick={() => setVocalFocus(!vocalFocus)}
              >
                {vocalFocus ? "On" : "Off"}
              </Button>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is creating your mashup...
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              This may take 1-2 minutes depending on track complexity
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-600">
              <Sparkles className="h-5 w-5" />
              <div>
                <p className="font-medium">Mashup Complete!</p>
                <p className="text-sm">
                  {result.duration}s • {result.bpm} BPM • {result.key}
                </p>
              </div>
            </div>
            
            {/* AI Analysis */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="font-medium">{Math.round(result.aiAnalysis.energy)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Danceability</p>
                <p className="font-medium">{Math.round(result.aiAnalysis.danceability)}%</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => {}}>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {}}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {tracks.length >= 2 && !result && !isGenerating && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={!compatibility.compatible}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Mashup
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
