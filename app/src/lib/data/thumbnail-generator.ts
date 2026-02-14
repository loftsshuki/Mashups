// Thumbnail Generator - Create mashup cover art from waveforms

export interface ThumbnailTemplate {
  id: string
  name: string
  background: "gradient" | "solid" | "image"
  backgroundColor?: string
  gradientColors?: string[]
  waveformStyle: "bars" | "line" | "circular" | "radial"
  waveformColor: string
  textLayout: "center" | "bottom" | "overlay"
  fontFamily: string
}

export interface ThumbnailOptions {
  width: number
  height: number
  title: string
  artist?: string
  waveformData?: number[]
  template?: ThumbnailTemplate
  customColors?: {
    primary: string
    secondary: string
    text: string
  }
}

export interface GeneratedThumbnail {
  id: string
  dataUrl: string
  blob: Blob
  width: number
  height: number
  createdAt: string
}

// Default templates
export const thumbnailTemplates: ThumbnailTemplate[] = [
  {
    id: "neon_nights",
    name: "Neon Nights",
    background: "gradient",
    gradientColors: ["#0f0c29", "#302b63", "#24243e"],
    waveformStyle: "bars",
    waveformColor: "#00d4ff",
    textLayout: "center",
    fontFamily: "Inter, sans-serif",
  },
  {
    id: "sunset_vibes",
    name: "Sunset Vibes",
    background: "gradient",
    gradientColors: ["#ff6b6b", "#feca57", "#48dbfb"],
    waveformStyle: "line",
    waveformColor: "#ffffff",
    textLayout: "bottom",
    fontFamily: "Georgia, serif",
  },
  {
    id: "minimal_dark",
    name: "Minimal Dark",
    background: "solid",
    backgroundColor: "#1a1a1a",
    waveformStyle: "circular",
    waveformColor: "#7c3aed",
    textLayout: "center",
    fontFamily: "Inter, sans-serif",
  },
  {
    id: "retro_wave",
    name: "Retro Wave",
    background: "gradient",
    gradientColors: ["#2d1b4e", "#764ba2", "#f093fb"],
    waveformStyle: "radial",
    waveformColor: "#ffd700",
    textLayout: "overlay",
    fontFamily: "Courier New, monospace",
  },
]

// Generate waveform data from audio buffer
export async function extractWaveformData(
  audioBuffer: AudioBuffer,
  numPoints: number = 100
): Promise<number[]> {
  const channelData = audioBuffer.getChannelData(0)
  const samplesPerPoint = Math.floor(channelData.length / numPoints)
  const waveform: number[] = []
  
  for (let i = 0; i < numPoints; i++) {
    let sum = 0
    const start = i * samplesPerPoint
    const end = Math.min(start + samplesPerPoint, channelData.length)
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j])
    }
    
    waveform.push(sum / samplesPerPoint)
  }
  
  // Normalize
  const max = Math.max(...waveform)
  return waveform.map(v => v / max)
}

// Generate thumbnail canvas
export async function generateThumbnail(
  options: ThumbnailOptions
): Promise<GeneratedThumbnail> {
  const { width, height, title, artist, waveformData, template, customColors } = options
  
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  
  const selectedTemplate = template || thumbnailTemplates[0]
  const colors = customColors || {
    primary: selectedTemplate.waveformColor,
    secondary: selectedTemplate.gradientColors?.[0] || "#333",
    text: "#ffffff",
  }
  
  // Draw background
  drawBackground(ctx, width, height, selectedTemplate)
  
  // Draw waveform
  if (waveformData) {
    drawWaveform(ctx, width, height, waveformData, selectedTemplate)
  }
  
  // Draw text
  drawText(ctx, width, height, title, artist, selectedTemplate, colors.text)
  
  // Convert to blob
  const dataUrl = canvas.toDataURL("image/png")
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95)
  })
  
  return {
    id: `thumb_${Date.now()}`,
    dataUrl,
    blob,
    width,
    height,
    createdAt: new Date().toISOString(),
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: ThumbnailTemplate
) {
  if (template.background === "gradient" && template.gradientColors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    template.gradientColors.forEach((color, index) => {
      gradient.addColorStop(index / (template.gradientColors!.length - 1), color)
    })
    ctx.fillStyle = gradient
  } else {
    ctx.fillStyle = template.backgroundColor || "#1a1a1a"
  }
  
  ctx.fillRect(0, 0, width, height)
  
  // Add subtle noise texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)"
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    ctx.fillRect(x, y, 2, 2)
  }
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: number[],
  template: ThumbnailTemplate
) {
  ctx.strokeStyle = template.waveformColor
  ctx.fillStyle = template.waveformColor + "40" // 25% opacity
  ctx.lineWidth = 2
  
  const centerY = height / 2
  
  switch (template.waveformStyle) {
    case "bars":
      drawBarsWaveform(ctx, width, height, data, centerY)
      break
    case "line":
      drawLineWaveform(ctx, width, height, data, centerY)
      break
    case "circular":
      drawCircularWaveform(ctx, width, height, data)
      break
    case "radial":
      drawRadialWaveform(ctx, width, height, data)
      break
  }
}

function drawBarsWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: number[],
  centerY: number
) {
  const barWidth = width / data.length * 0.8
  const gap = width / data.length * 0.2
  const maxBarHeight = height * 0.6
  
  data.forEach((value, index) => {
    const barHeight = value * maxBarHeight
    const x = index * (barWidth + gap) + gap / 2
    const y = centerY - barHeight / 2
    
    // Draw bar with rounded top
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
    ctx.fill()
  })
}

function drawLineWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: number[],
  centerY: number
) {
  ctx.beginPath()
  const stepX = width / (data.length - 1)
  const maxHeight = height * 0.4
  
  data.forEach((value, index) => {
    const x = index * stepX
    const y = centerY - value * maxHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Mirror for bottom
  ctx.beginPath()
  data.forEach((value, index) => {
    const x = index * stepX
    const y = centerY + value * maxHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

function drawCircularWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: number[]
) {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.25
  const maxAmplitude = Math.min(width, height) * 0.15
  
  ctx.beginPath()
  
  for (let i = 0; i <= data.length; i++) {
    const index = i % data.length
    const angle = (index / data.length) * Math.PI * 2 - Math.PI / 2
    const amplitude = data[index] * maxAmplitude
    const radius = baseRadius + amplitude
    
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.closePath()
  ctx.stroke()
  
  // Inner circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, baseRadius * 0.7, 0, Math.PI * 2)
  ctx.globalAlpha = 0.3
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawRadialWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: number[]
) {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.45
  
  // Draw multiple rings
  const rings = 3
  for (let ring = 0; ring < rings; ring++) {
    ctx.beginPath()
    const ringOffset = (ring / rings) * Math.PI
    
    for (let i = 0; i <= data.length; i++) {
      const index = i % data.length
      const angle = (index / data.length) * Math.PI * 2 + ringOffset
      const amplitude = data[index] * maxRadius * (1 - ring * 0.2)
      
      const x = centerX + Math.cos(angle) * amplitude
      const y = centerY + Math.sin(angle) * amplitude
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    ctx.globalAlpha = 1 - ring * 0.3
    ctx.stroke()
  }
  
  ctx.globalAlpha = 1
}

function drawText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  artist: string | undefined,
  template: ThumbnailTemplate,
  textColor: string
) {
  ctx.fillStyle = textColor
  ctx.textAlign = "center"
  ctx.font = `bold ${height * 0.08}px ${template.fontFamily}`
  
  let titleY: number
  let artistY: number
  
  switch (template.textLayout) {
    case "center":
      titleY = height / 2 + height * 0.05
      artistY = titleY + height * 0.1
      break
    case "bottom":
      titleY = height - height * 0.15
      artistY = titleY + height * 0.08
      break
    case "overlay":
      titleY = height * 0.15
      artistY = titleY + height * 0.08
      break
    default:
      titleY = height / 2
      artistY = titleY + height * 0.1
  }
  
  // Draw title shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
  ctx.fillText(title, width / 2 + 2, titleY + 2)
  
  // Draw title
  ctx.fillStyle = textColor
  ctx.fillText(title, width / 2, titleY)
  
  // Draw artist
  if (artist) {
    ctx.font = `${height * 0.04}px ${template.fontFamily}`
    ctx.globalAlpha = 0.8
    ctx.fillText(artist, width / 2, artistY)
    ctx.globalAlpha = 1
  }
}

// Social media size presets
export const socialMediaSizes = {
  youtube: { width: 1280, height: 720 },
  soundcloud: { width: 800, height: 800 },
  spotify: { width: 640, height: 640 },
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 },
  tiktok: { width: 1080, height: 1920 },
}

// Generate thumbnails for all platforms
export async function generatePlatformThumbnails(
  options: Omit<ThumbnailOptions, "width" | "height"> & { audioBuffer: AudioBuffer }
): Promise<Record<string, GeneratedThumbnail>> {
  const waveformData = await extractWaveformData(options.audioBuffer)
  
  const thumbnails: Record<string, GeneratedThumbnail> = {}
  
  for (const [platform, size] of Object.entries(socialMediaSizes)) {
    thumbnails[platform] = await generateThumbnail({
      ...options,
      width: size.width,
      height: size.height,
      waveformData,
    })
  }
  
  return thumbnails
}

// Download thumbnail
export function downloadThumbnail(thumbnail: GeneratedThumbnail, filename?: string) {
  const link = document.createElement("a")
  link.href = thumbnail.dataUrl
  link.download = filename || `mashup-cover-${thumbnail.id}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Mock waveform data for testing
export const mockWaveformData: number[] = Array.from({ length: 100 }, (_, i) => {
  // Create a pattern with some peaks
  const base = Math.sin(i / 10) * 0.3 + 0.5
  const peak = Math.sin(i / 5) * 0.2 * Math.exp(-Math.pow(i - 50, 2) / 500)
  return Math.max(0, Math.min(1, base + peak))
})
