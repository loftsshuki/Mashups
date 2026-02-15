# Challenge Engine - Backend Plan

**Priority:** P1  
**Timeline:** 2 weeks  
**Cost:** $0 (uses existing database)

---

## Overview

Weekly/daily themed challenges with automated scoring and leaderboards.

## Challenge Types

| Type | Frequency | Duration | Focus |
|------|-----------|----------|-------|
| **Daily** | Every day | 24 hours | Quick creativity |
| **Weekly** | Every Monday | 7 days | Themed deep dives |
| **Special** | Events | Varies | Collabs, holidays |

## Database Schema

```sql
-- Challenges
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text, -- e.g., "Retro Gaming", "Nature Sounds"
  
  -- Type & Schedule
  type text CHECK (type IN ('daily', 'weekly', 'special')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  
  -- Status
  status text CHECK (status IN ('upcoming', 'active', 'completed')),
  
  -- Optional linked content
  stem_pack_id uuid, -- Specific stems for challenge
  sample_pack_id uuid,
  featured_track_id uuid,
  
  -- Rewards
  reward_credits integer DEFAULT 0,
  reward_badge_id text,
  reward_featured boolean DEFAULT false,
  
  -- Scoring config
  scoring_config jsonb DEFAULT '{
    "playsWeight": 1,
    "likesWeight": 5,
    "sharesWeight": 10,
    "commentsWeight": 3,
    "earlyBonus": 50
  }'::jsonb,
  
  created_at timestamp DEFAULT now()
);

-- Challenge Entries
CREATE TABLE challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  mashup_id uuid REFERENCES mashups(id),
  
  submitted_at timestamp DEFAULT now(),
  
  -- Scores (updated by cron)
  plays_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  total_score integer DEFAULT 0,
  
  -- Result
  rank integer,
  won_prize boolean DEFAULT false,
  
  UNIQUE(challenge_id, user_id) -- One entry per user
);

-- Challenge Leaderboard Cache
CREATE MATERIALIZED VIEW challenge_leaderboards AS
SELECT
  challenge_id,
  user_id,
  mashup_id,
  total_score,
  rank() OVER (PARTITION BY challenge_id ORDER BY total_score DESC) as rank
FROM challenge_entries
WHERE rank <= 100; -- Top 100 only

-- Indexes
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_challenge_entries_challenge ON challenge_entries(challenge_id, total_score DESC);
```

## API Endpoints

### Get Current Challenge
```typescript
GET /api/challenges/current

Response:
{
  "challenge": {
    "id": "uuid",
    "title": "Retro Wave Week",
    "description": "Create a mashup with 80s synth vibes",
    "theme": "Retro",
    "type": "weekly",
    "startDate": "2026-02-10",
    "endDate": "2026-02-17",
    "timeRemaining": { "days": 3, "hours": 12 },
    "stemPack": {
      "id": "uuid",
      "name": "Retro Synth Stems",
      "previewUrl": "..."
    },
    "rewards": {
      "credits": 500,
      "badge": { "id": "retro_master", "name": "Retro Master" },
      "featured": true
    },
    "stats": {
      "entryCount": 45,
      "yourRank": 12 // If submitted
    }
  }
}
```

### List Challenges
```typescript
GET /api/challenges?status=active&page=1

Response:
{
  "challenges": [
    {
      "id": "uuid",
      "title": "...",
      "type": "weekly",
      "status": "active",
      "entryCount": 45,
      "endDate": "..."
    }
  ]
}
```

### Get Challenge Details
```typescript
GET /api/challenges/:id

Response:
{
  "challenge": { /* full details */ },
  "leaderboard": [
    {
      "rank": 1,
      "user": { "id", "name", "avatar" },
      "mashup": { "id", "title", "coverUrl" },
      "score": 1250,
      "stats": { "plays": 100, "likes": 50, "shares": 20 }
    }
  ],
  "yourEntry": { // If submitted
    "entryId": "uuid",
    "mashupId": "uuid",
    "submittedAt": "...",
    "score": 800,
    "rank": 12
  }
}
```

### Submit Entry
```typescript
POST /api/challenges/:id/submit

Body:
{
  "mashupId": "uuid"
}

Response:
{
  "entryId": "uuid",
  "submittedAt": "...",
  "message": "Entry submitted! Current rank: --"
}
```

## Scoring Algorithm

```typescript
// lib/challenges/scoring.ts

interface ScoringConfig {
  playsWeight: number;
  likesWeight: number;
  sharesWeight: number;
  commentsWeight: number;
  earlyBonus: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
  playsWeight: 1,
  likesWeight: 5,
  sharesWeight: 10,
  commentsWeight: 3,
  earlyBonus: 50
};

export function calculateScore(
  entry: ChallengeEntry,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const baseScore =
    entry.plays_count * config.playsWeight +
    entry.likes_count * config.likesWeight +
    entry.shares_count * config.sharesWeight +
    entry.comments_count * config.commentsWeight;

  // Early submission bonus
  const earlyBonus = isEarlySubmission(entry) ? config.earlyBonus : 0;

  return baseScore + earlyBonus;
}

function isEarlySubmission(entry: ChallengeEntry): boolean {
  // Within first 24 hours of challenge
  const submissionTime = new Date(entry.submitted_at).getTime();
  const challengeStart = new Date(entry.challenge.start_date).getTime();
  const hoursDiff = (submissionTime - challengeStart) / (1000 * 60 * 60);
  
  return hoursDiff <= 24;
}

// Update scores (run by cron)
export async function updateChallengeScores(challengeId: string): Promise<void> {
  const { data: entries } = await supabase
    .from('challenge_entries')
    .select('*, mashup:mashups(*)')
    .eq('challenge_id', challengeId);

  const { data: challenge } = await supabase
    .from('challenges')
    .select('scoring_config')
    .eq('id', challengeId)
    .single();

  for (const entry of entries) {
    const score = calculateScore(entry, challenge.scoring_config);
    
    await supabase
      .from('challenge_entries')
      .update({ total_score: score })
      .eq('id', entry.id);
  }

  // Refresh leaderboard materialized view
  await supabase.rpc('refresh_challenge_leaderboard', { challenge_id: challengeId });
}
```

## Cron Jobs

```typescript
// app/api/cron/challenges/route.ts

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();

  // 1. Start new challenges
  await startNewChallenges(now);

  // 2. Update scores for active challenges
  await updateActiveChallengeScores();

  // 3. Complete ended challenges
  await completeChallenges(now);

  return Response.json({ success: true });
}

async function startNewChallenges(now: Date): Promise<void> {
  // Start challenges where start_date <= now
  await supabase.rpc('activate_challenges', { current_date: now });
}

async function updateActiveChallengeScores(): Promise<void> {
  const { data: active } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active');

  for (const challenge of active) {
    await updateChallengeScores(challenge.id);
  }
}

async function completeChallenges(now: Date): Promise<void> {
  // Find challenges ending today
  const { data: ending } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .lt('end_date', now);

  for (const challenge of ending) {
    // Final score update
    await updateChallengeScores(challenge.id);

    // Award prizes
    await awardPrizes(challenge.id);

    // Mark as completed
    await supabase
      .from('challenges')
      .update({ status: 'completed' })
      .eq('id', challenge.id);
  }
}

async function awardPrizes(challengeId: string): Promise<void> {
  const { data: winners } = await supabase
    .from('challenge_entries')
    .select('user_id, rank')
    .eq('challenge_id', challengeId)
    .order('rank', { ascending: true })
    .limit(3); // Top 3

  for (const winner of winners) {
    // Award credits
    await supabase.rpc('award_credits', {
      user_id: winner.user_id,
      amount: getPrizeAmount(winner.rank)
    });

    // Award badge (if applicable)
    if (winner.rank === 1) {
      await supabase.from('user_badges').insert({
        user_id: winner.user_id,
        badge_id: 'challenge_winner'
      });
    }

    // Mark entry as won
    await supabase
      .from('challenge_entries')
      .update({ won_prize: true })
      .eq('challenge_id', challengeId)
      .eq('user_id', winner.user_id);
  }
}

function getPrizeAmount(rank: number): number {
  switch (rank) {
    case 1: return 500;
    case 2: return 300;
    case 3: return 100;
    default: return 0;
  }
}
```

## Weekly Challenge Generation

```typescript
// lib/challenges/generator.ts

const THEMES = [
  { name: 'Retro Wave', description: '80s synth and retro vibes' },
  { name: 'Nature Remix', description: 'Blend nature sounds with beats' },
  { name: 'Movie Mash', description: 'Famous movie quotes and themes' },
  { name: 'Gaming Beats', description: 'Video game music remixes' },
  { name: 'Vocal Chop', description: 'Creative vocal manipulation' },
  // ... more themes
];

export async function generateWeeklyChallenge(startDate: Date): Promise<void> {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  await supabase.from('challenges').insert({
    title: `${theme.name} Week`,
    description: theme.description,
    theme: theme.name,
    type: 'weekly',
    start_date: startDate,
    end_date: endDate,
    status: 'upcoming',
    reward_credits: 500,
    reward_badge_id: 'weekly_winner',
    reward_featured: true
  });
}
```

## Notifications

```typescript
// lib/challenges/notifications.ts

export async function notifyNewChallenge(challenge: Challenge): Promise<void> {
  // Get all users with notifications enabled
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('notify_new_challenges', true);

  // Queue notification emails
  for (const user of users) {
    await queueEmail(user.id, 'new_challenge', {
      challengeTitle: challenge.title,
      challengeUrl: `/challenges/${challenge.id}`
    });
  }
}

export async function notifyChallengeWinner(entry: ChallengeEntry): Promise<void> {
  await queueEmail(entry.user_id, 'challenge_won', {
    challengeTitle: entry.challenge.title,
    rank: entry.rank,
    creditsWon: getPrizeAmount(entry.rank)
  });
}
```

## Cost

| Component | Cost |
|-----------|------|
| Database | Existing |
| Compute | Minimal (cron) |
| Storage | Existing |
| **Total** | **$0/month** |

---

*Next: Voice Chat*