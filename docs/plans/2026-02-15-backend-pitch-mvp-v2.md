# Backend Implementation Plan — Pitch-Ready MVP V2

**Date:** 2026-02-15
**Supersedes:** `app/docs/Demo Features Requiring Backend.md`, `app/docs/Backend Implementation Master Plan.md`
**Goal:** Build the minimum backend to make Mashups.com feel real and demonstrate its unique value proposition to investors, partners, and early users

---

## Philosophy

An investor demo doesn't need 24 features. It needs 5-6 that work flawlessly and tell a story:

> "Upload a song. AI separates the stems. Mix them with other creators' stems. Publish. Get paid."

That loop — **create, collaborate, publish, monetize** — is the pitch. Everything else is a nice-to-have. This plan focuses exclusively on making that loop real.

---

## What Makes Mashups.com Unique (The "Why Us" Features)

| Feature | Why It Matters | Competitor Gap |
|---------|---------------|----------------|
| AI Stem Separation | Upload any song, get remix-ready stems | BandLab/Splice don't do this |
| AI Mashup Generation | One-click professional mashup from stems | No competitor offers this |
| Real-Time Collaboration | Google Docs for music production | BandLab has basic, we can differentiate |
| Stem Marketplace | Stems as tradeable creative assets | Splice sells samples, not stems |
| Creator Monetization | Stem royalties track usage across mashups | Nobody does per-stem revenue sharing |

---

## What This Plan Does NOT Include

Deliberately skipped — these are engagement features that matter after product-market fit, not before:

- Gamification (XP, badges, streaks) — engagement optimization, not core product
- Challenges/Battles — community features, need users first
- Trending sounds API — content discovery, can use mock data for demo
- Voice chat — nice collab feature, not critical path
- Analytics dashboard — creator vanity metrics, defer
- Audio fingerprinting — legal compliance, defer until scale
- MIDI controller — power user niche
- Thumbnail generation — client-side, no backend needed
- Seasons/Events — engagement mechanics
- Content ID — complex partnerships, far future

---

## The 6-Week MVP

### Week 1: Auth + Core Data

**Why first:** Can't demo anything without user accounts.

#### 1.1 Supabase Auth
Connect the existing login/signup pages to Supabase Auth.

**Files to modify:**
- `app/src/app/login/page.tsx` — wire form to `supabase.auth.signInWithPassword()`
- `app/src/app/signup/page.tsx` — wire form to `supabase.auth.signUp()`
- `app/src/middleware.ts` — create, refresh session cookies

**What already exists:**
- `lib/supabase/client.ts` — browser client with no-op fallback
- `lib/supabase/server.ts` — server client with cookie handling
- Migration 001 — profiles table with RLS policies

**Supabase Auth setup:**
- Enable email/password provider
- Set redirect URLs for Vercel deployment
- Create database trigger: on `auth.users` insert → insert into `public.profiles`

#### 1.2 Wire Core Data Files
Make these data files query Supabase instead of returning mock data:

| File | Priority | Query Complexity |
|------|----------|-----------------|
| `mashups.ts` | Already done | - |
| `follows.ts` | Already done | - |
| `plays.ts` | Already done | - |
| `profiles.ts` | Verify working | Simple SELECT |
| `likes.ts` | Verify working | Simple INSERT/DELETE |
| `comments.ts` | Wire up | SELECT with joins, INSERT |
| `stems.ts` | Wire up | SELECT with filters |

**Pattern for each file:**
```typescript
export async function getThings() {
  if (!isSupabaseConfigured()) return mockThings
  const supabase = await createClient()
  const { data, error } = await supabase.from("things").select("*")
  if (error || !data) return mockThings
  return data
}
```

#### Deliverable
Users sign up, log in, browse real mashups, like, comment, follow creators.

---

### Week 2: Stem Separation + Upload

**Why:** This is the core product. Upload any audio → get remix-ready stems.

#### 2.1 File Upload Pipeline
**New file:** `app/src/lib/storage.ts`
**External service:** Vercel Blob ($0.15/GB/mo)

```
User uploads audio file
    → Validate (format, size <50MB, duration <10min)
    → Upload to Vercel Blob
    → Save reference in mashups/stems table
    → Return URL
```

**API route to make real:** `POST /api/upload`
- Accept multipart form data
- Upload to Vercel Blob via `@vercel/blob`
- Return `{ url, filename, size }`

#### 2.2 AI Stem Separation
**Tables:** `mashup_stems` (migration 007b — already has volume, mute columns)
**External service:** Replicate (Demucs htdemucs model, ~$0.05/track)
**API route:** `POST /api/audio/separate`

Flow:
1. Receive mashup ID + audio URL
2. Call Replicate API with Demucs model
3. Poll for completion (Replicate webhooks or polling)
4. Upload 4 separated stems (vocals, drums, bass, other) to Vercel Blob
5. Insert into `mashup_stems` table with URLs
6. Update mashup: `has_stems = true, stems_count = 4`

**Env vars needed:** `REPLICATE_API_TOKEN` (already in .env.local.example)

#### 2.3 Stem Registry
**Tables:** `stems`, `stem_mashup_links` (migration 009)
**Files to modify:** `stems.ts`, `stems-registry.ts`

Wire up:
- `getStems(filters?)` → query stems table with instrument/genre/bpm filters
- `getStemById(id)` → with usage count from stem_mashup_links
- `createStem(data)` → insert into stems table
- `linkStemToMashup(stemId, mashupId)` → insert into stem_mashup_links

#### Deliverable
Users upload audio, AI separates into stems, stems are saved and browsable. The "wow" moment of the demo.

---

### Week 3: AI Mashup Generation

**Why:** The second "wow" moment. Select stems → AI creates a mashup.

#### 3.1 Job Queue
**New table:** `ai_jobs` (track async processing)
**Infrastructure:** Inngest (free tier) or simple polling

```sql
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

#### 3.2 Mashup Generation Pipeline
**Files to modify:** `auto-mashup.ts`
**External services:** Replicate (FFmpeg model or custom), Vercel Blob

Flow:
1. User selects stems + configuration (vibe, intensity, transition style)
2. `POST /api/mashup/ai` → create ai_job, return jobId
3. Background processing:
   - Analyze stems (BPM detection, key detection)
   - Time-stretch to match BPM if needed
   - Mix stems with crossfades and transitions (FFmpeg via Replicate or serverless function)
   - Apply mastering (normalization, light compression)
   - Upload final MP3 to Vercel Blob
4. `GET /api/mashup/ai/:id` → poll status, return result when complete
5. User previews → saves as new mashup

**Simplified MVP approach:**
For the demo, the "AI" can be simpler than the V1 plan suggests. Use FFmpeg on Replicate to:
- Concatenate stems with crossfades
- Apply basic EQ and compression
- Normalize output levels

This gives a real audio result without building a custom ML pipeline.

#### Deliverable
Select stems → click "Generate" → wait 15-30 seconds → hear real mashup → save it.

---

### Week 4: Billing + Tier Gating

**Why:** Investors want to see a revenue model that works.

#### 4.1 Stripe Setup
**Tables:** `subscriptions`, `subscription_plans`, `checkout_sessions` (migration 004)
**Files to modify:** `billing.ts`, `subscriptions.ts`
**New file:** `app/src/lib/stripe.ts`

**Products:**
| Tier | Price | Key Limits |
|------|-------|------------|
| Free | $0 | 3 mashups/mo, 1 stem separation/day, no AI generation |
| Pro | $9.99/mo | Unlimited mashups, 20 AI generations/mo, stem export |
| Studio | $29.99/mo | Everything unlimited, priority processing, collaboration |

**API routes to make real:**
- `POST /api/billing/checkout` → Stripe Checkout Session, redirect to Stripe
- `POST /api/billing/webhook` → handle subscription lifecycle events
- `GET /api/billing/subscription` → current user's tier + entitlements

**Webhook events to handle:**
- `checkout.session.completed` → create/update subscription in DB
- `customer.subscription.updated` → sync status changes
- `customer.subscription.deleted` → mark as canceled
- `invoice.payment_failed` → mark as past_due

#### 4.2 Entitlement Enforcement
**New file:** `app/src/lib/entitlements.ts`

```typescript
export async function getUserTier(userId: string): Promise<'free' | 'pro' | 'studio'> {
  const sub = await getActiveSubscription(userId)
  if (!sub) return 'free'
  return sub.plan_id as 'pro' | 'studio'
}

export async function canPerformAction(userId: string, action: string): Promise<boolean> {
  const tier = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]
  const usage = await getMonthlyUsage(userId, action)
  return usage < limits[action]
}
```

Add checks to:
- `POST /api/mashup/ai` → check AI generation limit
- `POST /api/audio/separate` → check separation limit
- `POST /api/upload` → check mashup creation limit

#### Deliverable
Real payment flow. Free users hit limits, upgrade prompts appear, Stripe handles checkout. Revenue starts day one.

---

### Week 5: Real-Time Collaboration

**Why:** The differentiator. "Google Docs for music" is the investor hook.

#### 5.1 PartyKit Server
**Infrastructure:** PartyKit ($5/mo)
**Files to modify:** `realtime-collab.ts`, `studio-collab.ts`

**PartyKit server (deployed separately):**
- One room per project/mashup
- Broadcast cursor positions (throttled to 30fps)
- Broadcast track operations (volume change, mute, add stem, remove stem)
- Broadcast transport controls (play, pause, seek)
- Track connected users with presence

**Client integration:**
```typescript
// hooks/use-studio-collab.ts
export function useStudioCollab(projectId: string) {
  const socket = useRef<PartySocket>()
  const [peers, setPeers] = useState<Peer[]>([])

  useEffect(() => {
    socket.current = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: projectId,
    })
    // handle messages...
    return () => socket.current?.close()
  }, [projectId])

  return { peers, sendCursor, sendOperation }
}
```

#### 5.2 Collaboration UI
**Tables:** `collaboration_sessions`, `collaboration_participants` (migration 003)

- Show colored cursors for each connected user
- Display user avatars in studio header
- Sync mixer state (volumes, mutes, solo) across clients
- "Follow" mode: your view follows another user's cursor

#### Deliverable
Two people open the same mashup project → they see each other's cursors → changes sync in real-time. Demo this live to investors.

---

### Week 6: Polish + Stem Economics

**Why:** Close the loop. Stems have value. Creators get paid when their stems are used.

#### 6.1 Stem Marketplace (Wire Up)
**Tables:** `stems`, `stem_mashup_links`, `stem_usage_log` (migration 009)

Make real:
- Browse stems by instrument, genre, BPM, key
- See usage count (how many mashups use this stem)
- One-click "Add to my mashup" (creates stem_mashup_link)
- Stem provenance: full history of which mashups used this stem

#### 6.2 Stem Royalties
**Tables:** `earnings_ledger` (migration 002)
**Files to modify:** `revenue-splits.ts`, `earnings.ts`, `stem-royalties.ts`

When a mashup earns revenue (plays, subscriptions, tips):
1. Look up all stems in the mashup via `stem_mashup_links`
2. Split revenue proportionally across stem creators
3. Insert entries into `earnings_ledger` for each creator
4. Show earnings on creator dashboard

**This doesn't need Stripe Connect yet** — for MVP, just track earnings in the ledger. Actual payouts can be manual or deferred.

#### 6.3 Crates (Stem Collections)
**Tables:** `crates`, `crate_stems` (migration 009)
**Files to modify:** `crates.ts`

Wire up basic CRUD:
- Create a crate, add/remove stems, browse crates
- Share link to crate

#### 6.4 Demo Data Seeding
Create a seed script that populates the database with:
- 5-10 real user profiles
- 20-30 mashups with real audio (from `mp3/` directory or creative commons sources)
- 50+ stems across instruments
- Sample crates, challenges, follower relationships
- A few earning entries to show the monetization dashboard

This makes the demo feel alive and populated.

#### Deliverable
Complete loop: stems are browsable, addable to mashups, and earn revenue for their creators. Demo looks populated and real.

---

## Infrastructure Summary

### Services needed (MVP only)
| Service | Purpose | Cost | Setup |
|---------|---------|------|-------|
| **Supabase** (Pro) | Database, Auth, Realtime | $25/mo | Already set up |
| **Vercel** (Pro) | Hosting, serverless, cron | $20/mo | Already set up |
| **Replicate** | Stem separation, AI generation | $20-40/mo | Add API token |
| **Stripe** | Payments | 2.9% + $0.30/txn | Create products |
| **PartyKit** | Real-time collaboration | $5/mo | Deploy party server |
| **Vercel Blob** | Audio file storage | $5-15/mo | Included with Vercel |
| **Total** | | **~$80-110/mo** | |

### Env vars to add
```
# Already in .env.local.example
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REPLICATE_API_TOKEN=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# New
NEXT_PUBLIC_PARTYKIT_HOST=...
BLOB_READ_WRITE_TOKEN=...
```

---

## Demo Script (For Investors)

This is the 5-minute flow that shows the product working end-to-end:

1. **Sign up** (15 seconds) — email + password, instant account
2. **Upload a song** (30 seconds) — drag and drop MP3, see it appear
3. **AI stem separation** (30 seconds) — click "Separate", watch progress, see 4 stems appear
4. **Browse stem marketplace** (30 seconds) — find a bass stem from another creator, add it
5. **Generate mashup** (45 seconds) — select stems, pick vibe, click Generate, hear result
6. **Collaborate** (60 seconds) — share link, second user joins, cursors visible, sync changes
7. **Publish** (15 seconds) — one click, mashup is live with stem credits
8. **Show earnings** (15 seconds) — stem creator sees revenue from usage
9. **Upgrade prompt** (15 seconds) — hit free tier limit, show Stripe checkout

**Total: ~4.5 minutes.** Every step is real.

---

## What Ships After MVP

Once the MVP is proven, the Full Production plan (see companion doc) adds:
- Challenges & battles (community engagement)
- Trending sounds (content discovery)
- Voice chat (collaboration enhancement)
- Analytics dashboard (creator insights)
- Audio fingerprinting (content safety)
- Gamification (retention mechanics)

These are Phase 1 features in the full plan and can be wired up in 2-3 weeks each since the schema already exists.

---

## Key Differences from V1

1. **6 features, not 24** — laser focus on the product story
2. **6 weeks, not 24** — wire existing schema instead of building from scratch
3. **$80-110/mo, not $400-700** — no over-provisioned infrastructure
4. **Demo script included** — built for showing, not just building
5. **Seed data strategy** — empty apps don't impress anyone
6. **Revenue from week 4** — Stripe works on day one, not month six
7. **Real audio processing** — not more mock data, actual stem separation and mashup generation

---

*V2 Plan — Pitch-Ready MVP Backend*
*Created: 2026-02-15*
