# Can Mashups Become the Rights-Cleared Social Remix Platform for Everyday Music Fans?

**Decision document — skeptical, evidence-based**

| | |
|---|---|
| **Research completion date** | 2026-08-08 (all sources accessed on or before this date; no future-dated announcements used) |
| **Jurisdictions examined** | United States (launch analysis); European Union (incl. Germany, France); United Kingdom; Canada; Australia; Japan; Brazil and Mexico (Latin America) |
| **Method** | Nine parallel research streams across two waves (law; platform precedents; label/AI dealmaking; technology; mandatory fact-check; consumer demand & app-market; platform-license boundaries & added jurisdictions; catalog supply & beachhead; economics inputs), ~200 sources reviewed, ~110 cited. Load-bearing claims re-verified against primary sources. Direct inspection of the Mashups codebase for the current-product-state assessment. |
| **Companion document** | `docs/RIGHTS_CLEARED_PLATFORM_RESEARCH.md` (2026-08-08) — deep licensing/legal research this document builds on; corrections to it from the mandatory fact-check are listed in §5 and appended to that file |
| **Standing caveats** | Legal analysis herein is research synthesis, **not legal advice**; sections flagged ⚖ require qualified music counsel. All modeled numbers are labeled as models. Several key metrics (competitor retention, deal terms) are not public anywhere; absence is disclosed rather than papered over. |

## Contents map

Sections follow the required deliverable list: §1 executive memo · §2 recommendation · §3 thesis · §4 proven vs assumed · §5 fact-check · §6 demand · §7–8 competition · §9 rights map · §10 platform boundaries · §11 jurisdictions · §12 catalog paths · §13 beachhead · §14 one-stop verification · §15 pilot license · §16 pairing controls · §17 sharing vs containment · §18 remix tree · §19 creator ownership/rewards · §20 audio quality · §21 arrangement generation · §22 architecture · §23 rights ops · §24 trust & safety · §25 business model · §26 licensing economics · §27 unit economics (+ §27A scenarios A–E) · §28 defensibility · §29 virality · §30 staged GTM · §31 partner map · §32 outreach · §33 metrics & experiments · §34 risk register · §35 red team · §36 alternatives · §37 90-day plan · §38 24-month roadmap · §39 capital & hiring · §40 kill criteria · §41 final answers (40) · §42 sources · §43–45 fact/assumption/open-question ledgers.

---


# 1. Executive decision memo

**The question:** should Mashups pursue a staged rights-cleared consumer remix platform, beginning with owned and artist-direct music?

**What the evidence says, in five findings:**

1. **Licensing is possible; it is no longer the binding constraint at pilot scale.** MashApp launched Feb 2025 with UMG, Sony, WMG, Kobalt and UMPG licenses for exactly this product category (after ~4 years of negotiation); Hook licensed 1M in-app songs from ~18K artists via Downtown, Too Lost, Primary Wave and Avex, ships real two-song mashups ("Blend two tracks into one" — its own App Store listing), and exports watermarked short clips to TikTok/Instagram plus 60-second remixes to SoundCloud; the NMPA published opt-in template AI licenses (June 2026); Merlin has licensed three creation products. The dam broke in 2025–26. But every deal shares one shape: **opt-in catalog, walled garden, no free audio export**.
2. **Consumer demand for mashup *creation* is weak and unproven as a habit — this is now the binding constraint.** The two cleanest tests of this exact thesis — licensed, VC-funded, majors-blessed — show tiny footprints: Hook has roughly a hundred US App Store ratings after nearly two years; MashApp sits near 3.7★ with ~50K downloads (aggregator estimate) and silence since launch. Consumption of transformed music is enormous (16B #spedup views, 43M-view mashup videos, official sped-up releases charting); creation is a thin superfan/meme-maker layer on top. No player publishes retention. The one longitudinal case (Rave.dj, 8 years) decayed from viral novelty to Patreon niche.
3. **The technology is buildable and the quality bar is reachable — but the current prototype has not reached it.** Every pipeline stage is published, benchmarked technique; compute costs are trivial (~$0.04/mashup); artist-provided stems at intake sidestep the hardest quality problem. The repo's current "compatibility scoring" is a metadata heuristic and its arrangements are preset variants — the "three meaningfully different, genuinely good arrangements" engine is still to be built and must pass a blind listening test before any money is spent on rights.
4. **The competitive window is real but narrow and closing from above.** Spotify announced licensed fan covers/remixes with UMG (May 2026) and Merlin (Aug 4, 2026) as a paid add-on — but its announced scope is **single-source** transformation; the phrase "mashup" appears nowhere. Two-song combination, fork lineage, and creator-to-creator economics remain unclaimed by anyone with distribution. Udio's licensed platform and KLAY are announced-not-launched; ElevenMusic is live at indie scale. The unclaimed capability is precisely Mashups' thesis — and incumbents' entry validates the category while threatening the standalone destination.
5. **The economics only work as a gated, mostly-organic, superfan business at first.** Modeled honestly: content pool 50–75% on licensed plays, ~1.7% median download→paid conversion, ~13% monthly churn, $70–235 paid CAC if bought — paid acquisition cannot carry this; artist-driven organic distribution must. At artist-direct tier with $0 advances and rev-share-only, gross margins can be software-like on subscriptions; at major-catalog tier this becomes a rights-heavy media business with venture-scale capital needs.

**The decision logic:** the thesis cannot be falsified or confirmed from a desk — the demand question is open, the quality question is testable in-house, and the licensing question is answerable with ten conversations. Everything needed to resolve all three costs roughly one quarter and very little cash. Committing now to the full consumer thesis would ignore finding 2; abandoning now would ignore findings 1, 4, and the sunk prototype. The rational move is a **pre-registered, gated experiment** — with the pivot destinations (white-label artist campaigns; rights/derivative-accounting infrastructure) named in advance so a "no" is cheap and a "yes" compounds.

---

# 2. Firm recommendation

**Run a limited product-and-licensing experiment before committing** — structured as Stage 0 → Stage 1 of the staged thesis, with pre-registered gates, a 90-day clock, and named pivots.

Concretely: (1) build the arrangement engine to the §20 quality bar on owned tracks and pass a blind listening test; (2) instrument the existing prototype for the §33 event model and run the five demand experiments (repeat creation, recognizability lift, three-vs-one arrangements, share intent, listener→creator conversion); (3) take the §15 pilot term sheet to 10–15 one-stop artists in the §13 beachhead and 2–3 boutique labels — the answers, timelines, and control-asks are themselves primary evidence; (4) ship nothing that requires rights not yet signed (§17 containment tiers); (5) judge against §40 kill criteria at day 90.

| Decision | Conditions (pre-registered) |
|---|---|
| **GO — commit to the narrower staged thesis** (artist-direct superfan remix platform, in-app only, Stage 1→2) | Listening test passes gates (§20) **and** W4 repeat-creation ≥15% of activated creators **and** ≥25% share-intent on best arrangement **and** ≥5 artist-direct signings from ≤15 asks with median cycle ≤30 days |
| **CONDITIONAL GO — extend 60 days** | Quality passes but demand is borderline (repeat 8–15%) → run the recognizability and artist-activation experiments (E2/E7) before final call; or quality fails narrowly → one engine iteration, retest |
| **PIVOT** — to §36-C (white-label artist/label remix campaigns) or §36-D (rights-passport + derivative-accounting B2B) | Demand gates fail but artists/labels engage eagerly (supply-side pull without consumer pull), or consumer metrics look like Hook's footprint after honest distribution effort |
| **STOP** | Quality unfixable within two iterations; **or** artist conversion <20% of asks with control-demands that break the product (per-pairing approval); **or** repeat creation <5% with no artist-driven acquisition signal |

**What Mashups should be in one sentence:** *the place where an artist's real fans are allowed to play with the artist's real music — two tracks in, three good mashups out, published and forked inside a rights-safe walled garden that credits everyone and can pay everyone.*

The recommendation deliberately rejects two alternatives: "Go now with the current thesis" (refuted by finding 2 — no evidence yet that ordinary consumers repeat this behavior, and the thesis's "publish or share" language overpromises export that no license grants), and "pivot to B2B infrastructure now" (premature — the B2B asset's credibility depends on operating proof the consumer pilot generates, and the consumer question is one cheap quarter from an answer).

---

# 3. Product thesis in plain English (what it is, and is not)

A consumer app where a music fan picks two songs from a catalog that artists put there on purpose, hears three genuinely different mashup arrangements within about a minute, tweaks one if they want, publishes it inside the app, shares it anywhere as a link, and watches other fans fork it — every version crediting the source artists and the chain of creators, with the plumbing to pay rightsholders (and eventually creators) per play. It is a **social music creation app + fan-participation platform** with a remix game inside it; the primary user is the **artist superfan / scene member** (secondarily the meme-making short-form creator), not the professional producer and not, at first, the mainstream listener.

**Best initial user and job-to-be-done (decision tables):**

| Candidate motivation | Frequency | Strength | Monetizable | Verdict |
|---|---|---|---|---|
| "Hear what these two songs sound like together" | High once, unknown repeat | Strong trigger | Weak alone | The hook, not the habit |
| "Make something funny/surprising to share" | Medium | Strong in meme culture | Via reach, not payment | Secondary target |
| "Participate in my favorite artist's release" | Campaign-shaped, repeatable per drop | Strong for superfans | Yes (passes, prizes, label budgets) | **Primary — the beachhead JTBD** |
| "Look musically talented without a DAW" | Medium | Medium | Subscription | Supporting |
| "Soundtrack for my video" | High but served elsewhere | Weak here (no export at launch) | — | Explicitly deferred |
| "Compete in a remix challenge" | Weekly-cadence | Proven in-niche (Hook contests, SKIO) | Sponsorship | **The retention engine** |
| "Discover music through combinations" | Passive-heavy | Real but consumption-side | Indirect | Feed feature, not wedge |
| "Fork and improve a rising creation" | Low base, network-dependent | Untested | — | The experiment (E5) |
| "DJ/producer fast ideation" | Niche | Real | Small | Off-thesis (crowded, §36-G) |

The **minimum loop that tests the primary JTBD without major-label music**: one scene's artist-direct catalog + two-track pick + three arrangements + publish-in-app + link share + weekly themed battle + fork with credit. Everything else — video export, DSP distribution, royalties to creators, majors — is staged behind evidence and signatures.

---

# 4. What has been proven versus assumed

| Layer | Proven (with evidence) | Assumed / unproven |
|---|---|---|
| Prototype (verified in-repo) | Two-track selection; Web Audio preview mixing and stem playback engine; client-side WAV render of owned/demo material; vibe/transition preset variants; hosted stem separation via Modal/Replicate; large social scaffold (feed, battles, chains, graph, earnings routes); DMCA/terms drafts | "Compatibility scoring" is currently a metadata heuristic (BPM-distance + title/description length — `app/src/lib/audio/quality-score.ts`), not musical analysis; "three arrangements" are preset variants, not structure-aware distinct arrangements; no rights-passport schema, no lineage ledger, no server-side render/watermark path |
| Tech feasibility | Published methods for every stage (AutoMashUpper lineage; AAAI-2021 stem-compatibility; Demucs-class separation ~9dB SDR; MIREX-grade structure analysis); compute ~$0.019/track separation (Replicate published per-run) | That the engine can hit the §20 "proudly shareable" bar across genres — testable in-house, untested today |
| Licensing | Category is licensable (MashApp: all 3 majors + publishing; Hook: 1M-song in-app catalog, cross-song mashups, clip + SoundCloud export; NMPA templates; Merlin×3) | That *Mashups* can sign artist-direct one-stops on the §15 terms in ≤30-day cycles — the Stage-1 experiment; major-label terms for a startup (not public, historically brutal) |
| Demand | Mass consumption of transformed music; superfan/contest engagement in-niche; Suno-scale willingness to pay for prompt-based creation ($10/mo, 2M subs) | Repeat mashup-creation habit for ordinary fans (no evidence anywhere; Hook/MashApp footprints argue caution); willingness to pay $9.99 for mashup-only value (MashApp's most-resented feature is its export paywall) |
| Economics | Cost side is verifiable and small (~$0.04/mashup compute; ~$0 egress on R2; $8–13/mo price band; 1.7% median conversion; ~13% monthly churn benchmarks) | Content-pool percentage at each catalog tier (50–75% modeled); organic acquisition via artist reposts (the load-bearing growth assumption); any creator-payout economics |
| Legal | No exception supports the commercial platform anywhere examined (US fair use post-Warhol; EU Pelham II pastiche + Art. 17; UK s.30A; CA s.29.21 non-commercial; AU s.41A + authorisation liability; JP/BR/MX moral rights + no UGC out) — licensing is the only path; DMCA safe-harbor posture drafted in-repo | Fork-of-fork (derivative-of-derivative) license language — no precedent exists anywhere; §15/§18 design is novel contract work ⚖ |

---

# 5. Mandatory fact-check results

Verdicts on all 25 claims (full sourcing in §42; strategic notes below the table). **One systemic correction:** the premise that "MashApp Music" is a separate MWM app is wrong — App Store ID 6475177484 "MashApp Music" is published by MashApp Music, Inc. (Ian Henderson's company); mwm.ai is a third-party app directory that also lists Hook and Jammable.

| # | Claim | Verdict | Date checked | Strategic importance |
|---|---|---|---|---|
| 1 | MashApp launched with UMG/Sony/WMG/Kobalt agreements | **Verified** (plus UMPG, Warner Chappell) | 2026-08-08 | Majors will license consumer mashups |
| 2 | MashApp took ~4 years to license | **Verified as company-sourced** (Music Ally relay; no independent confirmation) | 2026-08-08 | Licensing lead-time is the barrier |
| 3 | MashApp combines multiple popular songs | **Verified** (free: 2 tracks; MashApp+: up to 4, 3-min, $9.99/mo) | 2026-08-08 | Freemium price anchor |
| 4 | MashApp shares only links, no standalone audio | **Partly verified** — true at launch (web links; terms bar off-platform upload); a SoundCloud Help Center page for MashApp suggests a later share pathway whose format is unverified (page egress-blocked) | 2026-08-08 | Walled-garden precedent, possibly evolving |
| 5 | Hook offers ~1M songs / ~18K artists | **Verified as Hook's current App Store claim**; the Feb 2026 press "20M+ songs / 1,200+ artists" measures the contractual pipeline / featured partners — both real, different definitions | 2026-08-08 | Catalog claims need definition discipline |
| 6 | Hook permits direct social sharing; what leaves | **Verified, expanded**: watermarked short video clips to TikTok/IG/Snap (watermark-free is a premium perk); ≤60s remix audio to SoundCloud since Jul 22 2025; no general MP3 download | 2026-08-08 | Controlled export is grantable |
| 7 | Hook has cross-song mashup permission | **Verified** — its own listing: "Mashups: Blend two tracks into one" | 2026-08-08 | Two-song rights exist in market |
| 8 | Hook's metrics | **Verified as claims**: 45× active-user growth (no base), 250M+ campaign views, $16M funding ($10M Khosla Series A Feb 2026). NOT public: MAU/DAU, retention, revenue | 2026-08-08 | PR gloss ≠ traction data |
| 9 | Downtown licensed Hook; scope public | **Verified** (Downtown's own announcement; monetizing sped-up/slowed fan versions; full scope not disclosed) | 2026-08-08 | Indie-catalog UGC-remix template |
| 10 | Spotify+UMG fan covers/remixes, May 2026 | **Verified** (Spotify Newsroom, 2026-05-21; recorded + publishing) | 2026-08-08 | Incumbent entry |
| 11 | Spotify equivalent with Merlin/Sony/Warner/Believe? | **Verified: Merlin only** (2026-08-04). No Sony/Warner/Believe deal found | 2026-08-08 | Sony/WMG holdout = Spotify catalog gap |
| 12 | Spotify–Merlin deal dated Aug 4, 2026 exists | **Verified** (Spotify Newsroom + TechCrunch same day) | 2026-08-08 | ~15% market added to rival tool |
| 13 | Spotify product scope | **Partly verified — no mashup language**: "covers and remixes… new vocal take on a cover or a full remix with altered beats, structures, or styles" (single-source, generative). Two-song mashups outside announced scope | 2026-08-08 | **Cross-song combination remains unclaimed** |
| 14 | Spotify announced opt-in/comp/attribution/export/timing | **Verified facts**: opt-in, "consent, credit, compensation," paid Premium add-on. **Not announced**: launch date, price, export rules, attribution mechanics | 2026-08-08 | Tool unlaunched as of research date |
| 15 | Tracklib's sampling/remix distinction | **Verified**: "A sample license from Tracklib is for sampling, not remixing"; remixes of catalog tracks excluded; remixes of your own Tracklib-sample-bearing song permitted with registration | 2026-08-08 | The industry's sampling≠derivative fault line |
| 16 | AudioShake = tech provider, not licensor | **Verified** (its label deals are processing partnerships; rights remain with rightsholders) | 2026-08-08 | Stem tech ≠ permission (Principle 7) |
| 17 | bushido/Chordal/Musiqmesh/Synchtank = standardized derivative licensing? | **Partly verified — only bushido fits**: a boutique white-label "Licensing Exchange" for pre-cleared sampling/remix/edit rights (AudioShake stems partnership). Chordal = sync marketplace; Synchtank = rights/royalty SaaS; Musiqmesh = negligible footprint | 2026-08-08 | No consumer-scale derivative rail exists; bushido = closest concept and possible partner |
| 18 | BandLab forks create legal lineage? | **Verified with nuance**: "Forkable" is an express ToS license to other users (copy/modify/republish, even commercialize) + automatic "Inspired By" attribution — real license chains, but user-owned content only | 2026-08-08 | Fork-grant ToS precedent to emulate |
| 19 | Pelham II effect | **Verified** (Grand Chamber judgment PDF, 14 Apr 2026): pastiche = autonomous concept; evocation + perceptible differences + objective artistic dialogue; no humour requirement; three-step test preserved; remitted to BGH | 2026-08-08 | No blanket EU mashup license |
| 20 | "EU is the most permissive launch jurisdiction" | **Misleading**: Art. 17 direct platform liability + Pelham II limits + UrhDaG remuneration duties cut the other way; Art. 17(7)/§5 UrhDaG protect *users*, and Germany adds platform-paid remuneration. "Structured," not permissive | 2026-08-08 | Don't pick jurisdictions on this framing |
| 21 | UK treatment | **Verified**: s.30A fair dealing (2014); *Shazam v Only Fools* (2022) = leading authority, defence failed on wholesale reproduction; no UK music-mashup pastiche case; Pelham II persuasive only; UKIPO's live consultation is AI/TDM, not parody | 2026-08-08 | UK untested; assume license-required |
| 22 | Dubset/MixBANK history | **Verified with date correction**: Apple 2016; **Spotify agreement announced May 2016** (not 2018); Sony first major 2017; Merlin 2017; $4M Series A; Spotify integration never scaled; Pex acquired Mar 2020 (~$25M); MixBANK absorbed/wound down | 2026-08-08 | Deals announced ≠ scaled; splits tech survived, consumer product didn't |
| 23 | Pex today; ID = permission? | **Verified**: Vobile completed Pex acquisition Apr 2025; sells identification (incl. sped-up/pitch-robust matching, AI-music detection) + licensing *support*. Identification ≠ permission — confirmed by Pex's own positioning | 2026-08-08 | Compliance plumbing vendor, not a rights source |
| 24 | Story Protocol music adoption | **Verified (negative)**: pivoted to AI-training-data focus ("DATA Foundation," Jun 2026); no consumer-scale music remix accounting anywhere | 2026-08-08 | Don't build on on-chain rails (Principle 10) |
| 25 | Udio/Suno/licensed fan-remix product status | **Partly verified, component-wise**: UMG–Udio settled Oct 2025, platform target 2026, **not launched**; WMG–Udio (Nov 2025) and WMG–Suno (Nov 2025) signed, products unlaunched; Sony unsettled with both, litigation active; Udio iOS app live since Jan 2026 with downloads disabled. **Live licensed remix products today: Hook, MashApp, ElevenMusic (Apr 29, 2026, ~4,000 indie artists)** | 2026-08-08 | Competition is announced-heavy, launch-light — a window |

**Corrections applied to the companion round-1 report:** Dubset–Spotify first deal 2016 (was stated as 2018); Hook catalog figures given definitional nuance (1M in-app vs 20M pipeline; 18K catalog artists vs 1,200+ featured); Metapop shutdown 2023 (was 2022 in initial working notes); TIDAL DJ integrations were curtailed (stems disabled Dec 2023, paywalled May 2024), not fully shut down.

---

# 6. Consumer demand analysis

**Verdict: consumption of transformed music is mass-market and proven; creation is a thin layer whose repeat-habit potential is unproven — real today only for superfans, meme-makers, and aspiring DJs.** (Full evidence and sources: consumer-demand research stream, §42.)

**What is proven (high confidence):**
- Transformed-music *listening* is enormous and label-endorsed: ~16B TikTok #spedup views (Billboard-reported before TikTok hid hashtag counts); Raye's "Escapism." reached the Hot 100 off a fan sped-up edit, and the official sped-up version has 114M+ Spotify streams; labels now routinely release official sped-up versions; DJ Earworm's "United State of Pop 2009" holds 43M+ YouTube views; There I Ruined It has 1M+ YouTube subs / 3M+ TikTok followers. Pattern: *one skilled producer, millions of listeners*.
- Creation tools at mass scale exist only where the job is different: edjing Mix (casual DJ toy) 100M+ downloads / 1.5M ratings; BandLab 100M+ registered (actives undisclosed); Moises 70M+ registered (practice/karaoke JTBD); Suno 2M *paid* subscribers at ~$10/mo on 100M+ cumulative users (~2% conversion) — proof people pay for music creation when input friction is near zero.
- Superfan economics are the industry's stated direction (Deloitte's 2026 Digital Media Trends pivots to superfan monetization) while subscription fatigue is real (61% would cancel a favorite service over a $5 increase; 47% say they already pay too much — Deloitte 2025).

**What is not proven (and the counter-evidence):**
- No mashup-creation product shows mass adoption: Hook ≈ hundreds of US App Store ratings in ~2 years despite licenses, funding, and label campaigns; MashApp ≈ 3.7★, ~50K downloads (aggregator, low-med confidence), no news since launch. Neither publishes MAU, retention, or revenue — **nobody in this category does**, which is itself a finding.
- The longitudinal case is discouraging: Rave.dj (2018–2026) cycled viral spikes → Patreon-funded niche; the observable pattern is one-and-done novelty.
- The natural experiment cuts against mainstream creation: when transformation got as easy as it can get (sped-up edits ≈ one slider), the market's equilibrium became *labels producing official versions for passive consumption* — the demand was for the sound, not the act of making it.
- Review themes (anecdotal but consistent): the #1 complaint on both licensed apps is **catalog** ("barely any actual REAL songs"; users arrive with one specific mashup in mind and churn when a song is missing); MashApp's most-resented feature is its **export paywall** at $9.99/mo; Hook's best-loved feature is **contests**.

**Interview & usability research design (Stage 0):** five cohorts × 8–10 subjects — mainstream fans, short-form creators, artist superfans (recruited from 2–3 pilot artists' Discords), amateur producers/DJs, existing mashup-tool users (Rave.dj/Fadr/Hook). Moderated 30-min sessions: (1) unprompted — "show me the last thing you made and shared, of any kind"; (2) task — make a mashup from a seeded pair, think-aloud, measure time-to-first-listen and completion; (3) card-sort motivations (the §3 table) and price-sensitivity ladder ($0/$4.99/$9.99 framings); (4) share test — "would you post this? where? what stops you?" Success signals to look for: unprompted repeat-use intent, specific pair requests (capture them — that's licensing telemetry), share to a real feed during the session.

**The five demand experiments (≤90 days, no major catalog needed)** — full designs in §33: E1 repeat-creation cohort (the habit test); E2 recognizability lift (owned vs. recognizable catalog, activation + completion deltas); E3 listener→creator conversion from a consumption feed; E4 three-vs-one arrangement value; E5 share-intent and actual link-share rate (plus fork/tree-card variant). Pre-registered gates per §2.

---

# 7. Competitive landscape

Full per-competitor notes in the companion report and fact-check; the decision-relevant matrix (data as of 2026-08-08; blanks = not public):

| Product | Status | Licensing position | Two-song mashups? | Creation format | Export | Social/forks | Monetization | Public traction evidence |
|---|---|---|---|---|---|---|---|---|
| **Hook** | Live iOS (Sep 2024), $16M raised | 1M in-app songs/18K artists (Downtown, Too Lost, Primary Wave, Avex; UMG campaigns) — opt-in | **Yes** (its listing: "Blend two tracks into one") | ≤60s clips + AI effects | Watermarked clips → TikTok/IG/Snap; 60s audio → SoundCloud | Contests, feed; no fork lineage | Free (premium perks incl. watermark-free) | ~109 US ratings; 45× growth claim (no base); 250M campaign views claim |
| **MashApp** | Live iOS US (Feb 2025) | UMG+Sony+WMG+Kobalt+UMPG (masters + publishing) — "select tracks" | Yes (2 free / 4 paid) | Full-track real-time blend | Web links only (SoundCloud path unverified) | Community feed; no forks | MashApp+ $9.99/mo | ~3.7★; ~50K downloads (aggregator); silent since launch |
| **Spotify covers/remixes** (announced) | Unlaunched | UMG (recorded+publishing) + Merlin; opt-in per artist | **No** — announced scope is single-source covers/remixes | Generative transformation | Unannounced | None announced | Paid Premium add-on | N/A |
| **Udio (UMG/WMG JV)** | Announced, unlaunched; legacy app degraded (downloads off) | UMG+WMG settlements; Merlin, Kobalt, NMPA templates | Vocal-swap remixes of opt-in artists (announced) | Generative | Walled garden (no export) | Unannounced | Subscription | N/A |
| **ElevenMusic** | **Live** (Apr 29, 2026) | Merlin + Kobalt opt-in; ~4,000 indie artists | Remix of catalog tracks (single-source) | Generative + remix | On-platform | Basic | Subscription | Early; no metrics |
| **BandLab** | Live, huge | User-owned content only | N/A (user content) | Full DAW | Yes (own content) | **Forks + "Inspired By" lineage** | Membership $14.95/mo | 100M+ registered |
| **Suno** | Live; Sony/UMG litigation | WMG settled; new licensed models pending | No (prompt-generative) | Text→song | Paid, capped downloads (WMG deal) | Basic | $10/$30 tiers; 2M paid subs, $300M ARR (claimed) | Strongest WTP proof in category |
| **Fadr / Rave.dj** | Live | None (user uploads / YouTube-sourced) | Yes (auto) | Auto mashup/stems | MP3 (Fadr) | No | Fadr Plus $10/mo; Rave.dj Patreon | Niche; novelty-decay pattern |
| **Tracklib** | Live | Pre-cleared **sampling** (not remixing) | No | Sample licensing | Yes (as samples in new works) | No | Sub + clearance fees + 2–20% rev share | ~100K tracks; profitable-model precedent |
| **Moises / DJ tools (djay, Serato, rekordbox, DJ.Studio, edjing)** | Live | User files / performance-scoped streaming | Manual | Practice/DJ | Varies; streaming tracks locked | No | $4–36/mo | Big (edjing 100M+ installs) — different JTBD |
| **Mixcloud / SoundCloud / Audius** | Live | Radio-style mixes / UGC + Hook lane / indie crypto | DJ mixes only | Upload | — | Reposts; Audius remix contests | Select/Next Pro | Niche-stable |
| **bushido / ClearBeats / Pex-Vobile / AudioShake** | Live (B2B) | Derivative-licensing exchange (boutique) / clearance services / ID / stems tech | — | — | — | — | B2B | The infrastructure adjacency — partners more than competitors |

---

# 8. Closest competitor and differentiation

- **Closest direct competitor today: Hook** — licensed, social, contest-driven, ships real two-song mashups with controlled export. It is also small (the ratings footprint) and short-form-only, with no arrangement intelligence, no full-song mashups, no fork lineage, no creator economics.
- **Strongest licensing position: MashApp** (all three majors + publishing) — and its silence since launch is the category's most important cautionary datum: *the license is not the product*.
- **Strongest consumer loop: BandLab** (creation→social→fork at 100M-registered scale, user content only) and **Suno** (lowest-friction creation, proven payment) — neither does licensed catalog mashups.
- **Greatest existential threat: Spotify** — distribution, opt-in catalog from UMG+Merlin, paid add-on economics. Mitigants (evidence-based, not hopeful): announced scope is single-source covers/remixes (no mashup language); Sony and Warner are absent; nothing has shipped; Spotify has repeatedly failed at social features; a neutral cross-catalog pairing graph is structurally awkward inside any one incumbent's app.
- **What remains meaningfully unclaimed:** (1) **two-song combination of licensed catalog with musical intelligence** (Hook does clips; MashApp does manual blending; Spotify/Udio/Eleven do single-source); (2) **fork lineage + derivative accounting on licensed content** (BandLab proves the UX on user content; nobody does it on catalog); (3) **creator-to-creator economics** (everyone pays rightsholders; nobody pays or even formally credits the chain of fan creators).
- **What Mashups can do substantially better (not incrementally):** make the *first minute magical* — automated, structure-aware, genuinely listenable arrangements from two picked tracks (nobody ships this); make the *tenth day social* — battles, forks, scene identity (only Hook gestures at this); and make the *rights ledger a product* — per-node provenance and split accounting that becomes the B2B pivot asset if the consumer bet fails. Differentiation that should NOT be claimed: catalog size (unwinnable), export freedom (unlicensable), "AI" as such (commodity).

---

# 9. Copyright and rights map (Workstream 4)

> Legal analysis in this section is research synthesis, **not legal advice**; every conclusion marked ⚖ requires qualified music counsel before being relied on in a contract or product decision.

## 9.1 The rights inventory for one two-track mashup

Every mashup of Track A and Track B touches, at minimum: two **sound-recording copyrights** (masters — usually label- or artist-owned) and two **musical-composition copyrights** (usually publisher-administered, often split among several co-writers). Against those four bundles, the platform's product behaviors implicate: **reproduction** (copying audio into the system, making stems, rendering output), **adaptation/derivative-work preparation** (the mashup itself; also any tempo/pitch/structure change beyond faithful reproduction), **distribution** (downloads/exports), **public performance / communication to the public / making available** (streaming playback in-app and via links), **synchronization** (timing music to user video), and **mechanical reproduction** (audio-only copies). Alongside: **performers' and producers' contractual approval rights** (featured-artist consent and producer agreements can give individuals veto or payment rights even where the label owns the master — ⚖ diligence per track), **neighboring rights** in non-US territories, **moral rights** (attribution + integrity; inalienable in France, Germany, Japan, Brazil, and present in the UK/Canada/Australia — they survive any economic license), **name/image/likeness and trademark** (artist names used in attribution and marketing are nominative but promotional uses need care ⚖), **union obligations** (AFM/SAG-AFTRA new-use rules can attach to major-label masters — the AFM is currently litigating over AI settlements; ⚖ for any major catalog), and **AI-specific consents** (stem separation of a delivered master is a reproduction + arguably a technical adaptation; every 2025–26 licensed product treats AI processing as needing express grant — AudioShake's label deals and the Udio/KLAY structures all say permission, not technology, is the gate).

Two structural rules dominate everything: (1) **no compulsory or collective license reaches any of this** — §115 covers only faithful covers, The MLC/PROs cannot license derivatives, so every grant is voluntary and per-catalog; (2) **the 100%-consent rule** — a derivative use needs every co-owner of every composition to say yes; one silent co-publisher blocks the pair. This is why opt-in catalog design (where consent is gathered once, at ingestion) is the only architecture that scales.

## 9.2 The sixteen scenarios

| # | Scenario | Rights implicated (beyond baseline playback) | Likely licensors | Collective license help? | Direct permission still required? | Practical risk unlicensed | MVP? |
|---|---|---|---|---|---|---|---|
| 1 | Playing two full tracks sequentially | Performance/making-available only | Labels (via DSP-style license), PROs, mechanical collectives | Yes — this is ordinary streaming licensing | Yes (masters) | Moderate (it's a mini-DSP) | No — don't build a streaming service |
| 2 | Beat-matched DJ-style mix of two tracks | + reproduction of the mix file; arguably adaptation (transitions); "non-interactive mix" precedents exist (Mixcloud, Dubset) | Labels + publishers; PRO blankets help only for performance | Partially (performance side) | Yes | Moderate; established gray culture but platforms carry liability (EU Art. 17) | No |
| 3 | Vocal of A over instrumental of B | Reproduction + **derivative work** on both; stem creation = reproduction; moral-rights exposure (integrity) | Both labels + all publishers of both songs | **No** | **Yes — always** | High; this is the textbook unauthorized derivative | **Yes — the core product; licensed catalog only** |
| 4 | Short samples of both in a substantially new work | Same as 3; de minimis unreliable (Bridgeport vs VMG split); fair use weak post-Warhol | Same | No | Yes | High (US circuit-dependent, EU recognizability test) | No (Tracklib-style later) |
| 5 | Speed/pitch edit of one track | Reproduction + adaptation (sped-up versions are now a licensed product category — Hook/Downtown deal) | Label + publishers of that song | No | Yes | Moderate-high; heavily enforced on DSPs | Phase 2 (single-track edits are an easier grant) |
| 6 | New arrangement of one track from separated stems | Reproduction + derivative + AI-processing consent | Label + publishers | No | Yes | High | Phase 2 |
| 7 | Mashup + user video | All of #3 **+ synchronization** on all four bundles; publicity/privacy rights in the video itself | Labels + publishers (sync is individually priced) | No | Yes | High; sync is the most jealously priced right | Not in MVP; watermarked clip export is the later, negotiated version |
| 8 | Publish mashup inside Mashups only | #3 + on-platform communication/making-available | Same as 3 — one license can bundle it | No | Yes | Contained; this is the walled-garden shape every 2025–26 deal uses | **Yes — the MVP publishing mode** |
| 9 | Shareable playable link (audio lives on Mashups) | Same as 8 (playback still on-platform); link itself is not a copy | Same | No | Yes (same grant) | Low incremental if #8 licensed; the proven "share without export" mechanic (MashApp's model) | **Yes** |
| 10 | Embeddable player on third-party sites | Same as 9 + communication-to-public in embedded context; EU embed case law mostly favorable if source is licensed | Same; some licensors restrict embed surfaces ⚖ | No | Yes (embed as named surface) | Low-moderate | Phase 2 (nice-to-have) |
| 11 | Watermarked short video clip export | #7's sync + off-platform distribution to named platforms; platform ToS put rights warranty on uploader | Labels + publishers, with **named-platform grant** (the Hook→TikTok/SoundCloud precedent) | No | Yes — express export grant | High without it: multi-claim Content ID/Rights Manager collision | **No at MVP; the single most valuable Phase 2/3 grant** |
| 12 | Standalone WAV/MP3 export | Reproduction + distribution (a download store, effectively) + everything in 3 | Same | No | Yes | Very high; the red line in every observed deal (Udio walled garden; Suno's paid caps; djay no-record) | **No — off the roadmap for licensed catalog; owned catalog only** |
| 13 | Upload to TikTok/IG/YouTube/SoundCloud/Spotify/Apple | #12 + each platform's uploader-warranty ToS; platform blanket licenses do NOT cover imported mashup files (verified per-platform) | Labels + publishers granting off-platform distribution; DSP delivery additionally needs a distributor + full clearance | No | Yes | Very high; multi-claim collision, account strikes for users | No (SoundCloud-via-partnership is the one precedented lane) |
| 14 | Mashup in a paid advertisement | Sync-for-advertising on all four bundles + likely artist NIL/endorsement consent ⚖ | Labels + publishers + often artist approval rights | No | Yes — individually negotiated, priciest category | Extreme | No — permanently out of consumer scope |
| 15 | Another user forks the mashup | New derivative of a derivative: all of #3 again for the new user + license to the parent creator's contribution | Source rightsholders (via a fork-scoped grant in the catalog license) + parent creator (via ToS grant) | No | Yes — **no existing license grants this; bespoke clause** ⚖ | N/A (novel) | **Yes in-garden, as the differentiator — with the clause** |
| 16 | Paying the user who selected/edited the arrangement | Not a copyright act itself; creates contract/employment/tax questions; if payment is framed as royalty on others' works, rightsholder consent advisable ⚖ | Platform ToS + catalog license acknowledgment | N/A | Contractual | Low legal, moderate commercial (see §19) | Status + prizes yes; cash royalties later |

Territorial note for all scenarios: every grant must state territories; moral-rights jurisdictions (FR/DE/JP/BR) keep an author-level objection alive regardless of the economic license, so the license needs an objection-triggered takedown covenant rather than a purported waiver (unenforceable there). ⚖

## 9.3 Why the scenarios differ — the two-sentence version

Sequential play is consumption (streaming licensing exists for it); a DJ blend is presentation of whole works (licensable as radio-like); a vocal-over-instrumental mashup is the **preparation of a new derivative work**, which sits outside every collective scheme and requires unanimous, voluntary consent — and that consent has never been granted platform-wide, only opt-in. Sync (video), advertising, export, and DSP distribution are each separately priced expansions on top of the derivative grant, which is why the product must be built as concentric rings of capability that unlock per signed right, not as one "licensed" switch.

---

---

# 10. Platform-license boundaries

Governing finding (verified per-platform from first-party terms, snippet-corroborated where pages were unfetchable): **no destination platform's music license covers a mashup file made elsewhere and uploaded by a user.** Every platform's blanket deals cover sounds picked *inside its own library*, for scoped account types and uses; every upload path puts the rights warranty on the uploader.

| Platform | What its licenses cover | Hard boundaries relevant to Mashups |
|---|---|---|
| TikTok | General Music Library (personal accounts, personal use); Commercial Music Library (~1M pre-cleared tracks) for Business accounts/branded content | CML content locked to TikTok ("may only post or share… within TikTok"); non-CML branded use requires certified own rights; uploaded "Original Sounds" are uploader-warranted and takedown-exposed; Creator Rewards penalizes licensed-music content |
| Instagram/Facebook | Licensed library for personal use in videos with a visual component; Sound Collection (royalty-free) for business — Meta products only | "No music listening experience" rule; auto-muting/blocking; business accounts restricted from popular library; Sound Collection can't leave Meta |
| YouTube/Shorts | Content ID monetize-or-block regime; Shorts library (≤60s in Shorts only); Creator Music (US YPP: buy license or rev-share) | Creator Music **explicitly forbids remixing** the licensed song; Shorts audio can't leave Shorts; a mashup upload draws multiple claims — most-restrictive policy wins, uploader typically earns 0% |
| Snapchat | Sounds library for personal, non-commercial Snaps | License bans "alter[ing] the fundamental character of the melody" — no adaptations even in-app; on-platform only |
| Twitch | DJ Program (2024): live DJ sets of catalog, rev-share (~30% of channel revenue to rights, split 50/50 Twitch/DJ after subsidy) | **Live only** — VODs/Clips/Highlights/exports excluded by design; baseline music rules still prohibit unlicensed pre-recorded music; Soundtrack tool discontinued 2023 |
| SoundCloud | UGC hosting with fingerprinting; remixes/mixes/mashups require documented permission; monetization requires 100% ownership (mashups categorically excluded); the Hook integration (Jul 2025) is the sanctioned licensed-remix lane | Culturally receptive, legally identical: permission or takedown; a Mashups→SoundCloud lane would need a Hook-style bilateral + rightsholder grants |
| Spotify/Apple Music | No UGC path; developer terms prohibit remix/segue/sync apps on their APIs (Spotify Developer Policy bans "segue, mix, re-mix, or overlap"; MusicKit is playback-only) | Mashup distribution to DSPs = full re-clearance + distributor; cannot build creation features on their APIs |

Design consequences (carried into §17): licensed remixing stays in-app; any export must carry its own rights *and* platform allow-listing (register catalog references with Content ID/Rights Manager so licensed exports resolve as licensed, not muted); personal vs commercial share paths must be separated in-product; off-platform monetization promises must never be made to creators.

---

# 11. Jurisdiction comparison

| Jurisdiction | Individual creator exception? | Can a commercial platform rest on it? | Key authorities | Notes for Mashups |
|---|---|---|---|---|
| US (launch) | Fair use — weak for non-parody commercial mashups post-*Warhol* (2023); no de minimis safety (circuit split) | **No** | §106(2), §115(a)(2); *Bridgeport*; *VMG Salsoul*; *Warhol* | Clearest safe harbor (DMCA §512) + biggest market + minimal moral rights for music (VARA excludes sound recordings) → right launch jurisdiction for a *licensed* product |
| EU | Pastiche (Art. 5(3)(k)) after **Pelham II (Grand Chamber, 14 Apr 2026)**: evocation + perceptible differences + objective artistic dialogue; three-step test preserved | **No** — and DSM Art. 17 makes the platform directly liable absent licenses/best-efforts; Germany adds UrhDaG remuneration duties even for pastiche | Pelham I/II; DSM Art. 17; UrhDaG | "EU most permissive" is **misleading**; user exceptions ≠ platform license; launch EU only with licenses + Art. 17 posture |
| Germany (specific) | §51a UrhG pastiche + UrhDaG presumed-permitted uses (≤15s, non-commercial thresholds) | No (platform pays collecting societies regardless) | UrhDaG §§5, 9–12 | The remunerated-UGC mechanic is unique — a future licensed-market feature, not a loophole |
| UK | s.30A fair dealing (parody/caricature/pastiche) — untested for music mashups; *Shazam* (2022) rejected wholesale-reproduction pastiche | **No** | CDPA s.30A; *Shazam v Only Fools* | Pelham II persuasive post-Brexit; UKIPO's live consultation is AI/TDM, not remix |
| Canada | s.29.21 UGC exception — **individuals, solely non-commercial**, attribution, no substantial adverse effect; + fair dealing | **No** (platform isn't the beneficiary; monetizing creators fail "non-commercial") | Copyright Act s.29.21 | The friendliest *individual* regime; irrelevant to platform economics |
| Australia | Fair dealing incl. parody/satire (s.41A) — purpose-limited; aesthetic mashups fail; **no UGC exception** (ALRC reform never enacted) | **No** — plus authorisation liability (*Cooper v Universal*, ss 36(1A)/101(1A)) | ss 41, 41A; Part IX moral rights | 2025: government ruled out even a TDM exception; licensing-first culture |
| Japan | None usable (Arts. 27/28 adaptation rights; Art. 20 integrity); JASRAC/NexTone blankets cover compositions for covers, never masters or arrangement | **No** | Copyright Act Arts. 20, 27, 28 | Moral rights effectively non-waivable; author-level consent mechanics required |
| Brazil | Art. 47 parody only (non-reproduction, non-discrediting); mashups are substantially reproductions → outside it; inalienable moral rights (Arts. 24, 27) | **No** (ECAD covers performance only) | Lei 9.610/98 | Author-objection protocol required for any BR expansion |
| Mexico | Narrow Art. 148 limitations; Art. 21 perpetual moral rights | **No** | LFDA | Same posture as Brazil |

**Comparative bottom line:** launch US-first as a licensed walled garden; treat every exception regime as user-protective color, never as business model (Principle 2 confirmed); gate FR/DE/JP/BR expansion on author-consent + objection-takedown mechanics in the license (§15). A globally available web app should geo-scope licensed catalog by the territory grants in each passport from day one.

---

# 12. Catalog acquisition pathways

The 22 paths, assessed (full per-path evidence in the supply research; scores High/Med/Low on the axes that decide: rights concentration, ability to grant the §9 scenario set, speed, cost, scalability):

| # | Path | Rights concentration | Can grant mashup+fork? | Speed | Cost | Verdict |
|---|---|---|---|---|---|---|
| 1 | Mashups-owned originals | Total | Yes, everything | Now | Sunk/small | **Stage 0 backbone** |
| 2 | Commissioned work-for-hire tracks (incl. commissioned acapellas) | Total | Yes | Weeks | $1–5K/track (modeled) | **Stage 0–1: buy the vocal supply the catalog lacks** (Epidemic's model at micro scale) |
| 3 | Self-releasing one-stop artists | High (verify per §14) | Yes, by §15 license | 2–6 wks/artist | $0 advance + rev share | **Stage 1 core** |
| 4 | Artist-owned labels (Ophelia, Cyclops, WAKAAN, Night Bass, Deadbeats, bitbird…) | High | Yes | 4–8 wks | Low; maybe small MG later | **Stage 1–3 core; the beachhead cluster** |
| 5 | Boutique electronic labels (Anjuna, Armada, Defected, Toolroom, Hospital, Drumcode…) | Medium-high (publishing varies) | Mostly | 1–3 mo | Small MG plausible | Stage 3 |
| 6 | Labels w/ masters only (publishing elsewhere) | Split | Only with publisher joinder | Slow | Higher | Avoid until template exists; the classic trap (Principle 5) |
| 7 | Artist-services cos (EMPIRE, Create Music Group…) | Aggregated | CMG now = mau5trap + Monstercat single desk | 2–4 mo | MG likely | **Stage 3 unlocks — two signatures, two famous catalogs** |
| 8 | Distributors with explicit opt-in rights programs (Too Lost, Symphonic precedents) | Opt-in per artist | Yes — the Hook/ElevenMusic playbook | 2–4 mo to program launch | Rev share; integration work | **Stage 3 scale mechanism** |
| 9 | Independent publishers (Kobalt precedent ×3) | Composition side | Needed for paths 6–7 | 2–4 mo | Rev share | Stage 3, alongside 7–8 |
| 10 | Catalog administrators (Songtrust-class) | Admin ≠ derivative authority usually | Rarely | — | — | Diligence flag, not a source |
| 11 | Producer/songwriter collectives | Medium | Sometimes | Fast | Low | Opportunistic |
| 12 | Pre-cleared remix/stem catalogs (bushido exchange; SKIO relationships) | Purpose-built | Yes (scoped) | Fast | Per-track fees | **Stage 1–2 accelerant; partner, don't rebuild** |
| 13 | Production libraries permitting consumer derivatives | None do today (Epidemic/Artlist/Uppbeat all exclude remix) | No | — | — | **Attractive-but-wrong** (verified) — the model to copy, not rent |
| 14 | Public-domain compositions + newly-controlled masters | Total on new masters | Yes | Weeks | Recording cost | Niche content lever (holiday/classical moments) |
| 15 | Cover/replay strategies (re-record hits) | Masters yes; composition via §115 only for faithful covers — **mashup arrangements exceed §115** | **No** (the compulsory doesn't stretch; Principle: don't confuse covers with mashups) ⚖ | — | — | **Attractive-but-wrong** for mashups; usable only for marketing covers |
| 16 | Regional one-stop catalogs (e.g., LatAm indies, Afrobeats labels) | Varies | Sometimes | Slow (diligence) | Low-med | Later; territory complexity |
| 17 | Artist fan-club/direct releases | High | Yes | Fast | Low | Stage 1 flavor of path 3 |
| 18 | Promotional windows on new releases | High (scoped) | Yes, time-boxed | Fast per campaign | Often $0 (it's marketing) | **The wedge deal shape — lowest-commitment yes** |
| 19 | Label-sponsored remix challenges | High (scoped) | Contest-scoped | Fast | Sponsor pays | Revenue + supply + proof; fold into every stage |
| 20 | White-label licensing partners (bushido, ClearBeats) | Purpose-built | Scoped | Med | Fees | Stage 2–3 plumbing |
| 21 | Merlin-scale collective route | Aggregated indie | Precedented (×3 creation apps) | 6–12 mo, needs traction | MG + rev share | **Stage 3–4 target; requires evidence pack** |
| 22 | Majors + major publishers | Full | Precedented (MashApp) but 4-yr/insider path; expect advances/MG/equity asks | Years | Highest | **Stage 4 option, never a prerequisite** (Principle 11) |

**Best-first answers:** first 20 tracks → paths 1+2 (owned + commissioned vocals). First 100 → path 3+4+18 (one-stop artists and their labels + release-window promos) in one scene. First 1,000 → paths 4+5+12 (label cluster + boutiques + pre-cleared stem partners). Recognizable independent music → paths 7+8+21 (CMG/EMPIRE desks, distributor opt-in programs, then Merlin). Majors → path 22 only after Stage-3 evidence, and only if unit economics survive the §26 content-pool stress case.

---

# 13. Genre and community beachhead

Scoring summary (evidence in the supply stream; axes: one-stop density, tempo/structure compatibility, remix/fan culture, short-form relevance, vocal supply, rights cost):

- **Winner: North American bass music** (dubstep/melodic bass/"flip" culture — the Ophelia, Subsidia, Cyclops, WAKAAN, Deadbeats, HypnoVizion cluster, US/Canada): densest artist-owned-label structure in music (six headliner-owned labels), remix/flip contests are the scene's native marketing, 140 BPM half-time grids bridge directly to hip-hop vocal tempos, Discord-organized fandoms, and one-desk catalog unlocks nearby (CMG: mau5trap + Monstercat; EMPIRE: Dirtybird).
- **Fast-follow: house/tech house** (120–128 uniform grid = best auto-mashup math; John Summit/Experts Only, Chris Lake/Black Book, Night Bass, Confession, Defected/Toolroom acapella tradition).
- **Considered and deferred:** Afro house and hard techno (hottest trends, but rights concentrate in fewer, harder counterparties — Keinemusik, Drumcode — and vocal supply is thin); phonk (TikTok-native and huge, but producer ownership is opaque — route via distributor opt-ins later); pop/hip-hop majors (clearance structure: ~4.6 writers per hit vs ~1–2 in electronic); lo-fi (no vocals, Lofi Records publishing sits with Warner Chappell France — not one-stop).
- **The vocal-supply problem, solved three ways:** (a) commissioned, outright-owned acapellas (path 2) designed to key/tempo-match the instrumental catalog; (b) the vocal-rich corner of the cluster (Ophelia-style topline-driven melodic bass); (c) one-stop self-releasing rappers/singers via Too Lost/Symphonic-style opt-ins at Stage 3. A mashup platform whose catalog can't produce "vocal over drop" moments will fail the delight test regardless of licensing — treat vocal supply as a first-class catalog KPI (target: ≥40% of catalog pairs include a usable vocal stem).
- **Beachhead-alternative test (required):** an *artist-fandom* beachhead (one big artist's superfans) beats a genre beachhead **if** a large enough artist signs early — design the pilot to allow either; a fitness/gaming-community beachhead fails the licensing test (needs recognizable multi-genre catalog immediately); a meme beachhead fails the rights test (meme value depends on famous source material). Genre-scene-first with artist-fandom opportunism is the evidence-backed sequence.

---

# 14. One-stop verification system (Workstream 9)

**Operational definition of "one-stop" for Mashups:** a single counterparty who can lawfully sign, for a named track, (a) 100% of the master, (b) 100% of the composition (all writers' shares, self-published or administered with derivative authority), (c) confirmation of no third-party samples/interpolations, no featured-artist or producer approval rights, and no conflicting exclusivities — for the specific grants in the pilot license. Anything less is "multi-party" and priced accordingly in time.

**Verification pipeline (per track):**
1. **Identity**: ISRC (recording), ISWC (work), artist/writer IPI, party ISNI where available; mismatches are an automatic exception.
2. **Master chain**: distributor dashboard screenshot or statement naming the licensor as rights controller; release history scan (has this track appeared on a label the licensor doesn't control?).
3. **Composition chain**: signed split sheet listing all writers + shares; each writer either (i) is the licensor, (ii) signs a joinder, or (iii) is confirmed self-published via PRO/publisher database lookup (ASCAP/BMI Songview, MLC public search). Any registered publisher who is not a signatory = exception.
4. **Samples/interpolations**: written rep + fingerprint screen of the track against commercial catalog (Audible Magic/ACRCloud-class) to catch undisclosed samples; any match = exception requiring documentation.
5. **Participants**: rep + warranty covering featured performers' consents and producer agreements (no approval/veto rights over derivatives); session-player release confirmation for tracks with live instrumentation. ⚖
6. **Encumbrances**: reps on existing sync exclusives, remix-approval customs, Content ID registration status (who registered it, so allow-listing can be arranged), territory carve-outs, AI-processing restrictions in any upstream deal.
7. **Registrations**: copyright registration numbers where they exist (US: strengthens enforcement; absence is not disqualifying).

**Acceptable evidence hierarchy:** executed agreements > split sheets + PRO/MLC registry concordance > distributor statements > written reps & warranties (backstopped by indemnity and takedown). Registry data alone is never sufficient (registries are known-dirty; The MLC's historical unmatched pool passed $424M), and a rep alone is acceptable only for the lowest-risk fields with indemnity.

**The rights passport (track-level record).** Fields and gates:

| Field | Ingestion | In-app creation | Social sharing (Phase 2+) | Export (if ever) | Paid/commercial use |
|---|---|---|---|---|---|
| ISRC / ISWC / IPI identifiers | Required | — | — | — | — |
| Master authority evidence | Required | — | — | — | — |
| Composition authority (all splits) | Required | — | — | — | — |
| Sample/interpolation rep + fingerprint screen | Required | — | — | — | — |
| Stem-generation + AI-processing consent | Required | — | — | — | — |
| Derivative (mashup) grant + pairing scope | — | Required | — | — | — |
| Fork (downstream derivative) grant | — | Required for forkable tracks | — | — | — |
| Territory list + term + takedown terms | — | Required | — | — | — |
| Performer/producer approval clearance rep | — | Required | — | — | Re-verified |
| Named-platform distribution grant + sync scope | — | — | Required | — | — |
| Content ID / Rights Manager allow-list status | — | — | Required | — | — |
| Standalone-audio distribution grant | — | — | — | Required | — |
| Advertising/brand sync grant + artist approval | — | — | — | — | Required |
| Moral-rights objection protocol acknowledgment | — | Required (FR/DE/JP/BR territories) | Required | Required | Required |

Every product behavior reads the passport at runtime; a missing field disables the behavior for that track rather than blocking ingestion. This is the mechanism that turns "which behaviors are enabled" from a policy debate into data.

---

---

# 15. Minimum viable artist-direct license (Workstream 10)

> Drafting aid for counsel, **not legal advice and not a ready-to-sign agreement**. Items marked ⚖ need specialist drafting.

## 15.1 Plain-English pilot term sheet (v1 — in-app only)

- **Parties/scope**: Artist (warranting 100% master + composition control) grants Mashups a **non-exclusive**, revocable-on-notice license to named tracks (schedule with ISRCs).
- **Grants**: (1) host and reproduce the tracks; (2) analyze them (tempo/key/structure/fingerprint); (3) create and store stems via approved processing (named vendor or in-house; no AI model training on the tracks — expressly excluded ⚖); (4) enable users to combine each track **with other opted-in tracks** into mashup arrangements within stated transform limits (tempo ±20%, pitch ±4 semitones, section reordering, looping/hook extraction — limits configurable per artist); (5) stream resulting mashups **inside Mashups only**, including via shareable links and (optional toggle) embeds; (6) allow other users to **fork** mashups under the same constraints, with attribution to the artist on every node; (7) display artist name/likeness for attribution and catalog listing (no endorsement implied).
- **Express exclusions (reserved)**: standalone audio download; off-platform posting of any kind; DSP distribution; synchronization to user video; advertising/brand use; AI training; sublicensing.
- **Controls**: artist dashboard with per-track toggles — pairing scope (all opted-in tracks / genre category / allowlist / blocklist), explicit-lyrics pairing flag, forkability on/off, territory list, takedown button (specific mashup) and withdrawal (whole track).
- **Withdrawal mechanics**: track withdrawal stops new creations immediately; existing published mashups either (a) sunset after 30 days, or (b) survive for on-platform playback only, per artist election at signing ⚖ — this choice must be surfaced to users ("this mashup may disappear if a source artist withdraws").
- **Money**: pilot = **no advance, no MG**; revenue share only if/when the platform monetizes: X% of attributable net revenue to the rights pool per play (per-track share pro-rata by playtime), 50/50 master:composition internally (NMPA-parity convention); transparent monthly statements from day one even when the number is $0. Prize/challenge budgets are separate marketing spend, not royalties.
- **Compensation floor honesty**: the pilot pays in promotion, data, and product access first; the term sheet must say so plainly rather than implying royalties will be material.
- **Reporting**: monthly per-track: creations, plays, forks, shares, saves, top mashups, listener geography.
- **Legal hygiene**: artist reps/warranties (ownership, no samples, no third-party approvals needed, no conflicting deals); mutual indemnities capped at fees paid or a small fixed amount ⚖; term 12 months auto-renew with 30-day walk-away; governing law + informal-then-arbitration dispute path ⚖; no assignment without consent except to a successor.
- **Moral-rights protocol** (non-US artists or non-US exploitation): artist may flag any specific mashup as objectionable → takedown within 48h, no platform liability if honored ⚖.

## 15.2 Rightsholder-facing explanation (one paragraph)

"Mashups lets your fans legally play with your music inside our app: they pick your track and one other opted-in track, our system builds a few mashup options, and they publish inside Mashups only — nothing leaves the platform, nothing hits Spotify or TikTok, no downloads. You keep ownership, you choose which tracks participate and what they can be paired with, you can pull anything down with one click, you get named credit on every creation and a monthly report of exactly what fans made and heard. It costs you nothing; if the platform earns money on plays of your music, you share in it from the first dollar, and prize-backed challenges around your releases are funded by us."

## 15.3 User-facing rights explanation (in-product copy)

"Every song in the Mashups catalog was put there by its artist, on purpose, so you can remix it. Your mashups live on Mashups — you can publish them here and share links anywhere, but you can't download the audio or repost it to other platforms, because the artists' permission covers Mashups only. Artists always get credit, they can remove their music (which can remove mashups built on it), and what you make with catalog tracks may include rights that belong to the artists. Make something great — and if an artist pulls a song, we'll tell you what happens to your mashup."

## 15.4 Provisions requiring specialist counsel

Derivative-of-derivative (fork) grant language; the withdrawal/survival election and its consumer-law implications; moral-rights protocol wording per territory; AI-processing definition (separating "analysis/stems" from "training"); indemnity caps and E&O interaction; publicity-rights scope of artist-name use in marketing vs attribution; minors as users (creation by 13–17-year-olds and reward eligibility); tax characterization of creator rewards; export-control of the license schema itself when later platforms (named-platform grants) are added.

## 15.5 Intentionally excluded from the pilot

Standalone export; any off-platform posting; sync to user video (even watermarked) — deferred to the Phase-2 addendum; advertising; DSP release; AI training; exclusivity of any kind; MGs/advances; sublicensing to other services.

## 15.6 Phase-2 addendum (controlled social export) — outline

Adds: watermarked video-clip export (≤60s, named platforms, non-commercial creator use), platform allow-listing cooperation (registering the licensor's catalog references so exports resolve as licensed), per-artist toggle, revocable per platform; sync grant limited to user-shot/AI-generated non-commercial video ⚖; no standalone audio.

## 15.7 Phase-3 commercial addendum — outline

Individually negotiated per campaign: advertising/brand sync with artist approval; DSP release of selected mashups via a named distributor with full re-clearance; paid download of specific creations (Suno×WMG's paid-cap precedent). Never a default right.

---

---

# 16. Cross-track pairing controls (Workstream 11)

Evidence base: every observed licensed product restricts combination scope somehow (Hook: opt-in catalog, 60s, effects/genre-flip lanes; MashApp: "select tracks," in-app; Snap: no adaptations at all; Udio-JV/KLAY: opt-in artists, walled garden). No public license shows "any track × any track" unrestricted pairing of third-party catalog — assume controls are a condition of supply, not an option.

- **Recommended model — three-tier default**: (1) global platform standards (no pairing into hate/harassment contexts; explicit-lyrics flag honored; territory intersect of both tracks); (2) **artist-level default = open pairing within the opted-in catalog**, with opt-out lists (artists/labels they refuse) and an explicit-content toggle — mirroring how remix contests already work (whole opted-in pool); (3) reactive controls — artist dashboard flag → 48h takedown of specific mashups, plus emergency takedown SLA for reputational incidents.
- **Rejected as unscalable**: per-pairing preapproval (kills the product loop; nothing licensed at consumer scale works this way) and genre-fence-only models (genres are metadata fiction at the edges; users will defeat them).
- **Preflight automation**: territory intersect, explicit flags, blocklists, and moral-rights-jurisdiction routing are computable at generation time from the rights passport; combined with post-publication moderation (§24) this keeps human review off the critical path.
- **The uncomfortable truth to disclose to artists**: pairing controls limit embarrassment, not eliminate it; a licensed catalog means your track can appear under someone else's vocal in a mashup you dislike. The 48h flag-to-takedown covenant, visible lineage, and the non-derogatory-use platform rule are the honest mitigations. Artists for whom that is intolerable should not opt in — better a smaller, comfortable catalog than churn and public disputes.

---

# 17. Sharing-versus-containment strategy

The central design tension: virality wants files everywhere; licenses want playback at home. The eleven modes, ranked (viral potential × licensing difficulty × leakage/claim risk):

| Mode | Viral potential | Licensing difficulty | Leakage/claim risk | Verdict |
|---|---|---|---|---|
| 1. In-app playback only | Low | Baseline (§15) | Minimal | Launch floor |
| 2. Public Mashups URL (rich preview card) | **Medium-high** | Same grant as in-app | Low | **Launch — the workhorse** (MashApp precedent) |
| 3. Embeddable player | Medium | Low incremental (named surface) | Low-med | Phase 1.5 |
| 4. Private message link | Medium (dark-social) | Same as 2 | Low | Launch |
| 5. Watermarked short video export (≤60s, named platforms) | **High** | The negotiated Phase-2 grant (Hook precedent proves grantable) | Medium (claims; mitigate via allow-listing) | **The growth unlock — Stage 2** |
| 6. Direct API publish to TikTok/IG/YT/Snap | High | Same rights as 5 + platform partnership | Medium | Stage 2–3, per-platform |
| 7. Downloadable short video | High | Harder than 5 (uncontrolled redistribution) | High | Defer; only with explicit grant |
| 8. Downloadable full-length video | Medium | Near-export difficulty | High | No |
| 9. Standalone WAV/MP3 download | Medium (creators love it; MashApp's paywall resentment shows demand) | **The red line in every observed deal** | Maximum | **Owned/commissioned catalog only — a deliberate perk of non-licensed tracks** |
| 10. DSP distribution of selected mashups | Low-medium (prestige) | Full re-clearance + distributor per release | Contained (it's a release) | Stage 3+ campaign feature, artist-approved one-offs |
| 11. Paid advertising / brand use | N/A (revenue, not virality) | Individually negotiated, artist approval | — | Never a default; §15 Phase-3 addendum |

**The strongest compromise (recommended):** modes 1–4 at launch + aggressive *link-native* virality (§29) + mode 5 as the first negotiated expansion, with three honesty rules: (a) owned/commissioned tracks get full export as a visible free-tier superpower — the product demonstrates the difference between "artist-permitted" tiers instead of hiding it; (b) every share surface displays attribution (source artists + creator chain) as part of the card, making credit travel with the content; (c) no mechanic ever promises off-platform monetization to creators.

**What the containment tools can and cannot do (verified):** fingerprinting (Audible Magic/Pex-class) detects catalog audio in uploads and powers allow-listing — it cannot stop screen-recording; watermarking (audible bug on free video exports; forensic inaudible marks on premium) deters casual re-use and traces leaks — robust removal is always possible for a motivated attacker (SoK literature); signed expiring URLs + DRM'd in-app playback prevent trivial scraping — not analog capture; platform allow-listing converts inevitable matches into licensed-recognized uses — it requires per-platform registration workflows and licensor cooperation. Containment is risk-shaping, not risk-elimination; the license's takedown covenant is the backstop, and honest artist-facing framing of this is part of the §32 pitch.

---

# 18. Remix-tree feasibility (Workstream 13)

**Decision: ship lineage as rights infrastructure at launch; ship it as a consumer surface later, only if Stage-0 data says users care.**

The evidence for consumer value is thin: BandLab's fork feature (10 years old, 100M registered users) works because forking is *useful* (grab the multitrack), with lineage shown as a modest "Inspired By" tag — not because trees are a destination. ccMixter has run visible remix genealogy since 2004 at tiny scale. No mass product has demonstrated that *seeing* a remix tree drives engagement. Meanwhile the rights value is unambiguous: every 2025–26 licensed deal demands provenance, attribution, and per-source accounting — which is exactly what a lineage graph is. So the graph is a launch requirement *as a ledger*; the visualization is an experiment (WS28 E5), not a bet.

**Mechanics (each answered for the ledger, whether or not visualized):**
- **Model**: DAG, not tree. Nodes = published creations; edges = `derived_from` (parent creation) and `sources` (catalog track ISRCs). A mashup node has 2 source edges; a fork has 1 parent edge + inherits sources transitively. Multi-source ancestry is natural in a DAG; true branch *merging* (combining two published mashups) multiplies the rights stack (4+ sources) and should be **disabled** until licenses contemplate it.
- **Depth**: no legal limit, but each generation adds no new source rights (sources flow through); practical cap (e.g., depth 10) to bound accounting queries and abuse.
- **Duplicates/low-effort forks**: near-duplicate detection (parameter-delta threshold + audio similarity) collapses spam forks into "reposts" that don't earn rewards or ranking; forks must change something material to count.
- **Deletion/bans**: deleting a node orphans no children (children re-point attribution to the nearest surviving ancestor + always to root sources); banned users' nodes are delisted but the ledger entries persist for accounting/audit.
- **Source withdrawal** (the hard one): per the license election (§15), either sunset descendants (30-day notice, then unpublish the whole affected subgraph) or freeze them (playable, not forkable). Users see a truthful state badge ("source withdrawn — playback only"). Withdrawal must cascade *by source*, not by parent: every descendant carries the withdrawn ISRC and is affected regardless of fork path.
- **Territory changes/expiry**: passports are territorial; a node is playable in the intersection of its sources' territories, recomputed on any amendment. Rights expiration behaves like withdrawal with a scheduled date.
- **Downstream takedowns/disputes**: a DMCA/complaint against one node takes down that node only; a complaint against a *source* routes to withdrawal mechanics. Contribution disputes between users (fork claims "I made this better") are ranked/credited by the ledger's recorded parameter deltas — an honest tiebreaker no competitor has.
- **Legal characterization of a fork** ⚖: contractually, treat every fork as (a) a **new grant under the source licenses** (the fork clause in §15 — each fork is a fresh licensed derivative, not an amendment of the parent's license), plus (b) a **ToS license from the parent creator** to the forker covering the parent's contribution (BandLab's forkable-grant is the working precedent), plus (c) a **platform-controlled arrangement** for anything machine-generated. Jurisdiction matters at the margins (whether the forker's contribution attracts its own thin copyright — US selection/arrangement standard vs. UK/EU originality), which is why rewards must be contractual (§19), never premised on the fork owning anything.

---

# 19. Creator ownership and reward model (Workstream 14)

**Ownership reality.** Under the US Copyright Office's 2025 framework, a user who merely picks one of three machine-generated arrangements likely owns nothing; meaningful edits (section re-ordering, level/EQ decisions, added vocals/video) can create thin authorship in the selection/arrangement; user-added original vocals or video are unambiguously theirs. Outside the US, originality thresholds differ and moral rights attach to *source authors* regardless. Product consequences: (1) log every human edit per node (the authorship record); (2) the ToS must have users grant the platform + other users the licenses needed for hosting/forking regardless of whether their contribution clears any bar; (3) never market "own your mashup" — market "get credited, get status, get rewarded." ⚖ ToS drafting.

**Reward model comparison (condensed):**

| Model | Legal basis | Accounting burden | Motivation | Fraud risk | Rightsholder acceptance | Verdict |
|---|---|---|---|---|---|---|
| Recognition/attribution | ToS | Trivial | High (identity) | Low | High | **Launch** |
| Status/badges/leaderboards | ToS | Low | High for target users (Hook's contests are its best-loved feature) | Medium (vote rings) | High | **Launch** |
| Challenge prizes (fixed, sponsored) | Contest law (state/FTC rules) ⚖ | Low | High, campaign-shaped | Medium | High — labels co-fund these today | **Launch** (with contest T&Cs) |
| Fixed per-milestone bonuses | Contract | Low | Medium | High (botting) | Medium | Later, capped |
| Subscription revenue pool (pro-rata to creator plays) | Contract | Medium | Medium | High | Medium — must not dilute rights pool | Phase 3, after monetization exists |
| Direct remix royalty / multi-generational cascade | Contract; touches rightsholder economics | High (micro-splits at depth) | Low per person (dilution: a 3rd-generation fork's share of an 8% creator pool is pennies) | High | Low-medium until proven | **Not at launch**; pilot the cascade math internally on the ledger first |
| Ad revenue share | Contract + ad ops | High | Medium | Very high | Medium | No (no ads early anyway) |
| Referral rewards | Contract | Low | Medium | High | N/A | Optional growth lever |

**Recommendation:** launch with attribution + status + sponsored prizes; run the royalty **ledger** silently from day one (every node accrues hypothetical splits so the cascade can be audited against real usage); introduce cash only when (a) monetization exists, (b) fraud controls are proven, (c) a payout would exceed a de-minimis floor (e.g., $10) for a meaningful cohort. Payments/tax plumbing (W-9/1099, DAC7 in EU, minors) is a real cost — do not take it on to distribute pennies. ⚖ tax/payments counsel before first cash payout.

---

# 20. Audio-quality requirements (Workstream 15)

**The bar:** a user must be proud to share the result — which for short-form consumer audio means: no audible time-stretch warble on the vocal, no key clash, chorus lands on a musically sensible boundary, loudness competitive (-14 to -9 LUFS integrated depending on surface), artifacts below the "is this broken?" threshold on ordinary earbuds. "Studio quality" is not the bar; **"not embarrassing on TikTok"** is, and it is still demanding.

**Constraint budget (from published DSP behavior + listening practice; targets are engineering hypotheses to validate in the listening test, not vendor claims):**
- Tempo: pair gate at ≤15% stretch (prefer ≤8%); allow half/double-time matching (140 dubstep ↔ 70 hip-hop) before raw stretching.
- Key: pair gate at ≤3 semitones of vocal shift (prefer ≤2; use Camelot-adjacent target keys); shift instrumentals before vocals.
- Separation: HT-Demucs-class offline quality (~9 dB SDR) is the floor; reverb-heavy/dense sources flagged at ingestion (pre-compute per-stem confidence; low-confidence tracks get restricted arrangement templates or human-checked stems). For a permissioned catalog, **ask artists for real stems at intake** — the pilot's secret weapon; separation is the fallback, not the plan.
- Structure: phrase-aligned section boundaries (8/16-bar grid) with beat-grid confidence scores; low-confidence tracks fall back to loop/hook-extraction templates rather than full-song arrangements.
- Mastering: per-arrangement auto-gain staging, gentle bus compression/limiting, LUFS normalization; sidechain duck of instrumental under vocal as a default.
- Explicit lyrics: flag from metadata + transcription; honor pairing controls and surface a badge.

**Listening-test protocol (run in Stage 0, before any licensing conversation):** 20–30 listeners per round (target users, not audio engineers), blind, randomized: for each of ~15 pairs across 4 genres, present the 3 generated arrangements + 1 deliberately naive baseline (straight 50/50 blend, no structure logic). Rate 1–5: musical coherence, vocal intelligibility, transition quality, artifact severity, overall "would you share this?" (binary + willingness intensity), pick favorite arrangement. Success gates (pre-registered): ≥70% of pairs yield at least one arrangement rated ≥4 overall by a majority; share-willingness ≥40% on best-of-three; generated arrangements beat the naive baseline in ≥80% of pairs (if they don't, the arrangement engine isn't earning its complexity). Fail → fix engine before spending any money on rights.

---

# 21. Arrangement-generation strategy (Workstream 16)

**Recommended: curated template library + deterministic MIR pipeline + learned ranking. No generative audio model.** Rationale: templates are explainable to licensors (the license enumerates permitted transforms), deterministic output is reproducible for rights review, and the ranking layer is where the data moat accrues (WS23) — all without training anything on licensed audio (ranking trains on *user choices and features*, not on the recordings, so no training-permission conflict; state this in the license anyway ⚖).

Template set v1 (each with pair-compatibility preconditions and known failure modes):
1. **A-vocal over B-instrumental** (and the reverse as arrangement #2) — precondition: clean vocal stem, harmonic compatibility within gate; fails on rap-over-complex-harmony (melody/harmony mismatch matters less for rhythmic vocals — genre-aware scoring).
2. **Alternating sections** (verse A / chorus B) — precondition: confident structure segmentation on both; fails when energy gap between sources is extreme (needs energy matching/EQ tilt).
3. **Drop swap** (A build → B drop) — electronic-native; precondition: detectable build/drop; the crowd-pleaser in bass genres.
4. **Hook-first short-form** (both hooks interleaved in 30–60s) — the shareable clip format; lowest legal surface if clip export is later licensed.
5. **Call-and-response** (phrase-level A/B vocal trade) — hardest; gate on phrase alignment confidence; v2.
6. **Medley/DJ transition** (sequential with beat-matched crossfade) — the safety template that almost always "works" but is least mashup-like; include as the floor, never as 2 of 3 options.
Diversity rule: the three offered arrangements must come from ≥2 distinct template families with detectably different structure (enforced by minimum edit-distance between arrangement plans). User feedback loop: selection + completion + share events label (pair, template, parameters) tuples; a gradient-boosted ranker re-orders candidate arrangements per pair; cold-start uses AutoMashUpper-style mashability scoring.

---

# 22. Technical architecture (Workstream 17)

**Shape:** keep the existing Next.js/Supabase/Vercel core; add a rendering/analysis worker tier (GPU batch for stems at ingestion; CPU workers for analysis/render), object storage + CDN for audio, and the rights passport as first-class schema.

Key decisions (compared as required):
- **Lineage store: relational (Postgres), not a graph DB.** The DAG is shallow (depth ≤10) and query patterns are known (ancestors for attribution, descendants for withdrawal cascade, per-source rollups) — recursive CTEs + a closure table handle this at any plausible scale; a graph database adds operational surface for zero product benefit at <10M nodes. Revisit only if traversal queries dominate cost, which nothing in the product suggests.
- **Ledger: conventional double-entry in Postgres (append-only journal + periodic snapshots), not blockchain.** Requirements are auditability, idempotent event ingestion, and per-party statements — a solved accounting problem. Blockchain adds cost, key-management UX, and counterparty confusion while solving a trust problem no counterparty has asked to solve (Story Protocol's music traction: none; it pivoted). Rule 10 of the brief is satisfied on the evidence.
- **Rendering: hybrid.** Browser (Web Audio, existing code) for preview — zero server cost, instant iteration; server-side render for the published artifact (consistent loudness/mastering, watermarking hook, no client-version drift). Cache rendered arrangements keyed by (pair, template, params) — mashup popularity is zipfian, cache hit-rates will be high.
- **Stems: batch at ingestion, not on-demand.** Permissioned catalog is finite; pre-separating (or ingesting artist-provided stems) removes GPU latency from the user path entirely and makes per-track stem QA possible. On-demand separation only if user-upload of owned material is later allowed.
- **Build vs buy:** BUY/rent — stem separation models (open Demucs-class self-hosted, or AudioShake-class vendor when a licensor requires an approved processor), fingerprinting (Audible Magic/ACRCloud/Pex-class), payments (Stripe), transcription (hosted Whisper-class). BUILD — compatibility scoring + arrangement engine (the product), rights passport + gating (the defensibility), lineage ledger + statements (the trust asset), moderation tooling glue. MANUAL until PMF — rights intake/verification (a human reviews every passport; automate at >50 tracks/month), artist support, takedown handling, listening QA on new catalog. DO NOT BUILD before PMF — recommendation/feed ranking beyond recency+follows, embeds, public API, white-label, native Android (iOS/web first; the entire licensed-remix market is iOS-first), any blockchain anything.
- **Security/abuse basics as launch requirements, not later**: signed short-lived audio URLs; no raw stem URLs client-side (stems are the crown jewels of leakage); rate limits on render/fork; age gate (13+ with parental-consent flow per COPPA; rewards 18+) ⚖; audit log on every rights-relevant event (ingestion, gating change, takedown, withdrawal) from day one; DR = daily snapshots + storage versioning; privacy = standard DSR tooling, minimal PII, no biometric anything.

---

# 23. Rights operations (Workstream 18)

Daily operating loop for a permissioned catalog (pilot scale = human-run with checklists; the point is that every step writes to the passport and audit log):

- **Intake → review → activate**: artist submits tracks + evidence → rights review against §14 checklist (target: ≤5 business days pilot) → exceptions queue (missing splits, fingerprint hits, sample flags) with a named owner and a "reject after 30 days silent" rule → stem processing (artist-provided preferred; approved separation otherwise) + QA listen → pairing permissions configured → publishing activation per territory.
- **Monitoring**: expiration/term alerts at T-60/T-30; amendment workflow (any grant change recomputes gating and cascades to affected nodes); Content ID/allow-list reconciliation when Phase-2 export exists (weekly: exports claimed vs allow-listed).
- **Withdrawal**: artist clicks withdraw → new creations stop instantly → affected subgraph computed by source ISRC → user notifications with the truthful reason and the survival state per the license election → public state badge. Target: takedown of a specific flagged mashup ≤48h (pilot SLA), emergency reputational takedown ≤4h business hours.
- **Claims**: inbound DMCA/complaints triaged same-day; counter-notice path per existing `app/legal/COPYRIGHT_POLICY.md`; repeat-infringer enforcement per existing policy; every action logged with actor + evidence.
- **Reporting**: monthly artist statements (creations, plays, forks, geography, top mashups, accrued share even when $0) — the pilot's most persuasive artifact for the next licensing tier; quarterly audit-evidence pack (passport snapshots, event counts, claim log).
- **Proposed SLA targets (labeled proposals, not market facts):** pilot — intake 5d, flag-takedown 48h, statement monthly, claim response 24h; growth — intake 48h, takedown 24h, statements with payments monthly, claim response 12h; enterprise — intake automated same-day with sampling QA, takedown 12h/contractual, daily usage feeds (DDEX DSR-style), claim response per contract.
- **Data retention**: rights evidence and audit logs retained for term + statute-of-limitations margin (≥6 years) ⚖; user content per privacy policy.

---

# 24. Trust, safety, and moderation (Workstream 19)

The distinctive risk: **licensed combination is also reputational combination** — artist A's vocal over artist B's beat creates associations neither approved individually. Controls in three layers:

1. **Pre-publication (automated, from the passport + content signals)**: pairing rules (blocklists, explicit flags, territory intersect); lyric transcription screening on user-added vocals (hate/harassment/CSAE lexicons + model classification); title/description/artwork moderation; impersonation checks on display names; rate limits.
2. **Post-publication**: user reporting with category routing; artist dashboard flag (fast lane, 48h covenant); audio-similarity spot checks against non-catalog commercial fingerprints (leakage of unlicensed material via "owned uploads" is the biggest legal hole — if user uploads of "their own" tracks are allowed at all in Stage 1, they get the full §14 verification, no exceptions); ranking suppression for borderline content pending review.
3. **Governance**: published community rules covering derogatory combinations, hate, sexual content, extremism, harassment, impersonation, dangerous challenges; a visible appeals path (user and artist sides); transparency notes on takedown volumes once volume exists; fraud controls for rewards (device/graph anomaly detection on plays/votes/forks, human review over prize thresholds, delayed payout windows); bot-fork collapse (§18). Minors: 13+ product, no rewards under 18, no DMs at launch (cut the whole grooming/abuse surface), CSAE reporting duties wired to NCMEC procedures ⚖.
- Malicious-claim handling: require complainants to identify the exact source right claimed; false-ownership claims (a chronic UGC problem) get evidence review before takedown except for verified rightsholder fast lanes.

---

# 25. Business model

Monetization candidates assessed (WTP evidence from §6; rightsholder acceptability from the deal record):

| Model | WTP evidence | Rightsholder fit | Margin | Conflict risks | Verdict |
|---|---|---|---|---|---|
| Free creation with limits (generations/day, pair count) | Standard freemium; Suno's shape | Fine (drives usage reporting) | — | None | **Launch** |
| Premium subscription ($4.99 intro; $7.49–9.99 mature) | MashApp+ $9.99 anchor; category band $8–13; Deloitte fatigue caution | Fine; simplest to account | High on software features | Don't paywall the share moment (MashApp's mistake) | **Launch (soft), price-test low first** |
| Creation credits (à la carte) | Suno credits precedent | Fine | High | Complexity for casual users | Test as alternative to sub in E9 |
| HQ export fees / watermark removal | Hook sells watermark-free; MashApp sells export | Only for rights-permitted tiers | High | Never on licensed tracks without the grant | Owned/commissioned tracks only at first |
| Premium catalog access | Labels may *require* paid gating (Spotify add-on precedent) | **Positive** — paid tiers are the licensed norm | Content-pool applies | Free-tier catalog must stay good enough to hook | Stage 2–3 |
| Artist fan-pass subscriptions (per-artist perks, early stems, badges) | Deloitte 2026 superfan thesis; fandom precedents | **Strongly positive** (artists share revenue) | Medium | Small audiences per artist | **Stage 1–2 — the thesis-aligned experiment** |
| Sponsored remix challenges (label/brand pays) | Hook runs label campaigns; SKIO's whole model | **Positive — they already budget for this** | Services-like but high | Sales-led lumpiness | **Launch-adjacent revenue; first dollars** |
| Advertising | — | Neutral | Low at small scale | UX damage early | No (pre-scale) |
| Tips / creator economy | Weak evidence here | Neutral | Low | Payments/tax overhead | Later |
| B2B API / white-label (the §36-C/D adjacency) | bushido/ClearBeats demand-signal; labels buy campaign tools | Positive | SaaS | Focus dilution | Keep warm as pivot, sell opportunistically |
| **Who pays first:** | **Sponsors/labels (challenges) + nobody-blocking-validation** — consumer subscription turned on softly in Stage 1 at $4.99 to measure conversion, not to fund the company; artists never pay (supply must be frictionless). | | | | |

---

# 26. Licensing economics

**Hard rule honored: no invented confidential rates.** Public anchors: Twitch DJ Program ≈ 30% of channel revenue to rights (50/50 platform/DJ split of that cost after subsidy); Spotify pays ~⅔ of revenue to rightsholders (gross margin ~33%); YouTube 55/45 with music adjustments; Mixcloud Select pays rightsholders first then 60/40; Tracklib clears at $50–$1,500 fees + 2–20% rev share; ElevenLabs/NMPA convention splits recording:composition 50/50; historical launch-license precedents include equity (Spotify 2008: ~18% to majors+Merlin) and MG-driven deadpools (Sonific). Major-label MGs/advances for a product like this are **not public — modeled only as scenario stressors.**

Modeled per-tier cost structure (labels: **all modeled**, anchored to the above):

| Catalog tier | Deal shape (modeled) | Content pool (% of attributable revenue) | Cash risk | Reporting burden |
|---|---|---|---|---|
| Owned/commissioned | N/A (costs are production: ~$1–5K/commissioned track) | 0% | Production budget only | None |
| Artist-direct one-stop | $0 advance, rev-share only (§15); challenge prizes as marketing | 15–30% (generous-by-design at tiny revenue; goodwill > margin) | ~None | Monthly statements (light) |
| Boutique labels | Small MG ($5–25K/yr per label, modeled) + rev share | 30–50% | Low | Monthly, per-track |
| Distributor opt-in / Merlin-scale | MG + rev share + integration costs | 50–65% | Medium (MG stacking) | DDEX-grade feeds, audits |
| Majors + publishers | Advances + MGs + possible equity + per-use minima (all confidential; modeled from precedent patterns) | 65–75%+ with per-play minima | **High — the classic startup killer** | Enterprise (daily feeds, audit rights) |

Non-royalty rights costs (verified where public): DDEX membership $291/yr; fingerprinting ~$0.076–0.08/audio-minute via marketplace rates (Audible Magic direct pricing unpublished); moderation $2–15K/mo scaling; music-aware E&O $1.3–5K+/yr (music-specific quotes unpublished — flag); outside counsel for the §15 template + fork clause: modeled $25–60K one-time ⚖; The MLC DSP assessment exposure if Mashups ever qualifies as a DMP: small but unmodeled — open question.

---

# 27. Unit economics (36-month, three scenarios — **all modeled**, inputs per the verified table in §42/economics stream)

**Shared verified inputs:** compute ~$0.04/mashup (2 separations + render; near-zero if artist stems provided); storage ~$0.0015/mashup-month (R2, compressed bundle); delivery ~$0/GB egress (R2) — streaming COGS effectively vanishes at pilot scale; payments 6.6% web (Stripe all-in) vs 15–30% stores (US link-out at 0% currently contested — SCOTUS term Oct 2026); price $4.99 intro / $9.99 mature; download→paid median 1.7% (range 1–3%); monthly churn ~13% (monthly plans); CPI $1–5.30 → **paid CAC $70–235/subscriber — treated as prohibitive; the model assumes organic/artist-driven acquisition with paid UA only for tests.**

**Base case (Stage 1–3 arc, artist-direct → boutique):** Months 1–6: 5K–15K registered, ~20% activation (create ≥1), conversion off (validation); costs ≈ infra $0.5–1K/mo + moderation/ops $2–4K/mo + 2–3 salaries → burn dominated by payroll, not COGS. Months 7–18: 50K–150K registered via 10–25 artist activations (each artist push modeled at +2–10K registrations — assumption to validate in E7); soft paywall at $4.99 → 1.7% of ~100K = ~1,700 subs ≈ $8.5K MRR gross; content pool 25% on the ~40% of plays that touch licensed catalog → platform keeps ~$6.5K MRR + challenge sponsorships ($5–15K/quarter each, modeled on SKIO/Hook patterns) → revenue covers COGS + part of ops; payroll still the burn. Months 19–36: 300K–750K registered (requires the viral loop to actually work — K-factor ≥0.4 on link shares, unproven), 2% conversion at blended $7 ARPU ≈ $42–105K MRR; content pool 40–50% blended; **gross margin on subscription revenue ~45–60%; company-level breakeven at roughly 500K–800K registered / 10–16K subscribers + 4–6 sponsored campaigns/quarter, with a team of 6–8** ($1.4–2.0M/yr fully-loaded). Cash need to reach the Month-19 gate: **$1.5–2.5M** (see §39).
**Downside:** repeat creation <8%, artist pushes convert <1K each → the consumer network never compounds; company survives only by pivoting to §36-C/D revenue (white-label campaigns $15–50K each) — which is why those pivots are pre-named. **Upside:** a genuine viral mechanic (tree-cards or battles) + one breakout artist activation → 2M+ registered by Month 30; at that scale distributor opt-in catalog (Stage 3) is fundable and the Merlin conversation opens; subscription + sponsorship revenue $2.5–5M ARR; **margins remain software-like only because licensed plays carry rev-share without MGs — the moment MGs stack, gross margin compresses toward media-business range (30–45%).**
**Sensitivities (the three that matter):** content-pool % (each +10pts ≈ −6pts gross margin at scale); repeat-creation rate (drives everything — below ~10% W4 the funnel never pays for itself organically); MG stacking at Stage 3+ (a $250K/yr MG floor across boutiques/distributors moves breakeven by ~50–80K registered users). **Answer to the margin question: software-like margins are achievable through Stage 3 with rev-share-only deals and R2-class delivery; a majors-tier catalog converts the company into a rights-heavy media business unless per-use minima are avoided — plan capital accordingly and treat Stage 4 as optional.**

---

# 27A. Scenario models A–E (required; all modeled)

| | A. Owned only | B. Artist-direct (20–100 tracks) | C. Boutique labels | D. Recognizable indie (distributor/Merlin) | E. Majors |
|---|---|---|---|---|---|
| Product value | Proves quality + loop mechanics; no recognition pull | Superfan pull per artist; scene identity | Scene-wide catalog; repeatable drops | "Songs you know"; catalog stops being the objection for its genres | Mainstream promise |
| Catalog quality | Demo-grade + commissioned vocals | Real releases, niche fame | Known within scenes | Genuinely recognizable in-genre | Hits |
| Licensing time | 0 | 2–6 wks/artist | 1–3 mo/label | 3–9 mo/program | Years (MashApp: ~4) |
| Capital need (incremental, modeled) | <$50K | $100–250K | $250–750K | $1–3M (MGs + ops) | $5M++ (advances/MGs/equity asks; not public) |
| Rights scope achievable | Everything incl. export | §15 full set incl. forks; export owned-only | §15 + some clip export | §15 + negotiated clip/SoundCloud lanes | Walled garden, paid gating, heavy reporting |
| Consumer acquisition | None organic | Artist reposts (the load-bearing bet) | Label channels + contests | Distributor/artist networks | Mass PR |
| Retention hypothesis | Habit test only | Superfan cadence (release-window spikes) | Multi-artist cadence smooths spikes | Catalog depth extends session/return | Unknown; MashApp warns recognition ≠ retention |
| Revenue | ~$0 | Sponsorships + soft subs ($50–150K ARR) | $0.3–1M ARR | $1–5M ARR | Scale-dependent |
| Gross margin | ~90% | 70–85% | 55–70% | 45–60% | 25–45% (media-business range) |
| Main risk | Unrepresentative of licensed reality | Artist pushes don't convert | MG stacking before demand proof | Integration + reporting overhead; Content ID ops | Economics + control + timeline |
| Proof to unlock next | §20 quality gates + E1 habit signal | ≥5 signings, ≥1 activation converting >2K users, claims=0 | 2+ labels renewing; sponsorship repeat rate | Retention at scale + clean audit trail + claim SLA record | Only if Stage-3 economics survive stress case — else don't |

---

# 28. Network effects and defensibility (Workstream 23)

| Moat candidate | Honest strength | Notes |
|---|---|---|
| Licensed catalog | **Weak-to-moderate, temporary** | Non-exclusive by design (artists won't grant exclusivity to a pilot, and demanding it poisons trust). Catalog is a *requirement*, not a moat — Hook/MashApp/Spotify all have more. |
| Exclusive artist relationships | Moderate if earned | Exclusive *activations* (challenge windows, first-remix drops) are gettable; exclusive catalog is not. Relationship depth + tooling (dashboards, statements) is the sticky part. |
| Audio quality (arrangement engine) | **Moderate, defensible 12–24mo** | Real MIR engineering, few teams do it well; but replicable by a funded incumbent. Quality lead must convert into data lead to persist. |
| Arrangement-ranking data (pair × template × outcome) | **Strong if reached** | Compounds with usage; not purchasable; directly improves the core magic. The most venture-legible asset in the plan. |
| Track compatibility graph ("what mashes with what") | Strong complement to above | Same flywheel; also a licensing sales tool ("your track pairs with 4,000 others — here's the demand curve"). |
| Remix lineage + per-node accounting ledger | **Moderate-strong as B2B/rights asset** | No incumbent exposes multi-generational derivative accounting; it's the hard, boring trust infrastructure — valuable to licensors even if consumers ignore the tree. |
| Rights passport data + pairing-permission graph | Moderate | Operationally valuable, replicable in principle; becomes strong only at catalog scale with exception history. |
| Creator identity/status/social graph | Strong *if* the community forms | The only durable consumer moat in this market — and the least controllable. Hook's contest community shows the seed pattern at small scale. |
| Challenge ecosystem + label integrations | Moderate, relationship-dependent | Repeatable revenue + supply channel; copyable mechanics. |
| Claim-resolution history / trust record | Moderate, slow-building | "Zero unresolved claims, 48h SLA met for 12 months" is exactly what unlocks the next catalog tier; nobody can fake tenure. |
| Rendering tech | Weak | Table stakes. |
| Distribution relationships (SoundCloud-style) | Weak-moderate | Available to competitors (SoundCloud already partners with Hook and lists MashApp). |

**Distinguish difficult from valuable:** major-label mashup licensing is *difficult*, but MashApp proves a startup can get it and still not matter — difficulty without user demand is not a moat (Principle 12). The defensible sequence is: quality → usage → ranking-data + compatibility-graph + community → catalog access on better terms. Spotify/TikTok can copy any feature; what they won't copy quickly is a creator community with status stakes and a cross-catalog compatibility dataset built from real choices.

---

# 29. Virality strategy (Workstream 24)

Constraint: assume **no standalone audio export** and (at Stage 0-1) **no off-platform video**. Mechanics ranked by (viral hypothesis × rights cost):

**Work without any export (Stage 0-1):**
- **Shareable remix cards + public URLs** (rich OG embeds: cover art collision, waveform, play button) — the MashApp mechanic; measure link CTR→listen→signup. Rights: in-app playback grant only.
- **"Try these two tracks" challenge links** (pair pre-selected, one tap to generate) — the lowest-friction creation invite; also the pair-demand telemetry engine.
- **Fork chains + notifications** ("X forked your mashup — hear what they changed") — retention loop, zero new rights.
- **Weekly battles/tournaments** (theme + sponsored prize + leaderboard) — the proven engagement engine in this niche (Hook contests, SKIO); rights: contest T&Cs only.
- **Before/after reveal** ("what these two songs become") as on-platform shareable moment; artist reposts of winner mashups (artists sharing *links* to their own fan activity is friction-free and the pilot's core distribution bet).
- **Limited-time catalog drops** ("this week only: X's stems") — scarcity + artist-fan activation.
- Referral rewards (extra generations) — standard, fraud-guarded.
- Remix-tree visualization as shareable image (the tree as *content* — a genealogy card, not a product surface) — cheap test of whether lineage has consumer pull.

**Requires Phase-2 rights (watermarked ≤60s video export to named platforms):** reaction/duet bait clips, hook-first vertical videos, TikTok/IG challenge hashtags. This is the highest-leverage growth unlock and precisely what the Phase-2 license addendum buys; sequence deals so the *proof* that in-app mechanics work funds the export ask.
- Measurement for every mechanic: invites sent/accepted (K-factor components), link CTR, visitor→creator conversion, cost per activated creator; abuse risk noted per mechanic (vote rings on battles; link spam) with §24 controls.

---

# 30. Staged go-to-market plan

| | Stage 0 — Owned green room | Stage 1 — Artist-direct pilot | Stage 2 — Controlled social sharing | Stage 3 — Boutique labels & catalog partners | Stage 4 — Strategic/major discussions |
|---|---|---|---|---|---|
| Product scope | Arrangement engine v2 to §20 bar; §33 instrumentation; battles; link cards; fork ledger (hidden) | + Rights passport live; artist dashboards + statements; fan-pass experiment; forks visible | + Watermarked ≤60s video export to named platforms; allow-listing ops; embeds | + Distributor-feed ingestion (DDEX); pairing-scale ops; ranking dataset flywheel | + Enterprise reporting; paid-tier catalog gating if required |
| Rights scope | Owned/commissioned only (full export allowed — the free-tier superpower) | §15 pilot license (in-app + links + forks; no export) | §15 Phase-2 addendum (clip export, named platforms) | Label/distributor agreements; small MGs; publisher joinders where needed | Whatever majors require — only if economics survive |
| Catalog target | 20–40 owned/commissioned tracks (≥40% with vocal stems) | 15–30 artists / 60–150 tracks in the beachhead scene | 150–400 tracks | 1,000–5,000 tracks | Selective hits, campaign-first |
| User target (modeled) | 1–3K testers | 25–75K registered | 150–400K | 0.5–1.5M | — |
| Partner target | 0 (build) | ≥5 signed artists of ≤15 asked; 1 SKIO-style contest | 2 platforms allow-listed; 3 label-sponsored challenges | 3–5 boutique labels; 1 distributor program; CMG/EMPIRE conversations | Merlin; then majors |
| Evidence target (exit criteria) | §20 listening gates passed; E1 repeat ≥15%; E4 three>one confirmed | Artist-push conversion ≥2K registrations for ≥1 artist; W4 repeat ≥15%; share-link CTR ≥8%; 0 unresolved claims | Export lifts K-factor ≥0.15 absolute; claims auto-resolve via allow-list ≥95%; artist renewal ≥80% | Retention stable at scale (W4 ≥12% blended); sponsorship repeat ≥50%; audit-clean statements ×4 quarters | — |
| Kill criteria (stage-level) | Quality gates fail twice; repeat <5% | <20% artist conversion; pairing-control demands break product; repeat <8% after 2 artist pushes | Export shifts K <0.05 absolute; claim chaos (>5% exports muted after allow-listing) | MG stack pushes gross margin <35% with no offsetting retention gain | Terms require export bans on owned content, per-pairing approvals, or MGs beyond §27 stress case |
| Budget (modeled) | ≤$75K discretionary | $250–400K | $300–500K | $1–3M | — |
| Prohibited during stage | Any licensed-catalog ingestion; any export promises | Any off-platform posting of licensed content; royalties promises to creators | DSP distribution; ads; full-length export | Major-label dependence; blockchain anything | — |

---

# 31. Partner prospect map

Public business information only; **inclusion asserts nothing about availability or clearance**; every row requires §14 verification before any track is touched. Priority: ① first-wave, ② second, ③ later. Confidence H/M/L refers to the *ownership/remix-friendliness evidence*, not willingness.

**Self-releasing / one-stop-leaning artists & artist-owned imprints (30):**

| Prospect (imprint) | Country/scene | Evidence & angle | Likely objection | Pri/Conf |
|---|---|---|---|---|
| Moby (mobygratis) | US / electronic | 500+ free instrumentals **with stems, remix-permitted** — relaunched 2025; goodwill flagship | Non-commercial default → needs commercial tier talk | ① H |
| GRiZ | US / funk-bass | Free flips/edits giveaway culture | On hiatus; mgmt responsiveness | ① H |
| Pretty Lights | US / electro-soul | Catalog free-download for years | Complex return/touring status | ② H |
| Subtronics (Cyclops) | US / dubstep | Label owner; flip-culture icon | Touring schedule; existing partners | ① H |
| Seven Lions (Ophelia) | US / melodic bass | Label owner; **vocal-rich catalog** | Topline writer splits per track ⚖ | ① H |
| Excision (Subsidia) | CA / bass | Label owner; mass compilations = volume supply | Volume ≠ curation | ① H |
| Zeds Dead (Deadbeats) | CA / bass | Label owners; remix-comp history | — | ① H |
| REZZ (HypnoVizion) | CA / midtempo | Label owner | Dark-brand fit control | ② H |
| Liquid Stranger (WAKAAN/SSKWAN) | SE-US / bass | Label owner | — | ① H |
| AC Slater (Night Bass) | US / bass house | Label owner; DJ-tool culture | — | ① H |
| Tchami (Confession) | FR / future house | Label owner | FR moral-rights protocol ⚖ | ② H |
| Jauz (Bite This) | US / bass | Label owner | — | ② H |
| San Holo (bitbird) | NL / indie-electronic | Label owner; stem-forward history | NL/EU territory care | ② H |
| CloZee (Odyzey) | FR-US / world bass | Label owner | — | ② H |
| TOKiMONSTA (Young Art) | US / beats | Label owner | — | ② H |
| ODESZA (Foreign Family) | US / indie-electronic | Label owners; remix-contest history | Premium brand = high bar | ③ H |
| Kaskade (Arkade) | US / house | Label owner; vocal house | Legacy deal pockets ⚖ | ② M-H |
| Lane 8 (This Never Happened) | US / melodic house | Label owner; devoted community | Anti-phone show culture (brand fit q) | ② H |
| John Summit (Experts Only) | US / tech house | Label owner; peak relevance | Price of heat | ③ H |
| Chris Lake (Black Book) | US-UK / tech house | Label owner | — | ③ H |
| Emancipator (Loci) | US / downtempo | Label owner | Instrumental-only | ③ H |
| Big Gigantic | US / livetronica | Free-release history | Sax/live stems complexity | ③ M |
| Gramatik (Lowtemp) | US-SI / electro-soul | Famously free catalog | Crypto-era rights experiments to diligence ⚖ | ③ M |
| Ganja White Night (SubCarbon) | BE / dubstep | Label owners | BE/EU territory | ③ M |
| Boris Brejcha (Fckng Serious) | DE / high-tech minimal | Label owner | DE moral-rights protocol ⚖ | ③ M-H |
| Adam Beyer (Drumcode) | SE / techno | Flagship indie techno | Harder counterparty; vocals scarce | ③ H |
| Charlotte de Witte (KNTXT) | BE / techno | Label owner | Same | ③ H |
| Keinemusik (&ME, Rampa, Adam Port) | DE / Afro house | Collective-owned label; 2024-25 apex | Apex pricing; DE protocol | ③ H |
| Black Coffee (Soulistic) | ZA / Afro house | Artist-owned company | Scheduling/gravitas | ③ M-H |
| Deadmau5 catalog — via CMG | CA / progressive | mau5trap sold to Create Music Group 2025; remix-comp catalog at one desk | It's a CMG BD deal, not artist-direct | ② H |
| *Excluded:* Bassnectar | — | Settled abuse litigation 2025 — reputational risk | — | — |

**Boutique/artist-owned labels (22):** the imprints above (Ophelia, Subsidia, Cyclops, WAKAAN, Deadbeats, Night Bass, Confession, Bite This, bitbird, Odyzey, Young Art, Foreign Family, Arkade, TNH, Experts Only, Black Book, Loci, SubCarbon, Fckng Serious, Drumcode, KNTXT) **plus**: Anjunabeats/Anjunadeep (UK — indie, deep remix culture, ②), Armada (NL — largest indie dance, contests, ②), Defected (UK — indie owner-CEO; acapella tradition — the vocal-supply label, ①-②), Toolroom (UK — remix academy culture, ②), Hospital Records (UK DnB — independence to re-verify, ③), Ninja Tune (UK — indie, ③), NCS (UK — free-use precedent, creator-native, ①-② for a special-terms lane), Monstercat & mau5trap (CA — **via Create Music Group**, one desk, ②), Dirtybird (US — **via EMPIRE**, one desk, ②), Chillhop (NL — claim-free program precedent, ③).

**Distributor / artist-services partners (10):** Too Lost (① — proven Hook licensor; 300K+ artists); Symphonic (① — proven opt-in AI/dataset programs); Create Music Group (② — Monstercat+mau5trap desk; stated licensing ambitions); EMPIRE (② — Dirtybird + hip-hop one-stops for vocal supply); ONErpm (②); Believe/TuneCore (③ — scale, no known program); CD Baby/FUGA (③ — **now UMG-owned**, treat as major-adjacent); Stem (③ — splits-focused distribution); Symphonic's Sureel adjacency (③ — consent-tracking); AWAL (③ — Sony-owned, flag).

**Publishers / administrators (10):** Kobalt (① — licensed MashApp, ElevenLabs, Udio; the proven yes-desk); NMPA template route (① — opt-in indie-publisher mechanism, June 2026); BMG (②); Reservoir (②); Position Music (② — sync-forward); Third Side Music (② — CA, electronic/indie specialty); peermusic (③); Sentric/Believe (③); Songtrust (③ — admin only; derivative authority usually absent — diligence flag); Downtown/UMPG-adjacent desks (③ — UMG-owned now). *Publishing control varies per track; every deal needs §14 split verification.* ⚖

**Remix/DJ/fan communities (10):** SKIO (① — contest partner, 650K producers); Monstercat/CMG community (② — 13M+ audience); r/mashups + r/EDMproduction (① — recruitment, size unverified); DJcity (③ — pro DJs); Digital DJ Tips (③); EDM.com "The Drop" (③); Hypeddit (② — bootleg-culture creators to convert to legal supply/demand); BandLab community (③ — creator recruitment); Audius (③ — remix-contest natives); Discords of pilot artists (① — the actual beachhead venue).

**Rights-tech / stem partners (5):** AudioShake (label-approved separation when a licensor requires it); Music AI/Moises (enterprise stems + fingerprint marketplace pricing); Audible Magic (UGC content-ID rail); Pex/Vobile (ID + licensing-support; sped-up-robust matching); bushido (pre-cleared derivative-licensing exchange — both supply channel and Stage-3 plumbing candidate).

---

# 32. Outreach and interview materials

Positioning rule for every message: a **controlled fan-participation experiment** — never promise virality, revenue, or that any rights are pre-cleared; never imply other artists' participation without consent to name them.

**Artist-direct email (v1):**
> Subject: Let your fans legally remix [Artist] — 90-day pilot, you keep control
> Hi [name] — I run Mashups, a small app where fans pick two songs and get three genuinely listenable mashups they can publish inside the app only — no downloads, no TikTok leakage, every play credited and reported to you. We're inviting ~15 artists who own their masters and publishing to a 90-day pilot: you pick the tracks, set what they can be paired with, see a monthly report of everything fans made, and can pull anything with one click. No cost, no exclusivity, revenue share from the first dollar if we monetize. Worth a 20-minute call to see the prototype with your stems? — [sig]

**Boutique-label email:** same skeleton, plus: "We verify chain-of-title per track (splits, samples, featured performers) before anything goes live, and we'd start with a scoped drop — one release, one remix challenge, prize funded by us — before any catalog conversation."

**Publisher/administrator inquiry:** "We're building an opt-in pilot where compositions are remixed only inside a closed app with per-track consent, full reporting, and a 50/50 recording:composition convention modeled on the NMPA's 2026 template approach. For writers you administer who also control their masters, what would you need to see to approve participation for named works?" ⚖

**Distributor partnership inquiry:** "Too Lost and Symphonic have shown distributor opt-in programs work for licensed creation apps. We're earlier — one scene, in-app only — and want to design the opt-in flow with a partner from the start: per-artist consent, DDEX-friendly reporting, withdrawal SLA. Who owns new-partnerships evaluation on your side?"

**Artist-manager message (short):** "Licensed fan-remix pilot, in-app only, artist keeps veto + takedown, monthly per-track reporting, zero cost. 15 slots. Can I send the one-page term sheet?"

**Fan/creator recruitment (Discord/community post):** "We're letting [Artist]'s fans legally mash [Artist]'s tracks — pick two songs, get three mashups, publish, battle, fork. Free during the pilot. First 200 get early access + a badge. [link]" (Posted only with the artist's/mod's consent.)

**Product interview invite + guide (consumer):** invite offers $25 incentive, 30 min. Guide (7 questions): last thing you made and shared (anything); walk me through making a mashup now (observe, don't help); what would you do with this result; what two songs would you try first (capture); what would make you come back Thursday; would you pay, and for what specifically; who do you know who'd love this.

**Artist interview guide:** how do you think about fan edits/bootlegs of your work today; what would make you proud vs embarrassed here; which tracks would you never include; what reporting matters; what would make you post a fan's mashup on your own channels (the activation question); what's a dealbreaker.

**Label interview guide:** who must sign off (master, publishing, artist approval customs); how do you evaluate new-platform risk; what happened last time you licensed something experimental; what reporting format do you need; what would renewal depend on.

**Chain-of-title interview questions (per track, §14):** who recorded/produced and under what agreement; all writers + splits + publishers/administrators; any samples/interpolations (incl. "inspired by" replays); featured performers and their agreements; prior label/distribution deals touching this recording; existing Content ID registrations; any sync exclusivities or AI-processing restrictions in upstream deals.

**Objection handling (top 5):** "Fans will make things I hate" → pairing controls + 48h flag takedown + non-derogatory rule; honest answer: control is at the track level, not the mashup level. "What does it pay?" → honest: promotion + data now, rev-share from first monetized dollar, prizes we fund; we won't inflate projections. "Why not wait for Spotify's tool?" → theirs is single-source covers/remixes inside their app; this is your superfans combining *your* catalog, with you in control, now. "Is this AI training on my music?" → no; expressly excluded in the license; processing is stems/analysis only. "What if I want out?" → one click; new creations stop instantly; you chose sunset-or-freeze for existing ones at signing.

**Pilot follow-up sequence:** D+2 value recap + term sheet; D+9 prototype video with *their* track (with permission) + one relevant proof point; D+21 pilot-cohort social proof + scarcity (slots); D+35 graceful close ("keeping your slot open until [date]; door stays open").

---

# 33. Product metrics and experiments

**Event model (implement in Stage 0; all targets are hypotheses, not industry facts):** catalog_impression, track_preview, track_select, pair_submitted, compat_result(score, gated?), arrangement_generated(template, latency), first_listen(t_from_pair), arrangement_switch, edit_applied(type), creation_completed, save, publish, share_link_created, share_link_opened(referrer), external_video_export (Stage 2), fork_start, fork_completed, follow, reaction, return_session(d1/d7/d30), sub_start, sub_cancel, claim_received, takedown_executed. Plus artist-side: artist_repost, artist_flag, artist_withdrawal.

| Metric | Hypothesis target | Decision it controls |
|---|---|---|
| Activation (signup → first completed creation) | ≥35% | Onboarding + engine latency investment |
| Time to first listen | ≤60s from pair choice | The "delight in minutes" claim — engine latency budget |
| Creation completion (started → published/saved) | ≥50% | Arrangement quality + editor scope |
| Best-of-three share intent (E4/E5) | ≥25% intent; ≥10% actual link shares | Whether the walled garden can grow (§2 gate) |
| **W4 repeat creation** (≥1 creation in week 4 per activated creator) | **≥15% GO / 8–15% extend / <8% fail** | **The habit question — the company's central gate** |
| D1/D7/D30 return | 40/20/10% | Feed/battle investment |
| Fork rate (per published mashup, 30d) | ≥5% | Whether lineage earns a consumer surface (§18) |
| Link CTR (share_link_opened / created) | ≥8%, visitor→signup ≥20% | Virality mechanics priority |
| Artist-push conversion | ≥2K registrations per mid-size activation | Stage-1 viability (the load-bearing assumption) |
| Sub conversion (soft $4.99) | 1.5–3% of registered | §27 model validity |
| Claim/takedown rate | <0.5% of published; 100% within SLA | Licensing renewals + Stage-3 evidence pack |
| Pair-search "miss" rate (wanted track absent) | Tracked, no target | **Licensing priority queue — the demand telemetry** |

**The five committed experiments (E1–E5) + five follow-ons (E6–E10), mapped to the ten required questions:** E1 repeat-creation cohort (Q: habit) — Stage 0, cost ≈ instrumentation only, highest information value. E2 recognizability lift (Q1) — owned vs. licensed-recognizable subset once ≥5 artists signed; measure activation/completion/share deltas; if recognizable lift <20% relative, the whole "must have famous music" assumption weakens (cheap, decisive). E3 listener→creator funnel (Q: do consumers create) — feed-first cohort; measure crossover ≥5%. E4 three-vs-one arrangements (Q3) — randomized single-arrangement arm; measure completion + satisfaction delta; kills or keeps a core cost. E5 share/fork mechanics (Q4/Q5) — link cards vs tree-cards vs fork-notifications; measure K components. E6 challenges (Q6): battle cadence on/off per cohort. E7 artist activation (Q7): one artist push, measure conversion + retention of arrivals. E8 controlled video export (Q8, Stage 2 only). E9 price/packaging (Q9): $4.99 vs credits vs free at Stage-1 end (expect ~1.7% baseline). E10 pairing-permission variants with artists (Q10): open-with-blocklist vs category-fenced — measure artist acceptance in real term-sheet conversations, not surveys.

---

# 34. Legal and operational risk register

Scale: L/M/H. Owner abbreviations: CEO, Eng, Legal (fractional counsel), Ops. Stage = when it becomes material.

| Risk | L | S | Leading indicator | Preventive / detective control | Response | Stage |
|---|---|---|---|---|---|---|
| Missing master authority (false one-stop rep) | M | H | Passport exception; distributor mismatch | §14 evidence hierarchy; fingerprint screen / claim received | Freeze track + subtree; indemnity; post-mortem the intake gap | 1 |
| Missing composition authority (unlisted co-writer/publisher) | **H** | H | PRO/MLC registry mismatch | Split sheets + registry concordance; joinders / publisher inquiry letters | Same as above; renegotiate or remove | 1 |
| Undisclosed samples/interpolations | M | H | Fingerprint hit at intake / later claim | Intake screen + reps / Audible Magic-class rescan cadence | Takedown subtree; clawback vs licensor per §15 | 1 |
| Featured-artist/producer approval rights surface late | M | M-H | Artist mentions "my producer" in diligence | §14 participant reps ⚖ / complaint monitoring | Pause track; obtain consent or remove | 1 |
| Fork-clause unenforceability in some jurisdiction | L-M | M | Counsel flag; first dispute | Conservative drafting ⚖; territory scoping / dispute log | Amend template; grandfather nodes read-only | 2–3 |
| AI-authorship gap (users own nothing; someone claims otherwise) | M | L-M | User asserts ownership publicly | ToS clarity; edit-logging; "credits not copyright" framing / support tickets | Point to ToS + ledger record | 1 |
| Withdrawal cascades anger users | M | M | First artist withdrawal | Election disclosed at signing; user-facing state badges / sentiment monitoring | Notice + grace period + badge; never silent deletion | 1 |
| Content ID collision on Stage-2 exports | M | H | Export mute/claim rate >1% | Allow-list registration before launch; watermark + metadata / weekly claim reconciliation | Pause export per catalog segment; fix registration | 2 |
| Cross-territory leakage (VPN access to ungranted territory) | M | L-M | Geo-anomaly in plays | Geo-scoping by passport; standard geofencing / logs | Commercially reasonable efforts clause ⚖ | 1 |
| Platform API dependence (TikTok/Meta/SoundCloud posture change) | M | M | Partner-policy updates | Multi-platform export design; links-first virality / policy watch | Re-route growth to links + battles | 2 |
| Rights-vendor dependence (separation/fingerprint vendor terms shift) | L-M | M | Pricing/terms notice | Two-vendor capability (open Demucs + commercial) / contract alerts | Swap vendor; passports record processor per track | 1 |
| Derogatory-combination incident harms artist trust | M | H | Artist flag; social blowup | Pairing rules; lyric screening; non-derogatory policy / artist dashboard | 4h emergency takedown; personal outreach; post-mortem to all artists | 1 |
| Hate/extremist/sexual misuse incl. minors' safety | L-M | **H** | Moderation queue signals | §24 layers; no DMs; 13+/18+ gates / classifier + human review | Remove + ban + report (NCMEC where applicable) ⚖ | 0 |
| False DMCA / malicious claims vs catalog | M | M | Claim spike pattern | Evidence-required intake except verified rightsholders / claim log | Counter-notice support; §512(f) posture ⚖ | 1 |
| Fraudulent plays / bot forks / reward gaming | M | M (H if cash rewards) | Velocity + graph anomalies | No cash at launch; device checks; delayed payouts / anomaly detection | Void rewards; ban; tighten thresholds | 2–3 |
| Weak consumer retention (the central bet) | **H** | **H** | W4 repeat <8% | E1–E7 program; battles; artist cadence / cohort dashboards | Execute §2 pivot tree — do not "one more feature" past the gate | 0–1 |
| Artist pushes don't convert (organic engine fails) | M-H | H | <1K registrations per push ×2 | Creative formats per artist; fan-pass tests / per-push attribution | Re-target beachhead or pivot to §36-C | 1 |
| MG exposure stacks before demand proof | M | H | Deal pipeline pressure | $0-advance rule Stage ≤2; §27 stress test per deal / deal-desk review | Walk away; publish the discipline to investors | 3 |
| Licensing cycle time balloons (custom-agency drift) | M | M | Median cycle >45 days; terms variance ↑ | Standard §15 template; no bespoke under 20 tracks / pipeline metrics | Drop outliers; revisit at next stage | 1–3 |
| Incumbent copies the wedge (Spotify adds mashups; Hook adds arrangements) | M | M-H | Product announcements | Speed on ranking-data + community moats (§28) / competitive watch | Differentiate deeper (forks, neutrality, scene depth); consider partnership | 2–4 |
| Key-person/counsel gap on novel clauses | M | M | Template questions unresolved >30d | Fractional specialist counsel retained early ⚖ | Escalate to specialist firm | 0 |
| Payments/tax/minors compliance on rewards | L-M | M | First cash payout planned | No cash until §19 conditions; then 1099/DAC7 tooling ⚖ | Delay cash; prizes-in-kind | 2–3 |
| App-store economics shift (SCOTUS on link-out) | M | M | Ruling news (term starts Oct 2026) | Web-first billing; store IAP as secondary / legal watch | Reprice per §27 payment scenarios | 1–3 |
| Insurance gap (music E&O) | M | M | First licensed track live | Bind media-liability/E&O before Stage 1 ⚖ / annual review | Scale coverage with catalog | 1 |
| Residual: even with all controls, a licensed catalog can shrink overnight (withdrawals) and a viral moment can outrun moderation | — | — | — | Accept + disclose to investors/artists; design for graceful degradation | — | All |

---

# 35. Red-team case (Workstream 30)

| # | Attack | Label | Cheapest resolving experiment |
|---|---|---|---|
| R1 | Creation is a novelty, not a habit (Rave.dj decay; no retention data anywhere) | **Potentially fatal — the central risk** | Stage-0 W4 repeat-creation cohort metric (E1); pre-registered gate |
| R2 | People want to *hear* mashups, not make them (43M views for DJ Earworm; ~109 ratings for Hook) | Potentially fatal, partially mitigable (listener→creator funnel) | Feed-first test: measure listener→creator conversion (E3) |
| R3 | Unknown music can't attract users (catalog is the product) | **Testable, the Stage-0/1 crux** | Recognizability A/B: owned tracks vs. licensed recognizable pairs (E2); search-first landing page capturing wanted pairs |
| R4 | Recognizable music is unaffordable for a startup | Mitigable in sequence (artist-direct → boutique → distributor opt-in are all precedented); majors genuinely may be | Run the §31 catalog ladder; the Too Lost/Symphonic-style opt-in conversation costs one meeting |
| R5 | Hook/MashApp already solve it | Unlikely (both under-penetrated; neither does auto-arrangements or forks; MashApp silent) — but their *struggle* is the real warning | Competitive tracking + differentiation test in E2 |
| R6 | Spotify eliminates the opportunity | Mitigable/unknown: its announced scope is single-source covers/remixes, paid add-on, unlaunched, Sony/WMG absent; two-song mashups + fork community unclaimed | Monitor; differentiation = cross-song + community + creator rewards |
| R7 | The best viral outputs can't be licensed for sharing (export is the red line) | Mitigable: Hook proved watermarked short-form export and SoundCloud publishing are grantable; full audio export stays dead | Phase-2 addendum ask with 2–3 pilot artists |
| R8 | A walled garden can't grow | Mitigable: link-shares grew MashApp not at all — but MashApp also had no social loop; battles/forks/artist reposts are untested in a walled garden at this quality level | E4/E6: measure link-driven signup rate; artist-repost reach |
| R9 | Auto-mashups rarely sound good | Testable now, entirely in current control | §20 listening test with pre-registered gates |
| R10 | Separation artifacts unacceptable | Mitigable: artist-direct stems at intake sidestep it; separation is fallback | Stem-intake rate in pilot; artifact scores in listening test |
| R11 | Rightsholders won't allow open cross-pairing | Mitigable: default-open-with-blocklist is how contests work; some artists will decline — acceptable | Term-sheet conversations with 10 artists; measure pairing-control asks |
| R12 | Remix trees = legal complexity > consumer value | Mitigable: ship ledger-only; visualization is optional (§18) | E5: tree-card share test |
| R13 | Creator royalty promises are legally weak / economically trivial | **True as stated — concede it** | Don't promise royalties; status+prizes at launch (§19); silent ledger pilot |
| R14 | Rights ops prevent software margins | Partially true structurally (content share caps gross margin on licensed plays); platform can still be software-margin on subscriptions if content pool is per-use only | §26/27 economics; pilot licenses with $0 MG |
| R15 | Company becomes a custom licensing agency | Mitigable by discipline: standardized term sheet, no bespoke deals under N tracks, walk-away rules | Track deal-cycle time + terms variance in Stage 1 |
| R16 | Majors demand unaffordable advances | Likely true for years — plan assumes it (majors are Stage 4, optional) | None needed; sequencing handles it |
| R17 | Artist-direct catalogs lack recognition → no pull | The binding constraint on Stage 1; partially offset by superfan targeting (artist brings fans) | E7: artist-activation test — does an artist push convert their fans? |
| R18 | Platforms mute exports despite permission (allow-listing fails) | Mitigable: allow-list registration before export launch; test with own catalog first | Content ID dry run with owned tracks |
| R19 | The value belongs inside Spotify/TikTok/label apps, not a standalone destination | Unknown, the venture-thesis risk; the counter is community + cross-catalog neutrality (no single label's app can host other labels' pairings as neutrally) | Only resolved by Stage 1-2 traction |

**Strongest single case against:** R1+R2+R3 compound — the cleanest licensed tests of this exact thesis (Hook, MashApp) have not found mass creation demand, and the observed equilibrium of the adjacent behavior (sped-up culture) was *labels industrializing consumption*. If Stage-0/1 metrics look like Hook's footprint, the consumer thesis should be declared false and the company should pivot to §36 alternatives or stop.

---

# 36. Strategic alternatives (Workstream 31)

| Alternative | Consumer value | Rights difficulty | Time to market | Capital | Competition | Margin | Virality | Defensibility | Name/domain fit | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| A. Consumer mashups, owned music only | Medium (no recognition) | None | Now (exists) | Minimal | Rave.dj/Fadr free | High | Medium | Low | Perfect | **Stage 0 — do it, but only as validation** |
| B. Artist-direct fan remix platform | Medium-high for superfans | Low-medium (one-stop) | 60–90 days | Low | Hook (indie-heavy) | High until scale | Medium (artist-driven) | Community-dependent | Perfect | **Stage 1 — the recommended thesis** |
| C. White-label remix experiences for artists/labels (campaign tool) | Indirect | Low-medium per campaign | 90 days | Low | SKIO, agencies | High (services+SaaS) | N/A | Relationship moat | Good | **Parallel revenue + supply channel; also the honest pivot if B2C demand fails** |
| D. B2B remix-rights/passport + derivative-accounting infrastructure | None direct | Medium (standards work) | 6–12 mo | Medium | bushido (boutique), ClearBeats, Pex adjacency | SaaS margins | None | Strong if adopted; adoption risk high | Weak fit | **Pivot candidate #2; credible only after operating proof from B** |
| E. Sample-clearance marketplace | Producer-only | High (Tracklib fought this for a decade) | Long | High | Tracklib incumbent | Thin | None | Low | Medium | No |
| F. AI mashup engine licensed to other platforms (API) | None direct | Low (tech only) | 6 mo | Low-medium | AudioShake adjacency, open models | Good if adopted | None | Model+data | Medium | Optional later monetization of the engine; not a company yet |
| G. DJ ideation tool (pro/prosumer) | Niche | Low (works on user files) | Now | Low | DJ.Studio, Mixed In Key, Serato | Medium | Low | Low | Medium | No — crowded, small, off-thesis |
| H. Social-video soundtrack generator (commissioned music) | Medium | None (owned) | 90 days | Medium | Epidemic/Artlist adjacency | Medium | Medium | Low | Medium | No — collides with production-library giants |
| I. Remix-challenge platform only (no open creation) | Medium, campaign-shaped | Low (contest licenses) | 60 days | Low | SKIO (producer-aimed) | Services-like | Campaign spikes | Low-medium | Good | Fold into B as the activation engine, not standalone |
| J. Music-discovery feed from user combinations | Medium | Inherits B's rights | With B | Low incremental | None direct | — | Medium | Data moat | Good | Feature of B, not a company |

**Consumer app vs. demonstration layer:** run B as the company; treat C as immediate revenue and licensing-relationship builder; keep D explicitly named as the pivot (the ledger/passport built for B *is* D's product; nothing is wasted). Decide at the Stage-2 gate: if consumer retention clears bars → consumer network is the company; if licensing traction outruns consumer traction → C/D become the company. This is a genuine fork, stated as such, resolved by evidence — not blended.

---

# 37. 90-day execution plan

**Days 0–30 — engine + instrumentation.** Objective: make the core magical and measurable. Consumer hypothesis: three structure-aware arrangements beat presets enough to share. Rights hypothesis: none (owned catalog only). Deliverables: arrangement engine v2 (structure segmentation, §21 templates 1–4, pair gating, server render + loudness); §33 event model live; commissioned-vocal briefs out (10–15 acapellas); §15 term sheet to counsel ⚖; listening-test protocol ready. Catalog: 20–30 owned tracks, ≥40% vocal-paired. Users: 200–500 invited testers. Budget: engineering time + ≤$15K (vocals, counsel start). Prohibited: any licensed ingestion, any export promises. Exit: engine passes internal bar; instrumentation verified. Kill: none yet (build phase).

**Days 31–60 — listening test + demand probes.** Objective: pass the §20 gates and read first behavior. Deliverables: blind listening test (n≥25/round, 2 rounds); E1 cohort running; E4 three-vs-one arm; battles v1; share-link cards; pair-search miss-capture on the landing page ("what two songs would you mash?" — licensing telemetry). Partner motion: 15 artist-direct conversations opened (§32), zero signatures needed yet. Users: 1–3K. Budget: ~$10K (test incentives, tooling). Exit: listening gates passed; ≥8 artist conversations in progress with the term sheet reviewed. Kill trigger armed: two failed engine iterations → stop per §40.

**Days 61–90 — pilot signatures + gate review.** Objective: convert conversations and judge. Deliverables: ≥5 signed artists (target beachhead cluster); passports live for their tracks; first artist-scoped drop + battle; E2 recognizability probe on the signed subset; W4 repeat data from E1. Users: 3–10K if an artist push lands. Budget: ~$25K (prizes, activation, counsel completion). Day-90 gate review against §2 table → GO / CONDITIONAL / PIVOT / STOP, written up with the metrics attached.

---

# 38. 24-month roadmap

| Phase | Objective | Rights scope | Catalog | Users (modeled) | Key metrics gates | Budget (modeled) | Prohibited | Kill |
|---|---|---|---|---|---|---|---|---|
| M0–3 (=§37) | Prove quality + habit signal + signability | Owned + §15 pilots | 20–40 owned + 5 artists | 1–10K | §2 gates | ≤$75K | Licensed export; royalties promises | §40 A-C |
| M4–6 | Stage 1 full: 15–30 artists, battles cadence, fan-pass test, statements shipping | §15 at scale | 60–150 tracks | 25–75K | Artist-push ≥2K ×2; W4 ≥15%; claims 0 unresolved | $150–250K | Off-platform posting; ads | Artist conversion <20%; repeat <8% |
| M7–12 | Stage 2: watermarked clip export to 1–2 platforms, allow-listing ops, soft paywall $4.99, first boutique label + CMG/EMPIRE talks | Phase-2 addendum | 150–400 | 150–400K | Export lifts K ≥0.15; conv ≥1.5%; renewal ≥80% | $400–700K | DSP releases; full-length export | Export K-lift <0.05; renewals <50% |
| M13–18 | Stage 3 entry: 3–5 boutique labels, 1 distributor opt-in program design, ranking-data flywheel visible, sponsorship engine repeatable | Label agreements, small MGs | 1,000+ | 0.5–1M | W4 blended ≥12%; sponsorship repeat ≥50%; GM ≥45% | $700K–1.2M | Major-label dependence | MG stack → GM <35% |
| M19–24 | Scale Stage 3; Merlin conversation with evidence pack; Stage-4 optionality assessed against §27 stress case; B2B (§36-C/D) revenue line formalized if pull exists | Distributor program live | 2,000–5,000 | 1–1.5M | §27 base-case track | per raise | Blockchain; ads still off | Stage-4 terms breach stress case → decline majors, stay indie |

---

# 39. Capital and hiring requirements

**Capital (modeled):** the 90-day experiment runs on current resources + ≤$75K discretionary (counsel template $25–40K ⚖, commissioned vocals $10–20K, listening-test incentives ~$3K, tooling ~$5K). A committed Stage 1→2 (post-gate GO) needs **$1.5–2.5M for ~18 months**: ~55% payroll (6–8 people by month 12), ~15% artist/creator programs (prizes, commissioning, activations), ~10% legal/rights ops, ~10% infra/tools, ~10% reserve. Stage 3 (distributor/Merlin tier) is a separate raise gated on Stage-2 evidence ($3–6M, MG capacity being the driver). Numbers are planning models, not quotes.

**12-month hiring plan (post-gate; sequenced):**

| When | Role | Why |
|---|---|---|
| Now (contract) | Music-licensing counsel (fractional) ⚖ | §15 template, fork clause, moral-rights protocol |
| M0–1 | Founding MIR/audio engineer | The arrangement engine is the product |
| M0–1 | Full-stack product engineer | Passport, ledger, social loop on existing stack |
| M2 | Artist partnerships lead (scene-native) | Stage-1 supply is a relationship business |
| M3 | Designer (product/brand, part-time→full) | "Feels like play" is a design bar |
| M4–6 | Community/ops (moderation + artist support) | §23/§24 operating loop |
| M6–9 | Second product engineer | Phase-2 export + allow-listing plumbing |
| M9–12 | Data/growth analyst | §33 event model → decisions; ranking dataset |
| Deferred until Stage 3 | Rights-ops manager; BD for distributors; finance | Premature before catalog scale |

---

# 40. Kill criteria (consolidated, pre-registered)

**Kill the consumer thesis** (→ §36-C/D pivot or stop) if any of: (A) arrangement quality fails §20 gates after two engine iterations; (B) W4 repeat creation <5% (Stage 0) or <8% (Stage 1 after ≥2 real artist pushes); (C) artist-direct conversion <20% of ≤15 well-targeted asks, or signable only with per-pairing approval; (D) two consecutive artist activations convert <1K registrations each with creative variations tried; (E) share mechanics: link CTR <4% and K-components flat after 3 mechanic iterations. **Kill a stage, not the company** if: export claim chaos (>5% muted post-allow-listing) → retreat to links; MG stack breaches GM 35% → stay at prior tier. **Stop entirely** if consumer thesis killed AND ≤2 paying B2B/white-label engagements materialize within 2 quarters of the pivot — that combination means neither side of the market wants it. **Never trade past a kill:** the gates are written down now precisely because post-hoc rationalization ("one more feature") is this category's documented failure mode (Rave.dj's 8-year drift; MashApp's silence).

---

# 41. Final answers

1. **Continue?** Yes — as a 90-day gated experiment (§2), not an open-ended commitment.
2. **One sentence:** the place where an artist's real fans legally play with the artist's real music — two tracks in, three good mashups out, published, battled, and forked inside a rights-safe garden that credits and can pay everyone.
3. **First real user:** the superfan/scene member of a beachhead bass-music artist (secondarily the meme-making short-form creator).
4. **First repeatable JTBD:** "participate in my artist's release by making and battling mashups of it" — weekly challenge cadence, not daily tool use.
5. **Recognizable music required for validation?** No — quality, loop, and habit validate on owned+artist-direct catalog; recognizability lift is measured (E2), not assumed.
6. **Recognizable music realistic eventually?** Yes at indie tier (proven paths: artist-direct, Too Lost/Symphonic-style opt-ins, CMG/EMPIRE desks, Merlin precedent ×3); majors possible but slow (MashApp: ~4 years) and economically dangerous (§26).
7. **First music obtainable:** owned + commissioned vocals, mobygratis-style goodwill catalog, then the §31 artist cluster (Cyclops/Ophelia/WAKAAN/Night Bass et al.).
8. **Exact first scene:** North American bass music (dubstep/melodic bass flip culture) — US/Canada, Discord-organized, label-owner artists — with house/tech-house fast-follow.
9. **Smallest signable rights package:** §15 — non-exclusive in-app-only master+composition grant with stems/analysis consent, pairing controls, fork clause, takedown/withdrawal, rev-share-only, no advances.
10. **Behaviors disabled initially:** standalone audio export of licensed tracks; any off-platform posting; sync-to-video export; DSP distribution; ads/brand use; cash royalties to creators; branch merging; AI training (permanently, absent express consent).
11. **Best sharing format:** rich playable link cards (in-garden playback) at launch; watermarked ≤60s video export to named platforms as the negotiated Stage-2 unlock.
12. **Standalone audio export?** Only for owned/commissioned tracks (free-tier superpower); never for licensed catalog absent an explicit grant nobody currently gives.
13. **Social video export?** Yes — as the Stage-2 licensed addendum (Hook proves grantable), watermarked, ≤60s, named platforms, allow-listed.
14. **Paid advertising?** No. Individually licensed campaign work only, ever (§9 scenario 14).
15. **Forking at launch?** Yes, in-garden, under the §15 fork clause — it is the differentiator; ledger from day one, visualization behind an experiment.
16. **Creator royalties at launch?** No. Attribution + status + funded prizes; silent accrual ledger; cash only after monetization, fraud controls, and a de-minimis floor (§19).
17. **Multi-generational cascade sensible?** As accounting, yes (ledger cost is trivial); as cash, not initially — depth-diluted payouts are pennies and the promise creates legal/tax overhead before value (§19). Pilot the math silently.
18. **Remix tree: value or complexity?** Both — rights value is proven by every 2025–26 deal's provenance demands; consumer value is unproven → ship as infrastructure, test as UI (§18).
19. **Different from Hook/MashApp:** musical intelligence (three structure-aware full arrangements vs clips/manual blending), fork lineage + creator economics, scene-community depth, and a rights ledger built for the next licensing tier — not catalog size, not export freedom.
20. **What stops Spotify?** Nothing stops them from single-source remixing at scale; the defensible ground is two-song combination across a *neutral* multi-rightsholder catalog, scene community with status stakes, and the compatibility/ranking dataset — plus their announced scope excludes mashups and Sony/WMG aren't in it (§8). Speed matters.
21. **Audio-quality threshold:** §20 — best-of-three rated ≥4/5 by a majority on ≥70% of gated pairs; ≥40% share-willingness; beats naive baseline ≥80% of pairs; "not embarrassing on TikTok" loudness/artifact norms.
22. **Build/buy/postpone:** build arrangement engine, passport, ledger; buy separation, fingerprinting, payments, transcription; postpone Android, embeds API, white-label, recommendations-ML, all blockchain (§22).
23. **Manual in pilot:** rights intake/verification, stem QA listening, moderation edge cases, artist support, takedowns, statement assembly (§23).
24. **Who pays first?** Sponsors/labels via funded challenges; consumers via a *soft* $4.99 tier measured (not relied on); artists never.
25. **First paid offer:** $4.99/mo — longer mixes, more generations, badge/status, early catalog drops; **not** export, **not** the share moment (MashApp's documented mistake).
26. **Realistic margins:** ~90% owned-catalog stage; 70–85% artist-direct; 55–70% boutique; 45–60% distributor-tier; 25–45% majors-tier — software-like only while rev-share-only deals hold (§27).
27. **Proof unlocking boutiques:** 5+ artist pilots with statements, ≥1 activation >2K conversions, zero unresolved claims, 48h-takedown record, W4 ≥15%.
28. **Proof unlocking distributors/Merlin:** Stage-2 evidence — 150K+ registered, retention holding, allow-listing working (≥95% auto-resolution), audit-clean quarterly statements, sponsorship repeat rate.
29. **Proof for majors:** Stage-3 scale + a two-year clean-claims record + per-use accounting demonstrably accurate + economics that survive a 75% content pool with minima — and the discipline to decline if they don't (§27A-E).
30. **Next 30 days:** the §37 build block — engine v2, instrumentation, vocal commissions, counsel on the template, nothing licensed touched.
31. **Next 90 days:** the full §37 plan — listening gates, E1–E4, 15 artist conversations, ≥5 signatures, day-90 gate review.
32. **Explicitly not build:** audio export for licensed tracks, DSP delivery, ads system, blockchain anything, Android, per-pairing approval workflows, cash-royalty rails, majors-dependent features, generative-AI music models.
33. **Most dangerous false assumption:** "people who love mashups want to *make* mashups" — the consumption-creation gap is the graveyard's common headstone (§6, §35 R1–R3).
34. **Strongest defensible wedge:** licensed two-song combination done *well* (arrangement intelligence) inside one passionate scene, compounding into the pairing/ranking dataset and fork-ledger no incumbent has.
35. **Strongest reason not to build:** the cleanest licensed tests of this thesis (Hook, MashApp) have not found mass creation demand despite majors' blessing and venture funding — and nothing in hand proves Mashups' variant escapes that gravity yet.
36. **Classification today:** a focused-niche consumer product with a credible B2B pivot — **not yet** venture-scale on evidence; venture-scale becomes arguable only if E1/E7 show habit + artist-driven acquisition compounding (then the §27 upside case applies).
37. **Evidence that would change the classification:** W4 repeat ≥20% sustained two months; ≥2 artist activations converting >5K each; K ≥0.5 on link mechanics; sponsorship pipeline repeating without founder sales. Conversely: Hook-like footprint after honest Stage-1 → niche-product-at-best confirmed.
38. **Pivot conditions:** §40 A–E with supply-side pull intact → §36-C (white-label artist campaigns) or §36-D (rights-passport/derivative-accounting infrastructure), both pre-named and built-toward by the pilot's own artifacts.
39. **Shutdown conditions:** consumer kill + B2B pull absent (≤2 paying engagements within 2 quarters of pivot) — or a legal/regulatory shift making even opt-in derivative licensing untenable (none on any horizon examined).
40. **Single best next action:** commission the vocals and start the arrangement-engine sprint this week — every other decision in this document waits on the §20 listening gates, and that path is entirely within current control, costs almost nothing, and requires no one's permission.

---

# 42. Source appendix

~110 sources cited across this document and its research streams; every load-bearing claim carries its source inline. Primary sources (P) include: 17 U.S.C. §§102–115 (Cornell LII); *AWF v. Goldsmith* 598 U.S. 508; CJEU C-590/23 judgment (Grand Chamber, 14 Apr 2026; Courthouse News-hosted PDF) and C-476/17; UrhDaG official EN translation (gesetze-im-internet.de); CDPA s.30A and *Shazam v Only Fools* [2022] EWHC 1379 (National Archives); Canada Copyright Act s.29.21 (Justice Laws); Australia Copyright Act ss 41/41A + ALRC IP-42; Japan Copyright Act (official EN translation); Lei 9.610/98 and LFDA (WIPO Lex); US Copyright Office AI Part 2 (Jan 2025); EU AI Act Art. 50; Spotify Newsroom (2026-05-21 UMG; 2026-08-04 Merlin); PR Newswire (UMG–Udio Oct 2025; WMG–Udio Nov 2025; Hook–Too Lost; Dubset–Spotify May 2016); Downtown Music (Hook partnership); PRWeb (Hook–SoundCloud Jul 2025); App Store listings (Hook id6476193312; MashApp id6475177484); platform terms/help (TikTok CML terms; Meta Music Guidelines & Sound Collection; YouTube Creator Music restrictions; Snap Music Guidelines; Twitch DJ Program blog + terms; SoundCloud upload/monetization help; Spotify Developer Policy; Apple MusicKit docs); Tracklib support (remix-vs-sample articles) and pricing; Monstercat Gold page; mobygratis license; NCS usage policy; Epidemic/Artlist/Uppbeat license pages; BandLab ToS + forking explainer; bushido.is + AudioShake–bushido release; DDEX fee schedule; Cloudflare R2 pricing; Vercel pricing; Stripe pricing; RevenueCat State of Subscription Apps 2025/2026; Spotify SEC filings (Q4'25/Q1'26 gross margin); Loud & Clear; 9th Cir. Epic v. Apple opinion (Dec 2025). Key secondary (S): MBW, Billboard/Billboard Pro, Music Ally, TechCrunch, Variety, DMN, MusicTech, Music Week, Record of the Day, Rolling Stone, Deloitte Digital Media Trends 2025/2026, MIDiA, Business of Apps CPI research, Vantage (AWS pricing mirror), Social Blade, ISMIR/AAAI/arXiv MIR literature (AutoMashUpper; stem-compatibility; Stem-JEPA). Access dates: all 2026-08-08 (round 2) or 2026-08-08 round-1 stream (companion document). Egress-blocked pages verified via multiple independent snippet corroborations are flagged in-line and in §43.

---

# 43. Fact and inference ledger (the load-bearing items)

**Verified facts (P or multi-S):** MashApp all-majors+publishing launch (Feb 18, 2025); Hook's in-app "1M songs/18K artists" and two-song mashup feature (own listing); Hook clip export + SoundCloud lane (Jul 2025); Spotify×UMG (May 21, 2026) and ×Merlin (Aug 4, 2026), opt-in, paid add-on, unlaunched, single-source scope as announced; Pelham II holding (Apr 14, 2026); UMG/WMG–Udio and WMG–Suno settlements (Oct–Nov 2025), platforms unlaunched; Sony unsettled; ElevenMusic live (Apr 29, 2026); Dubset arc incl. Spotify-2016 correction; Pex→Vobile (Apr 2025); Story pivot away from music; Tracklib sampling≠remix rule; production libraries exclude remixes; Monstercat Gold excludes remixing; CMG owns Monstercat+mau5trap; EMPIRE owns Dirtybird; Twitch DJ ≈30% revenue to rights live-only; platform-license boundaries per §10; cost inputs per §27.
**Inferences (labeled):** MashApp's silence ⇒ weak traction (absence-based); Hook's rating count ⇒ small installed base (proxy-based); consumption-creation gap ⇒ creation is superfan-niche (pattern across cases); walled-garden necessity (100% of observed deals, zero counterexamples); artist-repost acquisition viability (untested — the pilot's load-bearing bet); electronic one-stop density (structural evidence, per-artist verification still required); every § 26–27 number (modeled); "no collective scheme licenses derivatives anywhere" (well-supported negative).

---

# 44. Assumption ledger (things this document treats as true without direct proof — each has a §33/§37 test or a diligence step)

1. Artist pushes can acquire users at material scale (E7). 2. The §20 quality bar is reachable by a small team in ≤2 iterations (listening test). 3. One-stop status of §31 prospects survives §14 verification (per-track diligence). 4. Beachhead fans' Discord culture converts to app usage (Stage-1 activation data). 5. The fork clause is drafttable and signable ⚖ (counsel + first 15 asks). 6. Rev-share-only pilots are acceptable to working artists (term-sheet conversations). 7. Allow-listing workflows will be available to a licensed startup at Stage 2 (platform partner conversations; Hook precedent). 8. R2-class zero-egress delivery remains priced as published at scale (contract review). 9. ~1.7%/13% conversion/churn benchmarks transfer to this category (E9). 10. No adverse ruling shifts the US licensing baseline mid-plan (monitor; §34).

---

# 45. Open-question ledger (unresolved; owners assigned in §37)

1. MashApp's actual traction and whether a SoundCloud share lane launched (watch; ask SoundCloud partnerships directly). 2. Hook's real MAU/retention (unknowable publicly; competitive intel via community observation). 3. Spotify tool's launch date, price, export rules, and whether scope expands to mashups (watch newsroom; re-run §8 on launch). 4. Udio/KLAY consumer products' final shape (watch). 5. Whether Sony's holdout posture hardens the majors' ask industry-wide (watch litigation in D. Mass.). 6. Exact CJEU operative-text nuances of Pelham II as applied by the BGH on remand (counsel memo when BGH rules ⚖). 7. Whether The MLC/DMP assessment applies to a walled-garden creation app at any scale (counsel ⚖). 8. Music-specific E&O pricing for derivative-works platforms (broker quotes). 9. bushido's exchange terms and whether it can serve as Stage-2/3 plumbing (discovery call). 10. SCOTUS Epic v. Apple outcome and durable US app-store economics (term starting Oct 2026; §27 scenarios ready). 11. Whether Twitch DJ Program expands beyond live (would open a distribution surface). 12. Monstercat/CMG "SoundScout" licensing platform's final shape (reported days before research cutoff — could be supply channel or competitor).

---
