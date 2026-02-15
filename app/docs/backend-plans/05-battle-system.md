# Battle System - Backend Plan

**Priority:** P1  
**Timeline:** 2 weeks  
**Cost:** $0 (uses existing database)

---

## Overview

Head-to-head mashup competitions with voting, leaderboards, and brackets.

## Features

- **Tournament Types:** Single elimination, double elimination, round-robin
- **Voting Methods:** Community votes, judge panel, hybrid
- **Blind Voting:** Hide vote counts during voting phase
- **Prizes:** Credits, badges, featured placement

## Database Schema

```sql
-- Battles
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text, -- e.g., "90s Hip Hop", "Summer Vibes"
  
  -- Configuration
  type text CHECK (type IN ('single_elimination', 'double_elimination', 'round_robin')),
  max_participants integer DEFAULT 32,
  blind_voting boolean DEFAULT true,
  
  -- Schedule
  status text CHECK (status IN ('upcoming', 'open', 'active', 'voting', 'completed')),
  registration_opens_at timestamp,
  registration_closes_at timestamp,
  starts_at timestamp,
  ends_at timestamp,
  voting_ends_at timestamp,
  
  -- Prizes
  prize_description text,
  prize_credits integer DEFAULT 0,
  prize_badge_id text,
  
  -- Relations
  created_by uuid REFERENCES auth.users(id),
  winner_id uuid REFERENCES auth.users(id),
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Battle Entries (submissions)
CREATE TABLE battle_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  mashup_id uuid REFERENCES mashups(id),
  
  -- Metadata
  submitted_at timestamp DEFAULT now(),
  seed integer, -- For bracket positioning
  bracket_position integer, -- e.g., "R1-M2" (Round 1, Match 2)
  
  -- Stats
  votes_count integer DEFAULT 0,
  win_count integer DEFAULT 0,
  loss_count integer DEFAULT 0,
  
  -- Result
  placement integer, -- 1st, 2nd, 3rd, etc.
  eliminated_at_round integer,
  
  UNIQUE(battle_id, user_id) -- One entry per user per battle
);

-- Votes
CREATE TABLE battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES battle_entries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  
  -- Optional: Match info for brackets
  round integer,
  match_id text,
  
  created_at timestamp DEFAULT now(),
  
  UNIQUE(battle_id, user_id, round) -- One vote per user per round
);

-- Indexes
CREATE INDEX idx_battles_status ON battles(status, starts_at);
CREATE INDEX idx_battle_entries_battle ON battle_entries(battle_id, votes_count DESC);
CREATE INDEX idx_battle_votes_user ON battle_votes(user_id, battle_id);
```

## API Endpoints

### List Battles
```typescript
GET /api/battles?status=active&page=1

Response:
{
  "battles": [
    {
      "id": "uuid",
      "title": "Summer Smash 2026",
      "theme": "Summer Vibes",
      "type": "single_elimination",
      "status": "voting",
      "participantCount": 32,
      "maxParticipants": 32,
      "endsAt": "2026-03-01T00:00:00Z",
      "prize": "1000 Credits + Featured Badge"
    }
  ],
  "total": 12,
  "page": 1
}
```

### Get Battle Details
```typescript
GET /api/battles/:id

Response:
{
  "battle": {
    "id": "uuid",
    "title": "Summer Smash 2026",
    "description": "...",
    "theme": "Summer Vibes",
    "type": "single_elimination",
    "status": "voting",
    "blindVoting": true,
    "schedule": {
      "registrationOpens": "2026-02-01",
      "registrationCloses": "2026-02-15",
      "starts": "2026-02-16",
      "votingEnds": "2026-03-01"
    },
    "prize": {
      "credits": 1000,
      "badge": { "id": "summer_smash_2026", "name": "Summer Smash Champion" }
    }
  },
  "participants": [
    {
      "entryId": "uuid",
      "user": { "id", "name", "avatar" },
      "mashup": { "id", "title", "coverUrl" },
      "seed": 1,
      "votes": 150,
      "rank": 1
    }
  ],
  "bracket": { // If tournament type
    "rounds": [
      {
        "round": 1,
        "matches": [
          {
            "id": "R1-M1",
            "participants": ["user1", "user2"],
            "winner": "user1",
            "votes": { "user1": 45, "user2": 32 }
          }
        ]
      }
    ]
  },
  "userEntry": { // If user is participating
    "entryId": "uuid",
    "mashupId": "uuid",
    "submittedAt": "...",
    "currentRound": 2
  },
  "userVote": { // If user has voted
    "entryId": "uuid",
    "round": 1
  }
}
```

### Register for Battle
```typescript
POST /api/battles/:id/register

Body:
{
  "mashupId": "uuid" // Optional: can submit later
}

Response:
{
  "entryId": "uuid",
  "status": "registered",
  "deadline": "2026-02-15T00:00:00Z"
}
```

### Submit Entry
```typescript
POST /api/battles/:id/entries

Body:
{
  "mashupId": "uuid"
}

Response:
{
  "entryId": "uuid",
  "submittedAt": "...",
  "position": 15 // Entry number
}
```

### Vote
```typescript
POST /api/battles/:id/vote

Body:
{
  "entryId": "uuid",
  "round"?: 1 // Optional: for multi-round battles
}

Response:
{
  "success": true,
  "votes": 151 // Updated count (if not blind)
}
```

### Get Leaderboard
```typescript
GET /api/battles/:id/leaderboard

Response:
{
  "entries": [
    {
      "rank": 1,
      "user": { "id", "name", "avatar" },
      "mashup": { "id", "title", "coverUrl" },
      "votes": 250,
      "placement": "1st"
    }
  ]
}
```

## Implementation

### Service Layer

```typescript
// lib/battles/service.ts

export class BattleService {
  // Create a new battle
  async createBattle(data: CreateBattleData): Promise<Battle> {
    return await supabase.from('battles').insert({
      ...data,
      status: 'upcoming'
    }).select().single();
  }

  // Register user for battle
  async register(battleId: string, userId: string, mashupId?: string): Promise<Entry> {
    // Check if registration is open
    const battle = await this.getBattle(battleId);
    if (battle.status !== 'open') {
      throw new Error('Registration is closed');
    }

    // Check capacity
    const count = await this.getEntryCount(battleId);
    if (count >= battle.max_participants) {
      throw new Error('Battle is full');
    }

    // Create entry
    return await supabase.from('battle_entries').insert({
      battle_id: battleId,
      user_id: userId,
      mashup_id: mashupId,
      seed: count + 1
    }).select().single();
  }

  // Cast vote
  async vote(
    battleId: string,
    entryId: string,
    userId: string,
    round?: number
  ): Promise<void> {
    // Check if voting is open
    const battle = await this.getBattle(battleId);
    if (battle.status !== 'voting') {
      throw new Error('Voting is not open');
    }

    // Check if user already voted this round
    const existing = await supabase
      .from('battle_votes')
      .select()
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .eq('round', round || 1)
      .single();

    if (existing) {
      throw new Error('Already voted in this round');
    }

    // Record vote
    await supabase.from('battle_votes').insert({
      battle_id: battleId,
      entry_id: entryId,
      user_id: userId,
      round: round || 1
    });

    // Update entry vote count
    await supabase.rpc('increment_vote_count', {
      entry_id: entryId
    });
  }

  // Generate bracket for tournament
  async generateBracket(battleId: string): Promise<Bracket> {
    const entries = await this.getEntries(battleId);
    
    // Sort by seed
    const sorted = entries.sort((a, b) => a.seed - b.seed);
    
    // Generate bracket pairs
    const matches = [];
    for (let i = 0; i < sorted.length / 2; i++) {
      matches.push({
        id: `R1-M${i + 1}`,
        round: 1,
        participants: [
          sorted[i],
          sorted[sorted.length - 1 - i]
        ]
      });
    }

    return { rounds: [{ round: 1, matches }] };
  }

  // Advance winners to next round
  async advanceRound(battleId: string, round: number): Promise<void> {
    // Get winners from current round
    const winners = await supabase
      .from('battle_entries')
      .select('id, user_id')
      .eq('battle_id', battleId)
      .eq('current_round', round)
      .order('votes_count', { ascending: false });

    // Pair winners for next round
    // ...
  }
}
```

### Bracket Generation

```typescript
// lib/battles/bracket.ts

export function generateSingleEliminationBracket(entries: Entry[]): Bracket {
  // Shuffle or seed entries
  const shuffled = shuffleArray(entries);
  
  // Find next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
  
  // Fill with byes if needed
  const padded = [...shuffled];
  while (padded.length < size) {
    padded.push(null); // Bye
  }

  // Generate matches
  const rounds = [];
  let currentRound = padded;
  let roundNum = 1;

  while (currentRound.length > 1) {
    const matches = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      matches.push({
        id: `R${roundNum}-M${matches.length + 1}`,
        round: roundNum,
        participants: [currentRound[i], currentRound[i + 1]],
        winner: null,
        votes: {}
      });
    }
    rounds.push({ round: roundNum, matches });
    
    // Prepare next round (winners)
    currentRound = matches.map(() => null);
    roundNum++;
  }

  return { rounds };
}

export function generateRoundRobinMatches(entries: Entry[]): Match[] {
  const matches = [];
  
  // Round-robin algorithm
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      matches.push({
        id: `RR-${i}-${j}`,
        round: 1, // All simultaneous
        participants: [entries[i], entries[j]],
        winner: null
      });
    }
  }
  
  return matches;
}
```

## Schedule Management

```typescript
// lib/battles/scheduler.ts
import { CronJob } from 'cron';

// Check battle status transitions every minute
export function startBattleScheduler() {
  new CronJob('* * * * *', async () => {
    const now = new Date();

    // Open registration
    await supabase.rpc('open_battle_registration', { current_time: now });

    // Close registration, start battle
    await supabase.rpc('start_battles', { current_time: now });

    // End battles, start voting
    await supabase.rpc('start_battle_voting', { current_time: now });

    // End voting, declare winners
    await supabase.rpc('complete_battles', { current_time: now });
  }).start();
}
```

## Cost

- Database: Uses existing Supabase
- Compute: Minimal
- **Total: $0/month**

---

*Next: Challenge Engine*