# Attribution & Audio Fingerprinting - Backend Plan

**Priority:** P1  
**Timeline:** 3-4 weeks  
**Cost:** $30-50/month

---

## Overview

Track and verify audio sources using acoustic fingerprinting to ensure proper attribution and rights management.

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Fingerprinting | Chromaprint (AcoustID) | Generate audio fingerprints |
| Storage | Elasticsearch | Fast similarity search |
| Processing | FFmpeg | Audio preprocessing |

## Architecture

```
Audio Upload
    │
    ▼
FFmpeg Preprocess (normalize, convert)
    │
    ▼
Chromaprint Fingerprint
    │
    ▼
Elasticsearch Query
    │
    ├─> No Match → New Entry
    └─> Match → Attribution Link
```

## Database Schema

```sql
-- Audio fingerprints
CREATE TABLE audio_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  
  -- Fingerprint data
  fingerprint text NOT NULL, -- Chromaprint string
  duration numeric,
  sample_rate integer,
  
  -- For matching
  chromaprint_id text, -- AcoustID (if available)
  
  created_at timestamp DEFAULT now()
);

-- Attribution sources (what was detected)
CREATE TABLE attribution_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  
  -- Detected source
  source_title text,
  source_artist text,
  source_album text,
  confidence numeric, -- 0-100 match confidence
  
  -- Match metadata
  match_type text CHECK (match_type IN ('fingerprint', 'manual', 'user_claimed')),
  fingerprint_match boolean DEFAULT false,
  
  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamp,
  
  created_at timestamp DEFAULT now()
);

-- User claims (manual attribution)
CREATE TABLE user_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  
  source_title text,
  source_artist text,
  source_url text,
  
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_fingerprints_mashup ON audio_fingerprints(mashup_id);
CREATE INDEX idx_attribution_mashup ON attribution_sources(mashup_id);
```

## Implementation

### Fingerprint Generation

```typescript
// lib/attribution/fingerprint.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FingerprintResult {
  fingerprint: string;
  duration: number;
  sampleRate: number;
}

export async function extractFingerprint(audioPath: string): Promise<FingerprintResult> {
  // Use fpcalc (Chromaprint CLI tool)
  const { stdout } = await execAsync(`fpcalc -json "${audioPath}"`);
  const result = JSON.parse(stdout);

  return {
    fingerprint: result.fingerprint,
    duration: result.duration,
    sampleRate: 11025 // Chromaprint default
  };
}

// Web-based alternative using chromaprint.js
export async function extractFingerprintWeb(audioBuffer: ArrayBuffer): Promise<FingerprintResult> {
  // Would need chromaprint WASM build
  // For now, use server-side processing
  throw new Error('Client-side fingerprinting not implemented');
}
```

### Elasticsearch Setup

```typescript
// lib/attribution/search.ts
import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: process.env.ELASTICSEARCH_URL });

// Index mapping
const fingerprintMapping = {
  mappings: {
    properties: {
      fingerprint: {
        type: 'text',
        analyzer: 'fingerprint_analyzer'
      },
      mashup_id: { type: 'keyword' },
      duration: { type: 'float' },
      created_at: { type: 'date' }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        fingerprint_analyzer: {
          tokenizer: 'fingerprint_tokenizer'
        }
      },
      tokenizer: {
        fingerprint_tokenizer: {
          type: 'ngram',
          min_gram: 4,
          max_gram: 4
        }
      }
    }
  }
};

export async function indexFingerprint(fingerprint: FingerprintResult, mashupId: string) {
  await es.index({
    index: 'audio_fingerprints',
    id: mashupId,
    document: {
      fingerprint: fingerprint.fingerprint,
      mashup_id: mashupId,
      duration: fingerprint.duration,
      created_at: new Date()
    }
  });
}

export async function findMatches(
  fingerprint: string,
  minConfidence: number = 70
): Promise<MatchResult[]> {
  const response = await es.search({
    index: 'audio_fingerprints',
    query: {
      more_like_this: {
        fields: ['fingerprint'],
        like: fingerprint,
        min_term_freq: 1,
        max_query_terms: 100,
        minimum_should_match: '30%'
      }
    },
    min_score: minConfidence
  });

  return response.hits.hits.map(hit => ({
    mashupId: hit._source?.mashup_id,
    confidence: hit._score || 0,
    duration: hit._source?.duration
  }));
}
```

### AcoustID Integration

```typescript
// lib/attribution/acoustid.ts
const ACOUSTID_API_KEY = process.env.ACOUSTID_API_KEY;

interface AcoustIDResult {
  id: string;
  score: number;
  recordings: {
    id: string;
    title: string;
    artists: { id: string; name: string }[];
  }[];
}

export async function lookupAcoustID(fingerprint: string, duration: number): Promise<AcoustIDResult[]> {
  const params = new URLSearchParams({
    client: ACOUSTID_API_KEY,
    duration: duration.toString(),
    fingerprint,
    format: 'json'
  });

  const response = await fetch(`https://api.acoustid.org/v2/lookup?${params}`);
  const data = await response.json();

  if (data.status !== 'ok') {
    throw new Error(data.error?.message || 'AcoustID lookup failed');
  }

  return data.results.map((r: any) => ({
    id: r.id,
    score: r.score,
    recordings: r.recordings || []
  }));
}
```

## API Endpoints

### Process Attribution
```typescript
POST /api/attribution/process

Body:
{
  "mashupId": "uuid"
}

Response:
{
  "jobId": "uuid",
  "status": "processing"
}
```

### Get Attribution
```typescript
GET /api/mashups/:id/attribution

Response:
{
  "sources": [
    {
      "id": "uuid",
      "sourceTitle": "Original Song Title",
      "sourceArtist": "Original Artist",
      "confidence": 85,
      "matchType": "fingerprint",
      "verified": true
    }
  ],
  "fingerprint": {
    "duration": 180,
    "sampleRate": 11025
  },
  "userClaims": [
    {
      "sourceTitle": "...",
      "sourceArtist": "...",
      "sourceUrl": "..."
    }
  ]
}
```

### Submit User Attribution
```typescript
POST /api/mashups/:id/attribution

Body:
{
  "sourceTitle": "...",
  "sourceArtist": "...",
  "sourceUrl": "..."
}

Response:
{
  "success": true,
  "attributionId": "uuid"
}
```

## Worker Implementation

```typescript
// workers/attribution.ts
import { Queue, Worker } from 'bullmq';

const queue = new Queue('attribution', { connection: redis });

const worker = new Worker('attribution', async (job) => {
  const { mashupId, audioUrl } = job.data;

  // 1. Download audio
  const audioPath = await downloadAudio(audioUrl);

  // 2. Extract fingerprint
  const fingerprint = await extractFingerprint(audioPath);

  // 3. Store fingerprint
  await storeFingerprint(mashupId, fingerprint);

  // 4. Check for matches in our database
  const localMatches = await findMatches(fingerprint.fingerprint);

  // 5. Query AcoustID for known tracks
  const acoustidMatches = await lookupAcoustID(
    fingerprint.fingerprint,
    fingerprint.duration
  );

  // 6. Store attributions
  for (const match of acoustidMatches.slice(0, 3)) { // Top 3
    if (match.score > 0.7) {
      await storeAttribution(mashupId, {
        sourceTitle: match.recordings[0]?.title,
        sourceArtist: match.recordings[0]?.artists[0]?.name,
        confidence: match.score * 100,
        matchType: 'fingerprint',
        fingerprintMatch: true
      });
    }
  }

  // 7. Index for future matching
  await indexFingerprint(fingerprint, mashupId);

  // Cleanup
  await cleanup(audioPath);

}, { connection: redis });

export async function queueAttributionJob(mashupId: string, audioUrl: string) {
  await queue.add('process', { mashupId, audioUrl });
}
```

## Docker Configuration

```dockerfile
# Dockerfile.attribution
FROM node:20

# Install FFmpeg and fpcalc
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libchromaprint-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "workers/attribution.js"]
```

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Elasticsearch | $30-50/month |
| AcoustID API | Free (non-commercial) |
| Processing | Minimal |
| **Total** | **$30-50/month** |

---

*Next: AI Vocal Generation*