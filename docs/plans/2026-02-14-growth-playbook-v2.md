# Growth Playbook V2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 45 growth ideas from Growth-Ideas-V2.md as production features across 6 development sprints.

**Architecture:** Next.js 16 App Router with Supabase backend, Stripe billing, Replicate AI. All features follow the existing pattern: `lib/data/*.ts` for business logic, `app/api/*/route.ts` for endpoints, `components/*.tsx` for UI, `app/*/page.tsx` for pages. Mock data fallback when Supabase is unavailable.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (Auth + Postgres + Realtime), Stripe, Replicate API, Web Audio API

---

## What Already Exists (Don't Rebuild)

Before building, know what's already in the codebase:

| Growth Idea | Existing Infrastructure | Gap |
|-------------|------------------------|-----|
| #1 One-Tap Remix | Remix Family Tree (D3.js), mashup detail page, source_tracks table | Need "Remix This" button that pre-loads stems into `/create` |
| #11 Remix Graph | `getMashupLineage()`, `getMashupChildren()` in mock-data.ts | Need navigable UI, not just tree visualization |
| #16 Studio Sessions | `studio-sessions.ts`, Yjs placeholder, voice chat placeholder | Need real WebSocket integration, spectator mode |
| #22 Streaks | `gamification.ts` has streak tracking | Need weekly creative streak UI, not login streaks |
| #26 Stem Royalties | `revenue-splits.ts`, `earnings.ts`, Stripe billing | Need per-stem attribution in revenue flow |
| #31 Infinite Stems | Replicate API integration, stem separation | Need text-to-stem generation endpoint |
| #34 Trend Synthesis | `trending-sounds.ts`, trending sidebar component | Need AI synthesis layer, not just listing |
| #41 Genre Translation | Style Transfer tool exists (`/tools/style`) | Need one-click genre swap on any mashup |

---

## Sprint 0: Foundation & Data Model (3 days)

*Database migrations and shared utilities that multiple features depend on.*

### Task 0.1: Stem Registry Migration

**Files:**
- Create: `app/supabase/migrations/009_stem_registry.sql`
- Modify: `app/src/lib/data/types.ts`

**What:** Add tables for individual stem tracking with provenance, usage stats, and tagging. This is the foundation for ideas #1, #12, #15, #20, #26, #31, #44.

```sql
-- Stems as first-class entities (not just source_tracks)
CREATE TABLE stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  instrument TEXT, -- vocal, drums, bass, synth, texture, other
  genre TEXT,
  bpm SMALLINT,
  key TEXT, -- e.g. "Cm", "F#"
  duration_ms INT,
  audio_url TEXT NOT NULL,
  waveform_data JSONB,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'upload', -- upload, ai_generated, separated, recorded
  play_count INT DEFAULT 0,
  usage_count INT DEFAULT 0, -- how many mashups use this stem
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track which stems appear in which mashups
CREATE TABLE mashup_stems (
  mashup_id UUID REFERENCES mashups(id) ON DELETE CASCADE,
  stem_id UUID REFERENCES stems(id),
  track_number SMALLINT,
  PRIMARY KEY (mashup_id, stem_id)
);

-- Stem collections (Crates - idea #20)
CREATE TABLE crates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crate_stems (
  crate_id UUID REFERENCES crates(id) ON DELETE CASCADE,
  stem_id UUID REFERENCES stems(id),
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (crate_id, stem_id)
);

-- Stem provenance tracking (idea #44)
CREATE TABLE stem_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stem_id UUID REFERENCES stems(id),
  mashup_id UUID REFERENCES mashups(id),
  total_plays_contributed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Creative streaks (idea #22)
CREATE TABLE creative_streaks (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  current_weekly_streak INT DEFAULT 0,
  longest_weekly_streak INT DEFAULT 0,
  last_creation_week TEXT, -- ISO week like '2026-W07'
  streak_history JSONB DEFAULT '[]'
);

-- Challenges v2 (ideas #10, #17, #18)
CREATE TABLE platform_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'flip', 'chain', 'collision', 'blind_test', 'roulette'
  title TEXT NOT NULL,
  description TEXT,
  stem_ids UUID[] DEFAULT '{}',
  genre_pair TEXT[], -- for collision events
  rules JSONB,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_entries INT,
  prize_description TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, voting, completed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seasons (idea #23)
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT,
  description TEXT,
  stem_pack_ids UUID[] DEFAULT '{}',
  collective_goal INT, -- target mashup count
  current_count INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming'
);

-- Enable RLS on all new tables
ALTER TABLE stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE mashup_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE crates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crate_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
```

**Step 1:** Create migration file with the SQL above
**Step 2:** Add TypeScript types to `lib/data/types.ts`: `Stem`, `Crate`, `CrateStem`, `CreativeStreak`, `PlatformChallenge`, `Season`
**Step 3:** Run `cd app && npx next build` to verify types compile
**Step 4:** Commit: `feat: add stem registry and growth foundation tables`

### Task 0.2: Stem Data Module

**Files:**
- Create: `app/src/lib/data/stems.ts`
- Create: `app/src/lib/data/crates.ts`
- Create: `app/src/lib/data/creative-streaks.ts`
- Create: `app/src/lib/data/platform-challenges.ts`
- Create: `app/src/lib/data/seasons.ts`

**What:** CRUD operations with Supabase + mock fallback for each new table. Follow the exact pattern used in `lib/data/mashups.ts`.

**Step 1:** Create each data module with: list, getById, create, update functions + mock data
**Step 2:** Build and verify
**Step 3:** Commit: `feat: add data modules for stems, crates, streaks, challenges, seasons`

---

## Sprint 1: Ship This Month — Quick Wins (5 days)

*Ideas #1, #7, #45, #39, #22, #15 — Low effort, high viral potential.*

### Task 1.1: One-Tap Remix (#1)

**Files:**
- Modify: `app/src/app/mashup/[id]/page.tsx` — Add "Remix This" button
- Modify: `app/src/components/mashup-card.tsx` — Add remix icon to hover overlay
- Modify: `app/src/app/create/page.tsx` — Accept `?remix=<mashupId>` query param
- Create: `app/src/lib/data/remix-loader.ts` — Load stems from a mashup into create flow

**What:** A button on every mashup that opens `/create?remix=<id>` with all stems pre-loaded.

**Step 1:** Add `remix-loader.ts` — function `loadStemsForRemix(mashupId)` that fetches source tracks and returns them as pre-loaded timeline data
**Step 2:** Modify the create page to check for `?remix=` param on mount, auto-load stems if present
**Step 3:** Add "Remix This" button to mashup detail page (next to play/like buttons)
**Step 4:** Add small remix icon to MashupCard hover overlay (bottom-right, next to play)
**Step 5:** Build and test: clicking remix → opens create with stems loaded
**Step 6:** Commit: `feat: one-tap remix — open DAW with pre-loaded stems from any mashup`

### Task 1.2: Before/After Stories Export (#7)

**Files:**
- Create: `app/src/components/export/before-after-generator.tsx`
- Create: `app/src/app/api/export/before-after/route.ts`
- Modify: `app/src/components/create/platform-export.tsx` — Add "Before/After" export option

**What:** Auto-generated visual showing source tracks → finished mashup, formatted per platform.

**Step 1:** Create `before-after-generator.tsx` — React component that renders a canvas with:
  - Left side: source track covers/waveforms labeled "Before"
  - Right side: final mashup waveform labeled "After"
  - Creator name and mashup title
  - "Made on Mashups.com" watermark
  - Three format options: 9:16 (TikTok/Reels), 16:9 (YouTube), 1:1 (Twitter)
**Step 2:** Create API route that accepts mashup ID and format, returns image buffer
**Step 3:** Add "Before/After Story" option to the existing platform export dialog
**Step 4:** Build and test
**Step 5:** Commit: `feat: before/after stories — auto-generated visual export for social sharing`

### Task 1.3: The Deconstruction View (#45)

**Files:**
- Create: `app/src/components/mashup/deconstruction-view.tsx`
- Modify: `app/src/app/mashup/[id]/page.tsx` — Add "Deconstruct" toggle

**What:** Listeners can toggle individual stems on/off to hear each layer independently.

**Step 1:** Create `deconstruction-view.tsx` — component that:
  - Shows each source track as a labeled row with a toggle switch and volume slider
  - Uses Web Audio API to play/mute individual stems via gain nodes
  - Displays a mini waveform per stem
  - Has a "Solo" button per stem (mutes all others)
**Step 2:** Add "Deconstruct" button to mashup detail page (eye icon or layers icon)
**Step 3:** When toggled, the player area expands to show the deconstruction view below
**Step 4:** Build and test: toggle stems on/off during playback
**Step 5:** Commit: `feat: deconstruction view — toggle individual stems on any mashup`

### Task 1.4: No-Algorithm Discovery Feed (#39)

**Files:**
- Create: `app/src/app/discover/page.tsx`
- Create: `app/src/app/api/discover/chronological/route.ts`

**What:** Pure chronological feed of all mashups, no algorithmic ranking.

**Step 1:** Create API route that returns mashups ordered by `created_at DESC` with pagination (cursor-based)
**Step 2:** Create discover page with infinite scroll, showing mashups in pure chronological order
**Step 3:** Add "Discover" link to main navigation (between Explore and Search)
**Step 4:** Add a subtle label: "No algorithm. Just what's new."
**Step 5:** Build and test
**Step 6:** Commit: `feat: no-algorithm discover feed — pure chronological mashup stream`

### Task 1.5: Creative Streaks UI (#22)

**Files:**
- Create: `app/src/components/profile/creative-streak.tsx`
- Create: `app/src/app/api/streaks/route.ts`
- Modify: `app/src/app/profile/[username]/page.tsx` — Add streak display

**What:** Track weekly creative output, display on profile as a visual timeline.

**Step 1:** Create API route that:
  - Calculates current streak (consecutive weeks with at least 1 mashup created)
  - Returns streak count, history, and portfolio timeline data
**Step 2:** Create `creative-streak.tsx` component:
  - Shows current streak count as a large number
  - GitHub-style contribution grid (weeks as columns, green shading for creation activity)
  - "You've created something every week for X weeks" message
  - List of mashups per week in a collapsible timeline
**Step 3:** Add streak component to profile page (below bio, above mashups)
**Step 4:** Build and test
**Step 5:** Commit: `feat: creative streaks — weekly output tracking on creator profiles`

### Task 1.6: Sample Credit Trail (#15)

**Files:**
- Modify: `app/src/app/mashup/[id]/page.tsx` — Show stem credits
- Modify: `app/src/app/profile/[username]/page.tsx` — Show "Featured in" section
- Create: `app/src/components/mashup/stem-credits.tsx`

**What:** Visible credit for every stem creator, "Featured in X (47K plays)" on profiles.

**Step 1:** Create `stem-credits.tsx` — shows a list of stem creators below the mashup player:
  - Creator avatar, name, what they contributed (e.g., "Drums by @beatalchemy")
  - Link to their profile
**Step 2:** Add stem credits section to mashup detail page
**Step 3:** Add "Featured In" section to profile page — list of mashups that used this creator's stems, with play counts
**Step 4:** Build and test
**Step 5:** Commit: `feat: sample credit trail — visible stem credits on mashups and profiles`

---

## Sprint 2: Core Differentiators (10 days)

*Ideas #2, #3, #11, #31, #45 already done, #10, #6, #13 — Product differentiation that requires more engineering.*

### Task 2.1: Stem Roulette (#2)

**Files:**
- Create: `app/src/app/roulette/page.tsx`
- Create: `app/src/app/api/roulette/spin/route.ts`
- Create: `app/src/components/roulette/roulette-spinner.tsx`
- Create: `app/src/components/roulette/countdown-timer.tsx`

**What:** Random 3-stem assignment with 5-minute creation timer.

**Step 1:** Create API route that selects 3 random stems (1 vocal, 1 rhythm, 1 texture) from the stem library
**Step 2:** Create roulette page with:
  - "Spin" button that triggers a slot-machine animation revealing 3 stems
  - 5-minute countdown timer that starts when you click "Start Flipping"
  - Embedded create/mixer interface (reuse existing create components)
  - "Submit" button that publishes with `source: 'roulette'` tag
**Step 3:** Create roulette spinner component with CSS animation (3 columns spinning vertically)
**Step 4:** Create countdown timer component (circular progress + minutes:seconds)
**Step 5:** Add "Stem Roulette" to navigation and homepage
**Step 6:** Build and test
**Step 7:** Commit: `feat: stem roulette — random 3-stem challenge with 5-minute timer`

### Task 2.2: AI Copilot — Finish This For Me (#3)

**Files:**
- Create: `app/src/components/ai/copilot-panel.tsx`
- Create: `app/src/app/api/ai/complete/route.ts`
- Modify: `app/src/app/create/page.tsx` — Add copilot toggle

**What:** AI analyzes partial creation and generates 3 completion options.

**Step 1:** Create API route that:
  - Accepts current mashup state (stems, arrangement, BPM, key)
  - Calls AI endpoint to analyze and generate 3 possible completions
  - Returns 3 options with labels ("Energetic Build", "Chill Fade", "Dramatic Drop")
**Step 2:** Create copilot panel component:
  - Floating panel on right side of create page
  - "Finish This" button that sends current state to API
  - Shows 3 completion cards with preview play buttons
  - "Apply" button per option that loads the completion into the timeline
  - "Regenerate" button for new options
**Step 3:** Add copilot toggle button to create page toolbar
**Step 4:** Build and test
**Step 5:** Commit: `feat: AI copilot — generates 3 completion options for in-progress mashups`

### Task 2.3: Interactive Remix Graph (#11)

**Files:**
- Create: `app/src/components/discovery/remix-graph.tsx`
- Create: `app/src/app/graph/[id]/page.tsx`
- Create: `app/src/app/api/graph/[id]/route.ts`
- Modify: `app/src/app/mashup/[id]/page.tsx` — Add "View Remix Graph" link

**What:** Navigable D3.js graph showing mashup lineage — what stems it used, what remixes were made.

**Step 1:** Create API route that, given a mashup ID, returns:
  - The mashup node
  - All stems used (with their creators)
  - All mashups that share any of the same stems
  - All remixes/forks of this mashup
  - Returns as `{ nodes: [], edges: [] }` for D3
**Step 2:** Create remix-graph component using D3 force-directed layout:
  - Mashup nodes (larger circles with cover art thumbnails)
  - Stem nodes (smaller colored circles by instrument type)
  - Edge lines connecting stems to mashups
  - Click a node to navigate to that mashup or stem
  - Zoom and pan support
  - Audio preview on hover (5-second snippet)
**Step 3:** Create graph page at `/graph/[id]` — full-screen graph view
**Step 4:** Add "View Remix Graph" link to mashup detail page
**Step 5:** Build and test
**Step 6:** Commit: `feat: interactive remix graph — navigable D3 visualization of mashup lineage`

### Task 2.4: Infinite Stems — AI Generation (#31)

**Files:**
- Create: `app/src/app/api/ai/generate-stem/route.ts`
- Create: `app/src/components/ai/stem-generator.tsx`
- Modify: `app/src/app/create/page.tsx` — Add "Generate Stem" option to track add menu

**What:** Text-to-stem generation. "Give me a melancholic cello in D minor, 85 BPM."

**Step 1:** Create API route that:
  - Accepts text prompt, optional BPM, key, duration constraints
  - Calls Replicate API (or similar) with a music generation model
  - Returns generated audio URL and metadata
  - Saves to stems table with `source: 'ai_generated'`
**Step 2:** Create stem generator component:
  - Text input for prompt
  - Optional dropdowns: instrument, genre, BPM, key, mood
  - "Generate" button with loading state
  - Preview player for the result
  - "Add to Timeline" and "Save to Crate" buttons
**Step 3:** Add "Generate with AI" option to the create page's "Add Track" menu
**Step 4:** Build and test
**Step 5:** Commit: `feat: infinite stems — AI text-to-stem generation in the DAW`

### Task 2.5: Platform-Native Challenges (#10)

**Files:**
- Modify: `app/src/app/challenges/page.tsx` — Redesign with platform_challenges table
- Create: `app/src/app/challenges/[id]/page.tsx` — Challenge detail with embedded create
- Create: `app/src/app/api/challenges/v2/route.ts` — CRUD for platform_challenges
- Create: `app/src/components/challenges/challenge-workspace.tsx`

**What:** Challenges that can only be entered through the Mashups.com DAW.

**Step 1:** Create v2 API routes for platform challenges (list, get, create, enter)
**Step 2:** Redesign challenges page to show active challenges with:
  - Challenge card: title, description, stem previews, time remaining, entry count
  - Filter by type (flip, chain, collision)
**Step 3:** Create challenge detail page with:
  - Challenge rules and stems
  - Embedded create interface with challenge stems pre-loaded
  - Submission form
  - Entries leaderboard with voting
**Step 4:** Create challenge workspace component (create interface constrained to challenge stems)
**Step 5:** Build and test
**Step 6:** Commit: `feat: platform-native challenges — create-to-enter challenge system`

### Task 2.6: The Stem Drop (#6)

**Files:**
- Create: `app/src/components/sharing/stem-drop.tsx`
- Create: `app/src/app/api/drops/route.ts`
- Create: `app/src/app/drop/[id]/page.tsx`

**What:** Share stems (not finished tracks) as a challenge/gift to others.

**Step 1:** Create API route for creating and retrieving stem drops
**Step 2:** Create stem-drop component:
  - Select stems from a mashup to include in the drop
  - Add a message ("I dare you to make something better")
  - Generate shareable link `/drop/<id>`
**Step 3:** Create drop landing page that:
  - Shows the stems with preview playback
  - Shows the challenge message and who sent it
  - "Accept Challenge" button → opens `/create` with stems pre-loaded
  - Shows all mashups created from this drop (responses)
**Step 4:** Build and test
**Step 5:** Commit: `feat: stem drops — share stems as creative challenges`

### Task 2.7: The Ear Test (#13)

**Files:**
- Create: `app/src/app/ear-test/page.tsx`
- Create: `app/src/app/api/ear-test/route.ts`
- Create: `app/src/components/ear-test/blind-player.tsx`

**What:** Weekly blind listening test — 5 mashups, no metadata, rate them.

**Step 1:** Create API route that:
  - Selects 5 mashups weighted toward lesser-known creators
  - Returns only audio URLs and IDs (no creator names, no play counts, no genres)
  - After rating, returns the full metadata as a "reveal"
**Step 2:** Create ear test page:
  - Card-based flow: listen → rate (1-5 stars) → next
  - After all 5, a "Reveal" screen showing creators, genres, play counts
  - "Discover more from [creator]" links
  - Weekly refresh (new set every Monday)
**Step 3:** Create blind player component (play button + waveform only, no metadata)
**Step 4:** Build and test
**Step 5:** Commit: `feat: the ear test — weekly blind listening and rating experience`

---

## Sprint 3: Community & Social Loops (10 days)

*Ideas #16, #17, #18, #19, #20, #25, #8, #9*

### Task 3.1: The Flip Chain (#17)

**Files:**
- Create: `app/src/app/chains/page.tsx`
- Create: `app/src/app/chains/[id]/page.tsx`
- Create: `app/src/app/api/chains/route.ts`
- Create: `app/src/components/chains/chain-timeline.tsx`

**What:** Sequential creative telephone — each creator changes one element.

**Step 1:** Create API routes for chain creation, joining, and submitting links
**Step 2:** Create chains listing page showing active/completed chains
**Step 3:** Create chain detail page with:
  - Scrollable horizontal timeline showing each link (creator avatar + audio preview)
  - "Add Your Link" button (only available for the next slot)
  - Opens create with previous link's mashup loaded, constrained to changing one element
  - Playback that steps through all links sequentially
**Step 4:** Create chain-timeline component (horizontal scroll of creator cards with audio)
**Step 5:** Build and test
**Step 6:** Commit: `feat: flip chains — sequential creative telephone game`

### Task 3.2: Genre Collision Events (#18)

**Files:**
- Create: `app/src/app/collisions/page.tsx`
- Create: `app/src/app/api/collisions/route.ts`
- Create: `app/src/components/collisions/collision-card.tsx`

**What:** Monthly events: mash two incompatible genres together.

**Step 1:** Create API route using platform_challenges with `type: 'collision'`
**Step 2:** Create collisions page showing:
  - Current month's collision (e.g., "Baroque x Trap")
  - Genre pair displayed as two large badges with a "x" between them
  - Provided stems from each genre
  - Entry leaderboard sorted by community votes
  - Past collisions archive
**Step 3:** Create collision card component (genre A badge x genre B badge, timer, entry count)
**Step 4:** Build and test
**Step 5:** Commit: `feat: genre collision events — monthly themed mashup challenges`

### Task 3.3: The Crate — Shared Stem Collections (#20)

**Files:**
- Create: `app/src/app/crates/page.tsx`
- Create: `app/src/app/crates/[id]/page.tsx`
- Create: `app/src/app/api/crates/route.ts`
- Create: `app/src/components/crates/crate-card.tsx`
- Create: `app/src/components/crates/crate-builder.tsx`

**What:** Public collections of stems curated by creators, followable and contributable.

**Step 1:** Create API routes: list crates, get crate, create crate, add/remove stems, follow/unfollow
**Step 2:** Create crates listing page (grid of crate cards with cover mosaic, title, stem count, follower count)
**Step 3:** Create crate detail page:
  - Stem list with preview playback
  - "Add to My Mashup" button per stem
  - "Contribute a Stem" button (if crate allows contributions)
  - Follow/unfollow button
  - Creator info
**Step 4:** Create crate builder modal (title, description, select stems, privacy toggle)
**Step 5:** Build and test
**Step 6:** Commit: `feat: crates — curated stem collections with follow and contribute`

### Task 3.4: Collab Receipts (#8)

**Files:**
- Create: `app/src/components/sharing/collab-receipt.tsx`
- Create: `app/src/app/api/receipts/generate/route.ts`

**What:** Auto-generated shareable visual when two creators collaborate.

**Step 1:** Create API route that accepts a mashup ID with multiple contributors and generates receipt data
**Step 2:** Create collab-receipt component that renders (via canvas or server-rendered SVG):
  - Both creators' avatars side by side
  - Track title
  - Each person's contribution (e.g., "Beats: @user1 | Vocals: @user2")
  - Creation date, play count, duration
  - "Made on Mashups.com" footer
  - Export as PNG button (for screenshotting/sharing)
**Step 3:** Auto-show receipt after publishing a collaborative mashup
**Step 4:** Build and test
**Step 5:** Commit: `feat: collab receipts — auto-generated shareable collaboration visuals`

### Task 3.5: The Listening Link (#9)

**Files:**
- Create: `app/src/app/listen/[id]/page.tsx`
- Create: `app/src/components/player/process-player.tsx`

**What:** Special URL that plays a track while showing how it was made.

**Step 1:** Create process-player component:
  - Timeline visualization showing stems appearing in order
  - As the track plays, stems light up on the timeline at their entry points
  - Volume automation curves visible
  - Creator avatar and track info overlay
  - "Make Your Own" CTA at the end
**Step 2:** Create listen page at `/listen/[id]` — full-screen process player
**Step 3:** Add "Copy Listening Link" button to mashup detail page (generates `/listen/[id]` URL)
**Step 4:** Build and test
**Step 5:** Commit: `feat: listening links — share tracks with visible creation process`

### Task 3.6: Apprentice Mode (#19)

**Files:**
- Create: `app/src/components/studio/apprentice-panel.tsx`
- Modify: `app/src/app/studio/page.tsx` — Add "Open to Apprentice" toggle

**What:** Experienced creators open sessions for learners to watch.

**Step 1:** Create apprentice panel component:
  - For mentor: "Open to Apprentice" toggle, shows connected apprentice name, chat
  - For apprentice: read-only view of mentor's DAW, text chat, "Request Control" button
  - Mentor can grant/revoke control of specific tracks
**Step 2:** Add apprentice toggle to studio page
**Step 3:** Create apprentice join flow: browse open sessions → join → watch
**Step 4:** Build and test
**Step 5:** Commit: `feat: apprentice mode — watch and learn from experienced creators`

---

## Sprint 4: Retention & Monetization (10 days)

*Ideas #21, #23, #24, #26, #27, #28, #30, #32, #40*

### Task 4.1: Creative Memory (#21)

**Files:**
- Create: `app/src/lib/data/creative-profile.ts`
- Create: `app/src/app/api/profile/creative-memory/route.ts`
- Create: `app/src/components/profile/creative-memory-card.tsx`

**What:** Platform builds a creative profile from all your history — powers recommendations.

**Step 1:** Create creative-profile module that aggregates:
  - Most-used genres, tempos, keys, instruments
  - Creation frequency patterns (time of day, day of week)
  - Preferred stem types
  - Collaboration frequency
  - Improvement metrics over time
**Step 2:** Create API route that returns the creative profile for authenticated user
**Step 3:** Create card component showing the profile:
  - Genre radar chart
  - "Most productive hours" heat map
  - "Signature sounds" — most-used stem types
  - "Creative evolution" — how preferences changed over time
**Step 4:** Wire creative profile into recommendation engine (modify `lib/recommendations/for-you.ts`)
**Step 5:** Build and test
**Step 6:** Commit: `feat: creative memory — personalized creative profile powering recommendations`

### Task 4.2: Seasonal Worlds (#23)

**Files:**
- Create: `app/src/app/season/page.tsx`
- Create: `app/src/app/api/seasons/current/route.ts`
- Create: `app/src/components/season/season-banner.tsx`
- Create: `app/src/components/season/collective-progress.tsx`

**What:** Quarterly themed creative containers with collective goals.

**Step 1:** Create API route for current season (theme, stems, progress, time remaining)
**Step 2:** Create season page:
  - Season theme hero (name, description, visual identity)
  - Featured stem pack for the season
  - Collective progress bar ("42,000 / 100,000 mashups this season")
  - Season-specific challenges
  - Leaderboard of top contributors
**Step 3:** Create season banner component (for homepage and create page)
**Step 4:** Create collective progress component (animated progress bar)
**Step 5:** Build and test
**Step 6:** Commit: `feat: seasonal worlds — quarterly themed creative containers`

### Task 4.3: Evolution Tracks (#24)

**Files:**
- Create: `app/src/components/mashup/evolution-compare.tsx`
- Create: `app/src/app/api/mashups/[id]/versions/route.ts`
- Modify: `app/src/app/mashup/[id]/page.tsx` — Add "Versions" tab

**What:** Save versions, compare side-by-side with auto-generated analysis.

**Step 1:** Create API route for mashup version history (list versions, compare two versions)
**Step 2:** Create evolution-compare component:
  - Side-by-side waveform view (V1 left, V2 right)
  - Synchronized playback with toggle
  - Auto-analysis panel: "V2 has better dynamic range (+3.2dB), tighter arrangement (8% fewer gaps)"
  - Version timeline showing all versions
**Step 3:** Add "Versions" tab to mashup detail page
**Step 4:** Build and test
**Step 5:** Commit: `feat: evolution tracks — version comparison with auto-generated analysis`

### Task 4.4: Stem Royalties (#26)

**Files:**
- Create: `app/src/lib/data/stem-royalties.ts`
- Create: `app/src/app/api/royalties/stems/route.ts`
- Modify: `app/src/app/dashboard/monetization/page.tsx` — Add stem earnings section

**What:** Auto-revenue share when your stem is used in a monetized mashup.

**Step 1:** Create stem-royalties module:
  - Calculate royalty per stem based on mashup revenue and stem count
  - Default split: equal among all stems, adjustable by mashup creator
  - Track and aggregate stem earnings per creator
**Step 2:** Create API route for stem earnings history
**Step 3:** Add "Stem Earnings" section to monetization dashboard:
  - Table: stem name, used in X mashups, total plays contributed, total earned
  - "Your stems earned $X.XX this month"
**Step 4:** Build and test
**Step 5:** Commit: `feat: stem royalties — automatic revenue share for stem creators`

### Task 4.5: Style Portraits (#32)

**Files:**
- Create: `app/src/components/profile/style-portrait.tsx`
- Create: `app/src/app/api/profile/style-portrait/route.ts`
- Create: `app/src/app/portrait/[username]/page.tsx`

**What:** AI-generated visual representing your creative DNA, shareable.

**Step 1:** Create API route that analyzes a creator's mashup history and generates:
  - Top 5 genres as a radar chart
  - Average BPM range
  - Harmonic preference (major vs minor keys)
  - "Creative archetype" label (e.g., "The Genre Bender", "The Beatsmith", "The Vibe Curator")
  - Color palette derived from their sonic preferences
**Step 2:** Create style-portrait component:
  - Beautiful, shareable card (designed for social media dimensions)
  - Radar chart of genres
  - Archetype name in display typography
  - Stats in small text
  - Color-coded background based on their palette
  - "Share" and "Download" buttons
**Step 3:** Create shareable portrait page at `/portrait/[username]`
**Step 4:** Add "View Style Portrait" to profile page
**Step 5:** Build and test
**Step 6:** Commit: `feat: style portraits — AI-generated shareable creative identity cards`

### Task 4.6: Platform Sabbatical (#40)

**Files:**
- Create: `app/src/components/wellbeing/sabbatical-prompt.tsx`
- Create: `app/src/components/wellbeing/welcome-back.tsx`
- Create: `app/src/lib/data/wellbeing.ts`

**What:** Suggest a 3-day break after 30 consecutive days. Welcome back experience.

**Step 1:** Create wellbeing module that tracks consecutive active days
**Step 2:** Create sabbatical prompt component:
  - Gentle banner: "You've been creating for 30 days straight. Your best ideas come after rest."
  - Dismissible (not enforced)
  - Shows only once per streak
**Step 3:** Create welcome-back component:
  - Shows after 3+ day absence
  - "While you were away" summary: new plays, new followers, popular mashups from feed
  - "Let's create" CTA
**Step 4:** Build and test
**Step 5:** Commit: `feat: platform sabbatical — wellbeing prompts and welcome-back experience`

---

## Sprint 5: AI-Native & Mashup-Specific (10 days)

*Ideas #5, #33, #34, #35, #41, #42, #43, #44*

### Task 5.1: Genre Translation (#41)

**Files:**
- Create: `app/src/components/ai/genre-translator.tsx`
- Create: `app/src/app/api/ai/translate-genre/route.ts`
- Modify: `app/src/app/mashup/[id]/page.tsx` — Add "Translate Genre" button

**What:** One-click genre conversion of any mashup.

**Step 1:** Create API route that accepts mashup ID and target genre, uses AI to:
  - Analyze current stems
  - Replace stems with genre-appropriate equivalents (keeping rhythm and melody structure)
  - Adjust BPM and key if needed
  - Return new mashup as a draft
**Step 2:** Create genre-translator component:
  - Genre selector grid (EDM, Jazz, Classical, Trap, Lo-fi, Bossa Nova, etc.)
  - Preview of the translation before saving
  - "Save as New Mashup" button
**Step 3:** Add "Translate Genre" button to mashup detail page
**Step 4:** Build and test
**Step 5:** Commit: `feat: genre translation — one-click genre conversion of any mashup`

### Task 5.2: Ghost Collaborator (#33)

**Files:**
- Create: `app/src/components/ai/ghost-collaborator.tsx`
- Create: `app/src/app/api/ai/suggest/route.ts`

**What:** AI bandmate that offers creative suggestions during creation.

**Step 1:** Create API route that accepts current mashup state and returns 2-3 suggestions:
  - Structural suggestions ("Try moving the drop 4 bars earlier")
  - Stem suggestions ("This would sound great with a brass stab here")
  - Effect suggestions ("Add reverb to the vocal at the bridge")
**Step 2:** Create ghost-collaborator component:
  - Small floating panel in the create view
  - Shows current suggestion with "Accept" / "Skip" / "Show Me" buttons
  - "Show Me" previews the suggestion applied to the mix
  - Suggestion frequency: 1 per 2 minutes of active creation
**Step 3:** Wire into create page as an opt-in toggle
**Step 4:** Build and test
**Step 5:** Commit: `feat: ghost collaborator — AI creative suggestions during mashup creation`

### Task 5.3: Trend Synthesis (#34)

**Files:**
- Create: `app/src/components/trends/trend-synthesis.tsx`
- Create: `app/src/app/api/trends/synthesis/route.ts`
- Modify: `app/src/components/create/trending-sidebar.tsx` — Replace basic list with synthesis

**What:** AI analyzes trends and provides actionable ingredients, not just alerts.

**Step 1:** Create API route that:
  - Aggregates trending data from existing trending-sounds module
  - AI synthesizes patterns: "808 glide bass + chopped soul vocal + 140 BPM = 3x engagement"
  - Returns 3 "trend recipes" with matched stems from the library
**Step 2:** Create trend-synthesis component:
  - "What's Working Now" header
  - 3 recipe cards, each with: pattern description, matched stems, "Start Creating" button
  - Updated daily
**Step 3:** Replace basic trending list in create sidebar with synthesis view
**Step 4:** Build and test
**Step 5:** Commit: `feat: trend synthesis — AI-powered trend recipes with matched stems`

### Task 5.4: AI A&R — Emerging Creator Promotion (#35)

**Files:**
- Create: `app/src/lib/growth/ai-ar.ts`
- Create: `app/src/app/api/discovery/emerging/route.ts`
- Create: `app/src/components/discovery/emerging-creators.tsx`

**What:** AI identifies creators about to break out and promotes them proactively.

**Step 1:** Create ai-ar module that scores creators based on:
  - Growth velocity (play count acceleration, not total)
  - Quality signals (average play-through rate, remix rate)
  - Consistency (regular creation frequency)
  - Community engagement (collabs, challenge participation)
  - Returns ranked list of "emerging" creators
**Step 2:** Create API route returning top 10 emerging creators
**Step 3:** Create emerging-creators component:
  - "Rising" section on explore page
  - Creator cards with growth metrics
  - "Platform believed in them early" badge for featured creators
**Step 4:** Add to explore page and homepage
**Step 5:** Build and test
**Step 6:** Commit: `feat: AI A&R — algorithmic emerging creator discovery and promotion`

### Task 5.5: The Mashup Map (#42)

**Files:**
- Create: `app/src/app/map/page.tsx`
- Create: `app/src/components/map/global-mashup-map.tsx`

**What:** Real-time global visualization of mashups being created.

**Step 1:** Create map page with a world map visualization (use a lightweight map library like react-simple-maps or a canvas-based approach)
**Step 2:** Create global-mashup-map component:
  - Dots appear on the map at creator locations (use timezone/locale as proxy, not exact GPS)
  - Dots are color-coded by genre
  - Hover a dot: show creator name, mashup title, 5-second audio preview
  - Activity heat map overlay showing creation density
  - Real-time counter: "X mashups created in the last hour"
**Step 3:** Add "Map" to navigation
**Step 4:** Build and test
**Step 5:** Commit: `feat: mashup map — real-time global visualization of creative activity`

### Task 5.6: Source vs. Mashup Blind Test (#43)

**Files:**
- Create: `app/src/app/blind-test/page.tsx`
- Create: `app/src/app/api/blind-test/route.ts`
- Create: `app/src/components/blind-test/ab-player.tsx`

**What:** Blind A/B test — original vs mashup, community votes.

**Step 1:** Create API route that:
  - Selects a mashup and one of its source tracks
  - Randomizes which is "A" and which is "B"
  - Returns both audio URLs without identifying which is which
  - Tracks votes and reveals results
**Step 2:** Create blind-test page:
  - Two large play buttons ("Track A" / "Track B")
  - "Which do you prefer?" vote buttons
  - After voting: reveal which was original vs mashup
  - Running results: "Mashups preferred 43% of the time"
  - New pair each visit
**Step 3:** Create ab-player component (two side-by-side players, clean minimal UI)
**Step 4:** Build and test
**Step 5:** Commit: `feat: source vs mashup blind test — community A/B voting`

### Task 5.7: Stem Marketplace with Provenance (#44)

**Files:**
- Modify: `app/src/app/explore/page.tsx` — Add "Stems" tab
- Create: `app/src/components/stems/stem-card.tsx`
- Create: `app/src/components/stems/provenance-panel.tsx`

**What:** Browse stems with full usage history and provenance data.

**Step 1:** Create stem-card component showing:
  - Waveform preview, instrument icon, BPM, key
  - Usage count ("Used in 47 mashups")
  - Total plays across all mashups
  - Creator name
**Step 2:** Create provenance-panel component (shown when clicking a stem):
  - Full history: who created it, when
  - List of mashups that used it (sorted by plays)
  - Genre distribution of mashups using this stem
  - "Legendary" badge for stems with 50+ uses and 100K+ total plays
**Step 3:** Add "Stems" tab to explore page with search/filter
**Step 4:** Build and test
**Step 5:** Commit: `feat: stem marketplace with provenance — browse stems with full usage history`

---

## Sprint 6: Polish & Anti-Growth Growth (5 days)

*Ideas #4, #12, #14, #29, #36, #37, #38 — Features that need marketplace maturity.*

### Task 6.1: Sound DNA Extraction (#5)

**Files:**
- Create: `app/src/app/extract/page.tsx`
- Create: `app/src/app/api/ai/extract-sound/route.ts`

**What:** Upload any audio clip, AI extracts and recreates the interesting element.

**Step 1:** Create API route: accept audio file + description of desired element → AI isolates and reconstructs
**Step 2:** Create extract page: upload zone, describe what you want ("that snare"), preview result, save to stems
**Step 3:** Build and test
**Step 4:** Commit: `feat: sound DNA extraction — AI isolates and recreates sounds from any audio`

### Task 6.2: Sonic Neighborhoods (#14)

**Files:**
- Create: `app/src/components/discovery/sonic-neighborhoods.tsx`
- Create: `app/src/app/api/discovery/neighborhoods/route.ts`

**What:** Discovery organized by sonic characteristics, not genres.

**Step 1:** Create API route that clusters stems/mashups by audio features (warmth, distortion, space, punch)
**Step 2:** Create sonic-neighborhoods component: visual map of neighborhoods, click to explore
**Step 3:** Add to explore page as an alternative discovery mode
**Step 4:** Build and test
**Step 5:** Commit: `feat: sonic neighborhoods — discovery by sound texture, not genre`

### Task 6.3: The Vault (#36)

**Files:**
- Create: `app/src/components/vault/vault-panel.tsx`
- Create: `app/src/app/api/vault/route.ts`

**What:** Premium stems locked behind creative achievement.

**Step 1:** Create API route that checks user achievements and returns unlocked/locked vault items
**Step 2:** Create vault panel: grid of locked stem packs with unlock requirements shown
**Step 3:** Wire unlock logic to existing gamification module
**Step 4:** Build and test
**Step 5:** Commit: `feat: the vault — premium stems unlocked through creative achievement`

### Task 6.4: Stems Like This (#12)

**Files:**
- Create: `app/src/components/stems/similar-stems.tsx`
- Create: `app/src/app/api/stems/similar/route.ts`

**What:** "Stems Like This" — find similar sounds and every mashup that used them.

**Step 1:** Create API route that finds similar stems by instrument, genre, BPM, key
**Step 2:** Create similar-stems component: horizontal scroll of related stems with usage counts
**Step 3:** Add to stem detail view and create page
**Step 4:** Build and test
**Step 5:** Commit: `feat: stems like this — discover similar sounds and their usage`

### Task 6.5: The Annual Report (#38)

**Files:**
- Create: `app/src/app/annual/page.tsx`

**What:** "State of Mashups" annual report page.

**Step 1:** Create a beautifully designed static page with placeholder data:
  - Top genres of the year
  - Most-used stems
  - Fastest-growing creators
  - Total mashups created
  - Most remixed track
  - Predictions for next year
**Step 2:** Design for shareability (social meta tags, OG image)
**Step 3:** Build and test
**Step 4:** Commit: `feat: the annual — state of mashups yearly report page`

---

## Ideas Deferred (Build When Ready)

These ideas require marketplace maturity, significant user base, or external partnerships:

| Idea | Reason for Deferral | Prerequisite |
|------|---------------------|--------------|
| #4 Reaction Remix | Requires video recording in browser + complex split-screen editing | Mobile app or WebRTC video |
| #16 Studio Sessions (spectator) | Real-time collab exists but needs WebSocket hardening | Production WebSocket infrastructure |
| #25 Waiting Room | Needs live events to have a waiting room for | Live sessions feature first |
| #27 Commission Board | Needs active stem marketplace with pricing | Stem royalties + marketplace |
| #28 Listener Splits | Needs attribution tracking on shares | Referral system maturity |
| #29 Label Showcases | Needs B2B sales pipeline | Enterprise features |
| #30 Exit Ramps to Streaming | Needs rights clearance automation | Sample clearance marketplace |
| #37 Closed Beta Features | Process, not code — needs feature flag infrastructure | Feature flags |

---

## Success Metrics per Sprint

| Sprint | Ship Date | Key Metric | Target |
|--------|-----------|------------|--------|
| Sprint 0 | Week 1 | Build passes | Green |
| Sprint 1 | Week 2 | Time to First Remix | < 10 min |
| Sprint 2 | Week 4 | Mashups created/week | +50% |
| Sprint 3 | Week 6 | Collab rate | > 20% |
| Sprint 4 | Week 8 | D30 retention | > 40% |
| Sprint 5 | Week 10 | Organic K-factor | > 0.3 |
| Sprint 6 | Week 11 | Stem reuse rate | > 4x |

---

## Build Verification

After each sprint:
```bash
cd app && npx next build
```
Must pass with zero errors before committing.

---

*Plan created: February 14, 2026*
*Total: 6 sprints, ~43 days of engineering*
*Covers 37 of 45 ideas (8 deferred pending marketplace maturity)*
