# Analytics Dashboard - Backend Plan

**Priority:** P1  
**Timeline:** 2-3 weeks  
**Cost:** $50-100/month

---

## Overview

Track and visualize mashup performance, user engagement, and growth metrics.

## Architecture

```
Frontend Events → Segment/PostHog → Data Warehouse → Aggregations → Dashboard API
     │                                                         ↑
     └────────────── Real-time Counters (Redis) ───────────────┘
```

## Event Tracking

```typescript
// lib/analytics/events.ts
import { posthog } from 'posthog-js';

export const analytics = {
  // Mashup events
  trackMashupPlay: (mashupId: string, metadata: { source: string; autoPlay: boolean }) => {
    posthog.capture('mashup_played', {
      mashup_id: mashupId,
      ...metadata
    });
  },

  trackMashupCreate: (metadata: { trackCount: number; duration: number; usedAI: boolean }) => {
    posthog.capture('mashup_created', metadata);
  },

  trackExport: (platform: string, format: string) => {
    posthog.capture('mashup_exported', { platform, format });
  },

  trackAILike: (mashupId: string, reaction: string) => {
    posthog.capture('ai_reaction', { mashup_id: mashupId, reaction });
  },

  // Engagement
  trackFollow: (creatorId: string) => {
    posthog.capture('user_followed', { creator_id: creatorId });
  },

  trackComment: (mashupId: string, hasMedia: boolean) => {
    posthog.capture('comment_posted', { mashup_id: mashupId, has_media: hasMedia });
  },

  // Conversion
  trackUpgrade: (fromTier: string, toTier: string) => {
    posthog.capture('subscription_upgraded', { from: fromTier, to: toTier });
  }
};
```

## Database Schema

```sql
-- Analytics events (raw)
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  properties jsonb,
  timestamp timestamp DEFAULT now(),
  session_id text
);

-- Aggregated daily stats (per mashup)
CREATE TABLE mashup_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Metrics
  plays integer DEFAULT 0,
  unique_plays integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  comments integer DEFAULT 0,
  downloads integer DEFAULT 0,
  avg_watch_time numeric, -- seconds
  
  UNIQUE(mashup_id, date)
);

-- User stats (daily)
CREATE TABLE user_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Activity
  mashups_created integer DEFAULT 0,
  plays_received integer DEFAULT 0,
  followers_gained integer DEFAULT 0,
  
  UNIQUE(user_id, date)
);

-- Real-time counters (Redis-backed)
-- Key: mashup:{id}:plays, mashup:{id}:likes, etc.

-- Indexes
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, timestamp);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, timestamp);
CREATE INDEX idx_mashup_stats_date ON mashup_daily_stats(mashup_id, date);
```

## API Endpoints

### Dashboard Overview
```typescript
GET /api/analytics/dashboard

Response:
{
  "period": { "start": "2026-01-01", "end": "2026-02-01" },
  "summary": {
    "totalPlays": 15420,
    "totalLikes": 3420,
    "totalShares": 890,
    "followers": 234,
    "following": 45
  },
  "trends": {
    "playsOverTime": [
      { "date": "2026-01-01", "plays": 450 },
      { "date": "2026-01-02", "plays": 520 }
    ],
    "likesOverTime": [...]
  },
  "topContent": [
    {
      "mashupId": "uuid",
      "title": "Summer Vibes Mix",
      "plays": 5000,
      "likes": 1200,
      "growth": 15 // %
    }
  ],
  "sources": [
    { "source": "direct", "count": 8000, "percentage": 52 },
    { "source": "twitter", "count": 3000, "percentage": 19 },
    { "source": "instagram", "count": 2000, "percentage": 13 }
  ],
  "demographics": {
    "countries": [{ "country": "US", "percentage": 45 }],
    "devices": [{ "device": "mobile", "percentage": 60 }]
  }
}
```

### Mashup Analytics
```typescript
GET /api/analytics/mashups/:id

Response:
{
  "mashup": {
    "id": "uuid",
    "title": "...",
    "createdAt": "..."
  },
  "lifetime": {
    "plays": 10000,
    "uniquePlays": 8500,
    "likes": 2000,
    "shares": 500,
    "comments": 150
  },
  "retention": {
    "avgWatchTime": 120, // seconds
    "completionRate": 65, // %
    "dropOffPoints": [
      { "time": 30, "percentage": 15 },
      { "time": 60, "percentage": 25 },
      { "time": 120, "percentage": 40 }
    ]
  },
  "daily": [
    { "date": "2026-01-01", "plays": 100, "likes": 20 }
  ],
  "peakTimes": [
    { "hour": 20, "plays": 500 }, // 8 PM most popular
    { "hour": 14, "plays": 400 }  // 2 PM
  ]
}
```

### Real-time Stats
```typescript
GET /api/analytics/realtime

Response:
{
  "activeUsers": 42,
  "playingNow": [
    { "mashupId": "uuid", "listeners": 5 },
    { "mashupId": "uuid", "listeners": 3 }
  ],
  "lastHour": {
    "plays": 150,
    "likes": 30
  }
}
```

## Aggregation Pipeline

```typescript
// lib/analytics/aggregate.ts
import { CronJob } from 'cron';

// Run daily at 2 AM
export function startAggregationJobs() {
  new CronJob('0 2 * * *', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await aggregateMashupStats(yesterday);
    await aggregateUserStats(yesterday);
    await refreshMaterializedViews();
  }).start();
}

async function aggregateMashupStats(date: Date) {
  const dateStr = date.toISOString().split('T')[0];

  await supabase.rpc('aggregate_mashup_stats', {
    target_date: dateStr
  });
}

// SQL function for aggregation
/*
CREATE OR REPLACE FUNCTION aggregate_mashup_stats(target_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO mashup_daily_stats (
    mashup_id, date, plays, unique_plays, likes, shares
  )
  SELECT
    (properties->>'mashup_id')::uuid as mashup_id,
    target_date,
    COUNT(*) FILTER (WHERE event_type = 'mashup_played'),
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'mashup_played'),
    COUNT(*) FILTER (WHERE event_type = 'mashup_liked'),
    COUNT(*) FILTER (WHERE event_type = 'mashup_shared')
  FROM analytics_events
  WHERE date_trunc('day', timestamp) = target_date
  GROUP BY properties->>'mashup_id'
  ON CONFLICT (mashup_id, date)
  DO UPDATE SET
    plays = EXCLUDED.plays,
    unique_plays = EXCLUDED.unique_plays,
    likes = EXCLUDED.likes,
    shares = EXCLUDED.shares;
END;
$$ LANGUAGE plpgsql;
*/
```

## Real-time Counters (Redis)

```typescript
// lib/analytics/realtime.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const realtimeCounters = {
  async incrementPlay(mashupId: string): Promise<number> {
    const key = `mashup:${mashupId}:plays`;
    return redis.incr(key);
  },

  async incrementLike(mashupId: string): Promise<number> {
    const key = `mashup:${mashupId}:likes`;
    return redis.incr(key);
  },

  async getStats(mashupId: string) {
    const [plays, likes] = await redis.mget(
      `mashup:${mashupId}:plays`,
      `mashup:${mashupId}:likes`
    );
    return {
      plays: parseInt(plays || '0'),
      likes: parseInt(likes || '0')
    };
  },

  // Sync to database every 5 minutes
  async syncToDatabase() {
    const keys = await redis.keys('mashup:*:plays');
    
    for (const key of keys) {
      const mashupId = key.split(':')[1];
      const count = await redis.get(key);
      
      await supabase.rpc('update_realtime_stats', {
        mashup_id: mashupId,
        plays: parseInt(count || '0')
      });

      // Reset counter
      await redis.set(key, 0);
    }
  }
};
```

## Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| PostHog | Free (1M events) | $0 |
| PostHog | Growth (10M events) | $150/month |
| Redis | Upstash 10K ops/day | $0 |
| **Typical** | | **$0-50/month** |

---

*Next: Trending Sounds*