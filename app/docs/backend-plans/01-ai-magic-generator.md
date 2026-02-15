# AI Magic Generator - Backend Plan

**Status:** Reference: `Audio Processing Backend Plan.md`  
**Priority:** P0 - Critical  
**Timeline:** 8 weeks  
**Cost:** $50-100/month

---

## Overview

The AI Magic Generator automatically creates mashups from uploaded tracks using AI-powered stem separation and audio processing.

## Architecture

```
Upload
    │
    ▼
Validate (size, format)
    │
    ▼
Queue Job (Bull + Redis)
    │
    ▼
Worker Node (separate server)
    ├─> Demucs: Separate stems
    ├─> FFmpeg: Process audio
    ├─> AI Analysis: Match/align
    └─> Mixdown
    │
    ▼
Upload to Storage
    │
    ▼
Notify Client (WebSocket)
```

## API Endpoints

### Start Generation
```typescript
POST /api/mashup/ai/generate
Content-Type: multipart/form-data

Body:
  - tracks: File[] (1-4 audio files)
  - vibe: 'energetic' | 'chill' | 'dark' | 'upbeat'
  - stemSettings?: { vocals: boolean, drums: boolean, ... }

Response:
{
  "jobId": "uuid",
  "status": "queued",
  "estimatedDuration": 120, // seconds
  "position": 3 // queue position
}
```

### Check Status
```typescript
GET /api/mashup/ai/:jobId/status

Response:
{
  "jobId": "uuid",
  "status": "queued" | "processing" | "completed" | "failed",
  "progress": 45, // 0-100
  "currentStep": "separating_stems" | "analyzing" | "mixing" | "mastering",
  "outputUrl"?: "https://...",
  "stems"?: [
    { "type": "vocals", "url": "..." },
    { "type": "drums", "url": "..." },
    ...
  ],
  "error"?: "Error message"
}
```

### Download Result
```typescript
GET /api/mashup/ai/:jobId/download

Response: 302 Redirect to signed URL
```

## Database Schema

```sql
-- AI Generation Jobs
CREATE TABLE ai_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  status text CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  
  -- Input
  input_tracks jsonb, -- [{ filename, originalName, duration }]
  vibe text,
  
  -- Output
  output_url text,
  stems jsonb, -- [{ type, url }]
  
  -- Processing
  worker_id text,
  started_at timestamp,
  completed_at timestamp,
  error_message text,
  
  -- Metadata
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index for user lookups
CREATE INDEX idx_ai_jobs_user ON ai_generation_jobs(user_id, created_at DESC);
```

## Worker Implementation

```typescript
// workers/audio-processor.ts
import { Queue, Worker } from 'bullmq';
import { demucs } from '../lib/audio/demucs';
import { ffmpeg } from '../lib/audio/ffmpeg';

const queue = new Queue('audio-processing', { connection: redis });

const worker = new Worker('audio-processing', async (job) => {
  const { tracks, vibe, jobId } = job.data;
  
  // Update status
  await updateJobStatus(jobId, 'processing', 0, 'separating_stems');
  
  // Step 1: Separate stems for each track
  const stems = await Promise.all(
    tracks.map(async (track) => {
      const result = await demucs.separate(track.path);
      return {
        trackId: track.id,
        vocals: result.vocals,
        drums: result.drums,
        bass: result.bass,
        other: result.other
      };
    })
  );
  
  await updateJobStatus(jobId, 'processing', 33, 'analyzing');
  
  // Step 2: Analyze and match
  const analysis = await analyzeStems(stems);
  
  await updateJobStatus(jobId, 'processing', 66, 'mixing');
  
  // Step 3: Mix based on vibe
  const mix = await createMix(stems, analysis, vibe);
  
  await updateJobStatus(jobId, 'processing', 90, 'mastering');
  
  // Step 4: Master
  const mastered = await ffmpeg.master(mix);
  
  // Upload to storage
  const outputUrl = await uploadToStorage(mastered, jobId);
  
  await updateJobStatus(jobId, 'completed', 100, null, outputUrl);
  
  return { outputUrl };
  
}, { connection: redis, concurrency: 2 });

async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  step: string | null,
  outputUrl?: string
) {
  await supabase
    .from('ai_generation_jobs')
    .update({ status, progress, current_step: step, output_url: outputUrl })
    .eq('id', jobId);
}
```

## Docker Configuration

```dockerfile
# Dockerfile.worker
FROM nvidia/cuda:12.0-runtime-ubuntu22.04

# Install Python, FFmpeg, Node.js
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Install Demucs
RUN pip3 install demucs

# Install Node dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy worker code
COPY workers/ ./workers/
COPY lib/ ./lib/

# Start worker
CMD ["node", "workers/audio-processor.js"]
```

## Environment Variables

```bash
# Redis
REDIS_URL=redis://localhost:6379

# Storage
BLOB_READ_WRITE_TOKEN=xxx

# Processing
MAX_CONCURRENT_JOBS=2
MAX_FILE_SIZE=50MB
SUPPORTED_FORMATS=mp3,wav,flac,m4a

# GPU (if available)
CUDA_VISIBLE_DEVICES=0
```

## Cost Breakdown

| Resource | Usage | Cost |
|----------|-------|------|
| Worker Server (GPU) | 1-2 instances | $100-200/month |
| Storage | ~1GB per 100 mashups | $20/month |
| Redis | Queue management | $10/month |
| Bandwidth | Downloads | $10-20/month |
| **Total** | | **$140-250/month** |

## Testing

```typescript
// tests/ai-mashup.test.ts
describe('AI Magic Generator', () => {
  it('should queue and process a mashup', async () => {
    const response = await request(app)
      .post('/api/mashup/ai/generate')
      .attach('tracks', 'test/fixtures/track1.mp3')
      .attach('tracks', 'test/fixtures/track2.mp3')
      .field('vibe', 'energetic');
    
    expect(response.status).toBe(200);
    expect(response.body.jobId).toBeDefined();
    
    // Wait for completion
    const job = await waitForJob(response.body.jobId);
    expect(job.status).toBe('completed');
    expect(job.outputUrl).toBeDefined();
  });
});
```

## Monitoring

```typescript
// Track key metrics
- Queue length
- Processing time (p50, p95, p99)
- Success/failure rate
- GPU utilization
- Storage usage
```

---

*See also: `../Audio Processing Backend Plan.md` for detailed 8-week implementation schedule*