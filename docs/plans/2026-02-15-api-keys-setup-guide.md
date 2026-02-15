# API Keys Setup Guide — Backend V3 Group B

**Date:** 2026-02-15
**Purpose:** Obtain all API keys needed to unblock Steps 8-12 of the Backend Completion V3 plan.

---

## Step 8 & 10: OpenAI API Key

**Used for:** Auto-captions (Whisper) + Recommendation embeddings

1. Go to **https://platform.openai.com/signup** — sign up or log in
2. Go to **https://platform.openai.com/api-keys**
3. Click **"Create new secret key"**, name it "Mashups"
4. Copy the key (starts with `sk-`)
5. Add to `.env.local`: `OPENAI_API_KEY=sk-...`
6. Add to Vercel: Project Settings > Environment Variables > same key

**Cost:** Pay-as-you-go. Whisper ~$0.006/min, embeddings ~$0.0001/1K tokens. Add $5-10 credit to start.

---

## Step 9a: Spotify Client ID & Secret

**Used for:** Trending sounds ingestion (featured playlists, top tracks)

1. Go to **https://developer.spotify.com/dashboard** — log in with any Spotify account (free works)
2. Click **"Create app"**
3. Name: "Mashups", Description: anything, Redirect URI: `http://localhost:3000/callback`
4. Check **"Web API"** checkbox
5. Click **"Create"**
6. On the app page, click **"Settings"** — you'll see **Client ID** and **Client Secret** (click "View client secret")
7. Add to `.env.local`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

**Cost:** Free

---

## Step 9b: YouTube Data API Key

**Used for:** Trending music videos ingestion

1. Go to **https://console.cloud.google.com/** — sign in with Google
2. Create a new project: click the project dropdown > "New Project" > name it "Mashups"
3. Go to **APIs & Services > Library**
4. Search **"YouTube Data API v3"** > click it > click **"Enable"**
5. Go to **APIs & Services > Credentials**
6. Click **"Create Credentials" > "API Key"**
7. Copy the key, optionally restrict it to YouTube Data API only
8. Add to `.env.local`: `YOUTUBE_API_KEY=AIza...`

**Cost:** Free tier = 10,000 units/day (one trending search ~100 units, plenty for daily cron)

---

## Step 10b: Enable pgvector in Supabase

**Used for:** Storing and querying mashup embeddings for recommendations

1. Go to **https://supabase.com/dashboard** > your Mashups project
2. Go to **Database > Extensions** (left sidebar)
3. Search for **"vector"**
4. Toggle it **ON**

**Cost:** Free (included in Supabase)

---

## Step 11: Daily.co API Key

**Used for:** Voice chat rooms

1. Go to **https://dashboard.daily.co/signup** — create account
2. After signup, go to **Developers** tab in the dashboard
3. Your **API Key** is shown at the top
4. Add to `.env.local`: `DAILY_API_KEY=your_key`

**Cost:** Free tier = 2,000 participant-minutes/month (plenty for MVP)

---

## Step 12: PostHog Project Key

**Used for:** Product analytics (page views, mashup plays, uploads, etc.)

1. Go to **https://app.posthog.com/signup** — create account
2. Create a new project named "Mashups"
3. Go to **Project Settings** (gear icon)
4. Copy the **Project API Key** (starts with `phc_`)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   POSTHOG_HOST=https://us.i.posthog.com
   ```

**Cost:** Free tier = 1M events/month

---

## Summary Checklist

Add all keys to `.env.local`:

```env
# OpenAI (Steps 8, 10)
OPENAI_API_KEY=sk-...

# Spotify (Step 9)
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# YouTube (Step 9)
YOUTUBE_API_KEY=AIza...

# Daily.co (Step 11)
DAILY_API_KEY=...

# PostHog (Step 12)
POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

Then add the same keys to **Vercel**: Project Settings > Environment Variables (set for both Production and Preview environments).

Enable **pgvector** extension in Supabase dashboard (Step 10b).

---

## After Keys Are Ready

Start a new session and run `/superpowers:execute-plan` pointing at `docs/plans/2026-02-15-backend-completion-v3.md` — Steps 8-12 can each be executed independently as keys become available.
