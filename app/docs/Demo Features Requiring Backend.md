# Demo Features Requiring Backend Implementation

This document catalogs all simulated/mock features in the Mashups codebase that need real backend implementations.

**Last Updated:** February 14, 2026  
**Total Data Files:** 58  
**Mock/Demo Files:** 24  
**Real Implementations:** 34  
**Priority Order:** High → Medium → Low

---

## 📊 Complete Inventory

### Mock Features (24 files needing real backend)
1. ai-vocal.ts - AI Vocal Generation
2. attribution.ts - Audio Fingerprinting & Attribution
3. auto-caption.ts - Auto-Caption/Subtitle Generation
4. auto-mashup.ts - AI Magic Mashup Generator
5. battles.ts - Battle System
6. billing.ts - Billing/Subscriptions
7. challenge-engine.ts - Challenge Engine
8. content-id.ts - Content ID/Rights Management
9. crates.ts - Stem Crates/Collections
10. creative-streaks.ts - Creative Streaks/Gamification
11. gamification.ts - Gamification System
12. platform-challenges.ts - Platform-Specific Challenges
13. realtime-collab.ts - Real-time Collaboration
14. recommendations.ts - Smart Recommendations
15. remix-loader.ts - Remix/Stem Loader
16. revenue-splits.ts - Revenue Splitting
17. seasons.ts - Seasonal Events
18. stems-registry.ts - Stem Registry
19. studio-collab.ts - Studio Collaboration
20. subscriptions.ts - Subscription Management
21. thumbnail-generator.ts - Thumbnail Generation
22. tipping.ts - Creator Tipping
23. trending-sounds.ts - Trending Sounds Discovery
24. voice-chat.ts - Voice Chat

### Real Implementations (34 files with working backends)
analytics.ts, audit-log.ts, challenges.ts, collaboration.ts, comments.ts, comments-v2.ts, earnings.ts, follow-feed.ts, follows.ts, fork-contests.ts, genres.ts, likes.ts, mashup-adapter.ts, mashup-detail.ts, mashups.ts, mashups-mutations.ts, midi-controller.ts, momentum-feed.ts, payout-threshold.ts, playlists.ts, plays.ts, profile-detail.ts, profiles.ts, recommendation-events.ts, rights.ts, rights-safety.ts, scoreboard.ts, scoreboard-server.ts, stems.ts, studio-persistence.ts, studio-sessions.ts, types.ts, viral-packs.ts, viral-packs-server.ts

---

## 🔴 HIGH PRIORITY (Core Product)

### 1. AI Magic Generator (auto-mashup.ts) ✅ PLANNED
**Status:** Demo mode - simulates processing, no actual audio generation  
**User Impact:** Critical - main value proposition  
**Backend Plan:** `Audio Processing Backend Plan.md` created  
**Effort:** 8 weeks / $30-50/month

**What's Simulated:**
- Audio processing pipeline
- Stem separation
- Beat matching
- Final mashup generation

**What Users See:**
- Progress bar that fills up
- "Generated" result with fake URL
- Preview/Download buttons that fail

---

### 2. Auto-Caption Generator (auto-caption.ts)
**Status:** Mock implementation with hardcoded phrases  
**User Impact:** High - needed for social media export  
**Effort:** 2-3 weeks / $20-50/month

**Current Implementation:**
```typescript
// Returns mock phrases instead of actual transcription
const mockPhrases = detectLyrics ? getMockLyrics() : getMockPhrases()
```

**Real Implementation Options:**
| Service | Accuracy | Cost | Latency |
|---------|----------|------|---------|
| **OpenAI Whisper** | 95%+ | $0.006/min | 2-5s |
| **Deepgram** | 90%+ | $0.0045/min | 1-3s |
| **AssemblyAI** | 92%+ | $0.0065/min | 2-4s |
| **AWS Transcribe** | 88%+ | $0.024/min | 3-6s |

**Recommendation:** OpenAI Whisper via API

**Backend Plan Outline:**
1. Accept audio file upload
2. Send to Whisper API
3. Process results (add timestamps)
4. Generate SRT/VTT formats
5. Return caption data

**Cost:** ~$0.006 per minute of audio

---

### 3. Real-Time Collaboration (realtime-collab.ts)
**Status:** Simulated with setTimeout, no actual WebSocket  
**User Impact:** High - key differentiator feature  
**Effort:** 4-6 weeks / $50-100/month

**What's Simulated:**
- Cursor presence
- Live cursors
- Session sync
- Conflict resolution

**Real Implementation:**
- **WebSocket Server:** Socket.io or PartyKit
- **State Sync:** CRDT (Yjs) or Operational Transform
- **Presence:** Redis for active users
- **Conflict Resolution:** Last-write-wins or structured

**Backend Components:**
```
WebSocket Server (Socket.io)
  ├── Room Management (per project)
  ├── Presence Tracking (who's online)
  ├── Operation Broadcasting (changes)
  └── State Persistence (Supabase)
```

**Infrastructure:**
- PartyKit: $5-20/month (easiest)
- Custom Socket.io: $30-50/month (more control)

---

### 4. Attribution & Audio Fingerprinting (attribution.ts)
**Status:** Mock fingerprinting, fake database matches  
**User Impact:** High - rights management core feature  
**Effort:** 3-4 weeks / $30-60/month

**Current Implementation:**
```typescript
// Mock fingerprint comparison
const mockMatch = await queryFingerprintDatabase(fingerprint)
```

**Real Implementation:**
- **Fingerprinting:** Chromaprint/AcoustID
- **Database:** ElasticSearch or PostgreSQL with pgvector
- **Matching:** Similarity search on audio fingerprints

**Backend Plan:**
1. Extract fingerprint from upload (Chromaprint)
2. Store in database
3. Query for matches on new uploads
4. Return attribution/confidence score

**Services:**
- AcoustID API: Free for non-commercial
- Custom: Chromaprint +自建数据库

---

## 🟡 MEDIUM PRIORITY (Growth Features)

### 5. AI Vocal Generation (ai-vocal.ts)
**Status:** Simulated generation with random audio URL  
**User Impact:** Medium - premium feature  
**Effort:** 2-3 weeks integration / $0.50-2.00 per generation

**Implementation Options:**
| Service | Quality | Cost | Speed |
|---------|---------|------|-------|
| **Suno AI** | High | $10/mo + usage | 30s |
| **Uberduck** | Medium | Free tier + $10/mo | 10s |
| **ElevenLabs** | Very High | $5/mo + $0.10/char | 5s |
| **Replicate** | High | Per-use | 30-60s |

**Recommendation:** Start with ElevenLabs for voice cloning

---

### 6. Analytics Dashboard (analytics.ts)
**Status:** Mock data with random numbers  
**User Impact:** Medium - creator insights  
**Effort:** 2-3 weeks / $20-40/month

**Current:**
```typescript
plays: Math.floor(Math.random() * 50000),
likes: Math.floor(Math.random() * 5000),
```

**Real Implementation:**
- **Event Tracking:** Segment or PostHog
- **Data Warehouse:** ClickHouse or BigQuery
- **Aggregations:** Materialized views in Supabase
- **Real-time:** Redis for live counters

**Events to Track:**
- play, pause, skip, like, share, download
- create, publish, remix
- signup, upgrade, churn

---

### 7. Battle System (battles.ts)
**Status:** Mock battles with static data  
**User Impact:** Medium - community engagement  
**Effort:** 2-3 weeks / $0 (use existing DB)

**Database Schema Needed:**
```sql
battles (id, status, start_time, end_time, theme)
battle_entries (battle_id, user_id, mashup_id, votes)
battle_votes (user_id, entry_id, created_at)
```

**Real-time Voting:**
- WebSocket for live vote counts
- Rate limiting (1 vote per user per battle)
- Anti-cheat (fingerprinting)

---

### 8. Challenge Engine (challenge-engine.ts, challenges.ts)
**Status:** Mock challenges, no real submission flow  
**User Impact:** Medium - retention feature  
**Effort:** 2 weeks / $0 (use existing DB)

**Missing Backend:**
- Challenge creation (admin)
- Submission handling
- Leaderboard calculations
- Prize distribution
- Streak tracking

**Database:**
```sql
challenges (id, title, theme, start_date, end_date, prize)
challenge_entries (challenge_id, user_id, mashup_id, submitted_at)
challenge_leaderboard (challenge_id, user_id, rank, score)
```

---

### 9. Voice Chat (voice-chat.ts)
**Status:** Simulated WebRTC, no actual connection  
**User Impact:** Medium - collaboration feature  
**Effort:** 1-2 weeks / $20-50/month

**Implementation:**
- **Daily.co API:** $0.001/minute (easiest)
- **Twilio:** $0.004/minute
- **100ms:** $0.003/minute

**Features:**
- Rooms per project
- Push-to-talk
- Mute/unmute
- Speaking indicators

---

## 🟢 LOW PRIORITY (Nice to Have)

### 10. Content ID / Rights Management (content-id.ts)
**Status:** Mock scanning, simulated risk scores  
**User Impact:** Low-Medium - legal protection  
**Effort:** 3-4 weeks / complex

**Integration Options:**
- YouTube Content ID API (requires partnership)
- Audible Magic
- Custom fingerprinting (see #4)

---

### 11. Earnings & Revenue Splits (earnings.ts, revenue-splits.ts)
**Status:** Mock earnings data  
**User Impact:** Low - monetization feature  
**Effort:** 2-3 weeks + Stripe integration

**Backend:**
- Stripe Connect for payouts
- Ledger system for tracking
- Split calculations
- Tax forms (1099)

---

### 12. Gamification System (gamification.ts)
**Status:** Mock XP, badges, levels  
**User Impact:** Low - engagement  
**Effort:** 1-2 weeks / $0

**Database:**
```sql
user_xp (user_id, total_xp, current_level)
user_badges (user_id, badge_id, earned_at)
user_streaks (user_id, current_streak, last_activity)
```

---

### 13. Smart Mashup Recommendations (recommendations.ts)
**Status:** Random recommendations  
**User Impact:** Medium - discovery  
**Effort:** 2-4 weeks / ML expertise

**Options:**
1. **Simple:** Collaborative filtering (users who liked X also liked Y)
2. **Advanced:** Embedding-based similarity (OpenAI embeddings)
3. **ML:** Train model on user behavior

---

### 14. Platform Export (platform-export.ts)
**Status:** Mock export to TikTok/YouTube/Instagram  
**User Impact:** Medium - distribution  
**Effort:** 1-2 weeks per platform

**Implementation:**
- **TikTok:** Creator API (requires approval)
- **YouTube:** Data API + OAuth
- **Instagram:** Basic Display API
- **Twitter:** Media Upload API

**Simpler Alternative:**
- Generate optimized video file
- Provide one-click download
- Include metadata/captions

---

### 15. MIDI Controller Support (midi-controller.ts)
**Status:** Mock MIDI device detection  
**User Impact:** Low - power user feature  
**Effort:** 1 week / $0 (client-side Web MIDI API)

**Note:** This is mostly client-side Web MIDI API - just needs real implementation, not backend.

### 16. Billing System (billing.ts)
**Status:** Mock subscription tiers, no real payment processing  
**User Impact:** High - revenue critical  
**Effort:** 2-3 weeks / Stripe integration

**Missing:**
- Stripe Checkout integration
- Subscription lifecycle (upgrade/downgrade/cancel)
- Invoice generation
- Failed payment handling
- Tax calculation (Stripe Tax)

### 17. Stem Crates/Collections (crates.ts)
**Status:** Mock crate system  
**User Impact:** Medium - content organization  
**Effort:** 1 week / $0 (database only)

**Simple CRUD:**
- Create/update/delete crates
- Add/remove stems from crates
- Share crates with community

### 18. Creative Streaks (creative-streaks.ts)
**Status:** Mock streak data  
**User Impact:** Medium - engagement/retention  
**Effort:** 1 week / $0

**Backend:**
- Track daily creation activity
- Calculate streaks
- Handle streak recovery
- Reward distribution

### 19. Studio Collaboration (studio-collab.ts)
**Status:** Mock studio session sync  
**User Impact:** High - collaboration  
**Effort:** 3-4 weeks

**See:** Realtime Collaboration (#3) - may be duplicate

### 20. Thumbnail Generator (thumbnail-generator.ts)
**Status:** Mock waveform data, static templates  
**User Impact:** Medium - visual appeal  
**Effort:** 1-2 weeks / Canvas API (client-side)

**Real Implementation:**
- Canvas-based generation
- Real waveform analysis
- Template rendering
- Export to PNG/JPG

### 21. Platform Challenges (platform-challenges.ts)
**Status:** Mock TikTok/Instagram challenge data  
**User Impact:** Medium - viral growth  
**Effort:** 2 weeks

**Backend:**
- Platform API integration (TikTok, Instagram)
- Challenge tracking
- Hashtag monitoring
- Winner selection

### 22. Remix Loader (remix-loader.ts)
**Status:** Mock stem loading from mashups  
**User Impact:** High - remix culture  
**Effort:** 2 weeks

**Backend:**
- Extract stems from existing mashups
- Permission system (allow remixing)
- Stem storage and delivery
- Attribution tracking

### 23. Seasons/Events (seasons.ts)
**Status:** Mock seasonal events data  
**User Impact:** Low - engagement  **Effort:** 1 week

**Backend:**
- Season configuration
- Time-limited challenges
- Special rewards
- Event analytics

### 24. Trending Sounds (trending-sounds.ts)
**Status:** Mock TikTok/Spotify trending data  
**User Impact:** High - content discovery  
**Effort:** 2-3 weeks / API integrations

**Real Implementation:**
- TikTok API integration (requires partnership)
- Spotify Charts API
- YouTube Trending API
- Internal trending algorithm

---

## 📊 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
1. ✅ AI Magic Generator backend plan (done)
2. Auto-Caption API integration
3. Real-time collaboration (PartyKit)
4. Basic analytics tracking

### Phase 2: Community (Weeks 5-8)
5. Battle system database
6. Challenge engine
7. Voice chat integration
8. Gamification system

### Phase 3: Advanced (Weeks 9-12)
9. Attribution fingerprinting
10. AI vocal generation
11. Content ID integration
12. Platform exports

### Phase 4: Monetization (Weeks 13-16)
13. Earnings/royalty system
14. Smart recommendations
15. Advanced analytics

---

## 💰 Total Cost Estimate

| Phase | Duration | Est. Monthly Cost |
|-------|----------|-------------------|
| Phase 1 | 4 weeks | $100-150 |
| Phase 2 | 4 weeks | $50-100 |
| Phase 3 | 4 weeks | $100-200 |
| Phase 4 | 4 weeks | $50-100 |
| Phase 5 | 4 weeks | $30-50 |
| **Total** | **20 weeks** | **$330-600/month** |

**Per-User Costs:**
- AI Mashup: $0.01-0.05
- Caption Generation: $0.006/min
- Voice Chat: $0.001-0.004/min
- Vocal AI: $0.50-2.00/generation
- Thumbnail Generation: $0 (client-side)
- Trending Sounds API: $0.001/query

---

## 🎯 Next Steps

**Immediate (This Week):**
- [ ] Create backend plan for Auto-Caption
- [ ] Set up PartyKit for real-time collab
- [ ] Implement basic analytics event tracking

**Next 2 Weeks:**
- [ ] Start AI Magic Generator MVP (Phase 1)
- [ ] Integrate Whisper API for captions
- [ ] Set up analytics pipeline

**Which backend plan should I create next?**