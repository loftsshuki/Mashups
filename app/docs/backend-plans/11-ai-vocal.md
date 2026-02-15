# AI Vocal Generation - Backend Plan

**Priority:** P2  
**Timeline:** 2 weeks  
**Cost:** Variable (per-use)

---

## Overview

Generate original vocals using AI for mashup tracks. Includes text-to-singing and voice cloning capabilities.

## Technology Options

| Service | Capability | Quality | Cost |
|---------|------------|---------|------|
| **Suno AI** | Full songs + vocals | Excellent | $10/mo + usage |
| **Uberduck** | Rap vocals, TTS | Good | Free tier + $10/mo |
| **ElevenLabs** | Voice cloning, TTS | Excellent | $5/mo + usage |
| **Replicate (RVC)** | Voice conversion | Good | Per-use (~$0.01) |
| **Bark (local)** | Text-to-speech | Good | Infrastructure cost |

## Architecture

```
Lyrics + Style Selection
    │
    ▼
Queue Job
    │
    ▼
AI Generation (Suno/ElevenLabs/Replicate)
    │
    ▼
Process Result
    │
    ▼
Store + Serve
```

## Database Schema

```sql
-- AI Vocal Generation Jobs
CREATE TABLE ai_vocal_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  
  -- Input
  lyrics text NOT NULL,
  style text, -- 'rap', 'singing', 'spoken', 'custom'
  voice_id text, -- Provider-specific voice ID
  reference_audio_url text, -- For voice cloning
  
  -- Output
  status text CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  audio_url text,
  duration numeric,
  
  -- Provider info
  provider text, -- 'suno', 'elevenlabs', 'replicate'
  external_job_id text,
  
  -- Metadata
  credits_used integer DEFAULT 0,
  error_message text,
  
  created_at timestamp DEFAULT now(),
  completed_at timestamp
);

-- Voice presets
CREATE TABLE voice_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  voice_id text NOT NULL,
  preview_url text,
  tags text[], -- ['male', 'energetic', 'rap']
  is_premium boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_vocal_jobs_user ON ai_vocal_jobs(user_id, created_at DESC);
```

## API Endpoints

### Generate Vocal
```typescript
POST /api/ai/vocals/generate

Body:
{
  "lyrics": "Verse 1:\nI'm walking down the street...",
  "style": "rap",
  "voiceId": "preset_rap_male_1",
  "tempo"?: 120,
  "key"?: "C minor"
}

Response:
{
  "jobId": "uuid",
  "status": "queued",
  "estimatedTime": 60
}
```

### Check Status
```typescript
GET /api/ai/vocals/:jobId

Response:
{
  "jobId": "uuid",
  "status": "completed",
  "audioUrl": "https://...",
  "duration": 45.5,
  "waveform": [0.1, 0.3, 0.8, ...] // Optional
}
```

### List Voice Presets
```typescript
GET /api/ai/vocals/presets?style=rap

Response:
{
  "presets": [
    {
      "id": "preset_rap_male_1",
      "name": "MC Flow",
      "provider": "elevenlabs",
      "previewUrl": "...",
      "tags": ["male", "energetic", "rap"]
    }
  ]
}
```

### Clone Voice
```typescript
POST /api/ai/vocals/clone

Body:
{
  "name": "My Voice",
  "sampleAudio": File // 1-5 min sample
}

Response:
{
  "voiceId": "custom_voice_123",
  "status": "training",
  "estimatedTime": 300 // 5 minutes
}
```

## Implementation

### Suno Integration

```typescript
// lib/ai/vocals/suno.ts

const SUNO_API_KEY = process.env.SUNO_API_KEY;

export async function generateWithSuno(params: {
  lyrics: string;
  style: string;
  title?: string;
}): Promise<VocalResult> {
  // Suno doesn't have official API yet
  // Using unofficial/reverse-engineered approach
  // Or wait for official API release
  
  const response = await fetch('https://studio-api.suno.ai/api/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: params.lyrics,
      style: params.style,
      title: params.title || 'Untitled'
    })
  });

  const data = await response.json();
  
  return {
    jobId: data.id,
    status: 'processing'
  };
}

export async function checkSunoStatus(jobId: string): Promise<VocalResult> {
  const response = await fetch(`https://studio-api.suno.ai/api/generate/${jobId}`);
  const data = await response.json();

  return {
    jobId,
    status: data.status,
    audioUrl: data.audio_url,
    duration: data.duration
  };
}
```

### ElevenLabs Integration

```typescript
// lib/ai/vocals/elevenlabs.ts
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

export async function generateWithElevenLabs(params: {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
}): Promise<VocalResult> {
  const audio = await elevenlabs.generate({
    voice: params.voiceId,
    text: params.text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: params.stability || 0.5,
      similarity_boost: params.similarityBoost || 0.75
    }
  });

  // Upload to storage
  const url = await uploadAudio(audio);
  
  return {
    audioUrl: url,
    duration: await getDuration(url),
    status: 'completed'
  };
}

export async function cloneVoice(params: {
  name: string;
  samples: Buffer[];
}): Promise<string> {
  const voice = await elevenlabs.voices.add({
    name: params.name,
    files: params.samples.map((s, i) => ({
      name: `sample_${i}.mp3`,
      data: s
    }))
  });

  return voice.voice_id;
}
```

### Replicate (RVC) Integration

```typescript
// lib/ai/vocals/replicate.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export async function generateWithReplicate(params: {
  lyrics: string;
  voiceUrl?: string; // Reference voice
}): Promise<VocalResult> {
  const output = await replicate.run(
    "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11ac716833f1ca8b29e9b640b",
    {
      input: {
        prompt: params.lyrics,
        history_prompt: params.voiceUrl || 'v2/en_speaker_6',
        temperature: 0.7
      }
    }
  );

  return {
    audioUrl: output,
    status: 'completed'
  };
}
```

## Unified Service

```typescript
// lib/ai/vocals/service.ts

interface VocalGenerationParams {
  lyrics: string;
  style: string;
  voiceId?: string;
  provider?: 'suno' | 'elevenlabs' | 'replicate';
}

export class VocalGenerationService {
  async generate(
    userId: string,
    params: VocalGenerationParams
  ): Promise<{ jobId: string }> {
    // Check user credits
    const hasCredits = await checkCredits(userId, 'vocal_generation');
    if (!hasCredits) {
      throw new Error('Insufficient credits');
    }

    // Select provider
    const provider = params.provider || this.selectProvider(params);

    // Create job
    const { data: job } = await supabase
      .from('ai_vocal_jobs')
      .insert({
        user_id: userId,
        lyrics: params.lyrics,
        style: params.style,
        voice_id: params.voiceId,
        provider,
        status: 'queued'
      })
      .select()
      .single();

    // Queue for processing
    await vocalQueue.add('generate', {
      jobId: job.id,
      provider,
      params
    });

    return { jobId: job.id };
  }

  private selectProvider(params: VocalGenerationParams): string {
    // Smart provider selection
    if (params.style === 'rap') return 'uberduck';
    if (params.voiceId?.startsWith('custom_')) return 'elevenlabs';
    return 'replicate'; // Default
  }
}
```

## Cost Breakdown

| Provider | Cost | Notes |
|----------|------|-------|
| ElevenLabs | $5/mo + $0.10/1000 chars | Best quality |
| Suno | ~$8-10 for 500 songs | Full songs |
| Uberduck | Free tier + $9.99/mo | Rap focused |
| Replicate | ~$0.001-0.01 per gen | Pay per use |
| **Est. Monthly** | **$20-100** | Depends on usage |

---

*Next: Gamification System*