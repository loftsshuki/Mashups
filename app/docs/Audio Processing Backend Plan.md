# Audio Processing Backend Plan
## AI Magic Generator - Real Implementation

**Objective:** Build a production-ready backend that can actually process, mix, and generate mashups from uploaded audio files.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  API Route       │────▶│  Job Queue      │
│   (Frontend)    │     │  /api/mashup/ai  │     │  (Redis/Bull)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  Worker Process  │
                                               │  (ffmpeg/Tone.js)│
                                               └──────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  Object Storage  │
                                               │  (S3/Vercel Blob)│
                                               └──────────────────┘
```

---

## 🎯 Tech Stack Options

### Option 1: Node.js + FFmpeg (Recommended)
**Best for:** Full control, cost-effective, scalable

| Component | Technology | Purpose |
|-----------|------------|---------|
| API Server | Next.js API Routes + Edge | Request handling, auth |
| Queue | Bull + Redis | Job queue, retries |
| Worker | Node.js + FFmpeg | Audio processing |
| Storage | Vercel Blob / S3 | File storage |
| Database | Supabase | Metadata, job status |

**Pros:**
- Full control over processing
- Can run on existing infrastructure
- Cost-effective at scale

**Cons:**
- Need to manage worker processes
- FFmpeg has learning curve

---

### Option 2: Serverless Functions + Replicate
**Best for:** Quick implementation, no infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| API | Next.js API Routes | Request handling |
| Processing | Replicate API | AI audio generation |
| Storage | Vercel Blob | File storage |
| Queue | Inngest / QStash | Job orchestration |

**Pros:**
- No worker management
- AI-powered results
- Scales automatically

**Cons:**
- Higher per-mashup cost (~$0.10-0.50)
- Less control over output
- Dependency on third-party service

---

### Option 3: Web Audio API (Client-Side)
**Best for:** Instant feedback, privacy, zero server cost

| Component | Technology | Purpose |
|-----------|------------|---------|
| Processing | Tone.js + Web Audio API | Browser-based mixing |
| Export | Recorder.js / MediaRecorder | Output generation |
| Storage | User's device | Local downloads |

**Pros:**
- Instant results
- Zero server costs
- Private (files stay local)

**Cons:**
- Limited by browser performance
- Can't process large files
- No server-side storage

---

## 🎵 Audio Processing Pipeline

### Phase 1: Upload & Analysis (1-2 seconds)
```
User Uploads Files
    │
    ▼
┌─────────────────┐
│ 1. Validate     │ ◄── Check format, size, duration
│    Files        │     (MP3/WAV, <50MB, <5min)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ 2. Extract      │ ◄── Use ffmpeg to get:
│    Metadata     │     BPM, key, duration, waveform
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ 3. Beat-matching│ ◄── Analyze beat grids, find
│                 │     compatible transition points
└─────────────────┘
    │
    ▼
Storage ──▶ Save to blob storage, store metadata in DB
```

**Implementation:**
```typescript
// lib/audio/analysis.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function analyzeAudio(filePath: string) {
  // Get BPM
  const { stdout: bpmOut } = await execAsync(
    `ffmpeg -i ${filePath} -af "ebur128=peak=true" -f null - 2>&1 | grep "Stream #0"`
  );
  
  // Get duration
  const { stdout: durationOut } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`
  );
  
  // Extract key using aubio or similar
  const { stdout: keyOut } = await execAsync(
    `aubio pitch ${filePath} | head -1`
  );
  
  return {
    bpm: parseFloat(bpmOut),
    duration: parseFloat(durationOut),
    key: detectKey(keyOut),
    waveform: await generateWaveform(filePath),
  };
}
```

---

### Phase 2: Stem Separation (5-10 seconds)
```
Upload Complete
    │
    ▼
┌─────────────────┐
│ Demucs/Spleeter │ ◄── Separate into:
│ Separation      │     Vocals, Drums, Bass, Other
└─────────────────┘
    │
    ▼
Storage ──▶ Save stems as separate files
```

**Options:**
1. **Demucs (Meta)** - Best quality, open source
2. **Spleeter (Deezer)** - Fast, good quality
3. **Replicate API** - No setup, pay per use

**Implementation:**
```typescript
// lib/audio/stem-separation.ts
import { exec } from 'child_process';

export async function separateStems(inputPath: string, outputDir: string) {
  // Using Demucs
  await execAsync(
    `demucs --two-stems=vocals ${inputPath} -o ${outputDir}`
  );
  
  return {
    vocals: `${outputDir}/vocals.wav`,
    drums: `${outputDir}/drums.wav`,
    bass: `${outputDir}/bass.wav`,
    other: `${outputDir}/other.wav`,
  };
}
```

---

### Phase 3: Mashup Generation (10-30 seconds)
```
Stems Ready
    │
    ▼
┌─────────────────┐
│ Apply User      │ ◄── Vibe preset, intensity,
│ Preferences     │     transition style
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Generate        │ ◄── Create segments based on
│ Mashup Plan     │     beat-matching analysis
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Mix Audio       │ ◄── Use ffmpeg to concatenate
│                 │     and mix segments
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Apply Mastering │ ◄── Normalize, EQ, compression
│                 │
└─────────────────┘
    │
    ▼
Storage ──▶ Save final mashup
```

**Implementation:**
```typescript
// lib/audio/mashup-generator.ts
import ffmpeg from 'fluent-ffmpeg';

interface MashupSegment {
  sourceTrack: string;
  stem: 'vocals' | 'drums' | 'bass' | 'other';
  startTime: number;
  duration: number;
  effects: string[];
}

export async function generateMashup(
  segments: MashupSegment[],
  config: MashupConfig,
  outputPath: string
) {
  const command = ffmpeg();
  
  // Add each segment
  for (const segment of segments) {
    const inputFile = getStemPath(segment.sourceTrack, segment.stem);
    
    command
      .input(inputFile)
      .seekInput(segment.startTime)
      .duration(segment.duration);
    
    // Apply effects based on config
    if (segment.effects.includes('reverb')) {
      command.audioFilter('aecho=0.8:0.9:1000:0.3');
    }
    if (config.intensity > 75) {
      command.audioFilter('acompressor');
    }
  }
  
  // Mix and output
  return new Promise((resolve, reject) => {
    command
      .complexFilter([
        // Mix all inputs
        '[0:a][1:a][2:a][3:a]amix=inputs=4:duration=longest[out]'
      ])
      .map('[out]')
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });
}
```

---

## 📡 API Design

### Endpoints

```typescript
// POST /api/mashup/ai
// Start a new AI mashup generation
{
  "tracks": [
    { "name": "track1.mp3", "size": 4200000 },
    { "name": "track2.mp3", "size": 3800000 }
  ],
  "config": {
    "vibe": "energetic",
    "intensity": 75,
    "transitionStyle": "drop",
    "vocalFocus": true
  }
}
// Response:
{
  "jobId": "ai_1234567890",
  "status": "uploading",
  "uploadUrls": [
    "https://blob.vercel-storage.com/upload/...",
    "https://blob.vercel-storage.com/upload/..."
  ]
}

// GET /api/mashup/ai/[jobId]
// Check job status
{
  "jobId": "ai_1234567890",
  "status": "mixing", // uploading | analyzing | separating | mixing | complete | error
  "progress": 65,
  "result": null, // populated when complete
  "error": null
}

// GET /api/mashup/ai/[jobId]/download
// Download completed mashup (returns audio file)

// DELETE /api/mashup/ai/[jobId]
// Cancel/delete a job
```

---

## 💾 Storage Strategy

### File Structure
```
/mashups/
  /uploads/
    {jobId}/
      original/
        track1.mp3
        track2.mp3
      stems/
        track1_vocals.wav
        track1_drums.wav
        track1_bass.wav
        track1_other.wav
        track2_vocals.wav
        ...
      output/
        mashup.mp3
      metadata.json
```

### Storage Options

| Provider | Cost | Best For |
|----------|------|----------|
| **Vercel Blob** | $0.15/GB/mo + $0.10/GB egress | Small scale, quick setup |
| **AWS S3** | $0.023/GB/mo + egress | Production, cost-effective |
| **Cloudflare R2** | $0.015/GB/mo (no egress) | High traffic, CDN |
| **Supabase Storage** | 1GB free, then $0.021/GB | Already using Supabase |

**Recommendation:** Start with Vercel Blob (easiest), migrate to R2 at scale.

---

## ⚡ Queue & Worker System

### Job Queue (Bull + Redis)

```typescript
// lib/queue/mashup-queue.ts
import Queue from 'bull';

const mashupQueue = new Queue('ai-mashup', process.env.REDIS_URL);

// Add job
export async function queueMashup(jobData: MashupJobData) {
  const job = await mashupQueue.add('generate', jobData, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    timeout: 120000, // 2 minutes
    removeOnComplete: 100, // Keep last 100 jobs
    removeOnFail: 50,
  });
  return job.id;
}

// Process job
mashupQueue.process('generate', 2, async (job) => { // 2 concurrent workers
  const { tracks, config, jobId } = job.data;
  
  // Update status
  await updateJobStatus(jobId, 'analyzing');
  await job.progress(10);
  
  // Step 1: Analyze
  const analysis = await analyzeTracks(tracks);
  await job.progress(25);
  
  // Step 2: Separate stems
  await updateJobStatus(jobId, 'separating');
  const stems = await separateStems(tracks);
  await job.progress(50);
  
  // Step 3: Generate mashup
  await updateJobStatus(jobId, 'mixing');
  const mashup = await generateMashup(stems, config);
  await job.progress(90);
  
  // Step 4: Master
  const final = await masterAudio(mashup);
  await job.progress(100);
  
  return {
    outputUrl: final.url,
    duration: final.duration,
    bpm: final.bpm,
  };
});
```

---

## 🛡️ Security & Rights

### Content Safety
1. **Virus Scan** - Scan uploads with ClamAV
2. **Content Moderation** - Check for explicit content
3. **Rights Verification** - Ensure users own the content they upload

### Rate Limiting
```typescript
// Limit per user
- Free: 3 mashups/day
- Pro: 20 mashups/day
- Studio: 100 mashups/day

// Limit per IP
- 10 requests/minute to /api/mashup/ai
```

### Data Retention
```
Uploads: Deleted after 24 hours
Stems: Deleted after mashup complete
Final mashup: Kept for 30 days (or user can save)
Job logs: Kept for 90 days
```

---

## 💰 Cost Estimates

### Monthly Costs (1,000 mashups/month)

| Component | Cost | Notes |
|-----------|------|-------|
| **Storage** | $5 | 50GB @ $0.10/GB |
| **Egress** | $10 | 100GB downloads |
| **Redis** | $15 | Upstash or Redis Cloud |
| **Worker** | $0 | Runs on existing server |
| **Total** | **~$30** | |

### Per-Mashup Cost
- Storage: ~$0.005 (5MB average)
- Processing: $0 (using own server)
- **Total: ~$0.01/mashup**

Compare to Replicate API: $0.10-0.50/mashup

---

## 📅 Implementation Phases

### Phase 1: MVP (Week 1-2)
**Goal:** Basic end-to-end flow working

- [ ] Set up file upload API
- [ ] Basic ffmpeg integration
- [ ] Simple concatenation (no stems)
- [ ] Save to blob storage
- [ ] Return download URL

**Cost:** $0 (use Vercel free tier)

---

### Phase 2: Stem Separation (Week 3-4)
**Goal:** Professional-quality mashups

- [ ] Integrate Demucs
- [ ] Separate vocals/drums/bass/other
- [ ] Smart stem selection based on vibe
- [ ] Better transitions

**Cost:** ~$20/month (small Redis instance)

---

### Phase 3: Queue System (Week 5-6)
**Goal:** Handle multiple concurrent requests

- [ ] Set up Redis + Bull
- [ ] Worker processes
- [ ] Job status tracking
- [ ] Progress updates via WebSocket
- [ ] Retry logic

**Cost:** ~$35/month

---

### Phase 4: Polish (Week 7-8)
**Goal:** Production-ready

- [ ] Advanced audio effects
- [ ] Mastering chain
- [ ] Waveform generation
- [ ] Preview generation (30-second clip)
- [ ] Error handling & monitoring
- [ ] Analytics

**Cost:** ~$50/month

---

## 🔧 Quick Start Code

### 1. Install Dependencies
```bash
npm install fluent-ffmpeg bull @upstash/redis
npm install -D @types/fluent-ffmpeg
```

### 2. API Route
```typescript
// app/api/mashup/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queueMashup } from '@/lib/queue/mashup-queue';

export async function POST(req: NextRequest) {
  const { config } = await req.json();
  
  // Auth check
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Rate limit check
  const canProceed = await checkRateLimit(user.id);
  if (!canProceed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Generate upload URLs
  const jobId = `ai_${Date.now()}`;
  const uploadUrls = await generateUploadUrls(jobId, 2);
  
  // Queue job (will start after uploads complete)
  await queueMashup({
    jobId,
    userId: user.id,
    config,
    status: 'uploading',
  });
  
  return NextResponse.json({
    jobId,
    status: 'uploading',
    uploadUrls,
  });
}
```

### 3. Worker Script
```typescript
// scripts/mashup-worker.ts
import { mashupQueue } from '@/lib/queue/mashup-queue';

console.log('Starting mashup worker...');

mashupQueue.process('generate', async (job) => {
  console.log(`Processing job ${job.id}`);
  // ... processing logic ...
});
```

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Processing Time | < 30 seconds |
| Success Rate | > 95% |
| Cost per Mashup | < $0.05 |
| Concurrent Jobs | 10+ |
| Queue Wait Time | < 5 seconds |

---

*Plan Created: February 14, 2026*  
*Est. Implementation: 6-8 weeks*  
*Est. Monthly Cost: $30-50*
