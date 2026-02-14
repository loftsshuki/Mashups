"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SpectralWaveformProps {
  audioBuffer?: AudioBuffer
  url?: string
  width?: number
  height?: number
  className?: string
  showFrequencyLegend?: boolean
  colorScheme?: "heatmap" | "aurora" | "fire"
}

// Frequency-to-color mapping for heatmap
function getHeatmapColor(frequency: number, amplitude: number): string {
  const normalizedFreq = Math.min(1, frequency / 8000)
  const hue = (1 - normalizedFreq) * 240
  const saturation = 70 + (amplitude / 255) * 30
  const lightness = 30 + (amplitude / 255) * 40
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function getAuroraColor(frequency: number, amplitude: number): string {
  const normalizedFreq = frequency / 8000
  const normalizedAmp = amplitude / 255
  
  if (normalizedFreq < 0.33) {
    return `hsl(${260 + normalizedAmp * 40}, ${80}%, ${30 + normalizedAmp * 30}%)`
  } else if (normalizedFreq < 0.66) {
    return `hsl(${120 + normalizedAmp * 60}, ${85}%, ${35 + normalizedAmp * 35}%)`
  } else {
    return `hsl(${30 + normalizedAmp * 300}, ${90}%, ${40 + normalizedAmp * 30}%)`
  }
}

function getFireColor(frequency: number, amplitude: number): string {
  const normalizedAmp = amplitude / 255
  
  if (normalizedAmp < 0.3) {
    return `hsl(240, 40%, ${20 + normalizedAmp * 40}%)`
  } else if (normalizedAmp < 0.6) {
    return `hsl(${240 - (normalizedAmp - 0.3) * 300}, 70%, ${50 + normalizedAmp * 20}%)`
  } else {
    return `hsl(${10 + (normalizedAmp - 0.6) * 30}, 100%, ${50 + normalizedAmp * 25}%)`
  }
}

export function SpectralWaveform({
  audioBuffer,
  url,
  width = 800,
  height = 200,
  className,
  showFrequencyLegend = true,
  colorScheme = "heatmap",
}: SpectralWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function renderSpectralWaveform() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      setIsLoading(true)
      setError(null)

      try {
        let buffer = audioBuffer

        if (!buffer && url) {
          const response = await fetch(url)
          const arrayBuffer = await response.arrayBuffer()
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          buffer = await audioContext.decodeAudioData(arrayBuffer)
        }

        if (!buffer) {
          renderPlaceholder(ctx, width, height)
          setIsLoading(false)
          return
        }

        const channelData = buffer.getChannelData(0)
        const numBands = 32
        const samplesPerPixel = Math.floor(buffer.length / width)
        
        const imgData = ctx.createImageData(width, height)
        const data = imgData.data

        for (let x = 0; x < width; x++) {
          const sampleOffset = x * samplesPerPixel
          
          for (let band = 0; band < numBands; band++) {
            const freqStart = (band / numBands) * (buffer.sampleRate / 2)
            const freqEnd = ((band + 1) / numBands) * (buffer.sampleRate / 2)
            
            let energy = 0
            let sampleCount = 0
            
            for (let i = 0; i < samplesPerPixel && sampleOffset + i < channelData.length; i++) {
              const sample = Math.abs(channelData[sampleOffset + i])
              energy += sample
              sampleCount++
            }
            
            energy = energy / sampleCount
            const normalizedEnergy = Math.min(1, energy * 5)
            
            const freq = (freqStart + freqEnd) / 2
            let color: string
            
            switch (colorScheme) {
              case "aurora":
                color = getAuroraColor(freq, normalizedEnergy * 255)
                break
              case "fire":
                color = getFireColor(freq, normalizedEnergy * 255)
                break
              case "heatmap":
              default:
                color = getHeatmapColor(freq, normalizedEnergy * 255)
            }
            
            const hslMatch = color.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/)
            
            if (hslMatch) {
              const h = parseFloat(hslMatch[1])
              const s = parseFloat(hslMatch[2])
              const l = parseFloat(hslMatch[3])
              const [r, g, b] = hslToRgb(h / 360, s / 100, l / 100)
              
              const bandHeight = height / numBands
              const yStart = Math.floor((numBands - 1 - band) * bandHeight)
              const yEnd = Math.floor((numBands - band) * bandHeight)
              
              for (let y = yStart; y < yEnd; y++) {
                const idx = (y * width + x) * 4
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = b
                data[idx + 3] = 255
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0)
        
        if (showFrequencyLegend) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
          ctx.font = "10px sans-serif"
          ctx.textAlign = "right"
          
          const freqs = ["20Hz", "100Hz", "500Hz", "1kHz", "4kHz", "8kHz"]
          const nyquist = buffer.sampleRate / 2
          
          freqs.forEach(freqLabel => {
            const freq = parseFrequency(freqLabel)
            const y = height - (freq / nyquist) * height
            ctx.fillText(freqLabel, width - 5, y + 3)
          })
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error rendering spectral waveform:", err)
        setError("Failed to analyze audio")
        renderPlaceholder(ctx, width, height)
        setIsLoading(false)
      }
    }

    renderSpectralWaveform()
  }, [audioBuffer, url, width, height, colorScheme, showFrequencyLegend])

  function renderPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, "#1e3a5f")
    gradient.addColorStop(0.5, "#0d2137")
    gradient.addColorStop(1, "#1e3a5f")
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)"
    for (let i = 0; i < 50; i++) {
      const x = (i / 50) * w
      const barHeight = Math.random() * h * 0.8
      ctx.fillRect(x, (h - barHeight) / 2, w / 50 - 2, barHeight)
    }
  }

  function parseFrequency(label: string): number {
    if (label.endsWith("kHz")) {
      return parseFloat(label) * 1000
    }
    if (label.endsWith("Hz")) {
      return parseFloat(label)
    }
    return 0
  }

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-md"
        style={{ width, height }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <div className="text-sm text-muted-foreground">Analyzing spectrum...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}
    </div>
  )
}

export function SpectralIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 h-4", className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full"
          style={{
            height: `${20 + Math.random() * 80}%`,
            background: `hsl(${240 - i * 20}, 70%, 50%)`,
          }}
        />
      ))}
    </div>
  )
}
