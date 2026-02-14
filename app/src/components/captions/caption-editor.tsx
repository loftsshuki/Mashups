"use client"

import { useState } from "react"
import { GeneratedCaptions, CaptionSegment, mockGeneratedCaptions, exportCaptions, generateKaraokeTiming } from "@/lib/data/auto-caption"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Download, Sparkles, FileText, Subtitles, Music, Mic } from "lucide-react"

interface CaptionEditorProps {
  initialCaptions?: GeneratedCaptions
  onCaptionsChange?: (captions: GeneratedCaptions) => void
  onGenerate?: () => Promise<GeneratedCaptions>
  className?: string
}

export function CaptionEditor({
  initialCaptions,
  onCaptionsChange,
  onGenerate,
  className,
}: CaptionEditorProps) {
  const [captions, setCaptions] = useState<GeneratedCaptions | null>(initialCaptions || null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<"srt" | "vtt" | "txt">("srt")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const handleGenerate = async () => {
    if (!onGenerate) return
    
    setIsGenerating(true)
    try {
      const newCaptions = await onGenerate()
      setCaptions(newCaptions)
      onCaptionsChange?.(newCaptions)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateSegment = (segmentId: string, updates: Partial<CaptionSegment>) => {
    if (!captions) return
    
    const updated: GeneratedCaptions = {
      ...captions,
      segments: captions.segments.map(s => 
        s.id === segmentId ? { ...s, ...updates } : s
      ),
    }
    
    setCaptions(updated)
    onCaptionsChange?.(updated)
  }

  const handleExport = () => {
    if (!captions) return
    
    const content = exportCaptions(captions, exportFormat)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = `captions.${exportFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const activeSegment = captions?.segments.find(s => 
    currentTime >= s.startTime && currentTime <= s.endTime
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {captions?.isLyrics ? (
            <Music className="h-5 w-5 text-primary" />
          ) : (
            <Subtitles className="h-5 w-5 text-primary" />
          )}
          <h3 className="font-semibold">
            {captions?.isLyrics ? "Lyrics" : "Captions"}
          </h3>
          {captions && (
            <Badge variant="secondary">
              {captions.segments.length} segments
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!captions ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !onGenerate}
              className="gap-1.5"
            >
              {isGenerating ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Auto-Generate
            </Button>
          ) : (
            <>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="srt">SRT</SelectItem>
                  <SelectItem value="vtt">VTT</SelectItem>
                  <SelectItem value="txt">Text</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="gap-1.5">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      {captions && (
        <>
          {/* Current Caption Display */}
          <div className="bg-muted rounded-lg p-4 min-h-[80px] flex items-center justify-center">
            {activeSegment ? (
              <p className="text-lg text-center font-medium">
                {activeSegment.text}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No caption at current position
              </p>
            )}
          </div>

          {/* Segments List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {captions.segments.map((segment, index) => (
                <Card
                  key={segment.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedSegment === segment.id && "ring-2 ring-primary",
                    activeSegment?.id === segment.id && "bg-primary/5 border-primary"
                  )}
                  onClick={() => setSelectedSegment(segment.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(segment.confidence)}%
                        </Badge>
                      </div>
                    </div>

                    {selectedSegment === segment.id ? (
                      <Textarea
                        value={segment.text}
                        onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                        className="min-h-[60px]"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm">{segment.text}</p>
                    )}

                    {segment.speaker && (
                      <p className="text-xs text-muted-foreground">
                        Speaker: {segment.speaker}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {!captions && !isGenerating && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          {onGenerate ? (
            <>
              <Mic className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-1">
                No captions generated yet
              </p>
              <p className="text-sm text-muted-foreground">
                Click Auto-Generate to create captions from audio
              </p>
            </>
          ) : (
            <>
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No captions available
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Compact caption indicator for timeline
interface CaptionIndicatorProps {
  captions: GeneratedCaptions
  currentTime: number
  className?: string
}

export function CaptionIndicator({ captions, currentTime, className }: CaptionIndicatorProps) {
  const activeSegment = captions.segments.find(s => 
    currentTime >= s.startTime && currentTime <= s.endTime
  )

  if (!activeSegment) return null

  return (
    <div className={cn(
      "bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium",
      className
    )}>
      {activeSegment.text}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
}
