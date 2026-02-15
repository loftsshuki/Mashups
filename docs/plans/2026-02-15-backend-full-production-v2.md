# Backend Implementation Plan — Full Production V2

**Date:** 2026-02-15
**Supersedes:** `app/docs/Demo Features Requiring Backend.md`, `app/docs/Backend Implementation Master Plan.md`
**Goal:** Systematically replace all mock data with real Supabase queries and external service integrations

---

## Current State (Honest Assessment)

### What's actually real (queries Supabase with mock fallback)
| File | Functions | Notes |
|------|-----------|-------|
| `mashups.ts` | `getMashups()`, `getMashupById()`, `getTrendingMashups()` | Full Supabase queries with joins |
| `follows.ts` | `toggleFollow()`, `getFollowerCount()`, `isFollowing()` | Auth-gated, browser client |
| `plays.ts` | `incrementPlayCount()` | Uses Supabase RPC |
| `billing.ts` | `getEntitlementSummaryForUser()`, `getInvoiceSummariesForUser()` | Queries subscriptions table |
| `profiles.ts` | Basic profile queries | Schema exists, queries work |
| `likes.ts` | Like/unlike | Counted in mashup queries |
| `stems.ts` | Stem queries | Schema in migration 009 |
| `comments.ts` | Basic comment CRUD | Schema + RLS policies exist |

### What's pure mock (hardcoded arrays, setTimeout, stub functions)
24 data files return static data. No Supabase queries, no real logic.

### What the V1 docs got wrong
1. Listed `analytics.ts`, `studio-collab.ts`, `collaboration.ts` as "real" — they're mock
2. Listed 34 files as real implementations — actually ~10
3. Proposed 24-week timeline with $600/month costs — over-scoped
4. Included speculative code for services (Elasticsearch, ClickHouse) that aren't needed yet
5. Missed that the Supabase schema already covers most features — migrations 001-009 define tables for battles, challenges, crates, stems, seasons, billing, collaboration, playlists, and more

### What already exists but isn't wired up
The schema is far ahead of the code. These tables exist in migrations but have zero queries:

| Migration | Tables | Status |
|-----------|--------|--------|
| 001 | profiles, mashups, source_tracks, likes, comments, follows | Partially wired |
| 002 | rights_assets, rights_declarations, licenses, claims, enforcement_actions, earnings_ledger, payouts | Not wired |
| 003 | remix_relations, collaboration_sessions, collaboration_participants, challenges, challenge_entries, recommendation_events | Not wired |
| 004 | subscription_plans, subscriptions, creator_licenses, checkout_sessions | Partially wired (billing.ts) |
| 005 | viral_pack_clips, creator_weekly_scores, fork_contests, studio_markers, studio_notes, studio_snapshots, referral_invites, referral_revenue_events, challenge_winners, challenge_ops_events | Not wired |
| 006 | challenges extensions (external_id, tag, frequency, sponsor) | Not wired |
| 007a | audit_events | Not wired |
| 007b | mashup_stems (separation data, mixer settings) | Not wired |
| 008 | playlists, playlist_tracks, playlist_comments, feed_preferences, comment_reactions, comment_mentions | Not wired |
| 009 | stems, stem_mashup_links, crates, crate_stems, stem_usage_log, creative_streaks, platform_challenges, seasons | Not wired |

---

## Implementation Strategy

### Principle: Wire before you build
Most features don't need new services or APIs. They need the existing mock data files to query the existing Supabase tables instead of returning hardcoded arrays.

### The pattern (already established in mashups.ts)
```typescript
import { createClient } from "@/lib/supabase/server"

const isConfigured = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL

export async function getThings() {
  if (!isConfigured()) return mockThings // graceful fallback

  const supabase = await createClient()
  const { data, error } = await supabase.from("things").select("*")

  if (error || !data) return mockThings // error fallback
  return data
}
```

Every data file follows this same pattern. The work is mechanical: replace mock return with Supabase query, keep mock as fallback.

---

## Phase 0: Auth Foundation (Week 1)

**Why first:** Nothing else works without auth. Currently, `supabase.auth.getUser()` returns null in the no-op client. Users can't sign in.

### Tasks
1. **Verify Supabase project is provisioned** — ensure env vars are set in Vercel
2. **Wire auth flow** — login/signup pages already exist, connect them to Supabase Auth
3. **Add auth middleware** — protect API routes that require authentication
4. **Profile creation on signup** — auto-insert into `profiles` table via trigger or on first login
5. **Session management** — cookie-based sessions via `@supabase/ssr` (server.ts already set up)

### Files to modify
- `app/src/app/login/page.tsx` — connect form to `supabase.auth.signInWithPassword()`
- `app/src/app/signup/page.tsx` — connect form to `supabase.auth.signUp()`
- `app/src/lib/supabase/server.ts` — verify cookie handling works
- `app/src/middleware.ts` — create if needed, refresh session on requests

### Deliverable
Users can sign up, log in, see their profile. Auth state persists across page loads.

---

## Phase 1: Wire Up Existing Schema — Database-Only Features (Weeks 2-4)

These features need zero external services. The tables exist, the RLS policies exist. Just write the queries.

### 1.1 Challenges & Challenge Engine
**Tables:** `challenges`, `challenge_entries`, `challenge_winners`, `challenge_ops_events`
**Files to modify:** `challenge-engine.ts`, `challenges.ts`, `platform-challenges.ts`

Queries needed:
- `getChallenges(status?)` → `SELECT * FROM challenges WHERE status = $1 ORDER BY starts_at`
- `getChallengeById(id)` → with entry count, user's entry
- `submitEntry(challengeId, mashupId)` → `INSERT INTO challenge_entries`
- `getLeaderboard(challengeId)` → entries ordered by score/votes

### 1.2 Battles
**Tables:** `challenges` (reuse with type column), or add `battles` table via new migration
**Files to modify:** `battles.ts`

Decision: The V1 doc proposed separate `battles` table. But `platform_challenges` in migration 009 has `type` column supporting 'flip', 'chain', 'collision', 'blind_test', 'roulette'. Battles could be a challenge type. **Recommendation:** Use `platform_challenges` for battles too, add type 'battle'. Avoid new migration.

Queries needed:
- `getActiveBattles()` → `SELECT * FROM platform_challenges WHERE type = 'battle' AND status = 'active'`
- `submitVote(battleId, entryId)` → needs a `battle_votes` table (new migration)
- `getBattleResults(id)` → entries with vote counts

**New migration needed:** `010_battle_votes.sql`
```sql
CREATE TABLE IF NOT EXISTS public.battle_votes (
  battle_id UUID NOT NULL REFERENCES public.platform_challenges(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (battle_id, user_id) -- one vote per user per battle
);
```

### 1.3 Gamification & Creative Streaks
**Tables:** `creative_streaks` (migration 009)
**Files to modify:** `gamification.ts`, `creative-streaks.ts`

Queries needed:
- `getStreak(userId)` → `SELECT * FROM creative_streaks WHERE user_id = $1`
- `updateStreak(userId)` → check last_creation_week, increment or reset
- XP system: add `user_xp` table (new migration) or use `creative_streaks.streak_history` JSONB

**New migration needed:** `010_gamification.sql`
```sql
CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Crates & Collections
**Tables:** `crates`, `crate_stems` (migration 009)
**Files to modify:** `crates.ts`

Queries needed:
- `getUserCrates(userId)` → with stem count
- `createCrate(title, description)` → insert
- `addStemToCrate(crateId, stemId)` → insert into crate_stems
- `getCrateContents(crateId)` → join with stems table

### 1.5 Seasons
**Tables:** `seasons` (migration 009)
**Files to modify:** `seasons.ts`

Queries needed:
- `getCurrentSeason()` → `WHERE status = 'active' LIMIT 1`
- `getSeasons()` → all, ordered by starts_at
- `incrementSeasonCount(seasonId)` → `UPDATE seasons SET current_count = current_count + 1`

### 1.6 Comments V2
**Tables:** `comments`, `comment_reactions`, `comment_mentions` (migration 008)
**Files to modify:** `comments.ts`, `comments-v2.ts`

Queries needed:
- `getComments(mashupId)` → with reactions, mentions, threaded (parent_id)
- `addComment(mashupId, content, parentId?, timestampSec?)` → insert
- `addReaction(commentId, emoji)` → insert into comment_reactions
- `mentionUser(commentId, userId)` → insert into comment_mentions

### 1.7 Playlists
**Tables:** `playlists`, `playlist_tracks`, `playlist_comments` (migration 008)
**Files to modify:** `playlists.ts`

Queries needed:
- `getUserPlaylists(userId)` → with track count
- `getPlaylist(id)` → with tracks joined to mashups
- `createPlaylist(title)` → insert
- `addTrack(playlistId, mashupId)` → insert into playlist_tracks

### 1.8 Collaboration Sessions
**Tables:** `collaboration_sessions`, `collaboration_participants` (migration 003)
**Files to modify:** `collaboration.ts`, `studio-collab.ts`

Queries needed:
- `createSession(title)` → insert session + owner participant
- `joinSession(sessionId)` → insert participant
- `getActiveSession(projectId)` → with participant list

### 1.9 Rights & Earnings
**Tables:** `rights_assets`, `rights_declarations`, `licenses`, `claims`, `earnings_ledger`, `payouts` (migration 002)
**Files to modify:** `rights.ts`, `rights-safety.ts`, `earnings.ts`, `revenue-splits.ts`

Queries needed:
- `getRightsDeclaration(mashupId)` → with licenses
- `submitClaim(mashupId, contact, type)` → insert into claims
- `getEarnings(userId)` → from earnings_ledger, grouped by month
- `requestPayout(userId, amount)` → insert into payouts

### 1.10 Studio Persistence
**Tables:** `studio_markers`, `studio_notes`, `studio_snapshots` (migration 005)
**Files to modify:** `studio-persistence.ts`

Queries needed:
- `saveMarker(sessionKey, label, atSec)` → insert
- `getMarkers(sessionKey)` → select ordered by at_sec
- `saveSnapshot(sessionKey, data)` → insert
- `loadSnapshot(id)` → select single

### 1.11 Scoreboard & Rankings
**Tables:** `creator_weekly_scores` (migration 005)
**Files to modify:** `scoreboard.ts`, `scoreboard-server.ts`

Queries needed:
- `getWeeklyScoreboard()` → `SELECT * FROM creator_weekly_scores WHERE week_start = $1 ORDER BY score DESC`
- `updateScore(username, metrics)` → upsert

### Deliverable (Phase 1)
All community features backed by real database. Users can create/join challenges, vote in battles, track streaks, organize stems into crates, manage playlists, collaborate, and earn. No external services needed.

---

## Phase 2: Billing & Payments (Week 5)

### 2.1 Stripe Integration
**Tables:** `subscriptions`, `subscription_plans`, `checkout_sessions` (migration 004)
**Files to modify:** `billing.ts`, `subscriptions.ts`
**New files:** `app/src/lib/stripe.ts` (Stripe client)

**Setup:**
1. Create Stripe products: Free, Pro ($9.99/mo), Studio ($29.99/mo)
2. Configure webhook endpoint in Stripe dashboard → `/api/billing/webhook`
3. Set env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**API routes to make real:**
- `POST /api/billing/checkout` → create Stripe Checkout session, return URL
- `POST /api/billing/webhook` → handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- `GET /api/billing/subscription` → query subscriptions table for current user

**Entitlement enforcement:**
- Create helper: `getUserTier(userId)` → 'free' | 'pro' | 'studio'
- Add tier checks to: AI generation endpoints, collaboration, export features
- Rate limits per tier (mashups/month, AI generations, etc.)

### Deliverable
Users can subscribe, manage billing via Stripe portal, and tier-gated features enforce limits.

---

## Phase 3: External API Integrations (Weeks 6-8)

### 3.1 Auto-Caption Generator (Whisper API)
**Files to modify:** `auto-caption.ts`
**External service:** OpenAI Whisper API ($0.006/min)

Implementation:
- Accept audio URL from mashup
- Stream to Whisper API with `response_format: 'verbose_json'`
- Parse segments with timestamps
- Generate SRT/VTT formats
- Store in new `mashup_captions` table

**New migration:** `010_captions.sql`
```sql
CREATE TABLE IF NOT EXISTS public.mashup_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID REFERENCES public.mashups(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  segments JSONB NOT NULL, -- [{start, end, text}]
  srt_text TEXT,
  vtt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mashup_id, language)
);
```

### 3.2 Trending Sounds (Spotify + YouTube APIs)
**Files to modify:** `trending-sounds.ts`
**External services:** Spotify Web API (free), YouTube Data API (free tier)

Implementation:
- Cron job (Vercel Cron, hourly): fetch top charts from Spotify and YouTube
- Upsert into `trending_sounds` table
- API route serves cached data, not live API calls

**New migration:** `010_trending.sql`
```sql
CREATE TABLE IF NOT EXISTS public.trending_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  source TEXT NOT NULL, -- 'spotify', 'youtube', 'internal'
  external_url TEXT,
  thumbnail_url TEXT,
  rank INTEGER,
  velocity NUMERIC DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_url)
);
```

### 3.3 Voice Chat (Daily.co)
**Files to modify:** `voice-chat.ts`
**External service:** Daily.co ($0.004/min)

Implementation:
- `POST /api/studio/:id/voice` → create Daily.co room via API, return room URL + token
- Client-side: `@daily-co/daily-js` for WebRTC
- Rooms are per-project, auto-expire after 1 hour of inactivity

### 3.4 Recommendations (OpenAI Embeddings)
**Files to modify:** `recommendations.ts`
**External service:** OpenAI Embeddings API ($0.0001/1K tokens)

Implementation:
- On mashup publish: generate embedding from title + description + genre + stems
- Store in Supabase with pgvector extension
- Query similar mashups: `SELECT * FROM mashups ORDER BY embedding <=> $1 LIMIT 10`
- Log recommendation events to existing `recommendation_events` table

**Requires:** Enable pgvector extension in Supabase, add `embedding vector(1536)` column to mashups table.

### Deliverable
Captions, trending sounds, voice chat, and smart recommendations all functional with real external services.

---

## Phase 4: AI Audio Processing (Weeks 9-12)

### 4.1 AI Mashup Generator
**Existing plan:** `app/docs/Audio Processing Backend Plan.md` (mostly correct)
**Files to modify:** `auto-mashup.ts`
**External services:** Replicate (Demucs for stem separation), Vercel Blob (storage)

Implementation:
- `POST /api/mashup/ai` → upload audio files to Vercel Blob, create job
- Background processing via Vercel Serverless Functions or Inngest:
  1. Analyze audio (BPM, key detection via FFmpeg/aubio)
  2. Separate stems via Replicate Demucs model
  3. Mix stems with FFmpeg (beat-matching, crossfades)
  4. Master output (normalization, compression)
  5. Upload result to Vercel Blob
- `GET /api/mashup/ai/:id` → poll job status
- Store job state in `mashup_stems` table + new `ai_jobs` table

**New migration:** `010_ai_jobs.sql`
```sql
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  job_type TEXT NOT NULL, -- 'mashup', 'stem_separation', 'vocal_generation', 'caption'
  status TEXT DEFAULT 'queued', -- queued, processing, complete, error
  progress INTEGER DEFAULT 0,
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### 4.2 Stem Separation
**Tables:** `mashup_stems` (migration 007b)
**External service:** Replicate (Demucs model, ~$0.05/track)

Implementation:
- `POST /api/audio/separate` → already exists, make it call Replicate
- Save separated stem URLs to `mashup_stems` table
- Update mashup `has_stems = true, stems_count = N`

### 4.3 AI Vocal Generation
**Files to modify:** `ai-vocal.ts`
**External service:** Replicate (Bark/RVC models, ~$0.01-0.10/generation)

Implementation:
- `POST /api/ai/vocals/generate` → submit to Replicate
- Poll for completion, save output to Vercel Blob
- Return audio URL to client

### 4.4 Sound DNA Extraction
**Files to modify:** extract-sound API route
**External service:** Replicate + OpenAI (for description parsing)

Implementation:
- Parse natural language description ("the bass riff at 0:42")
- If audio file provided, run stem separation, isolate described element
- If no file, generate matching sound via AI
- Save as new stem in `stems` table

### Deliverable
Core AI features functional: auto-mashup generation, stem separation, vocal generation, sound extraction. All backed by Replicate + Vercel Blob.

---

## Phase 5: Real-Time Features (Weeks 13-14)

### 5.1 Real-Time Collaboration (PartyKit)
**Files to modify:** `realtime-collab.ts`, `studio-collab.ts`
**Infrastructure:** PartyKit ($5/month base)

Implementation:
- PartyKit server: room per project, cursor sync, operation broadcast
- Client hook: `useStudioCollab(projectId)` with PartySocket
- Presence tracking: who's online, cursor positions
- Operation sync: track changes, volume changes, transport controls
- Persistence: save operations to Supabase `collaboration_sessions`

### 5.2 Live Notifications
**Infrastructure:** Supabase Realtime (included)

Implementation:
- Subscribe to `comments`, `likes`, `follows` inserts for current user
- Show real-time notifications in header
- Use Supabase Realtime channels, no additional infrastructure

### Deliverable
Multiple users can collaborate on mashups in real-time with cursor presence and synced state.

---

## Phase 6: Content Safety & Attribution (Weeks 15-16)

### 6.1 Audio Fingerprinting
**Files to modify:** `attribution.ts`, `content-id.ts`
**External service:** AcoustID/Chromaprint (free for non-commercial) or custom

Implementation:
- On upload: extract audio fingerprint via Chromaprint
- Store fingerprint in `rights_assets` table (fingerprint_id column exists)
- On new upload: compare against existing fingerprints
- Return match confidence score

### 6.2 Content Moderation
- Basic: check audio duration, file size, format validation (already partially done)
- Advanced: integrate with Audible Magic or similar service (defer until scale demands it)

### Deliverable
Basic attribution tracking via fingerprinting. Content ID integration deferred until needed.

---

## Phase 7: Analytics & Observability (Week 17)

### 7.1 Event Tracking
**Files to modify:** `analytics.ts`, `recommendation-events.ts`
**External service:** PostHog (free tier: 1M events/month)

Implementation:
- Client-side: PostHog snippet for page views, clicks, feature usage
- Server-side: log events to `recommendation_events` table for mashup-specific analytics
- Create materialized views for dashboard aggregations

### 7.2 Creator Analytics Dashboard
**Files to modify:** `analytics.ts`

Implementation:
- `GET /api/analytics/dashboard` → aggregate from plays, likes, follows tables
- Real data: play count trends, top mashups, follower growth
- Use Supabase aggregate queries, no external data warehouse needed initially

### Deliverable
Real analytics for creators. PostHog for product analytics. No ClickHouse/BigQuery needed at this scale.

---

## Client-Side Only Features (No Backend Needed)

These were listed in V1 as "needing backend" but are actually client-side:

| Feature | Implementation | Backend Needed? |
|---------|---------------|-----------------|
| MIDI Controller | Web MIDI API | No |
| Thumbnail Generator | HTML5 Canvas | No (save to Blob for sharing) |
| Waveform Visualization | Web Audio API | No |
| Style Portraits | Canvas rendering | No (already implemented) |

---

## New Migrations Summary

All new tables needed beyond existing migrations:

```
010_extended_features.sql
  - battle_votes (voting for battles)
  - user_gamification (XP, levels, badges)
  - xp_events (XP transaction log)
  - mashup_captions (Whisper transcriptions)
  - trending_sounds (cached external trends)
  - ai_jobs (async job tracking)
  - mashups.embedding (pgvector column for recommendations)
```

---

## Cost Estimates (Realistic)

### Monthly operational costs at 1,000 MAU
| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $25 | Pro plan |
| Vercel | $20 | Pro plan |
| Replicate | $20-50 | AI processing (~500 jobs/month) |
| OpenAI (Whisper) | $10 | Captions (~1,500 minutes) |
| OpenAI (Embeddings) | $2 | Recommendations |
| Stripe | 2.9% + $0.30/txn | On revenue only |
| Daily.co | $10 | Voice chat |
| PartyKit | $5-15 | Real-time collab |
| PostHog | $0 | Free tier |
| **Total** | **~$95-135/month** | |

### Per-user costs
- AI Mashup generation: ~$0.05
- Stem separation: ~$0.05
- Caption generation: ~$0.02
- Everything else: ~$0 (database queries)

---

## Timeline Summary

| Phase | Duration | What Ships |
|-------|----------|------------|
| Phase 0: Auth | Week 1 | Login, signup, sessions |
| Phase 1: Wire DB | Weeks 2-4 | 11 features backed by real data |
| Phase 2: Billing | Week 5 | Stripe subscriptions, tier enforcement |
| Phase 3: APIs | Weeks 6-8 | Captions, trending, voice chat, recommendations |
| Phase 4: AI | Weeks 9-12 | Mashup generation, stem separation, vocal AI |
| Phase 5: Realtime | Weeks 13-14 | Collab, live notifications |
| Phase 6: Safety | Weeks 15-16 | Fingerprinting, attribution |
| Phase 7: Analytics | Week 17 | Creator dashboards, PostHog |

**Total: 17 weeks** (vs V1's 24 weeks)
**Monthly cost: ~$100-135** (vs V1's $400-700)

---

## Key Differences from V1

1. **Wire before build** — most features just need Supabase queries, not new services
2. **Accurate inventory** — 10 files are real, not 34
3. **Schema already exists** — 40+ tables with RLS, don't need to design from scratch
4. **Realistic costs** — no Elasticsearch, ClickHouse, or custom WebSocket servers at MVP scale
5. **Auth first** — can't test anything without it
6. **Client-side features removed** — MIDI, thumbnails, waveforms don't need backend

---

*V2 Plan — Full Production Backend*
*Created: 2026-02-15*
