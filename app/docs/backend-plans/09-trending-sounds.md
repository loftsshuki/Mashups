# Trending Sounds - Backend Plan

**Priority:** P1  
**Timeline:** 2 weeks  
**Cost:** $10-30/month (API limits)

---

## Overview

Discover trending audio from TikTok, Spotify, YouTube for mashup inspiration.

## Data Sources

| Platform | API | Status | Rate Limit | Cost |
|----------|-----|--------|------------|------|
| **Spotify** | Web API | ✅ Available | 1 request/sec | Free |
| **YouTube** | Data API v3 | ✅ Available | 10K units/day | Free tier |
| **TikTok** | Research API | ⚠️ Application required | Varies | Free |
| **SoundCloud** | No official API | ❌ N/A | - | - |
| **Apple Music** | MusicKit | ✅ Available | Varies | Free |

## Architecture

```
Cron Job (Hourly)
    │
    ├─> Fetch Spotify Charts
    ├─> Fetch YouTube Trending
    ├─> Fetch TikTok Sounds
    │
    ▼
Normalize & Deduplicate
    │
    ▼
Update Database
    │
    ▼
Cache (1 hour)
```

## Database Schema

```sql
-- Trending sounds cache
CREATE TABLE trending_sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source info
  source text CHECK (source IN ('spotify', 'youtube', 'tiktok', 'apple_music')),
  external_id text NOT NULL,
  external_url text,
  
  -- Track info
  title text NOT NULL,
  artist text,
  album text,
  duration integer, -- seconds
  
  -- Media
  thumbnail_url text,
  preview_url text,
  
  -- Ranking
  rank integer,
  previous_rank integer,
  velocity numeric, -- How fast it's climbing
  
  -- Metadata
  popularity_score integer, -- 0-100
  genre text[],
  
  -- Timestamps
  fetched_at timestamp DEFAULT now(),
  
  UNIQUE(source, external_id)
);

-- Sound history (track ranking changes)
CREATE TABLE trending_sound_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_id uuid REFERENCES trending_sounds(id),
  date date,
  rank integer,
  popularity_score integer
);

-- Indexes
CREATE INDEX idx_trending_source ON trending_sounds(source, rank);
CREATE INDEX idx_trending_fetched ON trending_sounds(fetched_at);
```

## API Integrations

### Spotify

```typescript
// lib/trends/spotify.ts
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const spotify = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID,
  process.env.SPOTIFY_CLIENT_SECRET
);

export async function fetchSpotifyTrending() {
  // Get global and regional top 50 playlists
  const playlists = [
    '37i9dQZEVXbMDoHDwVN2tF', // Global Top 50
    '37i9dQZEVXbLRQDuF5jeBp', // US Top 50
    '37i9dQZEVXbLpXxHxSxUi1', // Viral 50 Global
  ];

  const sounds = [];

  for (const playlistId of playlists) {
    const playlist = await spotify.playlists.getPlaylistItems(playlistId);
    
    for (let i = 0; i < playlist.items.length; i++) {
      const track = playlist.items[i].track;
      if (!track) continue;

      sounds.push({
        source: 'spotify',
        externalId: track.id,
        externalUrl: track.external_urls.spotify,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        thumbnailUrl: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        rank: i + 1,
        popularityScore: track.popularity
      });
    }
  }

  return sounds;
}
```

### YouTube

```typescript
// lib/trends/youtube.ts

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function fetchYouTubeTrending(region: string = 'US') {
  const response = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?` +
    `part=snippet,contentDetails,statistics&` +
    `chart=mostPopular&` +
    `regionCode=${region}&` +
    `videoCategoryId=10&` + // Music category
    `maxResults=50&` +
    `key=${YOUTUBE_API_KEY}`
  );

  const data = await response.json();

  return data.items.map((video: any, index: number) => ({
    source: 'youtube',
    externalId: video.id,
    externalUrl: `https://youtube.com/watch?v=${video.id}`,
    title: video.snippet.title,
    artist: video.snippet.channelTitle,
    duration: parseDuration(video.contentDetails.duration),
    thumbnailUrl: video.snippet.thumbnails.medium.url,
    rank: index + 1,
    popularityScore: parseInt(video.statistics.viewCount) / 1000000 // Views in millions
  }));
}

// Parse ISO 8601 duration
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
```

### TikTok

```typescript
// lib/trends/tiktok.ts
// Requires TikTok Research API access

export async function fetchTikTokTrending() {
  // Note: TikTok Research API requires application
  // This is a placeholder for when access is granted
  
  const response = await fetch(
    'https://open.tiktokapis.com/v2/research/video/query/',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          and: [{ operation: 'IN', field_name: 'region_code', field_values: ['US'] }]
        },
        start_date: '20260101',
        end_date: '20260201',
        max_count: 100
      })
    }
  );

  // Parse and extract trending sounds
  // ...
}
```

## Cron Job

```typescript
// app/api/cron/trends/route.ts

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results = {
    spotify: 0,
    youtube: 0,
    errors: []
  };

  try {
    // Fetch from all sources
    const [spotify, youtube] = await Promise.allSettled([
      fetchSpotifyTrending(),
      fetchYouTubeTrending()
    ]);

    // Process Spotify results
    if (spotify.status === 'fulfilled') {
      await upsertTrendingSounds(spotify.value);
      results.spotify = spotify.value.length;
    } else {
      results.errors.push({ source: 'spotify', error: spotify.reason });
    }

    // Process YouTube results
    if (youtube.status === 'fulfilled') {
      await upsertTrendingSounds(youtube.value);
      results.youtube = youtube.value.length;
    } else {
      results.errors.push({ source: 'youtube', error: youtube.reason });
    }

    // Clean old entries (keep last 7 days)
    await supabase
      .from('trending_sounds')
      .delete()
      .lt('fetched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function upsertTrendingSounds(sounds: TrendingSound[]) {
  for (const sound of sounds) {
    // Get previous rank for velocity calculation
    const { data: existing } = await supabase
      .from('trending_sounds')
      .select('rank')
      .eq('source', sound.source)
      .eq('external_id', sound.externalId)
      .single();

    const velocity = existing 
      ? existing.rank - sound.rank // Positive = climbing
      : 0;

    await supabase.from('trending_sounds').upsert({
      ...sound,
      previous_rank: existing?.rank || null,
      velocity,
      fetched_at: new Date()
    }, {
      onConflict: 'source,external_id'
    });
  }
}
```

## API Endpoints

### Get Trending Sounds
```typescript
GET /api/trends?source=all&limit=50

Response:
{
  "updatedAt": "2026-02-15T10:00:00Z",
  "sources": ["spotify", "youtube"],
  "sounds": [
    {
      "id": "uuid",
      "source": "spotify",
      "title": "Song Title",
      "artist": "Artist Name",
      "rank": 1,
      "previousRank": 3,
      "velocity": 2, // Climbed 2 spots
      "thumbnailUrl": "...",
      "previewUrl": "...",
      "externalUrl": "..."
    }
  ]
}
```

### Search Sounds
```typescript
GET /api/trends/search?q=drake&source=spotify

Response:
{
  "results": [...]
}
```

## Cost Breakdown

| Service | Quota | Usage | Cost |
|---------|-------|-------|------|
| YouTube API | 10K units/day | ~100 units/day | Free |
| Spotify API | 1 req/sec | ~50 req/hour | Free |
| TikTok API | Varies | - | Free |
| **Total** | | | **$0/month** |

---

*Next: Attribution System*