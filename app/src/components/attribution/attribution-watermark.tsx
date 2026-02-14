"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Shield, 
  Check, 
  Copy,
  Download,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Phase 2: Attribution Watermark System - Invisible + visible tracking

interface WatermarkConfig {
  visible: boolean
  invisible: boolean
  position: "corner" | "center" | "bottom"
  opacity: number
  size: number
  style: "minimal" | "standard" | "prominent"
}

interface AttributionFingerprint {
  id: string
  audioHash: string
  visualHash: string
  timestamp: string
  creatorId: string
  mashupId: string
  parentIds: string[]
  chainOfCustody: CustodyRecord[]
}

interface CustodyRecord {
  timestamp: string
  action: "created" | "remixed" | "shared" | "exported"
  userId: string
  platform?: string
}

interface AttributionWatermarkProps {
  mashupId: string
  creatorId: string
  parentTrackIds?: string[]
  onWatermarkChange?: (config: WatermarkConfig) => void
  className?: string
}

export function AttributionWatermark({
  mashupId,
  creatorId,
  parentTrackIds = [],
  onWatermarkChange,
  className,
}: AttributionWatermarkProps) {
  const [config, setConfig] = useState<WatermarkConfig>({
    visible: true,
    invisible: true,
    position: "corner",
    opacity: 30,
    size: 20,
    style: "standard",
  })
  
  const [fingerprint, setFingerprint] = useState<AttributionFingerprint | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate fingerprint
  const generateFingerprint = useCallback(async () => {
    const newFingerprint: AttributionFingerprint = {
      id: `fp_${Date.now()}`,
      audioHash: await generateAudioHash(mashupId),
      visualHash: await generateVisualHash(mashupId),
      timestamp: new Date().toISOString(),
      creatorId,
      mashupId,
      parentIds: parentTrackIds,
      chainOfCustody: [{
        timestamp: new Date().toISOString(),
        action: "created",
        userId: creatorId,
      }],
    }
    setFingerprint(newFingerprint)
  }, [mashupId, creatorId, parentTrackIds])

  // Generate audio perceptual hash (simplified)
  const generateAudioHash = useCallback(async (id: string): Promise<string> => {
    // In production, this would analyze actual audio fingerprints
    return `audio_${btoa(id).slice(0, 16)}_${Date.now().toString(36)}`
  }, [])

  // Generate visual hash for cover art
  const generateVisualHash = useCallback(async (id: string): Promise<string> => {
    // In production, this would hash the actual image
    return `visual_${btoa(id).slice(0, 16)}_${Date.now().toString(36)}`
  }, [])

  // Update config and notify parent
  const updateConfig = useCallback((updates: Partial<WatermarkConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onWatermarkChange?.(newConfig)
  }, [config, onWatermarkChange])

  // Draw watermark preview
  useEffect(() => {
    if (!canvasRef.current || !showPreview) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw sample video frame
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#16213e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw waveform simulation
    ctx.strokeStyle = "#0f3460"
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < canvas.width; i += 5) {
      const height = Math.random() * 100 + 50
      ctx.moveTo(i, canvas.height / 2 - height / 2)
      ctx.lineTo(i, canvas.height / 2 + height / 2)
    }
    ctx.stroke()

    // Draw watermark if enabled
    if (config.visible) {
      ctx.save()
      ctx.globalAlpha = config.opacity / 100
      
      // Determine position
      let x = 10
      let y = canvas.height - 40
      
      if (config.position === "center") {
        x = canvas.width / 2
        y = canvas.height / 2
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
      } else if (config.position === "bottom") {
        x = canvas.width / 2
        y = canvas.height - 30
        ctx.textAlign = "center"
      }

      // Draw watermark text
      const fontSize = config.size
      ctx.font = `${config.style === "prominent" ? "bold" : "normal"} ${fontSize}px sans-serif`
      ctx.fillStyle = "#fff"
      
      if (config.style === "minimal") {
        ctx.fillText("♫", x, y)
      } else if (config.style === "standard") {
        ctx.fillText("♫ Mashups.com", x, y)
      } else {
        ctx.fillText("♫ Made on Mashups.com", x, y)
        ctx.font = `${fontSize * 0.6}px sans-serif`
        ctx.fillText(`ID: ${mashupId.slice(0, 8)}...`, x, y + fontSize + 5)
      }
      
      ctx.restore()
    }

    // Draw invisible watermark indicator
    if (config.invisible) {
      ctx.save()
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)"
      ctx.beginPath()
      ctx.arc(canvas.width - 20, 20, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }, [config, showPreview, mashupId])

  // Copy fingerprint to clipboard
  const copyFingerprint = () => {
    if (fingerprint) {
      navigator.clipboard.writeText(JSON.stringify(fingerprint, null, 2))
    }
  }

  // Export certificate
  const exportCertificate = () => {
    if (!fingerprint) return
    
    const certificate = {
      ...fingerprint,
      verificationUrl: `https://mashups.com/verify/${fingerprint.id}`,
      attestations: [
        { type: "creation", timestamp: fingerprint.timestamp },
        { type: "attribution", parents: parentTrackIds },
      ],
    }
    
    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attestation-${mashupId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Attribution & Watermark
            {config.invisible && (
              <Badge variant="secondary" className="text-[10px] ml-auto">
                <Fingerprint className="h-3 w-3 mr-1" />
                Protected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Watermark Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium">Visible Watermark</span>
                  <p className="text-[10px] text-muted-foreground">
                    Displayed on video
                  </p>
                </div>
              </div>
              <Switch
                checked={config.visible}
                onCheckedChange={(checked) => updateConfig({ visible: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium">Invisible Watermark</span>
                  <p className="text-[10px] text-muted-foreground">
                    Hidden audio fingerprint
                  </p>
                </div>
              </div>
              <Switch
                checked={config.invisible}
                onCheckedChange={(checked) => updateConfig({ invisible: checked })}
              />
            </div>
          </div>

          {/* Visible Watermark Settings */}
          {config.visible && (
            <Tabs defaultValue="style" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="style" className="text-[10px]">Style</TabsTrigger>
                <TabsTrigger value="position" className="text-[10px]">Position</TabsTrigger>
                <TabsTrigger value="appearance" className="text-[10px]">Look</TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="space-y-2 mt-2">
                <label className="text-xs font-medium">Watermark Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["minimal", "standard", "prominent"] as const).map((style) => (
                    <Button
                      key={style}
                      variant={config.style === style ? "default" : "outline"}
                      size="sm"
                      className="text-[10px] h-8 capitalize"
                      onClick={() => updateConfig({ style })}
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="position" className="space-y-2 mt-2">
                <label className="text-xs font-medium">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["corner", "center", "bottom"] as const).map((pos) => (
                    <Button
                      key={pos}
                      variant={config.position === pos ? "default" : "outline"}
                      size="sm"
                      className="text-[10px] h-8 capitalize"
                      onClick={() => updateConfig({ position: pos })}
                    >
                      {pos}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-3 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Opacity</span>
                    <span>{config.opacity}%</span>
                  </div>
                  <Slider
                    value={[config.opacity]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(v) => updateConfig({ opacity: v[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Size</span>
                    <span>{config.size}px</span>
                  </div>
                  <Slider
                    value={[config.size]}
                    min={10}
                    max={40}
                    step={2}
                    onValueChange={(v) => updateConfig({ size: v[0] })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Preview</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                ) : (
                  <><Eye className="h-3 w-3 mr-1" /> Show</>
                )}
              </Button>
            </div>
            
            {showPreview && (
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="w-full rounded-lg border"
              />
            )}
          </div>

          {/* Fingerprint Section */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Fingerprint className="h-3 w-3" />
                Content Fingerprint
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Unique identifier embedded in your content for tracking and attribution.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {!fingerprint ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={generateFingerprint}
              >
                <Fingerprint className="h-3 w-3 mr-1" />
                Generate Fingerprint
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] bg-muted px-2 py-1 rounded truncate">
                    {fingerprint.id}
                  </code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyFingerprint}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={exportCertificate}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Certificate
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Attribution Chain */}
          {parentTrackIds.length > 0 && (
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary mb-1">Attribution Chain</p>
              <p className="text-[10px] text-muted-foreground">
                This mashup includes {parentTrackIds.length} source track{parentTrackIds.length !== 1 ? "s" : ""}.
                All creators will be credited.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
