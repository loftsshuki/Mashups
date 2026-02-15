# Splice Integration — Research Brief

**Last Updated:** February 14, 2026
**Context:** Evaluating Splice as an integration partner for Mashups.com's sample/stem workflow

---

## 1. Splice Overview

### What Splice Offers

| Product | Description | Pricing |
|---------|-------------|---------|
| **Splice Sounds** | Subscription sample library — loops, one-shots, presets | $8-$30/mo (100-500 credits) |
| **Splice Plugins** | Rent-to-own VST/AU plugins | Pay monthly until owned |
| **Splice Create** | AI-powered sample generation and manipulation | Included with Sounds subscription |
| **Splice Community** | Project sharing, collaboration, remix contests | Free |
| **Splice Bridge** | Desktop app for managing downloads and DAW integration | Free with subscription |

### Key Stats
- **4M+ samples** in the Sounds library (as of 2025)
- **6M+ users** globally
- **200+ label partnerships** — Loopmasters, KSHMR, Cymatics, Output, etc.
- **Genre coverage** — EDM, hip-hop, pop, lo-fi, cinematic, world, experimental
- Samples are **royalty-free** — once downloaded, they can be used in commercial productions without additional licensing

### Splice's Licensing Model
- Samples downloaded via Splice Sounds are cleared for **commercial use in derivative works** (songs, mashups, productions)
- You **cannot** redistribute raw samples as-is (no re-selling sample packs)
- Samples used in a mashup/production are fully licensed — no additional clearance needed
- This makes Splice samples **ideal for a mashup platform** — zero copyright risk

---

## 2. API & Integration Possibilities

### Public API Status
- Splice does **not** offer a public REST API as of 2025/2026
- No official developer documentation or partner SDK
- The Splice Bridge desktop app communicates with Splice's internal API (authenticated, undocumented)

### Known Integration Points
| Integration | Method | Status |
|-------------|--------|--------|
| **DAW Integration** | Splice Bridge app + drag-and-drop | Available (desktop only) |
| **Web Embed** | No official embed/iframe SDK | Not available |
| **OAuth** | No public OAuth flow | Not available |
| **Affiliate Program** | Referral links with revenue share | Available |
| **Contest/Remix Partnerships** | Custom campaigns with Splice team | Available (business development) |

### How Other Platforms Integrate
- **BandLab** — No direct Splice integration; uses own sample library
- **Soundtrap (Spotify)** — Built own sample library; no Splice connection
- **Amped Studio** — No Splice integration; partners with Loopcloud
- **Landr** — Built own sample marketplace
- **Conclusion:** No browser-based DAW has achieved direct Splice integration. Most build their own sample ecosystems.

### Realistic Integration Paths
1. **Affiliate partnership** — Link to Splice from within Mashups.com; earn referral revenue; users download samples via Splice Bridge and manually import
2. **BD partnership** — Negotiate a custom API arrangement or white-label sample access (requires direct business relationship with Splice)
3. **Splice Create API** — If Splice opens their AI tools via API, integrate AI-generated samples directly
4. **File import** — Let users drag-and-drop Splice-downloaded files into the Mashups.com DAW (works today, no partnership needed)

---

## 3. Sample Library Integration Design

### User Flow (Ideal State)
```
1. User opens Mashups.com DAW
2. Clicks "Browse Samples" sidebar
3. Searches/filters by genre, instrument, BPM, key
4. Previews samples inline (waveform + play button)
5. One-click adds sample to timeline track
6. Sample is pre-cleared — no copyright warning
```

### Implementation Options

#### Option A: Build Own Library (Recommended for MVP)
- Curate 10,000-50,000 royalty-free samples
- Sources: free Creative Commons samples, partnerships with indie sample creators, AI-generated samples
- Full control over UX, licensing, and quality
- **Cost:** Licensing deals or creation costs; storage/CDN
- **Timeline:** 4-6 weeks for MVP library

#### Option B: Splice Partnership
- Requires business development negotiation
- Splice may offer white-label access for a revenue share
- Depends on Splice's willingness to partner with a potential competitor
- **Cost:** Revenue share + engineering
- **Timeline:** 3-6 months (negotiation + integration)

#### Option C: Loopcloud/Sounds.com Integration
- Loopcloud (by Loopmasters) has a more open integration approach
- Sounds.com (Native Instruments) offers API access for partners
- Smaller catalogs but more integration-friendly
- **Cost:** Partnership negotiation + engineering
- **Timeline:** 2-4 months

#### Option D: Hybrid Approach
- Build own library for core experience (Option A)
- Add Splice affiliate links for "want more?" upsell
- Explore Loopcloud/Sounds.com API for expanded catalog
- Use AI generation (Splice Create-style) for infinite variety

### Licensing Considerations
- Splice samples in mashups: **Fully cleared** — no issues
- Must honor Splice's Terms: cannot redistribute raw samples
- If building own library: establish clear licensing terms (royalty-free, commercial use permitted, no redistribution of raw files)

---

## 4. Splice Create (AI Tools)

### What Splice Create Offers
- **Stack:** Layer multiple samples to create new hybrid sounds
- **Create:** AI-generated variations of existing samples
- **Transform:** Change characteristics (pitch, texture, rhythm) while maintaining musicality
- **Text-to-Sample:** Describe a sound in natural language, AI generates it (beta)

### Comparison with Mashups.com AI Features
| Feature | Splice Create | Mashups.com (Current) |
|---------|--------------|----------------------|
| AI stem generation | Yes (sample-level) | Smart Stem Swapping (track-level) |
| Style transfer | Basic (timbre only) | Full style transfer (genre-bending) |
| Text-to-audio | Beta | Not yet |
| Vocal processing | No | AI Harmony, Auto-tune, Voice cloning |
| Auto-mashup | No | Yes (full auto-mashup from 2+ tracks) |
| Mastering | No | Yes (AI Mastering) |

### Opportunity
- Mashups.com's AI features are **more ambitious and mashup-specific** than Splice Create
- Splice Create is sample-focused; Mashups.com is production-focused
- Complementary rather than competitive — could integrate Splice Create for sample-level AI while Mashups.com handles track-level AI

---

## 5. Collaboration Features

### Splice Collaboration Model
- Share project files via Splice Community
- Version control for DAW projects (Git for music)
- Comment on specific sections of a project
- Fork/remix other creators' shared projects

### Mashups.com Already Has
- Real-time collaborative editing (Realtime Collab 2.0)
- Voice chat integration (Daily.co)
- Live cursor tracking and follow mode
- Remix Family Tree visualization

### Gap Analysis
| Feature | Splice | Mashups.com | Notes |
|---------|--------|-------------|-------|
| Version control | Yes (file-based) | No | Could add project snapshots |
| Async collaboration | Yes | No (real-time only) | Add "leave feedback" mode |
| Project forking | Yes | Yes (remix tree) | Already stronger |
| File sharing | Yes (via Splice Bridge) | Yes (in-browser) | Mashups is more seamless |

---

## 6. Competitive Analysis

### Sample/Loop Platforms
| Platform | Catalog | Pricing | Unique Angle | Integration Potential |
|----------|---------|---------|-------------|----------------------|
| **Splice** | 4M+ samples | $8-30/mo | Market leader, Rent-to-Own plugins | Low (no public API) |
| **Loopcloud** | 4M+ samples | $6-15/mo | In-app editing, cloud-based | Medium (more open to partnerships) |
| **LANDR** | 2M+ samples | $5-30/mo | AI mastering bundled | Medium (has API for mastering) |
| **Output Arcade** | Curated loops | $10/mo | Real-time manipulation engine | Low (standalone app) |
| **ADSR** | 500K+ samples | Pay-per-pack | No subscription; own forever | Medium (simpler licensing) |
| **Soundsnap** | 400K+ SFX/music | $15-30/mo | Strong SFX library | Medium (has embed options) |
| **Freesound** | 500K+ sounds | Free (CC) | Community-contributed, open | High (public API, free) |

### Recommended Priority Partners
1. **Freesound** — Free, open API, large catalog. Best for MVP integration.
2. **Loopcloud** — Large catalog, more partnership-friendly than Splice.
3. **LANDR** — AI mastering API could complement Mashups.com's own mastering.
4. **Splice** — Long-term aspirational partner; start with affiliate relationship.

---

## 7. Business Model Alignment

### Revenue Opportunities
| Model | Description | Revenue Potential |
|-------|-------------|-------------------|
| **Affiliate referrals** | Link to Splice/Loopcloud; earn per signup | $5-20/conversion |
| **Built-in sample marketplace** | Sell curated packs within platform | 30% platform fee |
| **Premium sample access** | Gate larger library behind Pro tier | Bundled with $12-29/mo subscription |
| **AI-generated sample packs** | Use AI to create unique, platform-exclusive samples | 100% margin (no licensing costs) |
| **Creator sample sales** | Let top creators sell their own sample packs | 70/30 creator/platform split |

### Partnership Structures
- **White-label licensing** — Pay Splice/Loopcloud a per-user or per-download fee for embedded access
- **Revenue share** — Split subscription revenue for users who primarily use the sample browser
- **Co-marketing** — Joint remix contests and creator campaigns
- **Referral/affiliate** — Simplest to implement; lowest friction; lowest revenue

---

## 8. Technical Integration Path

### Phase 1: File Import (Now — No Partnership Needed)
- Accept drag-and-drop of WAV, MP3, FLAC, OGG, AIFF files
- Users download from Splice Bridge and import manually
- Add "Import from local files" button in sample browser
- **Effort:** Already exists in current DAW

### Phase 2: Built-In Sample Library (4-6 weeks)
- Curate 10,000+ royalty-free samples (Freesound API + commissioned content)
- Build sample browser UI: search, filter by BPM/key/genre/instrument
- Preview playback with waveform visualization
- One-click add to timeline
- **Effort:** 4-6 weeks engineering + content curation

### Phase 3: AI Sample Generation (2-3 weeks)
- "Generate a sample" using text prompts or style references
- Leverage existing AI infrastructure (already have style transfer, stem swapping)
- Generated samples are 100% original — zero copyright risk
- **Effort:** 2-3 weeks (building on existing AI pipeline)

### Phase 4: Partner API Integration (3-6 months)
- Negotiate with Loopcloud or Sounds.com for API access
- OAuth flow for users to connect their existing subscriptions
- Embedded browsing/preview within Mashups.com DAW
- Download credits deducted from user's partner subscription
- **Effort:** 3-6 months (negotiation + engineering)

### File Format Considerations
| Format | Use Case | Support |
|--------|----------|---------|
| WAV (44.1/48kHz, 16/24-bit) | Studio quality, stems | Must support |
| MP3 (320kbps) | Compressed, quick preview | Must support |
| FLAC | Lossless, smaller than WAV | Should support |
| OGG | Web-native, good compression | Should support |
| AIFF | Mac-native, studio quality | Nice to have |

---

## Actionable Recommendations

1. **Don't wait for Splice** — Their lack of public API makes direct integration impractical in the short term. Start with an affiliate relationship.
2. **Build your own sample library** using Freesound API + AI generation + commissioned content. This gives full control and zero licensing risk.
3. **AI-generated samples are the differentiator** — No other platform offers "describe a sound, get a sample" integrated directly in the mashup workflow.
4. **Approach Loopcloud first** for a partnership — they're more open to API integrations than Splice.
5. **Creator-contributed samples** could become a flywheel — top creators upload stems, others use them in mashups, attribution drives discovery.
6. **Phase the rollout:** File import (free) -> Built-in library (Pro) -> AI generation (Pro) -> Partner integrations (future).
