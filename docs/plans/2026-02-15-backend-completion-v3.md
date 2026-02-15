# Backend Completion Plan V3 — Remaining Work

**Date:** 2026-02-15
**Supersedes:** `docs/plans/2026-02-15-backend-full-production-v2.md` (data layer wiring done)
**Goal:** Complete everything the V2 plan called for beyond data layer wiring

**How to execute:** Start a new session and run `/superpowers:execute-plan` pointing at this file. Each step should build, commit, and ship independently.

---

## What's Already Done

- All 7 phases of data layer wiring shipped to main (mock→Supabase patterns in every data file)
- 12 migrations pushed to Supabase (40+ tables with RLS)
- Supabase env vars set on Vercel (production + preview)
- Auth callback route, Stripe checkout/webhook/portal, entitlements module
- 3 new migrations (010-012): fan subscriptions, captions/trending/voice rooms, AI jobs

## What's Left

12 steps organized into two groups:
- **Group A (Steps 1-7):** Code-only — can be executed immediately, no external keys needed
- **Group B (Steps 8-12):** Needs API keys — blocked until user provides credentials

---

## Group A: Code-Only Steps

### Step 1: `battle_votes` migration
**Priority:** High — `battles.ts:361` already inserts into this table but it doesn't exist. Production bug.

**Create** `app/supabase/migrations/013_battle_votes.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL,
  entry_id uuid NOT NULL REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, user_id)  -- one vote per user per battle
);

CREATE INDEX IF NOT EXISTS battle_votes_battle_idx ON public.battle_votes (battle_id);
CREATE INDEX IF NOT EXISTS battle_votes_user_idx ON public.battle_votes (user_id);

ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes in public battles"
  ON public.battle_votes FOR SELECT USING (true);

CREATE POLICY "Users can cast own votes"
  ON public.battle_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Push migration:** `cd app && npx supabase db push --linked --include-all`
**Build + commit + ship.**

---

### Step 2: Gamification tables migration
**Priority:** High — `gamification.ts` has types but no backing tables.

**Create** `app/supabase/migrations/014_gamification.sql`:
```sql
-- User gamification profile
CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  weekly_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  total_mashups integer NOT NULL DEFAULT 0,
  total_plays integer NOT NULL DEFAULT 0,
  total_likes_received integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon_url text,
  category text NOT NULL CHECK (category IN ('creation', 'social', 'streak', 'milestone', 'special')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_reward integer NOT NULL DEFAULT 0,
  condition_type text NOT NULL,
  condition_value integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- XP transaction log
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xp_transactions_user_idx ON public.xp_transactions (user_id);
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON public.user_badges (user_id);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Gamification: users see own, badges are public
CREATE POLICY "Users can view own gamification" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Badges are public" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own XP" ON public.xp_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own XP" ON public.xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Push migration.** Build + commit + ship.

---

### Step 3: Revenue splits table + wire `revenue-splits.ts`
**Priority:** Medium — the only data file with zero Supabase code.

**Create** `app/supabase/migrations/015_revenue_splits.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.revenue_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES public.mashups(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  payout_frequency text NOT NULL CHECK (payout_frequency IN ('instant', 'weekly', 'monthly')) DEFAULT 'monthly',
  minimum_payout numeric NOT NULL DEFAULT 10.00,
  platform_fee_percent numeric NOT NULL DEFAULT 15.0,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_distributed numeric NOT NULL DEFAULT 0,
  total_pending numeric NOT NULL DEFAULT 0,
  chain_id text,
  contract_address text,
  transaction_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  last_distribution_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.revenue_split_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id uuid NOT NULL REFERENCES public.revenue_splits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  wallet_address text,
  percentage numeric NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  role text NOT NULL CHECK (role IN ('creator', 'vocalist', 'producer', 'writer', 'other')) DEFAULT 'creator',
  verified boolean NOT NULL DEFAULT false,
  total_received numeric NOT NULL DEFAULT 0,
  last_payout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenue_splits_mashup_idx ON public.revenue_splits (mashup_id);
CREATE INDEX IF NOT EXISTS revenue_splits_creator_idx ON public.revenue_splits (creator_id);
CREATE INDEX IF NOT EXISTS revenue_split_recipients_split_idx ON public.revenue_split_recipients (split_id);
CREATE INDEX IF NOT EXISTS revenue_split_recipients_user_idx ON public.revenue_split_recipients (user_id);

ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_split_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view splits they participate in" ON public.revenue_splits
  FOR SELECT USING (
    creator_id = auth.uid() OR
    id IN (SELECT split_id FROM public.revenue_split_recipients WHERE user_id = auth.uid())
  );
CREATE POLICY "Creators can create splits" ON public.revenue_splits
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own splits" ON public.revenue_splits
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can view recipient entries they're part of" ON public.revenue_split_recipients
  FOR SELECT USING (
    user_id = auth.uid() OR
    split_id IN (SELECT id FROM public.revenue_splits WHERE creator_id = auth.uid())
  );
CREATE POLICY "Split creators can manage recipients" ON public.revenue_split_recipients
  FOR INSERT WITH CHECK (
    split_id IN (SELECT id FROM public.revenue_splits WHERE creator_id = auth.uid())
  );
```

**Edit** `app/src/lib/data/revenue-splits.ts`:
- Add `isSupabaseConfigured()` check at top
- Wire `getSplitById()` → query `revenue_splits` + `revenue_split_recipients`
- Wire `getSplitsByMashup()` → query by mashup_id
- Wire `getSplitsByUser()` → query where user is recipient
- Wire `createRevenueSplit()` → insert into `revenue_splits` + `revenue_split_recipients`
- Wire `getEarningsSummary()` → aggregate from recipient records
- Keep all mock data as fallbacks
- Keep blockchain simulation as mock (no real chain needed)

**Push migration.** Build + commit + ship.

---

### Step 4: Tier enforcement on API routes
**Priority:** High — free users currently have unlimited access to everything.

**Create** `app/src/lib/billing/enforce-tier.ts`:
```typescript
// Helper that API routes call before processing
// 1. Extract user from Supabase session
// 2. Count their usage this month (query ai_jobs / mashups tables)
// 3. Call checkUsageLimit() from entitlements.ts
// 4. Return { allowed, userId, tier, remaining } or a 403 NextResponse
```

**Edit these API routes to add tier checks:**
- `app/src/app/api/upload/route.ts` — check mashup upload limit
- `app/src/app/api/audio/separate/route.ts` — check stem separation limit
- `app/src/app/api/ai/complete/route.ts` — check AI generation limit
- `app/src/app/api/ai/generate-stem/route.ts` — check AI generation limit

**Behavior:**
- Unauthenticated users → free tier limits
- Authenticated users → query their subscription tier
- Over limit → return 403 with `{ error, limit, remaining, tier }`
- Within limit → proceed normally

Build + commit + ship.

---

### Step 5: Realtime collab session persistence
**Priority:** Medium — in-memory `Map` means sessions are lost on deploy/cold start.

**Edit** `app/src/lib/data/realtime-collab.ts`:
- `createCollabSession()` → after creating in Map, call `persistCollabSession()` to save to Supabase
- `joinCollabSession()` → if session not in Map, try fetching from `collaboration_sessions` table; insert participant into `collaboration_participants`
- `leaveCollabSession()` → update participant `status` in Supabase
- Keep in-memory Map as hot cache for the current process
- Supabase is source of truth for session existence

Build + commit + ship.

---

### Step 6: Fix `recommendation_events` schema mismatch
**Priority:** High — every `logRecommendationEvent()` call fails silently because the CHECK constraint rejects the values the code sends.

**Create** `app/supabase/migrations/016_fix_recommendation_events.sql`:
```sql
-- Expand event_type CHECK to include recommendation-specific events
ALTER TABLE public.recommendation_events
  DROP CONSTRAINT IF EXISTS recommendation_events_event_type_check;

ALTER TABLE public.recommendation_events
  ADD CONSTRAINT recommendation_events_event_type_check
  CHECK (event_type IN (
    'impression', 'play', 'skip', 'like', 'share', 'open',
    'shown', 'clicked', 'dismissed', 'completed'
  ));

-- Add columns that recommendations.ts expects
ALTER TABLE public.recommendation_events
  ADD COLUMN IF NOT EXISTS recommendation_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
```

**Push migration.** Build + commit + ship.

---

### Step 7: Analytics time-series foundation
**Priority:** Medium — analytics only shows aggregate totals, no trends.

**Create** `app/supabase/migrations/017_analytics_events.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  mashup_id uuid REFERENCES public.mashups(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('play', 'like', 'share', 'comment', 'save', 'skip', 'download', 'embed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_mashup_time_idx
  ON public.analytics_events (mashup_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_user_time_idx
  ON public.analytics_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_type_time_idx
  ON public.analytics_events (event_type, created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can log own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creators can read events on their mashups
CREATE POLICY "Creators can view events on own mashups" ON public.analytics_events
  FOR SELECT USING (
    mashup_id IN (SELECT id FROM public.mashups WHERE creator_id = auth.uid())
  );
```

**Edit** `app/src/lib/data/analytics.ts`:
- Add `getCreatorAnalyticsTimeSeries(userId, period: 'day'|'week'|'month', range: number)`:
  - Query `analytics_events` with `date_trunc(period, created_at)` grouping
  - Return `{ date, plays, likes, shares, comments }[]`
  - Mock fallback: generate synthetic time-series data
- Add `logAnalyticsEvent(userId, mashupId, eventType)` for client-side tracking
- Keep existing `buildCreatorAnalytics` and `getCreatorAnalyticsFromDb` unchanged

**Push migration.** Build + commit + ship.

---

## Group B: Needs API Keys

Execute these steps one at a time as keys become available. Each is independent.

### Step 8: Auto-captions with OpenAI Whisper
**Requires:** `OPENAI_API_KEY` set in `.env.local` and Vercel

**Create** `app/src/lib/audio/whisper.ts`:
- Function `transcribeWithWhisper(audioUrl: string): Promise<CaptionSegment[]>`
- Call OpenAI Whisper API with `response_format: 'verbose_json'`
- Parse `segments` from response into `{ start, end, text }` format
- Handle errors gracefully

**Edit** `app/src/lib/data/auto-caption.ts`:
- In `transcribeAudio()`: check for `process.env.OPENAI_API_KEY`
- If present → call `transcribeWithWhisper()` → save to DB via `saveCaptionsToDb()`
- If missing → fall back to existing mock simulation

Build + commit + ship.

---

### Step 9: Trending sounds ingestion (Spotify + YouTube)
**Requires:** `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `YOUTUBE_API_KEY`

**Create** `app/src/lib/integrations/spotify.ts`:
- Client credentials OAuth flow
- Fetch featured playlists / top tracks
- Return normalized `{ title, artist, source, external_url, thumbnail_url }[]`

**Create** `app/src/lib/integrations/youtube.ts`:
- Fetch trending music videos via YouTube Data API v3
- Return same normalized format

**Create** `app/src/app/api/cron/trending/route.ts`:
- Vercel Cron handler (runs daily)
- Fetches from Spotify + YouTube
- Upserts into `trending_sounds` table
- `trending-sounds.ts` already has Supabase queries — no changes needed there

**Add to** `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/trending", "schedule": "0 6 * * *" }] }
```

Build + commit + ship.

---

### Step 10: Recommendations with OpenAI embeddings + pgvector
**Requires:** `OPENAI_API_KEY` + pgvector extension enabled in Supabase

**Create migration** to enable pgvector and add embedding column to `mashups`:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE public.mashups ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS mashups_embedding_idx ON public.mashups USING ivfflat (embedding vector_cosine_ops);
```

**Create** `app/src/lib/ai/embeddings.ts`:
- `generateEmbedding(text: string): Promise<number[]>` — call OpenAI embeddings API
- `embedMashup(mashupId, title, genre, tags)` — generate and store embedding

**Edit** `app/src/lib/data/recommendations.ts`:
- In `getRecommendations()`: if embeddings exist, query `ORDER BY embedding <=> $1 LIMIT 10`
- If no embeddings → fall back to existing mock

Build + commit + ship.

---

### Step 11: Voice chat with Daily.co
**Requires:** `DAILY_API_KEY`

**Create** `app/src/lib/integrations/daily.ts`:
- `createDailyRoom(name: string): Promise<{ url, token }>` — POST to Daily REST API
- `deleteDailyRoom(name: string)` — DELETE room
- Rooms auto-expire after 1 hour of inactivity

**Edit** `app/src/lib/data/voice-chat.ts`:
- In `createVoiceRoom()`: if `DAILY_API_KEY` exists, create real Daily room
- Store `provider_room_url` in `voice_rooms` table
- If no key → fall back to existing mock

Build + commit + ship.

---

### Step 12: PostHog analytics
**Requires:** `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_HOST` (optional, defaults to cloud)

**Install:** `npm install posthog-js posthog-node`

**Create** `app/src/lib/analytics/posthog.ts`:
- Client-side: `posthog.init()` with project key
- Server-side: `PostHog` node client for API route events

**Edit** `app/src/app/layout.tsx`:
- Add `<PostHogProvider>` wrapper (conditional on key existing)

**Track key events:** page views, mashup plays, uploads, battle entries, AI generations

Build + commit + ship.

---

## Skipping (not needed for MVP)

- **Content ID / Chromaprint** — complex AcoustID integration, low ROI now
- **Audio steganography** — JSON attribution watermark is fine for MVP
- **PartyKit** — Supabase Realtime channels already work for collab (`use-realtime-collab.ts`)

---

## Verification

After each step:
1. `cd app && npx next build` must pass
2. Ship: commit → push feature → merge to main → switch back
3. `npx supabase db push --linked --include-all` for migration steps

After all Group A steps:
- Deploy to Vercel (automatic on main push)
- Sign up on production → verify auth works
- Check that battle voting, gamification, revenue splits pages load real data
- Verify tier enforcement returns 403 when limits exceeded
- Verify collab sessions survive page refresh
- Check recommendation events actually insert (no silent failures)

After Group B steps (as completed):
- Auto-captions: upload audio → verify real transcription appears
- Trending: check `/api/cron/trending` → verify `trending_sounds` table populated
- Recommendations: publish mashup → verify embedding stored → verify similar mashups returned
- Voice chat: create room → verify Daily.co room URL returned
- PostHog: visit pages → verify events appear in PostHog dashboard
