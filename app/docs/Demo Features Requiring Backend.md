# Demo Features Requiring Backend Implementation

This document catalogs all simulated/mock features in the Mashups codebase that need real backend implementations.

**Last Updated:** February 14, 2026  
**Total Features:** 15 major areas  
**Priority Order:** High → Medium → Low

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
| **Total** | **16 weeks** | **$300-550/month** |

**Per-User Costs:**
- AI Mashup: $0.01-0.05
- Caption Generation: $0.006/min
- Voice Chat: $0.001-0.004/min
- Vocal AI: $0.50-2.00/generation

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