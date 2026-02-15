# Thumbnail Generator - Backend Plan

**Priority:** P2  
**Timeline:** 1 week  
**Cost:** $0 (client-side) + storage

---

## Overview

Auto-generate cover art for mashups using waveform visualization and customizable templates. Runs entirely client-side for zero processing costs.

## Architecture

```
Audio Analysis (Web Audio API)
    │
    ▼
Generate Waveform Data
    │
    ▼
Canvas Rendering
    │
    ├─> Background (gradient/image)
    ├─> Waveform visualization
    ├─> Text overlay
    └─> Effects
    │
    ▼
Upload to Storage
```

## Templates

```typescript
// lib/thumbnails/templates.ts

export interface ThumbnailTemplate {
  id: string;
  name: string;
  background: {
    type: 'gradient' | 'solid' | 'image';
    colors?: string[];
    imageUrl?: string;
  };
  waveform: {
    color: string;
    style: 'bars' | 'line' | 'filled';
    position: 'center' | 'bottom' | 'top';
    height: number; // % of canvas
  };
  text: {
    titleColor: string;
    artistColor: string;
    titleFont: string;
    artistFont: string;
    titlePosition: { x: number; y: number };
    artistPosition: { x: number; y: number };
  };
  effects?: {
    blur?: number;
    grain?: boolean;
    vignette?: boolean;
  };
}

export const DEFAULT_TEMPLATES: ThumbnailTemplate[] = [
  {
    id: 'neon_wave',
    name: 'Neon Wave',
    background: {
      type: 'gradient',
      colors: ['#0a0a0a', '#1a1a2e', '#16213e']
    },
    waveform: {
      color: '#00d4ff',
      style: 'bars',
      position: 'center',
      height: 60
    },
    text: {
      titleColor: '#ffffff',
      artistColor: '#00d4ff',
      titleFont: 'bold 60px Inter',
      artistFont: '30px Inter',
      titlePosition: { x: 540, y: 150 },
      artistPosition: { x: 540, y: 200 }
    },
    effects: {
      grain: true
    }
  },
  {
    id: 'sunset_vibes',
    name: 'Sunset Vibes',
    background: {
      type: 'gradient',
      colors: ['#ff6b6b', '#feca57', '#ff9ff3']
    },
    waveform: {
      color: '#ffffff',
      style: 'filled',
      position: 'bottom',
      height: 40
    },
    text: {
      titleColor: '#2d3436',
      artistColor: '#636e72',
      titleFont: 'bold 70px Inter',
      artistFont: '35px Inter',
      titlePosition: { x: 540, y: 200 },
      artistPosition: { x: 540, y: 260 }
    },
    effects: {
      vignette: true
    }
  },
  {
    id: 'minimal_dark',
    name: 'Minimal Dark',
    background: {
      type: 'solid',
      colors: ['#121212']
    },
    waveform: {
      color: '#b3b3b3',
      style: 'line',
      position: 'center',
      height: 50
    },
    text: {
      titleColor: '#ffffff',
      artistColor: '#a0a0a0',
      titleFont: 'bold 80px Inter',
      artistFont: '40px Inter',
      titlePosition: { x: 540, y: 800 },
      artistPosition: { x: 540, y: 880 }
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    background: {
      type: 'gradient',
      colors: ['#0c0c0c', '#1a0033', '#330066']
    },
    waveform: {
      color: '#ff00ff',
      style: 'bars',
      position: 'center',
      height: 55
    },
    text: {
      titleColor: '#00ffff',
      artistColor: '#ff00ff',
      titleFont: 'bold 65px "Orbitron"',
      artistFont: '32px Inter',
      titlePosition: { x: 540, y: 180 },
      artistPosition: { x: 540, y: 230 }
    },
    effects: {
      grain: true,
      vignette: true
    }
  }
];
```

## Waveform Analysis

```typescript
// lib/thumbnails/waveform.ts

export async function extractWaveformData(
  audioBuffer: AudioBuffer,
  samples: number = 100
): Promise<number[]> {
  const channelData = audioBuffer.getChannelData(0); // Left channel
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let sum = 0;

    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j]);
    }

    waveform.push(sum / blockSize);
  }

  // Normalize to 0-1
  const max = Math.max(...waveform);
  return waveform.map(v => v / max);
}

// Alternative: Use Web Audio API AnalyserNode for real-time
export function createAnalyser(audioContext: AudioContext): AnalyserNode {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  return analyser;
}
```

## Canvas Renderer

```typescript
// lib/thumbnails/renderer.ts

export async function generateThumbnail(
  audioFile: File,
  template: ThumbnailTemplate,
  metadata: { title: string; artist: string }
): Promise<Blob> {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw background
  await drawBackground(ctx, template.background, canvas.width, canvas.height);

  // 2. Decode audio and extract waveform
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const waveform = await extractWaveformData(audioBuffer, 120);

  // 3. Draw waveform
  drawWaveform(ctx, waveform, template.waveform, canvas.width, canvas.height);

  // 4. Draw text
  drawText(ctx, metadata, template.text, canvas.width);

  // 5. Apply effects
  applyEffects(ctx, template.effects, canvas.width, canvas.height);

  // 6. Export
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
  });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  bg: ThumbnailTemplate['background'],
  width: number,
  height: number
) {
  if (bg.type === 'gradient' && bg.colors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    bg.colors.forEach((color, i) => {
      gradient.addColorStop(i / (bg.colors!.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'solid' && bg.colors) {
    ctx.fillStyle = bg.colors[0];
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'image' && bg.imageUrl) {
    // Load and draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = bg.imageUrl;
    ctx.drawImage(img, 0, 0, width, height);
  }
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  waveform: number[],
  config: ThumbnailTemplate['waveform'],
  width: number,
  height: number
) {
  ctx.fillStyle = config.color;
  ctx.strokeStyle = config.color;

  const barWidth = width / waveform.length;
  const maxBarHeight = (height * config.height) / 100;

  // Calculate Y position based on config.position
  let baseY: number;
  switch (config.position) {
    case 'top':
      baseY = maxBarHeight / 2;
      break;
    case 'bottom':
      baseY = height - maxBarHeight / 2;
      break;
    case 'center':
    default:
      baseY = height / 2;
  }

  for (let i = 0; i < waveform.length; i++) {
    const barHeight = waveform[i] * maxBarHeight;
    const x = i * barWidth;

    if (config.style === 'bars') {
      const y = baseY - barHeight / 2;
      const w = barWidth - 2; // Gap between bars
      ctx.fillRect(x, y, w, barHeight);
    } else if (config.style === 'line') {
      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, baseY - waveform[i] * maxBarHeight / 2);
      } else {
        ctx.lineTo(x, baseY - waveform[i] * maxBarHeight / 2);
      }
    } else if (config.style === 'filled') {
      const y = baseY - barHeight / 2;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  }

  if (config.style === 'line') {
    ctx.stroke();
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  metadata: { title: string; artist: string },
  config: ThumbnailTemplate['text'],
  width: number
) {
  ctx.textAlign = 'center';

  // Title
  ctx.font = config.titleFont;
  ctx.fillStyle = config.titleColor;
  ctx.fillText(metadata.title, config.titlePosition.x, config.titlePosition.y);

  // Artist
  ctx.font = config.artistFont;
  ctx.fillStyle = config.artistColor;
  ctx.fillText(metadata.artist, config.artistPosition.x, config.artistPosition.y);
}

function applyEffects(
  ctx: CanvasRenderingContext2D,
  effects: ThumbnailTemplate['effects'],
  width: number,
  height: number
) {
  if (!effects) return;

  if (effects.grain) {
    applyGrain(ctx, width, height);
  }

  if (effects.vignette) {
    applyVignette(ctx, width, height);
  }

  if (effects.blur) {
    // Canvas filter for blur
    ctx.filter = `blur(${effects.blur}px)`;
  }
}

function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.3,
    width / 2, height / 2, height * 0.8
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, 'rgba(0,0,0,0.5)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
```

## React Component

```tsx
// components/thumbnail/generator.tsx
import { useState, useRef, useCallback } from 'react';
import { generateThumbnail } from '@/lib/thumbnails/renderer';
import { DEFAULT_TEMPLATES } from '@/lib/thumbnails/templates';

interface ThumbnailGeneratorProps {
  audioFile: File;
  defaultTitle: string;
  defaultArtist: string;
  onGenerate: (url: string) => void;
}

export function ThumbnailGenerator({
  audioFile,
  defaultTitle,
  defaultArtist,
  onGenerate
}: ThumbnailGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0]);
  const [title, setTitle] = useState(defaultTitle);
  const [artist, setArtist] = useState(defaultArtist);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await generateThumbnail(audioFile, selectedTemplate, {
        title,
        artist
      });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      onGenerate(url);
    } finally {
      setIsGenerating(false);
    }
  }, [audioFile, selectedTemplate, title, artist, onGenerate]);

  return (
    <div className="space-y-4">
      {/* Template selector */}
      <div className="grid grid-cols-4 gap-2">
        {DEFAULT_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`p-2 rounded border ${
              selectedTemplate.id === template.id
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-700'
            }`}
          >
            <div
              className="w-full h-20 rounded"
              style={{
                background: template.background.type === 'gradient'
                  ? `linear-gradient(135deg, ${template.background.colors?.join(', ')})`
                  : template.background.colors?.[0]
              }}
            />
            <span className="text-xs mt-1 block">{template.name}</span>
          </button>
        ))}
      </div>

      {/* Text inputs */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 bg-slate-800 rounded"
      />
      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="w-full p-2 bg-slate-800 rounded"
      />

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          alt="Thumbnail preview"
          className="w-full rounded-lg"
        />
      )}

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={isGenerating}
        className="w-full py-2 bg-cyan-500 rounded disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Thumbnail'}
      </button>
    </div>
  );
}
```

## Storage

```typescript
// lib/thumbnails/storage.ts
import { put } from '@vercel/blob';

export async function uploadThumbnail(
  mashupId: string,
  thumbnailBlob: Blob
): Promise<string> {
  const filename = `thumbnails/${mashupId}/cover.png`;

  const blob = await put(filename, thumbnailBlob, {
    contentType: 'image/png',
    access: 'public'
  });

  return blob.url;
}
```

## API Endpoint

```typescript
// app/api/mashups/:id/thumbnail/route.ts

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get mashup audio
  const { data: mashup } = await supabase
    .from('mashups')
    .select('audio_url, title, user_id')
    .eq('id', params.id)
    .single();

  if (!mashup) {
    return Response.json({ error: 'Mashup not found' }, { status: 404 });
  }

  if (mashup.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Return upload URL (thumbnail generated client-side)
  const { url } = await createUploadUrl(`thumbnails/${params.id}/cover.png`);

  return Response.json({ uploadUrl: url });
}
```

## Cost

| Component | Cost |
|-----------|------|
| Processing | $0 (client-side) |
| Storage | ~$0.01 per 100 thumbnails |
| **Total** | **~$0.10-1/month** |

---

*Next: Remix Loader*