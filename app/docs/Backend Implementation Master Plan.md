# Mashups Backend Implementation Master Plan

**Version:** 1.0  
**Date:** February 14, 2026  
**Status:** Comprehensive implementation roadmap for all 24 demo features

---

## Executive Summary

This master plan consolidates backend implementation strategies for all 24 simulated/demo features in the Mashups platform. Each feature includes architecture, API design, cost estimates, and implementation timeline.

**Total Investment Required:**
- **Timeline:** 20-24 weeks
- **Monthly Operational Cost:** $400-700
- **Initial Setup Cost:** ~$2,000-3,000

---

## Implementation Priority Matrix

| Priority | Feature | Business Impact | Implementation Complexity | Est. Cost/Month |
|----------|---------|-----------------|---------------------------|-----------------|
| 🔴 P0 | AI Magic Generator | Critical | High | $50-100 |
| 🔴 P0 | Billing/Stripe | Critical | Medium | $50 |
| 🔴 P0 | Real-Time Collaboration | High | High | $50-100 |
| 🔴 P0 | Auto-Caption | High | Low | $30-50 |
| 🟡 P1 | Battle System | Medium | Low | $0 |
| 🟡 P1 | Challenge Engine | Medium | Low | $0 |
| 🟡 P1 | Voice Chat | Medium | Low | $20-50 |
| 🟡 P1 | Analytics | High | Medium | $50-100 |
| 🟡 P1 | Trending Sounds | Medium | Medium | $30-50 |
| 🟡 P1 | Attribution | Medium | High | $30-50 |
| 🟢 P2 | AI Vocal | Low | Medium | Variable |
| 🟢 P2 | Gamification | Low | Low | $0 |
| 🟢 P2 | Thumbnails | Low | Low | $0 |
| 🟢 P2 | Content ID | Low | High | $100+ |

---

## Phase 1: Core Product (Weeks 1-8)

### 1.1 AI Magic Generator
**Existing Plan:** `Audio Processing Backend Plan.md`

**Quick Summary:**
- **Technology:** Node.js + FFmpeg + Demucs
- **Queue:** Bull + Redis
- **Storage:** Vercel Blob / S3
- **Cost:** $50-100/month
- **Timeline:** 8 weeks

**Key APIs:**
```typescript
POST /api/mashup/ai          // Start generation
GET /api/mashup/ai/:id       // Check status
GET /api/mashup/ai/:id/download  // Download result
```

---

### 1.2 Billing & Subscriptions (Stripe)

**Overview:**
Integrate Stripe for subscription management, payments, and invoicing.

**Architecture:**
```
User Action
    │
    ▼
Stripe Checkout/Portal
    │
    ▼
Webhook Handler (api/webhooks/stripe)
    │
    ▼
Update Supabase (subscriptions table)
    │
    ▼
Sync to App (real-time)
```

**Database Schema:**
```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  tier text CHECK (tier IN ('free', 'pro', 'studio')),
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  stripe_invoice_id text,
  amount_due integer, -- in cents
  amount_paid integer,
  status text,
  pdf_url text,
  created_at timestamp DEFAULT now()
);
```

**API Endpoints:**
```typescript
// Checkout
POST /api/billing/checkout
Body: { tier: 'pro' | 'studio', priceId: string }
Response: { url: string } // Stripe Checkout URL

// Customer Portal
POST /api/billing/portal
Response: { url: string } // Stripe Customer Portal

// Current Subscription
GET /api/billing/subscription
Response: { tier, status, currentPeriodEnd, features[] }

// Webhook
POST /api/webhooks/stripe
// Handles: checkout.completed, invoice.paid, subscription.updated, etc.
```

**Stripe Products Setup:**
```
Product: Mashups Pro
  - Price: $9.99/month (monthly)
  - Price: $99/year (annual, 17% discount)
  
Product: Mashups Studio
  - Price: $29.99/month
  - Price: $299/year
```

**Features by Tier:**
| Feature | Free | Pro | Studio |
|---------|------|-----|--------|
| Mashups/month | 3 | Unlimited | Unlimited |
| AI Generations | 0 | 20 | Unlimited |
| Stem Exports | No | Yes | Yes |
| Collaboration | No | Yes | Yes |
| Analytics | 7 days | 90 days | Unlimited |
| Priority Support | No | Email | Priority |

**Cost:**
- Stripe: 2.9% + $0.30 per transaction
- Est. monthly: $50 (at $10K MRR)

**Implementation:** 2-3 weeks

---

### 1.3 Real-Time Collaboration

**Overview:**
Enable multiple users to collaborate on the same project with live cursors, presence, and synced edits.

**Architecture Options:**

**Option A: PartyKit (Recommended for MVP)**
- Fully managed, scales automatically
- $5/month base + usage
- 2-week implementation

**Option B: Custom Socket.io**
- More control, higher maintenance
- $30-50/month infrastructure
- 4-week implementation

**PartyKit Implementation:**
```typescript
// server.ts (PartyKit server)
import type * as Party from "partykit/server";

export default class StudioServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  users = new Map<string, UserPresence>();
  projectState: ProjectState = { tracks: [], playhead: 0 };

  onConnect(conn: Party.Connection) {
    // Send current state to new user
    conn.send(JSON.stringify({
      type: "init",
      users: Array.from(this.users.values()),
      state: this.projectState
    }));
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    switch (data.type) {
      case "cursor":
        // Broadcast cursor position
        this.users.set(sender.id, { id: sender.id, ...data });
        this.room.broadcast(JSON.stringify(data), [sender.id]);
        break;

      case "operation":
        // CRDT operation or OT
        this.applyOperation(data);
        this.room.broadcast(JSON.stringify(data), [sender.id]);
        break;

      case "transport":
        // Play/pause/stop sync
        this.room.broadcast(JSON.stringify(data));
        break;
    }
  }
}
```

**Client Integration:**
```typescript
// hooks/use-studio-collab.ts
import PartySocket from "partysocket";

export function useStudioCollab(projectId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const socket = useRef<PartySocket>();

  useEffect(() => {
    socket.current = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
      room: projectId,
    });

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    return () => socket.current?.close();
  }, [projectId]);

  const sendCursor = (x: number, y: number) => {
    socket.current?.send(JSON.stringify({
      type: "cursor",
      x, y,
      timestamp: Date.now()
    }));
  };

  const sendOperation = (op: Operation) => {
    socket.current?.send(JSON.stringify({
      type: "operation",
      op
    }));
  };

  return { users, sendCursor, sendOperation };
}
```

**API Endpoints:**
```typescript
// Get active collaborators
GET /api/projects/:id/collaborators
Response: { users: [{ id, name, avatar, color, cursor? }] }

// Join project (generates PartyKit token)
POST /api/projects/:id/join
Response: { token: string, room: string }
```

**Database:**
```sql
-- Project sessions
CREATE TABLE project_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  user_id uuid REFERENCES auth.users(id),
  joined_at timestamp DEFAULT now(),
  last_activity_at timestamp DEFAULT now(),
  cursor_position jsonb,
  is_active boolean DEFAULT true
);
```

**Cost:**
- PartyKit: $5/month base + $0.40/million messages
- Est. monthly: $20-50

**Implementation:** 2-4 weeks

---

### 1.4 Auto-Caption Generator

**Overview:**
Automatically generate subtitles/captions for mashups using AI transcription.

**Technology:** OpenAI Whisper API

**Architecture:**
```
Audio File
    │
    ▼
Upload to Storage
    │
    ▼
Call Whisper API
    │
    ▼
Process Segments (add timestamps)
    │
    ▼
Store in Database
    │
    ▼
Display in Player
```

**API:**
```typescript
POST /api/captions/generate
Body: { mashupId: string, language?: string }
Response: { jobId: string }

GET /api/captions/:mashupId
Response: {
  captions: {
    segments: [{ start, end, text }],
    srt: string,
    vtt: string,
    txt: string
  }
}
```

**Implementation:**
```typescript
// lib/captions/transcribe.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCaptions(audioUrl: string) {
  // Download audio file
  const response = await fetch(audioUrl);
  const buffer = await response.arrayBuffer();

  // Call Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: new File([buffer], 'audio.mp3'),
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment', 'word']
  });

  // Format outputs
  return {
    segments: transcription.segments.map(s => ({
      start: s.start,
      end: s.end,
      text: s.text.trim()
    })),
    srt: toSRT(transcription.segments),
    vtt: toVTT(transcription.segments),
    txt: transcription.text
  };
}
```

**Cost:**
- Whisper: $0.006 per minute
- 1000 x 3-min mashups = $18/month

**Implementation:** 1-2 weeks

---

## Phase 2: Community Features (Weeks 9-14)

### 2.1 Battle System

**Overview:**
Head-to-head mashup competitions with voting and leaderboards.

**Database Schema:**
```sql
-- Battles
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  status text CHECK (status IN ('upcoming', 'active', 'voting', 'completed')),
  start_time timestamp,
  end_time timestamp,
  voting_end_time timestamp,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now()
);

-- Battle Entries
CREATE TABLE battle_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id),
  user_id uuid REFERENCES auth.users(id),
  mashup_id uuid REFERENCES mashups(id),
  submitted_at timestamp DEFAULT now(),
  votes_count integer DEFAULT 0
);

-- Votes
CREATE TABLE battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id),
  entry_id uuid REFERENCES battle_entries(id),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now(),
  UNIQUE(battle_id, user_id) -- One vote per user per battle
);
```

**API Endpoints:**
```typescript
// List battles
GET /api/battles?status=active&page=1
Response: { battles: [{ id, title, status, entryCount, endsAt }] }

// Get battle details
GET /api/battles/:id
Response: {
  battle: { id, title, description, theme, status, endsAt },
  entries: [{ id, user, mashup, votes, rank }],
  userVote?: string // entry_id user voted for
}

// Submit entry
POST /api/battles/:id/entries
Body: { mashupId: string }

// Vote
POST /api/battles/:id/vote
Body: { entryId: string }
```

**Features:**
- Tournament brackets (single/double elimination)
- Blind voting (hide vote counts during voting)
- Judge panels vs community votes
- Prize distribution

**Cost:** $0 (uses existing database)

**Implementation:** 2 weeks

---

### 2.2 Challenge Engine

**Overview:**
Weekly/daily challenges with themes, leaderboards, and rewards.

**Database:**
```sql
-- Challenges
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  type text CHECK (type IN ('daily', 'weekly', 'special')),
  stem_pack_id uuid, -- Optional linked stem pack
  start_date date,
  end_date date,
  status text,
  reward_credits integer DEFAULT 0,
  reward_badge_id uuid,
  created_at timestamp DEFAULT now()
);

-- Challenge Entries
CREATE TABLE challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id),
  user_id uuid REFERENCES auth.users(id),
  mashup_id uuid REFERENCES mashups(id),
  submitted_at timestamp DEFAULT now(),
  score integer, -- Calculated from plays, likes, etc.
  rank integer
);
```

**API:**
```typescript
GET /api/challenges/current
GET /api/challenges/:id/entries
GET /api/challenges/:id/leaderboard
POST /api/challenges/:id/submit
```

**Scoring Algorithm:**
```typescript
function calculateScore(entry: ChallengeEntry): number {
  return (
    entry.mashup.plays * 1 +
    entry.mashup.likes * 5 +
    entry.mashup.shares * 10 +
    entry.mashup.comments * 3 +
    (entry.submitted_early ? 50 : 0) // Bonus for early submission
  );
}
```

**Cost:** $0

**Implementation:** 2 weeks

---

### 2.3 Voice Chat

**Overview:**
Built-in voice communication for studio collaboration.

**Technology:** Daily.co API (easiest implementation)

**Architecture:**
```typescript
// Create room when studio session starts
POST https://api.daily.co/v1/rooms
Headers: { Authorization: Bearer DAILY_API_KEY }
Body: {
  name: `studio_${projectId}`,
  privacy: "private",
  properties: {
    max_participants: 10,
    enable_screenshare: false,
    enable_chat: false
  }
}

// Returns: { name, url, token }
```

**Client Integration:**
```typescript
// components/voice/voice-chat.tsx
import DailyIframe from '@daily-co/daily-js';

export function VoiceChat({ roomUrl, token }) {
  const callRef = useRef(null);

  useEffect(() => {
    const callFrame = DailyIframe.createFrame(callRef.current, {
      url: roomUrl,
      token: token,
      showLeaveButton: true,
      showFullscreenButton: false,
    });

    callFrame.join();

    return () => callFrame.destroy();
  }, [roomUrl, token]);

  return <div ref={callRef} className="w-full h-32" />;
}
```

**API:**
```typescript
// Get or create voice room
POST /api/studio/:id/voice
Response: { roomUrl: string, token: string }
```

**Cost:**
- Daily.co: ~$0.004/minute per participant
- 1000 hours/month = ~$240

**Implementation:** 1 week

---

### 2.4 Analytics Dashboard

**Overview:**
Track and visualize mashup performance, user engagement, and growth metrics.

**Architecture:**
```
Frontend Events
    │
    ▼
Segment / PostHog
    │
    ▼
Data Warehouse (ClickHouse/BigQuery)
    │
    ▼
Aggregated Metrics (Supabase)
    │
    ▼
Dashboard API
```

**Event Tracking:**
```typescript
// lib/analytics/track.ts
export const track = {
  play: (mashupId: string) => {
    posthog.capture('mashup_played', { mashup_id: mashupId });
  },

  create: (metadata: MashupMetadata) => {
    posthog.capture('mashup_created', metadata);
  },

  export: (platform: string) => {
    posthog.capture('mashup_exported', { platform });
  },

  upgrade: (tier: string) => {
    posthog.capture('subscription_upgraded', { tier });
  }
};
```

**Database (Materialized Views):**
```sql
-- Daily stats per mashup
CREATE MATERIALIZED VIEW mashup_daily_stats AS
SELECT
  mashup_id,
  date_trunc('day', created_at) as date,
  count(*) FILTER (WHERE event_type = 'play') as plays,
  count(*) FILTER (WHERE event_type = 'like') as likes,
  count(*) FILTER (WHERE event_type = 'share') as shares,
  count(DISTINCT user_id) as unique_users
FROM analytics_events
GROUP BY mashup_id, date_trunc('day', created_at);

-- Create index for fast queries
CREATE INDEX idx_mashup_stats_date ON mashup_daily_stats(mashup_id, date);
```

**API:**
```typescript
GET /api/analytics/dashboard
Response: {
  totalPlays: number,
  totalLikes: number,
  followers: number,
  topMashups: [...],
  playsOverTime: [{ date, plays }],
  sources: [{ source, count }],
  demographics: { age: [...], location: [...] }
}

GET /api/analytics/mashup/:id
Response: {
  plays: number,
  playTime: number, // total seconds listened
  avgPlayDuration: number,
  dropOffPoints: [{ timestamp, percentage }],
  peakConcurrent: number
}
```

**Cost:**
- PostHog: Free tier (1M events/month)
- ClickHouse: $50-100/month (if self-hosted)

**Implementation:** 2-3 weeks

---

### 2.5 Trending Sounds

**Overview:**
Discover trending audio from TikTok, Spotify, YouTube for mashup inspiration.

**Data Sources:**

| Platform | API | Data | Cost |
|----------|-----|------|------|
| TikTok | Research API (requires approval) | Trending videos, sounds | Free |
| Spotify | Charts API | Top 50 playlists | Free |
| YouTube | Data API | Trending videos | $0.004/unit |
| SoundCloud | No official API | Scraping (risky) | - |

**Implementation:**
```typescript
// lib/trends/fetchers.ts

// Spotify Charts
export async function getSpotifyTrending() {
  const response = await fetch(
    'https://charts.spotify.com/charts/view/regional-us-daily/latest'
  );
  // Parse and normalize
  return tracks.map(t => ({
    title: t.name,
    artist: t.artist_names[0],
    source: 'spotify',
    rank: t.chart_entry.current_rank,
    url: t.share_url
  }));
}

// YouTube Trending
export async function getYouTubeTrending() {
  const response = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?` +
    `part=snippet&chart=mostPopular&regionCode=US&` +
    `key=${process.env.YOUTUBE_API_KEY}`
  );
  return videos.map(v => ({
    title: v.snippet.title,
    channel: v.snippet.channelTitle,
    source: 'youtube',
    thumbnail: v.snippet.thumbnails.medium.url
  }));
}
```

**Database:**
```sql
-- Trending sounds cache
CREATE TABLE trending_sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  artist text,
  source text, -- 'tiktok', 'spotify', 'youtube'
  external_url text,
  thumbnail_url text,
  rank integer,
  velocity numeric, -- How fast it's climbing
  fetched_at timestamp DEFAULT now(),
  UNIQUE(source, external_url)
);

-- Index for fast queries
CREATE INDEX idx_trending_source ON trending_sounds(source, rank);
```

**Cron Job (Hourly):**
```typescript
// app/api/cron/fetch-trends/route.ts
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch from all sources
  const [spotify, youtube] = await Promise.all([
    getSpotifyTrending(),
    getYouTubeTrending()
  ]);

  // Upsert to database
  await upsertTrends([...spotify, ...youtube]);

  return Response.json({ success: true, count: spotify.length + youtube.length });
}
```

**API:**
```typescript
GET /api/trends?source=spotify&limit=20
Response: {
  sounds: [{
    id, title, artist, source,
    rank, velocity, thumbnailUrl,
    previewUrl? // if available
  }],
  updatedAt: timestamp
}
```

**Cost:**
- YouTube API: Free tier (10K units/day)
- Spotify: Free
- TikTok: Free (if approved)

**Implementation:** 2 weeks

---

## Phase 3: AI & Advanced Features (Weeks 15-20)

### 3.1 AI Vocal Generation

**Overview:**
Generate original vocals using AI (text-to-singing or voice cloning).

**Technology Options:**

| Service | Use Case | Quality | Cost |
|---------|----------|---------|------|
| **Suno AI** | Full songs with vocals | High | $10/mo + usage |
| **Uberduck** | Rap vocals, voice clones | Medium | Free tier + $10/mo |
| **ElevenLabs** | Voice cloning, TTS | Very High | $5/mo + $0.10/char |
| **Replicate (RVC)** | Voice conversion | High | Per-use |

**Implementation:**
```typescript
// lib/ai/vocal-generation.ts
import { Replicate } from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export async function generateVocals({
  lyrics,
  style,
  voiceId
}: VocalGenRequest) {
  const output = await replicate.run(
    "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11ac716833f1c" +
    "a8b29e9b640b",
    {
      input: {
        prompt: lyrics,
        voice: voiceId || "v2/en_speaker_6",
        temperature: 0.7
      }
    }
  );

  return {
    audioUrl: output,
    duration: await getDuration(output)
  };
}
```

**API:**
```typescript
POST /api/ai/vocals/generate
Body: {
  lyrics: string,
  style?: 'rap' | 'singing' | 'spoken',
  voiceId?: string,
  melodyRef?: string // optional reference audio
}
Response: { jobId: string }

GET /api/ai/vocals/:jobId
Response: { status, audioUrl?, error? }
```

**Cost:**
- Replicate: ~$0.001-0.01 per generation
- ElevenLabs: $0.10 per 1000 characters

**Implementation:** 2 weeks

---

### 3.2 Attribution & Audio Fingerprinting

**Overview:**
Track and verify audio sources using acoustic fingerprinting.

**Technology:** Chromaprint (AcoustID) + Elasticsearch

**Implementation:**
```typescript
// lib/attribution/fingerprint.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Extract fingerprint using fpcalc (Chromaprint)
export async function extractFingerprint(audioPath: string): Promise<string> {
  const { stdout } = await execAsync(`fpcalc -json ${audioPath}`);
  const result = JSON.parse(stdout);
  return result.fingerprint;
}

// Compare fingerprints
export async function findMatches(
  fingerprint: string
): Promise<MatchResult[]> {
  // Query Elasticsearch for similar fingerprints
  const response = await fetch(`${process.env.ES_URL}/fingerprints/_search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: {
        more_like_this: {
          fields: ["fingerprint"],
          like: fingerprint,
          min_term_freq: 1,
          max_query_terms: 12
        }
      }
    })
  });

  return parseMatches(response);
}
```

**Database:**
```sql
-- Audio fingerprints
CREATE TABLE audio_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id),
  fingerprint text NOT NULL, -- Chromaprint string
  duration numeric,
  created_at timestamp DEFAULT now()
);

-- Attribution sources
CREATE TABLE attribution_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id),
  source_title text,
  source_artist text,
  confidence numeric, -- 0-100
  verified boolean DEFAULT false,
  fingerprint_match boolean DEFAULT false
);
```

**Cost:**
- Elasticsearch: $20-50/month
- Processing: Minimal (one-time per upload)

**Implementation:** 3-4 weeks

---

### 3.3 Content ID / Rights Management

**Overview:**
Prevent copyright violations by scanning uploads against known content.

**Note:** This is complex and may require partnerships with platforms like YouTube Content ID.

**MVP Implementation:**
1. Use attribution system (#3.2) for basic detection
2. Integrate with Audible Magic (commercial solution)
3. Block uploads with >80% match confidence

**Cost:** $500+/month (Audible Magic)

**Recommendation:** Defer until post-launch, focus on attribution first.

---

## Phase 4: Polish & Secondary Features (Weeks 21-24)

### 4.1 Gamification System

**Overview:**
XP, levels, badges, and achievements to increase engagement.

**Database:**
```sql
-- User XP/Levels
CREATE TABLE user_gamification (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  weekly_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_at timestamp
);

-- Achievements/Badges
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  badge_id text, -- 'first_mashup', 'viral_hit', etc.
  earned_at timestamp DEFAULT now()
);

-- XP Transactions (audit log)
CREATE TABLE xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount integer,
  reason text, -- 'mashup_created', 'like_received', etc.
  reference_id uuid, -- optional (mashup_id, etc.)
  created_at timestamp DEFAULT now()
);
```

**XP Rules:**
```typescript
const XP_RULES = {
  MASHUP_CREATED: 100,
  MASHUP_LIKED: 10, // received a like
  MASHUP_PLAYED: 1, // someone played it (capped at 100/day)
  COMMENT_RECEIVED: 5,
  FOLLOWER_GAINED: 20,
  CHALLENGE_WON: 500,
  BATTLE_WON: 1000,
  STREAK_7_DAYS: 200,
  STREAK_30_DAYS: 1000
};
```

**Level Thresholds:**
```typescript
function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 400 XP
// Level 5: 1600 XP
// Level 10: 8100 XP
```

**API:**
```typescript
GET /api/gamification/profile
Response: {
  level: number,
  xp: number,
  xpToNextLevel: number,
  badges: [{ id, name, icon, earnedAt }],
  streak: { current, longest },
  weeklyStats: { mashups, plays, likes }
}
```

**Cost:** $0 (database only)

**Implementation:** 1-2 weeks

---

### 4.2 Thumbnail Generator

**Overview:**
Auto-generate cover art from waveforms and templates.

**Technology:** HTML5 Canvas (client-side)

**Implementation:**
```typescript
// Client-side generation (no backend needed!)
export async function generateThumbnail({
  title,
  artist,
  waveformData,
  template
}: ThumbnailParams): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, template.colors[0]);
  gradient.addColorStop(1, template.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // Draw waveform
  drawWaveform(ctx, waveformData, template.waveformColor);

  // Draw text
  ctx.font = 'bold 80px Inter';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(title, 540, 800);

  ctx.font = '40px Inter';
  ctx.fillText(artist, 540, 880);

  // Export
  return canvas.toDataURL('image/png');
}
```

**Storage:**
- Save generated thumbnails to Vercel Blob / S3
- Store reference in mashups table

**Cost:** $0 (client-side + minimal storage)

**Implementation:** 1 week

---

### 4.3 Remix Loader / Stem Extraction

**Overview:**
Allow users to load stems from existing mashups for remixing.

**Database:**
```sql
-- Stems registry
CREATE TABLE mashup_stems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id),
  stem_type text CHECK (stem_type IN ('vocals', 'drums', 'bass', 'other')),
  url text NOT NULL,
  duration numeric,
  created_at timestamp DEFAULT now()
);

-- Remix permissions
CREATE TABLE remix_permissions (
  mashup_id uuid REFERENCES mashups(id),
  allow_remix boolean DEFAULT true,
  require_attribution boolean DEFAULT true,
  allow_commercial boolean DEFAULT false
);
```

**Note:** Requires AI Magic Generator to be working (for stem separation).

**Cost:** Storage only (~$0.02 per mashup with stems)

**Implementation:** 1-2 weeks (after AI Mashup is done)

---

## Consolidated Timeline

### Phase 1: Core (Weeks 1-8)
| Week | Feature | Deliverable |
|------|---------|-------------|
| 1-2 | Billing | Stripe integration, subscription tiers |
| 2-4 | Real-time Collab | PartyKit integration, cursor sync |
| 4-6 | AI Magic Gen | FFmpeg pipeline, stem separation |
| 6-8 | Auto-Caption | Whisper API integration |

### Phase 2: Community (Weeks 9-14)
| Week | Feature | Deliverable |
|------|---------|-------------|
| 9-10 | Battle System | Tournaments, voting, leaderboards |
| 10-12 | Challenge Engine | Weekly challenges, scoring |
| 12-13 | Voice Chat | Daily.co integration |
| 13-14 | Analytics | PostHog, dashboards |

### Phase 3: AI & Advanced (Weeks 15-20)
| Week | Feature | Deliverable |
|------|---------|-------------|
| 15-17 | Trending Sounds | API integrations, cron jobs |
| 16-18 | AI Vocal | Replicate/Uberduck integration |
| 17-19 | Attribution | Fingerprinting, matching |
| 19-20 | Content ID | Basic scanning (MVP) |

### Phase 4: Polish (Weeks 21-24)
| Week | Feature | Deliverable |
|------|---------|-------------|
| 21-22 | Gamification | XP, badges, streaks |
| 22-23 | Thumbnails | Canvas generation |
| 23-24 | Remix Loader | Stem extraction, permissions |

---

## Total Cost Summary

### Monthly Operational Costs

| Category | Services | Est. Monthly Cost |
|----------|----------|-------------------|
| **AI Processing** | OpenAI, Replicate, Whisper | $100-200 |
| **Real-time** | PartyKit, Redis | $30-80 |
| **Storage** | Vercel Blob/S3 | $20-50 |
| **Audio** | Daily.co voice | $20-50 |
| **Analytics** | PostHog, ClickHouse | $50-100 |
| **Search** | Elasticsearch | $30-50 |
| **External APIs** | YouTube, Spotify | $10-20 |
| **Database** | Supabase (if over limit) | $25 |
| **Stripe** | Transaction fees | 2.9% + $0.30 |
| **TOTAL** | | **$285-575/month** |

### One-Time Setup Costs
- Stripe Connect setup: $0
- PartyKit/Daily.co setup: $0
- Elasticsearch cluster: $0 (start with managed)
- **Total Setup:** ~$500-1000 (mostly time)

---

## Success Metrics

Track these metrics to measure backend implementation success:

### Technical
- API response time < 200ms (p95)
- AI generation success rate > 95%
- Uptime > 99.5%
- Error rate < 0.1%

### Business
- AI Mashup usage: 1000+/month by month 3
- Conversion rate: 5% free → paid
- Churn rate: < 5%/month
- Cost per user: <$0.50/month

---

*Master Plan Version 1.0*  
*Next Review: After Phase 1 completion*