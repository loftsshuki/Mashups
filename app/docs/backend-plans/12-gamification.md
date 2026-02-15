# Gamification System - Backend Plan

**Priority:** P2  
**Timeline:** 1-2 weeks  
**Cost:** $0 (uses existing database)

---

## Overview

XP, levels, badges, and achievements to increase user engagement and retention.

## Core Mechanics

| Feature | Description |
|---------|-------------|
| **XP** | Experience points for activities |
| **Levels** | 100 levels with increasing thresholds |
| **Badges** | Achievements for milestones |
| **Streaks** | Daily/weekly activity tracking |
| **Leaderboards** | Rankings by XP, mashups, etc. |

## Database Schema

```sql
-- User gamification stats
CREATE TABLE user_gamification (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  
  -- XP & Level
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  xp_to_next_level integer DEFAULT 100,
  
  -- Streaks
  weekly_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_at timestamp,
  
  -- Stats
  total_mashups integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_likes_received integer DEFAULT 0,
  
  updated_at timestamp DEFAULT now()
);

-- Badges
CREATE TABLE badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon_url text,
  category text, -- 'creation', 'engagement', 'achievement'
  rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward integer DEFAULT 0,
  condition_type text, -- 'mashup_count', 'play_count', etc.
  condition_value integer
);

-- User badges
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  badge_id text REFERENCES badges(id),
  earned_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, badge_id)
);

-- XP transactions (audit log)
CREATE TABLE xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount integer NOT NULL,
  reason text NOT NULL, -- 'mashup_created', 'like_received', etc.
  reference_id uuid, -- mashup_id, etc.
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

-- Leaderboard cache
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT
  user_id,
  total_xp,
  current_level,
  row_number() OVER (ORDER BY total_xp DESC) as rank
FROM user_gamification
WHERE updated_at > now() - interval '7 days'
LIMIT 100;

-- Indexes
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id, created_at);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

## XP Rules

```typescript
// lib/gamification/xp.ts

export const XP_RULES = {
  // Creation
  MASHUP_CREATED: 100,
  STEM_UPLOADED: 50,
  AI_MASHUP_CREATED: 150,
  
  // Engagement (received)
  LIKE_RECEIVED: 10,
  PLAY_RECEIVED: 1, // Capped at 100/day
  COMMENT_RECEIVED: 15,
  FOLLOWER_GAINED: 25,
  SHARE_RECEIVED: 30,
  
  // Engagement (given)
  LIKE_GIVEN: 2,
  COMMENT_POSTED: 5,
  
  // Challenges & Battles
  CHALLENGE_ENTERED: 50,
  CHALLENGE_WON: 500,
  BATTLE_WON: 1000,
  
  // Streaks
  STREAK_3_DAYS: 50,
  STREAK_7_DAYS: 200,
  STREAK_30_DAYS: 1000,
  STREAK_100_DAYS: 5000,
  
  // Milestones
  FIRST_MASHUP: 200,
  FIRST_100_PLAYS: 300,
  FIRST_1000_PLAYS: 1000,
  VIRAL_HIT_10K: 2000,
  
  // Social
  PROFILE_COMPLETED: 100,
  BIO_ADDED: 25,
  AVATAR_UPLOADED: 25
};

// Daily caps
export const XP_CAPS = {
  PLAY_RECEIVED: 100, // Max 100 XP from plays per day
  LIKE_RECEIVED: 200,
  COMMENT_RECEIVED: 150
};
```

## Level System

```typescript
// lib/gamification/levels.ts

export function calculateLevel(xp: number): number {
  // Quadratic growth: Level = sqrt(XP / 100) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}

// Level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  5: 'Apprentice',
  10: 'Producer',
  20: 'Beatmaker',
  30: 'Remixer',
  50: 'Maestro',
  75: 'Virtuoso',
  100: 'Legend'
};

export function getLevelTitle(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (level >= threshold) {
      return LEVEL_TITLES[threshold];
    }
  }
  return 'Novice';
}
```

## Service Implementation

```typescript
// lib/gamification/service.ts

export class GamificationService {
  async awardXP(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<{ newXP: number; leveledUp: boolean; newLevel?: number }> {
    // Check daily caps
    const cappedAmount = await this.applyDailyCap(userId, reason, amount);
    if (cappedAmount <= 0) return { newXP: 0, leveledUp: false };

    // Record transaction
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: cappedAmount,
      reason,
      reference_id: referenceId
    });

    // Get current stats
    const { data: stats } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    const oldLevel = stats?.current_level || 1;
    const newXP = (stats?.total_xp || 0) + cappedAmount;
    const newLevel = calculateLevel(newXP);

    // Update stats
    await supabase
      .from('user_gamification')
      .upsert({
        user_id: userId,
        total_xp: newXP,
        current_level: newLevel,
        xp_to_next_level: xpToNextLevel(newXP)
      });

    // Check for level up
    const leveledUp = newLevel > oldLevel;
    if (leveledUp) {
      await this.handleLevelUp(userId, newLevel);
    }

    // Check for badge unlocks
    await this.checkBadgeUnlocks(userId);

    return { newXP, leveledUp, newLevel: leveledUp ? newLevel : undefined };
  }

  async checkBadgeUnlocks(userId: string): Promise<void> {
    const { data: stats } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const existingIds = new Set(existingBadges?.map(b => b.badge_id));

    // Check each badge condition
    const { data: allBadges } = await supabase.from('badges').select('*');

    for (const badge of allBadges) {
      if (existingIds.has(badge.id)) continue;

      const unlocked = await this.checkBadgeCondition(badge, stats);
      if (unlocked) {
        await this.awardBadge(userId, badge);
      }
    }
  }

  private async checkBadgeCondition(
    badge: Badge,
    stats: UserGamification
  ): Promise<boolean> {
    switch (badge.condition_type) {
      case 'mashup_count':
        return stats.total_mashups >= badge.condition_value;
      case 'play_count':
        return stats.total_plays >= badge.condition_value;
      case 'level':
        return stats.current_level >= badge.condition_value;
      case 'streak':
        return stats.weekly_streak >= badge.condition_value;
      default:
        return false;
    }
  }

  private async awardBadge(userId: string, badge: Badge): Promise<void> {
    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badge.id
    });

    // Award XP for badge
    if (badge.xp_reward > 0) {
      await this.awardXP(userId, badge.xp_reward, 'badge_earned', null);
    }

    // Send notification
    await sendNotification(userId, 'badge_earned', {
      badgeName: badge.name,
      badgeIcon: badge.icon_url
    });
  }

  async updateStreak(userId: string): Promise<void> {
    const { data: stats } = await supabase
      .from('user_gamification')
      .select('last_activity_at, weekly_streak')
      .eq('user_id', userId)
      .single();

    const lastActivity = stats?.last_activity_at;
    const now = new Date();

    if (!lastActivity) {
      // First activity
      await supabase
        .from('user_gamification')
        .update({ weekly_streak: 1, last_activity_at: now })
        .eq('user_id', userId);
      return;
    }

    const daysSince = Math.floor(
      (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince === 0) {
      // Already active today, no change
      return;
    } else if (daysSince === 1) {
      // Consecutive day
      const newStreak = (stats.weekly_streak || 0) + 1;
      await supabase
        .from('user_gamification')
        .update({
          weekly_streak: newStreak,
          longest_streak: Math.max(newStreak, stats?.longest_streak || 0),
          last_activity_at: now
        })
        .eq('user_id', userId);

      // Check streak badges
      await this.checkStreakBadge(userId, newStreak);
    } else {
      // Streak broken
      await supabase
        .from('user_gamification')
        .update({ weekly_streak: 1, last_activity_at: now })
        .eq('user_id', userId);
    }
  }
}
```

## API Endpoints

### Get Profile
```typescript
GET /api/gamification/profile

Response:
{
  "userId": "uuid",
  "level": 15,
  "title": "Producer",
  "xp": 2200,
  "xpToNextLevel": 300,
  "progress": 73, // % to next level
  "streak": {
    "current": 7,
    "longest": 14
  },
  "stats": {
    "mashupsCreated": 25,
    "totalPlays": 5000,
    "likesReceived": 340
  },
  "badges": [
    {
      "id": "first_mashup",
      "name": "First Steps",
      "description": "Created your first mashup",
      "iconUrl": "...",
      "rarity": "common",
      "earnedAt": "2026-01-15"
    }
  ]
}
```

### Get Leaderboard
```typescript
GET /api/gamification/leaderboard?period=weekly&page=1

Response:
{
  "users": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "User Name",
      "avatar": "...",
      "level": 42,
      "xp": 17500,
      "badges": 15
    }
  ],
  "myRank": 156
}
```

## Badges Seed Data

```typescript
// seeds/badges.ts

export const DEFAULT_BADGES = [
  // Creation badges
  { id: 'first_mashup', name: 'First Steps', condition_type: 'mashup_count', condition_value: 1, rarity: 'common', xp_reward: 100 },
  { id: 'mashup_10', name: 'Getting Started', condition_type: 'mashup_count', condition_value: 10, rarity: 'common', xp_reward: 200 },
  { id: 'mashup_50', name: 'Prolific', condition_type: 'mashup_count', condition_value: 50, rarity: 'rare', xp_reward: 500 },
  { id: 'mashup_100', name: 'Century', condition_type: 'mashup_count', condition_value: 100, rarity: 'epic', xp_reward: 1000 },
  
  // Engagement badges
  { id: 'viral_1k', name: 'Trending', condition_type: 'play_count', condition_value: 1000, rarity: 'rare', xp_reward: 300 },
  { id: 'viral_10k', name: 'Viral', condition_type: 'play_count', condition_value: 10000, rarity: 'epic', xp_reward: 1000 },
  { id: 'viral_100k', name: 'Superstar', condition_type: 'play_count', condition_value: 100000, rarity: 'legendary', xp_reward: 5000 },
  
  // Level badges
  { id: 'level_10', name: 'Producer', condition_type: 'level', condition_value: 10, rarity: 'common', xp_reward: 0 },
  { id: 'level_50', name: 'Maestro', condition_type: 'level', condition_value: 50, rarity: 'epic', xp_reward: 0 },
  
  // Streak badges
  { id: 'streak_7', name: 'Week Warrior', condition_type: 'streak', condition_value: 7, rarity: 'common', xp_reward: 100 },
  { id: 'streak_30', name: 'Monthly Master', condition_type: 'streak', condition_value: 30, rarity: 'rare', xp_reward: 500 },
  { id: 'streak_100', name: 'Century Club', condition_type: 'streak', condition_value: 100, rarity: 'legendary', xp_reward: 2000 }
];
```

## Cost

| Component | Cost |
|-----------|------|
| Database | Existing |
| Compute | Minimal |
| **Total** | **$0/month** |

---

*Next: Thumbnail Generator*