# Auto-Caption Generator - Backend Plan

**Priority:** P0  
**Timeline:** 1-2 weeks  
**Cost:** ~$0.006 per minute

---

## Overview

Automatically generate subtitles/captions for mashups using OpenAI Whisper API.

## Architecture

```
Audio File
    │
    ▼
Upload to Storage
    │
    ▼
Transcribe (Whisper API)
    │
    ▼
Format (SRT/VTT/JSON)
    │
    ▼
Store in Database
    │
    ▼
Serve via API
```

## API Endpoints

### Generate Captions
```typescript
POST /api/captions/generate

Body:
{
  "mashupId": "uuid",
  "language"?: "en" | "es" | "fr" | "auto", // default: "auto"
  "format": "all" | "srt" | "vtt" | "json" // default: "all"
}

Response:
{
  "jobId": "uuid",
  "status": "processing",
  "estimatedTime": 30 // seconds
}
```

### Check Status
```typescript
GET /api/captions/jobs/:jobId

Response:
{
  "jobId": "uuid",
  "status": "completed",
  "captions": {
    "language": "en",
    "confidence": 0.95,
    "segments": [
      {
        "id": 1,
        "start": 0.0,
        "end": 3.5,
        "text": "Hello and welcome"
      }
    ],
    "formats": {
      "srt": "https://.../captions.srt",
      "vtt": "https://.../captions.vtt",
      "json": "https://.../captions.json",
      "txt": "https://.../captions.txt"
    }
  }
}
```

### Get Captions
```typescript
GET /api/mashups/:id/captions?format=srt

Response: SRT file content
```

## Database Schema

```sql
-- Captions table
CREATE TABLE captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  
  -- Transcription
  language text,
  confidence numeric,
  segments jsonb, -- [{ id, start, end, text }]
  full_text text,
  
  -- File URLs
  srt_url text,
  vtt_url text,
  txt_url text,
  json_url text,
  
  -- Metadata
  generated_by text DEFAULT 'whisper-1',
  word_count integer,
  duration_seconds numeric,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_captions_mashup ON captions(mashup_id);
```

## Implementation

```typescript
// lib/captions/generate.ts
import { OpenAI } from 'openai';
import { put } from '@vercel/blob';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CaptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface CaptionResult {
  segments: CaptionSegment[];
  language: string;
  text: string;
  srt: string;
  vtt: string;
}

export async function generateCaptions(
  audioUrl: string,
  language?: string
): Promise<CaptionResult> {
  // Download audio
  const audioResponse = await fetch(audioUrl);
  const audioBuffer = await audioResponse.arrayBuffer();

  // Call Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language: language !== 'auto' ? language : undefined
  });

  // Format segments
  const segments: CaptionSegment[] = transcription.segments?.map((s, i) => ({
    id: i + 1,
    start: s.start,
    end: s.end,
    text: s.text.trim()
  })) || [];

  // Generate formats
  const srt = toSRT(segments);
  const vtt = toVTT(segments);

  return {
    segments,
    language: transcription.language,
    text: transcription.text,
    srt,
    vtt
  };
}

// Convert to SRT format
function toSRT(segments: CaptionSegment[]): string {
  return segments.map(s => (
    `${s.id}\n` +
    `${formatTime(s.start)} --> ${formatTime(s.end)}\n` +
    `${s.text}\n`
  )).join('\n');
}

// Convert to WebVTT format
function toVTT(segments: CaptionSegment[]): string {
  const header = 'WEBVTT\n\n';
  const body = segments.map(s => (
    `${formatTimeVTT(s.start)} --> ${formatTimeVTT(s.end)}\n` +
    `${s.text}\n`
  )).join('\n');
  return header + body;
}

// Format time as HH:MM:SS,mmm (SRT)
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

// Format time as HH:MM:SS.mmm (VTT)
function formatTimeVTT(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

function pad(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}
```

## Upload Handler

```typescript
// lib/captions/storage.ts
import { put } from '@vercel/blob';

export async function storeCaptions(
  mashupId: string,
  captions: CaptionResult
): Promise<{ srtUrl: string; vttUrl: string; txtUrl: string; jsonUrl: string }> {
  const prefix = `captions/${mashupId}`;

  const [srtBlob, vttBlob, txtBlob, jsonBlob] = await Promise.all([
    put(`${prefix}/captions.srt`, captions.srt, {
      contentType: 'text/srt',
      access: 'public'
    }),
    put(`${prefix}/captions.vtt`, captions.vtt, {
      contentType: 'text/vtt',
      access: 'public'
    }),
    put(`${prefix}/captions.txt`, captions.text, {
      contentType: 'text/plain',
      access: 'public'
    }),
    put(`${prefix}/captions.json`, JSON.stringify(captions.segments, null, 2), {
      contentType: 'application/json',
      access: 'public'
    })
  ]);

  return {
    srtUrl: srtBlob.url,
    vttUrl: vttBlob.url,
    txtUrl: txtBlob.url,
    jsonUrl: jsonBlob.url
  };
}
```

## API Route

```typescript
// app/api/captions/generate/route.ts
import { generateCaptions } from '@/lib/captions/generate';
import { storeCaptions } from '@/lib/captions/storage';

export async function POST(req: Request) {
  const { mashupId, language = 'auto' } = await req.json();

  // Get mashup audio URL
  const { data: mashup } = await supabase
    .from('mashups')
    .select('audio_url')
    .eq('id', mashupId)
    .single();

  if (!mashup) {
    return Response.json({ error: 'Mashup not found' }, { status: 404 });
  }

  // Generate captions
  const captions = await generateCaptions(mashup.audio_url, language);

  // Store files
  const urls = await storeCaptions(mashupId, captions);

  // Save to database
  await supabase.from('captions').upsert({
    mashup_id: mashupId,
    language: captions.language,
    confidence: 0.95, // Whisper doesn't provide this directly
    segments: captions.segments,
    full_text: captions.text,
    srt_url: urls.srtUrl,
    vtt_url: urls.vttUrl,
    txt_url: urls.txtUrl,
    json_url: urls.jsonUrl,
    word_count: captions.text.split(' ').length
  });

  return Response.json({
    success: true,
    captions: {
      language: captions.language,
      formats: urls
    }
  });
}
```

## Player Integration

```tsx
// components/player/captions-track.tsx
interface CaptionsTrackProps {
  vttUrl: string;
  isVisible: boolean;
}

export function CaptionsTrack({ vttUrl, isVisible }: CaptionsTrackProps) {
  if (!isVisible) return null;

  return (
    <track
      kind="subtitles"
      src={vttUrl}
      srcLang="en"
      label="English"
      default
    />
  );
}
```

## Cost Calculation

| Usage | Cost |
|-------|------|
| 100 x 3-min mashups | $1.80 |
| 1000 x 3-min mashups | $18.00 |
| Storage (per 1000) | ~$0.50 |
| **Monthly (1000 mashups)** | **~$18.50** |

## Supported Languages

Whisper supports 99 languages. Auto-detection works well for most cases.

---

*Next: Battle System*