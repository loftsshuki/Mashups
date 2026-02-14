"use client"

import { useState } from "react"
import { Mic, Wand2, Play, Download, Settings2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  applyVocalEffects,
  vocalPresets,
  getCategoryColor,
  type VocalEffect,
  type VocalPreset,
} from "@/lib/data/ai-vocal"

interface VocalEffectsPanelProps {
  audioUrl?: string
  className?: string
}

export function VocalEffectsPanel({ audioUrl, className }: VocalEffectsPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<VocalPreset | null>(null)
  const [activeEffects, setActiveEffects] = useState<Record<VocalEffect, number>>({
    autotune: 0,
    harmony: 0,
    robotic: 0,
    ethereal: 0,
    vintage: 0,
    choir: 0,
    gender_shift: 0,
    formant: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handlePresetSelect = (preset: VocalPreset) => {
    setSelectedPreset(preset)
    const newEffects = { ...activeEffects }
    preset.effects.forEach((e) => {
      if (e.enabled) {
        newEffects[e.effect] = e.intensity
      }
    })
    setActiveEffects(newEffects)
  }

  const handleEffectChange = (effect: VocalEffect, value: number) => {
    setActiveEffects((prev) => ({ ...prev, [effect]: value }))
  }

  const handleProcess = async () => {
    if (!audioUrl) return
    setIsProcessing(true)
    
    const enabledEffects = Object.entries(activeEffects)
      .filter(([_, intensity]) => intensity > 0)
      .map(([effect, intensity]) => ({
        effect: effect as VocalEffect,
        intensity,
        enabled: true,
      }))
    
    try {
      const processed = await applyVocalEffects(audioUrl, enabledEffects)
      setResult(processed.processedUrl)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          AI Vocal Studio
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Presets */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Quick Presets
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vocalPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  selectedPreset?.id === preset.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.icon}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getCategoryColor(preset.category))}
                  >
                    {preset.category}
                  </Badge>
                </div>
                <p className="font-medium mt-2">{preset.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Effect Controls */}
        <Tabs defaultValue="pitch" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pitch">Pitch & Tune</TabsTrigger>
            <TabsTrigger value="texture">Texture</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
          </TabsList>

          <TabsContent value="pitch" className="space-y-4">
            <EffectSlider
              label="Auto-Tune"
              description="Pitch correction"
              value={activeEffects.autotune}
              onChange={(v) => handleEffectChange("autotune", v)}
              icon="🎵"
            />
            <EffectSlider
              label="Formant Shift"
              description="Change vocal character"
              value={activeEffects.formant}
              onChange={(v) => handleEffectChange("formant", v)}
              icon="🎚️"
            />
            <EffectSlider
              label="Gender Shift"
              description="Alter vocal characteristics"
              value={activeEffects.gender_shift}
              onChange={(v) => handleEffectChange("gender_shift", v)}
              icon="⚧"
            />
          </TabsContent>

          <TabsContent value="texture" className="space-y-4">
            <EffectSlider
              label="Harmony"
              description="Add vocal layers"
              value={activeEffects.harmony}
              onChange={(v) => handleEffectChange("harmony", v)}
              icon="🎶"
            />
            <EffectSlider
              label="Choir"
              description="Ensemble effect"
              value={activeEffects.choir}
              onChange={(v) => handleEffectChange("choir", v)}
              icon="🎭"
            />
            <EffectSlider
              label="Vintage"
              description="Analog warmth"
              value={activeEffects.vintage}
              onChange={(v) => handleEffectChange("vintage", v)}
              icon="📻"
            />
          </TabsContent>

          <TabsContent value="creative" className="space-y-4">
            <EffectSlider
              label="Robotic"
              description="Vocoder effect"
              value={activeEffects.robotic}
              onChange={(v) => handleEffectChange("robotic", v)}
              icon="🤖"
            />
            <EffectSlider
              label="Ethereal"
              description="Spacious reverb"
              value={activeEffects.ethereal}
              onChange={(v) => handleEffectChange("ethereal", v)}
              icon="☁️"
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleProcess}
            disabled={isProcessing || !audioUrl}
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Apply Effects
              </>
            )}
          </Button>
          
          {result && (
            <>
              <Button variant="outline" size="lg" onClick={() => {}}>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="lg" onClick={() => {}}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {!audioUrl && (
          <p className="text-sm text-muted-foreground text-center">
            Upload a vocal track to start processing
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function EffectSlider({
  label,
  description,
  value,
  onChange,
  icon,
}: {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  icon: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="text-sm font-medium w-12 text-right">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        step={5}
      />
    </div>
  )
}
