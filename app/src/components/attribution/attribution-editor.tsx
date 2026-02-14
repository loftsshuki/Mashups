"use client"

import { useState } from "react"
import { AttributionSource, validateAttribution, generateAttributionText } from "@/lib/data/attribution"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, AlertCircle, Check, FileText, Music } from "lucide-react"


interface AttributionEditorProps {
  initialSources?: AttributionSource[]
  onSourcesChange?: (sources: AttributionSource[]) => void
  mashupDuration?: number
  className?: string
}

export function AttributionEditor({
  initialSources = [],
  onSourcesChange,
  mashupDuration = 180,
  className,
}: AttributionEditorProps) {
  const [sources, setSources] = useState<AttributionSource[]>(
    initialSources.length > 0 ? initialSources : []
  )
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] })
  const [showExport, setShowExport] = useState(false)

  const updateSources = (newSources: AttributionSource[]) => {
    setSources(newSources)
    setValidation(validateAttribution(newSources))
    onSourcesChange?.(newSources)
  }

  const addSource = () => {
    const newSource: AttributionSource = {
      id: `source_${Date.now()}`,
      title: "",
      artist: "",
      platform: "other",
      duration: 0,
      sampleUsed: { startTime: 0, endTime: 0 },
      licenseType: "unknown",
    }
    updateSources([...sources, newSource])
  }

  const updateSource = (id: string, updates: Partial<AttributionSource>) => {
    updateSources(sources.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const removeSource = (id: string) => {
    updateSources(sources.filter(s => s.id !== id))
  }

  const updateSampleTime = (id: string, field: "startTime" | "endTime", value: string) => {
    const seconds = parseTimeToSeconds(value)
    const source = sources.find(s => s.id === id)
    if (source) {
      const newSample = { ...source.sampleUsed, [field]: seconds }
      updateSource(id, { sampleUsed: newSample })
    }
  }

  const attributionText = generateAttributionText(sources, "full")

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Attribution Sources</h3>
          <Badge variant="secondary">{sources.length}</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(!showExport)}>
            <FileText className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button size="sm" onClick={addSource}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Source
          </Button>
        </div>
      </div>

      {!validation.valid && validation.errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <ul className="list-disc list-inside text-sm text-destructive">
              {validation.errors.slice(0, 3).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sources.map((source, index) => (
          <Card key={source.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Source #{index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSource(source.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Track Title</Label>
                  <Input
                    value={source.title}
                    onChange={(e) => updateSource(source.id, { title: e.target.value })}
                    placeholder="Song title"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Artist</Label>
                  <Input
                    value={source.artist}
                    onChange={(e) => updateSource(source.id, { artist: e.target.value })}
                    placeholder="Artist name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <Select
                    value={source.platform}
                    onValueChange={(v) => updateSource(source.id, { platform: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                      <SelectItem value="spotify">Spotify</SelectItem>
                      <SelectItem value="apple_music">Apple Music</SelectItem>
                      <SelectItem value="bandcamp">Bandcamp</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Sample Start</Label>
                  <Input
                    type="text"
                    placeholder="0:00"
                    value={formatSeconds(source.sampleUsed.startTime)}
                    onChange={(e) => updateSampleTime(source.id, "startTime", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Sample End</Label>
                  <Input
                    type="text"
                    placeholder="0:30"
                    value={formatSeconds(source.sampleUsed.endTime)}
                    onChange={(e) => updateSampleTime(source.id, "endTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>License Type</Label>
                <Select
                  value={source.licenseType}
                  onValueChange={(v) => updateSource(source.id, { licenseType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc">Creative Commons</SelectItem>
                    <SelectItem value="royalty_free">Royalty Free</SelectItem>
                    <SelectItem value="commercial">Commercial License</SelectItem>
                    <SelectItem value="fair_use">Fair Use</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        {sources.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No sources added yet</p>
            <Button variant="link" onClick={addSource} className="mt-1">
              Add your first source
            </Button>
          </div>
        )}
      </div>

      {showExport && sources.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Label>Attribution Text (for platforms)</Label>
            <Textarea
              value={attributionText}
              readOnly
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => navigator.clipboard.writeText(attributionText)}
              >
                <Check className="h-4 w-4" />
                Copy Full
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(generateAttributionText(sources, "short"))}
              >
                Copy Short
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return parseInt(timeStr) || 0
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

interface AttributionBadgeProps {
  sources: AttributionSource[]
  className?: string
}

export function AttributionBadge({ sources, className }: AttributionBadgeProps) {
  if (sources.length === 0) return null

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Music className="h-3 w-3" />
      <span>
        {sources.length} source{sources.length > 1 ? "s" : ""}:
        {sources.slice(0, 2).map(s => s.title).join(", ")}
        {sources.length > 2 && ` +${sources.length - 2} more`}
      </span>
    </div>
  )
}
