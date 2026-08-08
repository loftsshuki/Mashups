# Mashups — Complete Research Findings: Rights-Cleared Social Remix Platform

**Consolidated record of all findings** · Research dates: 2026-08-08 (both rounds) · Branch: `claude/mashups-rights-cleared-research-qytetc`

This single file consolidates everything produced by the two research rounds:

- **PART I — Decision report** (round 2): the full 45-section skeptical decision document, including the firm recommendation, mandatory 25-claim fact-check, consumer-demand verdict, rights architecture, economics, roadmap, kill criteria, and the 40 final answers. **Where Parts I and II differ, Part I governs** (it post-dates and fact-checks Part II).
- **PART II — Deep research report** (round 1): the underlying licensing/legal/precedent research ("Can Mashups Build a Rights-Cleared Social Remix Platform?"), with its own disclosures; carries a corrections banner from the round-2 fact-check.
- **PART III — Research-stream appendices**: the nine raw research-stream deliverables (legal; technology; platform precedents; label/AI dealmaking; fact-check notes; consumer demand; platform boundaries & jurisdictions; catalog supply & beachhead; economics inputs), reproduced with their original confidence tags and "could not verify" lists.

---

# PART I — DECISION REPORT (2026-08-08)

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


---

# PART II — DEEP RESEARCH REPORT (round 1, 2026-08-08)

# Can Mashups Build a Rights-Cleared Social Remix Platform?

**Deep research report**

| | |
|---|---|
| **Research completed** | 2026-08-08 |
| **Prepared for** | Mashups (mashups.agency) — evaluation of the rights-cleared product thesis |
| **Jurisdictions examined** | United States; European Union (with Germany and France specifics); United Kingdom; Canada; Japan |
| **Method** | Four parallel research streams (law, platform precedents, label/publisher economics, technology & competition), ~160 web sources reviewed, load-bearing claims independently re-verified against primary sources (official press releases, statutes, court materials, company newsrooms). Confidence labeling and unverified items disclosed below. |

The thesis under evaluation:

> A creator chooses two rights-cleared tracks, receives three musically structured mashup arrangements, keeps one, publishes it, and allows other creators to fork it into a visible remix tree — with source artists retaining attribution and contributors sharing in the economic upside.

---

> **Corrections & companion note (added 2026-08-08, second research round).** An independent fact-check pass (see `docs/RIGHTS_CLEARED_DECISION_REPORT.md`, §5) corrected three details in this report: (1) Dubset's Spotify agreement was first announced **May 2016** (PR Newswire primary), not 2018 — the integration never scaled regardless; (2) Hook's catalog figures need definitions — its current App Store listing claims **~1M in-app songs from ~18K artists**, while the Feb 2026 press "20M+ songs / 1,200+ artists" describes its contractual distributor pipeline and featured artist partners respectively; (3) Hook's own listing confirms genuine two-song mashups ("Blend two tracks into one") with watermarked clip export. The companion decision report also supersedes this document's strategic conclusions where they differ — notably, subsequent consumer-demand evidence (Hook's ~hundred-rating US footprint; MashApp's ~50K-download silence) weighs against the market-validation optimism in §1 and tightens the recommendation from "conditionally feasible" to a gated 90-day experiment.

## 0. Required disclosures

### 0.1 Research completion date

All findings are current as of **August 8, 2026**. The licensed-remix landscape is moving fast (three of the announcements cited below are less than 90 days old; one is four days old). Findings should be re-verified before being used in negotiations after roughly Q4 2026.

### 0.2 Jurisdictions examined

United States (federal copyright law and circuit case law); European Union (InfoSoc Directive, DSM Directive Art. 17, CJEU case law; German UrhDaG/UrhG and French moral-rights specifics); United Kingdom (CDPA fair dealing); Canada (Copyright Act s. 29.21); Japan (Copyright Act Arts. 20, 27, 28; JASRAC/NexTone collective licensing). Other territories were not examined and no conclusion in this report should be extended to them.

### 0.3 Important facts that could not be verified

1. **Financial terms of every 2025–26 AI/remix settlement and license** (UMG–Udio, WMG–Udio, WMG–Suno, KLAY, Spotify–UMG/Merlin): advances, minimum guarantees, and equity percentages are all undisclosed. Reports that the settlements include equity for labels are secondary-source only. A circulating "$0.002–$0.005 per generation" UMG–Udio rate is **single-source and unconfirmed**.
2. **Launch status vs. announcements**: as of 2026-08-08 the licensed Udio platform, KLAY's consumer product, Suno's licensed models, and Spotify's covers/remixes add-on all appear **announced but not shipped**. Absence of launch coverage is not proof of non-launch.
3. **Sony Music's settlement posture toward Udio**: one litigation tracker lists it as settled; this could not be confirmed elsewhere. This report treats Sony as unsettled with both Suno and Udio.
4. **MashApp's traction** (users, revenue, catalog size beyond "select tracks", any 2026 product changes, Android): no public data since its February 2025 launch. A SoundCloud Help Center page about MashApp exists, indicating some integration, but the page itself was unreachable from this research environment (egress-blocked) and its content is unverified.
5. **Hook's user/revenue scale** beyond a "45× active-user growth" claim, and whether Hook holds direct WMG or Sony licenses (only Downtown/FUGA, Too Lost, Primary Wave, Avex, and UMG campaign partnerships are verified).
6. **Dubset's exact percentage splits** between labels, publishers, and DJs, and why the announced 2018 Spotify integration never shipped at scale (no post-mortem exists).
7. **The exact operative wording of the CJEU's Pelham II judgment** (curia.europa.eu was egress-blocked): the holding used here is reconstructed from six-plus concordant professional summaries (Jones Day, Greenberg Traurig, Bird & Bird, Kluwer, Lausen, ECIJA, EC IP Helpdesk) and the CJEU press release reference; treat operative-text quotations as paraphrase.
8. **Whether the German BGH has applied Pelham II** to the underlying "Nur mir" dispute (no post-April-2026 BGH decision found).
9. **The precise JASRAC trust-contract clause** excluding the Art. 27 adaptation right from its collective mandate (consistently asserted in Japanese legal commentary; primary trust document not parsed).
10. **Rave.dj's ownership and licensing posture** (no primary source; treated as unlicensed/gray).
11. **A reported UMG-backed patent portfolio covering AI music derivatives / walled-garden enforcement** — single-source (Music Business Worldwide); flagged as a diligence item, not established fact.
12. **mashups.agency site content**: unreachable from this environment and no search footprint found; nothing in this report is based on it.
13. **BandLab "Splits" tooling**: could not be verified as a distinct product feature (may be confusion with DistroKid's feature of that name).

### 0.4 Conclusions based on inference rather than primary evidence

1. **The illustrative royalty stack in §6.2 is a model, not a reported deal.** It interpolates from streaming content-cost norms, the NMPA 50/50 recording:publishing precedent, and Dubset's time-pro-rata mechanics.
2. **"No collective or statutory scheme anywhere licenses derivative remixing at scale"** is a well-supported negative inference from the five jurisdictions examined, not something any single source states.
3. **MashApp's silence since launch is read as weak traction.** That is an inference from absence of announcements, not evidence.
4. **The competitive-window argument (§8)** — that majors now prefer to channel fan remixing through their own ventures (Udio JV, KLAY, Spotify add-on) and that the window for independent platforms is narrowing — is an inference from deal patterns.
5. **The claim that a commercial mashup platform cannot rest on the EU pastiche exception** is an inference from Pelham II's three-step-test limitation and concordant law-firm readings; no court has yet ruled on a *platform* invoking pastiche.
6. **The walled-garden requirement (§5.3)** is inferred from a consistent 2016–2026 pattern in every observed deal, plus the fact that the one company refusing it (Suno, with respect to UMG/Sony) remains in litigation. No label has published a policy document stating "no export."
7. The judgment that **no end-to-end generative "mashup arranger" exists as of mid-2026** rests on absence of evidence across multiple searches.

---

## 1. Executive summary and verdict

**Verdict: conditionally feasible — for the first time since the mashup era began.** There is no legal shortcut (no fair-use, pastiche, or UGC exception supports a *commercial platform* in any jurisdiction examined), so the thesis lives or dies on voluntary licensing. Between October 2025 and August 2026 the industry's answer to interactive remix products flipped from "no" to "yes, on our terms." Every load-bearing component of the Mashups loop now has a working precedent:

- **Licensed consumer mashups of major-label catalog exist**: MashApp launched Feb 18, 2025 with UMG, Sony, WMG (Warner Chappell + Warner Recorded), Kobalt, and UMPG licenses — after ~4 years of negotiation by an ex-Spotify licensing executive.
- **Licensed social remixing at scale exists**: Hook ($16M raised, Khosla-led Series A Feb 2026, 20M+ licensed tracks via Downtown/FUGA, Too Lost, Primary Wave, Avex, plus UMG campaigns).
- **Blanket-ish derivative licensing from publishers now exists**: the NMPA's industry-wide opt-in template AI licenses with Udio and KLAY (June 10, 2026), valuing songs and recordings 50/50.
- **Majors have signed remix-product licenses at platform scale**: UMG–Udio (Oct 2025), WMG–Udio (Nov 2025, explicitly "remixes, covers and new songs"), WMG–Suno (Nov 2025), KLAY (all three majors incl. publishing, Nov 2025), Spotify–UMG (May 21, 2026) and Spotify–Merlin (Aug 4, 2026) for a fan covers/remixes paid add-on.
- **The technology is shippable**: every stage of "two tracks → compatibility analysis → three structured arrangements" is published, benchmarked technique (AutoMashUpper lineage, neural stem-compatibility models, consumer-grade source separation), with real quality constraints but no missing science.

**The conditions.** The evidence says a fundable, licensable version of this product must accept: (1) **track-level artist/songwriter opt-in** — the catalog will be partial, indie-weighted at first; (2) a **walled garden** — publish-in-app, no free export (export is the single red line in every observed deal; it is the exact issue keeping Suno in litigation with UMG and Sony); (3) **dual payment layers** (catalog-access/ingest fees plus per-use royalties); (4) **~50/50 recording:publishing parity** in the content pool; (5) **DDEX-grade attribution plumbing** (ISRC/ISWC per source, RIN-style credits, AI-disclosure fields) with fingerprint/DRM enforcement.

**The three hard problems that remain unsolved anywhere:**

1. **The fork.** No existing license — not MashApp's, not Hook's, not the Udio JV's — pre-authorizes *derivatives of derivatives* of licensed catalog. The remix tree is Mashups' genuine novelty, and it requires bespoke contract language (§7). Prior art (BandLab Forks, ccMixter) works only on user-owned or CC content.
2. **The economics.** After two masters and two compositions are paid at observed norms, roughly 30% of attributable revenue is left for platform *plus* creators combined (§6.2, modeled). Free-tier plays are likely loss-making; the observed industry answer is paid-tier gating (Spotify's add-on, MashApp+, Udio's subscription).
3. **The window.** The majors now have their own preferred remix channels (Udio JV, KLAY, Spotify add-on) — simultaneously the strongest validation of consumer demand and the strongest reason a startup must differentiate on what incumbents won't build: the fork tree, creator-to-creator revenue splits, and community (§8).

A sequenced path that the evidence supports: **v1 on original/UGC + opt-in artist stems (no majors needed), v2 via Merlin + NMPA templates + indie aggregators (Hook's playbook), majors last** — detailed in §10.

---

## 2. The loop, stage by stage

Each arrow of the product thesis, against the evidence:

| Stage | Verdict | Basis |
|---|---|---|
| Two cleared tracks | **Feasible, catalog will be partial** | Opt-in is the universal 2025–26 deal shape (Udio, KLAY, ElevenMusic ~4,000 artists, Spotify add-on). "Your favorite song" will often not be in the catalog — the promise/library gap churned every predecessor (§5.4). |
| Compatibility analysis | **Feasible, commodity + real MIR work** | Key/BPM/structure analysis is mature; "mashability" scoring is published (AutoMashUpper 2013–14 → ByteDance AAAI 2021 → Stem-JEPA 2024). Must score-gate pairs: ≤~15% tempo delta, ≤3–4 semitones shift, or quality collapses (§9). |
| Three arrangements | **Feasible with engineering; thin copyright** | No off-the-shelf end-to-end generator exists; structure-aware section alignment + energy matching is buildable. If the system generates and the human only picks, the creator's own copyright in the arrangement is thin under the US Copyright Office's Jan 2025 AI report — creator upside should be **contractual**, not ownership-dependent (§7.3). |
| Creator selects one | **Feasible** | Selection + any editing strengthens the human-authorship record; log it (§7.3). |
| Publish **or export** | **Publish in-app: licensable. Export: the red line** | Every observed deal is walled-garden (MashApp in-app; Udio JV "no downloads"; djay can't record Apple Music streams; TikTok/CML on-platform only). Partial exceptions are narrow and negotiated: Hook's short-form social sharing (≤60s) and its July 2025 SoundCloud publish integration; Suno×WMG's *paid, capped* downloads. The thesis should read "publish in-app; export only where a specific license grants it." |
| Another creator forks it | **Novel — no license precedent** | Requires pre-authorized derivatives-of-derivatives inside the garden; underlying rightsholders' shares must flow undiluted through the whole tree while only the creator share subdivides (§7). |
| Source artists retain attribution | **Feasible, rails exist** | ISRC/ISWC per source, DDEX ERN/RIN/MEAD, the late-2025 DDEX AI-disclosure extension (adopted by Spotify Sept 2025). Attribution is also a *deal requirement*, not just a feature (§7.2). |
| Contributors share economic upside | **Feasible but thin; must be designed** | ~30% modeled headroom for platform+creators combined; forks subdivide the creator share. Precedent for creator payment is weak (YouTube mashup uploaders get 0%; official remixers get flat fees, no royalties) — paying creators *anything* recurring is a differentiator (§6). |

---

## 3. Legal analysis: no exception covers a commercial platform

The consistent finding across all five jurisdictions: recent law has *widened individual creators'* defenses at the margin while leaving a **commercial, monetizing platform** fully dependent on licenses.

### 3.1 United States

- A mashup implicates **two copyrights per source track** — the musical composition (publisher-controlled) and the sound recording (label-controlled) — and preparing a derivative work requires permission for both (17 U.S.C. §§102, 106(2), 114).
- **No compulsory route exists.** The §115 mechanical license permits only arrangements that do not "change the basic melody or fundamental character of the work" and never touches masters ([17 U.S.C. §115](https://www.law.cornell.edu/uscode/text/17/115)); The MLC states outright that it cannot license derivative works or samples. ASCAP/BMI license public performance only. A mashup platform cannot assemble its rights from any collective.
- **Sampling case law is split but irrelevant to the recognizable uses a mashup platform needs**: *Bridgeport v. Dimension Films*, 410 F.3d 792 (6th Cir. 2005) ("Get a license or do not sample") vs. *VMG Salsoul v. Ciccone*, 824 F.3d 871 (9th Cir. 2016) (de minimis defense allowed for a 0.23-second horn stab). De minimis at best excuses fragments, never a chorus.
- **Fair use is a weak defense post-*Warhol***. *Andy Warhol Foundation v. Goldsmith*, 598 U.S. 508 (2023) holds that where a commercial secondary use serves substantially the same purpose as the original (entertainment via music, competing in the original's licensing/derivative markets), "new expression" alone is not transformative. Only genuine parody (*Campbell v. Acuff-Rose*, 1994) retains a strong position. No US court has blessed a mashup as fair use; the *Grey Album* ended in cease-and-desists (Feb 2004), and Girl Talk was simply never sued — an enforcement-discretion datum, not a safe harbor.
- 2024–26 direction of travel: *Tempo Music v. Cyrus* (C.D. Cal. 2025) shows interpolation/derivative claims being actively litigated; the AI-training suits (§5.5) dominate the docket.

### 3.2 European Union

- **Pelham I** (C-476/17, 29 July 2019): any sample recognizable to the ear is a reproduction engaging the phonogram producer's right. A mashup — whose point is recognizability — always triggers it.
- **Pelham II** (C-590/23, **Grand Chamber, 14 April 2026** — after the AG Emiliou opinion of 17 June 2025): "pastiche" in Art. 5(3)(k) InfoSoc is an autonomous EU concept covering creations that (i) evoke an existing work, (ii) display perceptible differences, and (iii) enter into an **objectively recognisable artistic or creative dialogue** with it. Humour is not required; assessment is objective. Crucially, the Court also held pastiche is **not a catch-all for creative reuse** (no blanket cover for sampling/memes/mashups) and remains subject to the Art. 5(5) **three-step test** — no conflict with normal exploitation, no unreasonable prejudice. ([EC IP Helpdesk](https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/cjeu-grand-chamber-rules-music-sampling-and-pastiche-first-cjeu-hearing-generative-ai-and-copyright-2026-04-24_en), [Bird & Bird](https://www.twobirds.com/en/insights/2026/germany/pastiche-in-the-eu-and-uk-the-cjeu-pelham-ii-ruling), [Lausen](https://lausen.com/en/cjeu-defines-pastiche-no-blanket-licence-for-sampling-in-eu-copyright-law/).)
- **Consequence for the platform**: individual mashup creators gained a plausible case-by-case defense; a platform systematically monetizing full-track mashups competes with the originals' normal exploitation and derivative-licensing markets and cannot found its model on pastiche (inference, §0.4.5).
- **DSM Art. 17**: a for-profit UGC mashup platform is very likely an OCSSP — **directly liable** for user uploads unless licensed or compliant with best-efforts/notice-and-staydown; Art. 17(7) makes parody/pastiche mandatory *user* exceptions on such platforms, which protects users, not the platform's business model. Germany's UrhDaG operationalizes this with "presumably authorised uses" (≤15 seconds of audio, non-commercial thresholds) and **remuneration duties to collecting societies** even for pastiche uses — i.e., in Germany the platform pays either way.

### 3.3 United Kingdom

CDPA s.30A fair dealing for parody/caricature/pastiche (2014) exists, but *Shazam v Only Fools The Dining Experience* [2022] EWHC 1379 (IPEC) shows wholesale adaptation fails both the pastiche characterization and fair dealing. Pelham II is not binding post-Brexit but will likely be persuasive (s.30A implemented the same EU provision). Same bottom line: individual-scale defense, not a platform foundation.

### 3.4 Canada

S.29.21 (the 2012 "mashup/YouTube exception") is the world's most explicit UGC exception — and it is limited to **individuals acting solely for non-commercial purposes**, with attribution, a non-infringing source, and no substantial adverse effect on the original's exploitation. A monetizing creator fails "non-commercial"; the platform is not a beneficiary at all. No 2024–26 reform found.

### 3.5 Japan

Arts. 27/28 give authors exclusive adaptation rights plus full parallel rights over derivative exploitation; Art. 20's moral right of integrity is inalienable. JASRAC/NexTone blanket deals with Niconico/YouTube cover **compositions only** — they enable the cover-song ("utattemita") culture but exclude master recordings and the adaptation right itself. Japanese remix culture is legal because users re-perform compositions over self-made backing tracks; recombining masters sits outside every blanket license.

### 3.6 Cross-cutting constraints

- **The 100% consent rule**: clearance requires the master owner(s) plus **every co-writer's publisher** on both songs — one hold-out or non-responder blocks the pair. Two tracks commonly means 8+ writers across 4+ publishers.
- **Moral rights survive contracts** in France (perpetual, unwaivable — CPI L121-1), Germany (§§12–14 UrhG), and Japan (Art. 20). Even with full label+publisher sign-off, an author can later object to a distorting mashup. Mitigation is operational (artist opt-in *by design*, fast takedown covenants, per-artist opt-out), not contractual extinguishment.
- **AI layer**: US Copyright Office *Copyright and AI, Part 2* (Jan 29, 2025) — human authorship required; auto-generated arrangements are protectable only to the extent of documented human expressive choices. **EU AI Act Art. 50** transparency duties (machine-readable marking of synthetic audio, with a lighter regime for evidently artistic content) apply **from Aug 2, 2026** — six days before this report — and bind any generative components.

---

## 4. Why licensing is the only path — and why it just became possible

Until 2025 the answer to "who can say yes at scale?" was "no one, practically":

- Collectives (PROs, The MLC, mechanical societies) **cannot** license derivatives anywhere examined.
- Direct clearance of hit catalog per-use never closed economically (Dubset's chains of up to ~600 rightsholders per mix, §5.1).

Two things changed:

1. **The AI settlements built the deal template** (§5.5): opt-in, walled garden, dual payment layers, credit, fingerprinting. Labels now have an approved internal answer to "interactive derivative product."
2. **The NMPA template licenses (June 10, 2026)** with Udio and KLAY created the first **industry-wide, opt-in blanket mechanism for derivative/AI uses on the publishing side**, at 50/50 song:recording parity — solving, for participating indie publishers, precisely the fragmented-consent problem that killed Dubset. ([MBW](https://www.musicbusinessworldwide.com/music-publishers-strike-ai-licensing-deals-with-udio-and-klay-as-nmpa-reveals-landmark-industry-wide-pacts/), [CMU](https://completemusicupdate.com/nmpa-unveils-ai-licensing-deals-with-udio-and-klay-with-50-50-split-for-songs-and-recordings/).)

Merlin (≈15% of the global market, ~30k indie labels/distributors) has now licensed **three** creation/remix products — ElevenLabs (2025), Udio (Jan 2026), Spotify's remix add-on (Aug 4, 2026) — making it the established first stop for catalog. One consolidation caveat: UMG's $775M Downtown acquisition received final EU approval Feb 13, 2026, so the FUGA/CD Baby aggregator route now resolves to a major.

---

## 5. Precedent record: fifteen years of licensed-remix attempts

### 5.1 Dubset / MixBANK (2015–2020) — the closest ancestor, dead

MixSCAN fingerprinted every track inside DJ mixes/remixes from ~3-second snippets and mapped them to rightsholders; MixBANK cleared and distributed — Apple Music from March 2016, Sony as the first major to legalize remixing (Aug 2017), Merlin for indies, a Spotify deal announced 2018 that never visibly shipped. Royalties were allocated **pro-rata by seconds of each source track used** — the accounting model a fork tree should inherit. It died anyway: one mix could implicate 25–30 songs, 2–10 publishers each (up to ~600 rightsholders), against incomplete publishing data and label-imposed restricted lists; acquired by Pex (March 2020, reported $25M+), MixBANK wound down; Pex itself was later acquired by Vobile. Ex-Dubset leadership resurfaced at ClearBeats (2024), a B2B derivative-clearance service. **Lesson: the splits tech works; per-use clearance of unbounded hit catalog is what doesn't.**

### 5.2 MashApp (2025–) — the exact concept, licensed, quiet

Founded by Ian Henderson (ex-Spotify senior global head of label licensing). Launched US iOS Feb 18, 2025 with **UMG, Sony, WMG, Kobalt, UMPG** licenses covering both masters and publishing, after ~4 years of negotiation. Real-time two-track blending (vocals/instrumentals, tempo, duration), select-tracks catalog, freemium (MashApp+ $9.99/mo), consumption in-app/web-link only, stems produced via **AudioShake separation approved by the majors**. No traction announcements since launch (inference: limited). **Lessons: the all-majors mashup license is provably gettable; it takes years and an insider; "select tracks" and a walled garden are the price; a license is not a product-market fit.**

### 5.3 Hook (2024–) — licensed social remixing, alive and growing

iOS launch fall 2024; $16M total (seed Oct 2024; extension Mar 2025 with Kygo's Palm Tree Crew, Raine, Avex, KSHMR; **$10M Series A led by Khosla Ventures, Feb 2026**). 20M+ licensed tracks via Downtown/FUGA, Too Lost, Primary Wave, Avex; UMG campaign partnerships (claimed 250M+ campaign views; 45× active-user growth). Remixes capped ~60 seconds; sharing to TikTok/IG under its licenses; **July 2025: publish-to-SoundCloud integration** (launch campaign: Lil Wayne "Tha Carter VI" Remix Challenge). Creators earn via campaigns/leaderboards, with revenue share promised "over time." **Lessons: labels license consumer remixing when it's short-form, opt-in, tracked, and marketing-shaped; negotiated narrow export (to specific social platforms) is achievable; creator payment is still the unsolved half.**

### 5.4 The wider graveyard and the survivors

| Venture | Model | Outcome | Lesson |
|---|---|---|---|
| Indaba Music | Licensed remix contests | Absorbed by Splice 2018; contests died | Contest licenses (one song, one window) are cheap and label-comfortable — and don't compound |
| Metapop (Native Instruments) | Community remix challenges | Closed Apr 30, 2023 | Patron-funded communities die with the patron |
| ccMixter (2004–) | CC-licensed remix tree | Alive, tiny | The fork/attribution model works legally — when inputs are CC |
| Tracklib | Pre-cleared sampling, ~100k tracks, fees ~$50–$1,500 + 2–20% rev share | Alive | Pre-negotiated fixed terms on a **bounded** catalog is the one profitable clearance model |
| Splice | Royalty-free samples | $112M FY2025 revenue | Eliminating third-party rights is the other one |
| BandLab | UGC forks since 2015, 100M+ registered users | Alive | Fork-tree UX is proven and loved; licensing is the wall, not the mechanic |
| Mixcloud | Licensed **non-interactive** DJ mixes (majors + Merlin + PROs); no track seeking; Select tier pays rightsholders first, then 60/40 creator/platform | Alive 17+ years, niche | Labels price *interactivity*; radio-like is cheap, track-addressable remixing is expensive |
| SKIO Music | Official-stem remix contests | Alive | Same contest lesson |
| Audius | Crypto streaming + remix contests | Alive, niche, no majors | On-chain didn't solve licensing |
| Rave.dj | Free auto two-track mashups | Alive, legally gray, meme-tier quality | Demand for the exact UX exists; unlicensed + uncurated sets the quality floor to beat |

**Streaming-DJ integrations** define the interactivity frontier: Apple Music's 2024–25 integrations (djay, Serato, rekordbox, Engine DJ) allow full-catalog real-time mixing — but streamed tracks cannot be recorded or exported, and djay's Neural Mix stem separation is disabled on Apple Music streams. TIDAL disabled stem separation of its streams in Dec 2023 **explicitly at rightsholders' insistence**, then moved DJ access behind a paid add-on (May 2024). **Lessons: real-time in-app manipulation is licensable; recording/export is not; and granted permissions can be yanked mid-flight — platform risk is real.**

**The de-facto regimes**: YouTube Content ID is the world's largest involuntary mashup economy — >90% of claims are monetized rather than blocked, rightsholders had been paid $12B cumulatively by May 2025, and the mashup uploader receives **0%**. TikTok/Instagram blanket licenses are strictly on-platform. Every mass-scale "legal" remix regime that exists is platform-bound, attribution-capable, and pays creators nothing — which is exactly the gap the Mashups thesis targets.

### 5.5 The 2025–26 dam break

- **UMG–Udio** (settled Oct 29–30, 2025): 2026 launch of a licensed AI creation/streaming subscription platform — artist opt-in, paid for **training and per-use**, walled garden ("customize, stream and share" on-platform only), fingerprinting/filtering added immediately (the overnight download shutoff caused user revolt and a 48-hour grace window — a warning about retrofitting walls).
- **WMG–Udio** (Nov 19, 2025): explicitly frames the product as "**remixes, covers, and new songs**" using opt-in artists' voices and songwriters' compositions, credited and paid. This is a major label publishing a mashup-product spec.
- **WMG–Suno** (Nov 25, 2025): licensed models in 2026; **downloads become paid-only with monthly caps**; Suno dropped its fair-use defense.
- **Sony remains unsettled**; UMG+Sony v. Suno continues (April 2026 settlement impasse; 61,026 recordings added May 2026; the public sticking point is precisely **walled garden vs. Suno's "Open Studios" free-export stance**).
- **KLAY** (Nov 20, 2025): first AI company licensed by **all three majors including their publishing arms** for a platform that "enables listeners to customize existing music"; pre-launch as of spring 2026. The closest structural comparable to Mashups.
- **ElevenMusic** (relaunched Apr 29, 2026): licensed create/remix/stream platform, ~4,000 opt-in (mostly emerging) artists; built on 2025 Merlin + Kobalt deals with a reported 50/50 recorded:publishing split and a Kobalt MFN clause.
- **Spotify–UMG (May 21, 2026) and Spotify–Merlin (Aug 4, 2026)**: recorded **and** publishing licenses for a fan-made AI covers/remixes tool — opt-in per artist, "consent, credit, compensation," sold as a **paid Premium add-on**; unlaunched, no pricing or date. ([Spotify Newsroom UMG](https://newsroom.spotify.com/2026-05-21/universal-music-group-spotify-licensing-agreements-fan-made-covers-remixes/), [Spotify Newsroom Merlin](https://newsroom.spotify.com/2026-08-04/merlin-spotify-licensing-agreements-fan-made-covers-remixes/).)
- Udio's pre-launch stack shows the full compliance shape: Merlin (Jan 2026), Kobalt (Apr 2026), **NMPA template (Jun 2026)**, Audible Magic fingerprinting (2025), BuyDRM walled-garden DRM (Jul 2026, single-source).
- Counter-currents to watch: the **AFM musicians' union sued UMG and WMG over the settlements themselves**, and Irving Azoff's Music Artists Coalition demanded transparency — artist-relations scrutiny of *how* artists are paid inside these products is intense.

---

## 6. Economics

### 6.1 What the precedents pay

- **Official remixes**: flat work-for-hire fees ($500–$10k typical), no royalties, no publishing — the industry's default answer to remixer compensation is "nothing recurring."
- **Tracklib**: clearance fee tiers (~$50/$500/$1,500) + 2–20% revenue share scaled to sample length — proof that pre-priced derivative terms can work on a bounded catalog.
- **Dubset**: time-pro-rata splits to every source track's label and publishers; the DJ's share was small and unpublished.
- **YouTube**: mashup uploader gets 0% on claimed videos.
- **Hook**: rightsholders paid per consumption; creators paid via campaigns, rev-share "over time."
- **Suno** (demand proof, not a licensing model): 2M paid subscribers, $300M ARR, $400M Series D at $5.4B post (June 2026). People pay real money for interactive music creation.
- Deal-structure history says expect **advances/minimum guarantees and equity asks** (Spotify's 2008 licenses cost ~18% of the company for €8,804; Sonific died of advance demands in 2008; the Udio/Suno settlements reportedly include equity).

### 6.2 Illustrative royalty stack for one published mashup — **modeled inference, not a reported deal**

Assumptions: revenue attributed per-play/per-use; four rights buckets (2 masters, 2 compositions); ~70% content pool (streaming norm); 50/50 recording:publishing parity (NMPA/ElevenLabs precedent); 50/50 time-split between the two sources (Dubset mechanics).

| Recipient | Share of $1.00 attributable revenue |
|---|---|
| Master A (label/featured artist) | 17.5% |
| Master B | 17.5% |
| Composition A (all co-writers' publishers, pro-rata) | 17.5% |
| Composition B | 17.5% |
| **Platform** | **~22%** |
| **Mashup creator** | **~8%** |

On a fork, the underlying 70% must flow **undiluted**; only the creator share subdivides (e.g., 5% originator / 3% forker). Sensitivity: if majors demand 75–80% content share plus per-play minima, platform+creator headroom compresses below 20% and free-tier plays go underwater — which is why every 2026 incumbent product is a **paid tier** (Spotify add-on, Udio subscription, MashApp+). Two-source mashups are also structurally the *worst-case* content cost: a mashup carries two songs' full rights stacks against one stream's revenue.

Operational caveat: split accounting at scale is genuinely hard — The MLC accumulated $424M+ in unmatched "black box" royalties, and publishing ownership data remains incomplete. Capture splits at creation (Session-style), don't reconstruct them later.

---

## 7. The fork tree: the genuinely novel part

### 7.1 Legal characterization

Each fork is a **derivative of a derivative**. Under 17 U.S.C. §103(b) each contributor owns only their newly added material; the underlying two songs' rights run through every node of the tree. Nothing in any observed license — MashApp's, Hook's, the Udio JV's — pre-authorizes downstream derivative reuse of a licensed work *by a different user*. This is the clause Mashups must invent, and it has three requirements:

1. **Pre-authorization in the source license**: rightsholders grant, at opt-in, the right for platform users to create derivatives *and derivatives of those derivatives* within the walled garden, with every node carrying the original attribution and full royalty flow-through.
2. **Creator-side license grant**: each publishing creator grants the platform and other users a fork license to their contribution (BandLab's ToS mechanic, applied on top of licensed catalog).
3. **Undiluted flow-through accounting**: source-rights shares never shrink as the tree deepens; only the creator share subdivides (§6.2). Dubset's seconds-based pro-rata is the closest working precedent for the math.

### 7.2 Attribution rails

Use the industry's own plumbing rather than inventing one: **ISRC** per published mashup (a new derived recording), linked to source ISRCs/ISWCs; **DDEX ERN** for any distribution, **RIN**-style contributor credits, **MEAD** enrichment, and the **late-2025 DDEX AI-disclosure extension** (Spotify adopted it Sept 25, 2025). On-chain attribution is a dead end for now — Story Protocol, the flagship, pivoted away from music IP to AI training data. Attribution is also a **deal term**: every 2025–26 license (Udio, KLAY, Spotify, ElevenMusic) includes credit as a condition, and the platform's visible remix tree is a genuine negotiating asset — it gives labels the provenance graph they keep demanding from AI companies.

### 7.3 Who owns a fork, and does it matter?

Under the US Copyright Office's Jan 2025 report, if the system generates three arrangements and the human merely selects one, the human's copyright in the arrangement is thin to nonexistent; meaningful post-generation editing strengthens it, and the platform should log human expressive choices per node. But the economic design should not depend on creators *owning* anything: **make the creator/forker revenue share contractual** (a platform payment obligation), which works identically whether or not any given node's contribution clears the authorship bar.

---

## 8. Competition and the window (August 2026)

Ranked by proximity to the Mashups shape:

1. **MashApp** — the same consumer concept, all-majors licensed, manual (no auto-arrangements), no fork tree, traction unproven. Both the proof-of-possibility and the cautionary tale.
2. **Hook** — licensed social remixing with real momentum and the only negotiated export precedent; short-clip format, no full-song arrangements, no fork economics.
3. **Spotify's covers/remixes add-on (with UMG + Merlin)** — the steamroller. Unlaunched, AI-generation-centric, opt-in, paid add-on. A startup pitch must answer "why does this need to exist when Spotify built the pipes?" The evidence-backed answer: Spotify's product is fan-to-artist (make a version of one song); Mashups' loop is creator-to-creator (combine two songs, fork, split) — a social graph Spotify has repeatedly failed to build, and a two-song derivative is a different license than a one-song cover/remix.
4. **UMG×Udio JV and KLAY** — label-controlled walled gardens for customizing existing music; generative rather than two-catalog-track mashup; both pre-launch.
5. **ElevenMusic** — licensed remix model live at indie scale (~4,000 artists); the template for a v1 catalog.
6. **Fadr / Rave.dj** — unlicensed demonstrations that the auto-mashup UX has organic demand.

**Window logic (inference):** the majors now have preferred, equity-aligned remix channels. What they have *not* built — and what no observed deal covers — is the recursive, creator-to-creator fork economy. That is simultaneously the hardest thing to license and the only durable differentiation. The realistic wedge is to prove the fork-tree economy on catalog that doesn't require the majors (original stems, opt-in artists, Merlin/NMPA-template indies), then bring majors a working provenance-and-payments machine.

---

## 9. Technical feasibility

**Verdict: shippable with 2026 technology, with honest quality constraints.** Every stage is published, benchmarked technique; the failure mode is product, not science.

- **Pipeline**: licensed masters → approved AI stem separation (HT-Demucs-class, ~9 dB SDR; BS-RoFormer SOTA; **AudioShake is the label-approved vendor precedent** — Disney/UMG/WMG deals, and it already powers MashApp) → beat/downbeat/key (commodity; Camelot matching) → structure segmentation (MIREX-grade, good-not-perfect) → mashability scoring (AutoMashUpper ISMIR 2013/2014 → ByteDance AAAI 2021 neural stem compatibility → Stem-JEPA ISMIR 2024) → constrained transforms (élastique/RubberBand v3) → three arrangement templates (e.g., A-vocals/B-instrumental; alternating sections; interleaved-chorus), ranked.
- **Hard constraints to engineer around**: tempo stretch transparent to ~±10–15%, artifacts beyond ~20%; vocal pitch shift acceptable to ~±3–4 semitones; separation artifacts on dense/reverb-heavy mixes; structure-boundary errors. **Score-gate user-chosen pairs and say no (or warn) on bad pairs** — Rave.dj's meme-tier reputation is what ungated auto-mashups earn.
- **No end-to-end generative mashup arranger exists** to buy (absence-of-evidence, §0.4.7); the "three structured arrangements" layer is real MIR engineering and is also the defensible tech asset.
- **Enforcement plumbing** the licenses will require: fingerprinting (Audible Magic/Pex-class; Udio uses Audible Magic), DRM'd in-app playback (BuyDRM-class), watermarking on any permitted export (imperfect — post-hoc watermarks are strippable; the industry's real answer is the walled garden), DDEX-based catalog ingestion (ERN feeds), new ISRC per published mashup, and **labels mostly cannot deliver stems** (older catalog has none) — licensed separation of delivered masters is the standard route.
- **Fit with the existing codebase**: the repo already contains auto-mashup generation, beat detection, attribution watermarking, Chromaprint/AcoustID fingerprinting plans, realtime collab, and DMCA policies (`app/legal/`) — the walled-garden and derivative-graph accounting layers are the main missing systems. One posture correction: the Feb 2026 internal brief (`docs/SOCIAL_MEDIA_MUSIC_LICENSING.md`) recommends exporting clips sized to "minimize detection." A rights-cleared strategy must retire detection-avoidance entirely — it is incompatible with the licenses this report describes and with the good-faith record a licensor will diligence.

---

## 10. Recommendations

### 10.1 Sequenced go-to-market

1. **v0 (no new licenses needed): prove the loop on unencumbered audio.** Original/UGC stems, Creative Commons, artist-submitted stem drops, remix contests (SKIO-style). BandLab and ccMixter prove the fork mechanic; nobody has attached transparent money to it. Ship the derivative graph + split statements first — it is the negotiating asset.
2. **v1 (6–18 months): opt-in licensed catalog at indie scale.** Direct artist opt-in program (ElevenMusic's ~4,000-artist launch is the template), Merlin, NMPA template-style publishing opt-ins, indie aggregators (Too Lost, Primary Wave-class; note Downtown/FUGA/CD Baby now resolve to UMG). In-app-only publishing; contest-format major-label activations (Hook's playbook) as the majors' on-ramp.
3. **v2: majors.** Arrive with per-use statements, provenance graphs, enforcement logs, and traction. Expect years (MashApp: ~4), advances/MGs, possible equity asks, and an MFN propagating your best terms.

### 10.2 Pre-concede the 2026 deal shape

Track-level artist/songwriter opt-in; walled garden (DRM playback, fingerprinting, no free export; paid/capped export only if a licensor grants it); dual payment layers (access + per-use); ~50/50 recording:publishing; credit/attribution as a contract term; transparent artist-facing statements (the AFM/Azoff scrutiny makes this a differentiator, not overhead).

### 10.3 Design decisions the evidence dictates

- Publish in-app; treat every export surface as a separately licensed privilege (Hook's SoundCloud/TikTok carve-outs; Suno's paid capped downloads).
- Contractual (not ownership-based) creator/forker revenue shares; undiluted rights flow-through; seconds/section-based pro-rata math (Dubset precedent).
- Capture splits and credits at creation (Session-style; DDEX RIN/AI-disclosure fields); mint an ISRC per published mashup.
- Score-gate mashup pairs; constrain transforms (±15% tempo, ≤3–4 semitones); log human editing per node for the authorship record.
- Comply with EU AI Act Art. 50 marking for any generative components (in force Aug 2, 2026); maintain the DMCA agent registration and repeat-infringer enforcement already drafted in `app/legal/`.
- Diligence the reported UMG-backed derivative-enforcement patent portfolio before building proprietary walled-garden tech (single-source flag, §0.3.11).

### 10.4 Kill criteria (what would falsify the thesis)

- Merlin/NMPA-template-class licensors decline even walled-garden, opt-in mashup terms after v0 traction — the licensing floor doesn't exist.
- Content costs in real term sheets exceed ~80% with per-play minima — the fork economy can't pay creators anything meaningful.
- Spotify's add-on ships with two-song combination + social forking — the differentiation collapses to community alone.
- v0 fork-tree engagement is weak — the social-remix premise, not the licensing, was the bet that failed.

---

## 11. Bottom line

The mashup has spent twenty years as the music industry's tolerated outlaw — unlicensable in every jurisdiction examined, surviving on enforcement discretion (Girl Talk), platform-bound involuntary regimes (Content ID), and gray-zone tools (Rave.dj). Between October 2025 and August 2026, that changed structurally: the settlements, the NMPA templates, KLAY, ElevenMusic, and Spotify's UMG/Merlin deals establish that **interactive derivative products of licensed catalog are now a sanctioned, priced category** — on walled-garden, opt-in, dual-payment terms. MashApp proves the exact license is gettable; Hook proves the social loop is fundable; Dubset's corpse marks where the economics fail; and nobody — including the incumbents now entering — has built the recursive, creator-compensating remix tree that is this product's actual thesis. It is feasible, conditionally, and the conditions are now legible enough to build against. The narrow thing is the window.

---

## Appendix A: Primary sources for load-bearing claims

**Law**: [17 U.S.C. §115](https://www.law.cornell.edu/uscode/text/17/115) · [AWF v. Goldsmith, 598 U.S. 508 (2023)](https://supreme.justia.com/cases/federal/us/598/21-869/) · [CJEU C-590/23 Pelham II, 14 Apr 2026 (case ref)](https://www.ipcuria.eu/case?reference=C-590%2F23) · [EC IP Helpdesk on Pelham II](https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/cjeu-grand-chamber-rules-music-sampling-and-pastiche-first-cjeu-hearing-generative-ai-and-copyright-2026-04-24_en) · [UrhDaG (official EN translation)](https://www.gesetze-im-internet.de/englisch_urhdag/englisch_urhdag.html) · [Shazam v Only Fools [2022] EWHC 1379 (IPEC)](https://caselaw.nationalarchives.gov.uk/ewhc/ipec/2022/1379) · [Canada Copyright Act s.29.21](https://laws-lois.justice.gc.ca/eng/acts/c-42/section-29.21.html) · [Japan Copyright Act (EN)](https://www.japaneselawtranslation.go.jp/en/laws/view/1980/en) · [US Copyright Office AI reports](https://www.copyright.gov/ai/) · [EU AI Act Art. 50](https://artificialintelligenceact.eu/article/50/) · [The MLC on derivatives](https://help.themlc.com/en/support/can-i-register-my-derivative-work-with-the-mlc-and-receive-royalties)

**Deals & platforms**: [UMG–Udio announcement (PR Newswire, Oct 2025)](https://www.prnewswire.com/news-releases/universal-music-group-and-udio-announce-udios-first-strategic-agreements-for-new-licensed-ai-music-creation-platform-302599129.html) · [WMG–Udio (PR Newswire, Nov 2025)](https://www.prnewswire.com/news-releases/warner-music-group-and-udio-collaborate-to-build-a-new-licensed-music-creation-service-302620656.html) · [WMG–Suno (PR Newswire, Nov 2025)](https://www.prnewswire.com/news-releases/warner-music-group-and-suno-forge-groundbreaking-partnership-302626017.html) · [Spotify–UMG covers/remixes (Spotify Newsroom, 21 May 2026)](https://newsroom.spotify.com/2026-05-21/universal-music-group-spotify-licensing-agreements-fan-made-covers-remixes/) · [Spotify–Merlin (Spotify Newsroom, 4 Aug 2026)](https://newsroom.spotify.com/2026-08-04/merlin-spotify-licensing-agreements-fan-made-covers-remixes/) · [NMPA–Udio/KLAY templates (MBW, Jun 2026)](https://www.musicbusinessworldwide.com/music-publishers-strike-ai-licensing-deals-with-udio-and-klay-as-nmpa-reveals-landmark-industry-wide-pacts/) · [KLAY three-majors licensing (Music Week, Nov 2025)](https://www.musicweek.com/labels/read/klay-vision-signs-ai-licensing-deals-with-all-three-major-music-companies/093105) · [ElevenMusic launch (ElevenLabs blog, Apr 2026)](https://elevenlabs.io/blog/introducing-elevenmusic) · [MashApp launch coverage (MusicTech, Feb 2025)](https://musictech.com/news/gear/mashapp-licensing-deals-major-labels/) · [Hook Series A (MBW, Feb 2026)](https://www.musicbusinessworldwide.com/ai-remix-startup-hook-secures-10m-in-series-a-led-by-khosla-ventures/) · [Dubset–Sony (TechCrunch, Aug 2017)](https://techcrunch.com/2017/08/22/dubset-makes-sony-the-first-major-label-legalized-for-remixing) · [Pex acquires Dubset (TechCrunch, Mar 2020)](https://techcrunch.com/2020/03/05/legalizing-remix-culture) · [Tracklib pricing](https://www.tracklib.com/pricing) · [AudioShake–Disney (Business Wire, Jul 2024)](https://www.businesswire.com/news/home/20240715870771/en/) · [djay Neural Mix / Apple Music limits (Algoriddim support)](https://help.algoriddim.com/topic/using-djay/neuralmix-compatibility) · [BandLab Forks](https://blog.bandlab.com/forking-and-collaboration-on-bandlab-explained/) · [Suno scale (MBW, Jun 2026)](https://www.musicbusinessworldwide.com/suno-hits-2m-paid-subscribers-300m-annual-revenue/)

**Technology**: [AutoMashUpper (ISMIR 2013)](https://archives.ismir.net/ismir2013/paper/000077.pdf) · [Neural stem-compatibility mashups (AAAI 2021)](https://arxiv.org/abs/2103.14208) · [Stem-JEPA (ISMIR 2024)](https://arxiv.org/pdf/2408.02514) · [Demucs](https://github.com/facebookresearch/demucs) · [RubberBand](https://breakfastquay.com/rubberband/) · [MIREX 2025 structure analysis](https://music-ir.org/mirex/wiki/2025:Music_Structure_Analysis) · [DDEX standards](https://kb.ddex.net/about-ddex-standards/ddex-standards/)

## Appendix B: Internal documents reviewed

`CLAUDE.md` · `docs/SOCIAL_MEDIA_MUSIC_LICENSING.md` (Feb 2026 — posture superseded by this report) · `docs/SPLICE_INTEGRATION_RESEARCH.md` · `app/legal/COPYRIGHT_POLICY.md`, `TERMS.md`, `REPEAT_INFRINGER_POLICY.md` · `app/docs/backend-plans/10-attribution.md`, `14-remix-loader.md` · `BACKLOG_COMPLETE.md`


---

# PART III — Research-stream appendices (full findings, as recorded)

The nine research streams below are the underlying deliverables the two reports synthesize. They are reproduced as recorded on their research dates, including each stream's own confidence tags ([VERIFIED-PRIMARY] / [VERIFIED-SECONDARY] / [SINGLE-SOURCE] / [INFERENCE], or P/S + H/M/L), "could not verify" lists, and method caveats. Where a stream conflicts with the fact-check (Appendix B.1), the fact-check governs — known corrections: Dubset–Spotify first deal was May 2016 (not 2018); Hook catalog figures are definitional (1M in-app / 20M contractual pipeline; 18K catalog artists / 1,200+ featured partners); Metapop closed 2023 (not 2022); TIDAL curtailed DJ features (Dec 2023 stems block, May 2024 paywall) rather than shutting them down.

---

## Appendix A.1 — Legal landscape stream (round 1, research date 2026-08-08)

### United States

- **Two copyrights per source track.** A mashup implicates the musical composition (publisher-controlled) and the sound recording/master (label-controlled); permission is needed for both, and there is no compulsory license for using an existing recording. Sources: Soundrop licensing explainer; Sounds.co on unofficial mashups; US Copyright Office Circular 56; statutory basis 17 U.S.C. §§102(a)(2),(7), 106(2), 114. [VERIFIED-PRIMARY/SECONDARY]
- **§115 cannot authorize mashups.** 17 U.S.C. §115(a)(2) permits only an arrangement "to the extent necessary to conform it to the style or manner of interpretation of the performance involved," which "shall not change the basic melody or fundamental character of the work"; the arrangement gets no derivative-work protection absent express consent; §115 covers only nondramatic musical works, never masters. Legislative intent per House Report: no "perverted, distorted, or travestied" versions. [VERIFIED-PRIMARY — law.cornell.edu/uscode/text/17/115]
- **The MLC's MMA blanket excludes derivatives**: The MLC states it does not license derivative works, lyric changes, or samples — "no automatic or compulsory remix licence." [VERIFIED-SECONDARY — MLC Help Center; copyright.gov MMA pages]
- **Circuit split on de minimis sampling**: *Bridgeport Music v. Dimension Films*, 410 F.3d 792 (6th Cir. 2005) ("Get a license or do not sample") vs. *VMG Salsoul v. Ciccone*, 824 F.3d 871 (9th Cir. 2016) (0.23-second horn stab de minimis, expressly rejecting *Bridgeport*). Unresolved by the Supreme Court. Practical note: de minimis at best excuses tiny fragments — never the extended recognizable use a mashup platform requires. [VERIFIED-SECONDARY + INFERENCE]
- **Post-*Warhol* fair use is weak for commercial mashups.** *AWF v. Goldsmith*, 598 U.S. 508 (2023): where a commercial secondary use serves substantially the same purpose as the original (entertainment via music, competing in the original's licensing/derivative markets), "new expression, meaning, or message" alone is not transformative; only genuine parody (*Campbell v. Acuff-Rose*, 510 U.S. 569 (1994)) retains strength. [VERIFIED-PRIMARY (Justia) + VERIFIED-SECONDARY (Harvard L. Rev.; post-Goldsmith surveys)]
- **Mashup enforcement history is C&Ds, not adjudication.** EMI shut down *The Grey Album* by cease-and-desist (Feb 2004; "Grey Tuesday," ~100,000 downloads in a day); Girl Talk released five sample-dense albums and was never sued — attributed by commentators to labels' fear of adverse fair-use precedent. No US precedent blesses mashups as fair use; "nobody sued Girl Talk" is not a safe harbor. [VERIFIED-SECONDARY (Rolling Stone 2004; Berklee MBJ 2010; Techdirt 2009) + INFERENCE]
- **2024–26 docket**: no new mashup-specific appellate rulings found. Adjacent: *Tempo Music Investments v. Cyrus* (C.D. Cal.) — "Flowers" interpolation claim pleaded as unauthorized derivative; March 2025 ruling allowed a partial-interest assignee's standing; proceeding. [VERIFIED-SECONDARY — Variety, Loeb & Loeb]

### European Union

- **Pelham I (C-476/17, 29 July 2019)**: any sample, however short, is a reproduction under Art. 2(c) InfoSoc unless incorporated "in a modified form unrecognisable to the ear." A mashup, whose point is recognizability, always triggers the reproduction right. [VERIFIED-PRIMARY + INFERENCE]
- **Pelham II (C-590/23) — decided.** AG Emiliou opinion 17 June 2025 (rejecting the expansive "pastiche = any creative reuse incl. memes and mashups" reading); **Grand Chamber judgment 14 April 2026**: pastiche in Art. 5(3)(k) InfoSoc is an autonomous EU-law concept; a use qualifies where the new creation (i) evokes/recalls an existing work, (ii) displays perceptible differences, and (iii) enters into an objectively recognisable artistic or creative dialogue with it. Humour/mockery NOT required; assessment is objective (perspective of a person familiar with the source). Pastiche is not a catch-all for every creative reuse, cannot cover concealed copying, and remains subject to the Art. 5(5) three-step test. Sampling recognized as an artistic technique protected by artistic freedom; "Nur mir" remitted to the BGH. Sources: ipcuria case page (judgment date); Jones Day; Greenberg Traurig; Kluwer Copyright Blog; Bird & Bird; Lausen ("no blanket licence for sampling"); European Law Blog. [VERIFIED-SECONDARY, heavily triangulated; curia full text egress-blocked — operative wording reconstructed from 6+ concordant professional summaries]
- **Implication**: individual creators gain a case-by-case pastiche defense; a platform monetizing full-track mashups competes with normal exploitation/derivative markets and cannot found its model on pastiche. [INFERENCE consistent with Lausen/Jones Day]
- **DSM Art. 17**: a for-profit UGC mashup platform is likely an OCSSP — directly liable for user uploads unless licensed or compliant with Art. 17(4); Art. 17(7) makes quotation/parody/pastiche mandatory *user* exceptions on OCSSPs. [VERIFIED-PRIMARY — EC Guidance COM(2021) 288]
- **Germany**: UrhDaG (in force 1 Aug 2021) + §51a UrhG: "presumably authorised uses" (§§9–11) cannot be auto-blocked — <50% of a work, combined with other content, and either "minor use" (§10: ≤15 seconds audio/film, ≤160 characters text, ≤125 KB image, non-commercial/insignificant revenue) or user-flagged (§11); platforms owe collecting-society remuneration for these and for pastiche uses (§5(2)). [VERIFIED-PRIMARY — official EN translation, gesetze-im-internet.de]
- **Bottom line**: nothing in InfoSoc, DSM Art. 17, UrhDaG, or Pelham II permits a commercial mashup platform without licenses; these regimes protect users case-by-case, impose platform liability/remuneration, and exclude commercial-scale exploitation via the three-step test and non-commercial thresholds. [INFERENCE from primary sources]

### United Kingdom

- CDPA s.30A (2014): fair dealing for caricature, parody, pastiche; no statutory definition of pastiche. *Shazam Productions v Only Fools The Dining Experience* [2022] EWHC 1379 (IPEC): pastiche = imitation of style or assemblage/medley; defense failed as wholesale adaptation, not fair dealing. [VERIFIED-PRIMARY — National Archives judgment]
- Post-Brexit, Pelham II is not binding but likely persuasive (s.30A implemented Art. 5(3)(k); domestic authority thin). A commercial platform cannot rest on s.30A. [VERIFIED-SECONDARY + INFERENCE]

### Canada

- S.29.21 ("mashup/YouTube exception," 2012): an individual may use published works to create a new work and disseminate it (incl. via intermediaries) if (a) solely non-commercial; (b) source attribution where reasonable; (c) belief the source copy was non-infringing; (d) no substantial adverse effect on exploitation (incl. no substitution). Protects individuals acting non-commercially only — a monetizing creator or commercial platform fails (a); the platform is not the beneficiary. No significant case law; no 2024–26 amendment (gen-AI consultation closed Jan 2024). [VERIFIED-PRIMARY (Justice Laws text via corroborated excerpts) + VERIFIED-SECONDARY]

### Japan

- Arts. 27–28: exclusive adaptation/arrangement rights; original author retains full parallel rights over derivative exploitation. Art. 20: moral right of integrity (inalienable; non-exercise covenants used instead of waivers). JASRAC/NexTone blanket agreements with YouTube/Niconico legalize posting cover songs ("utattemita") — but cover only compositions' performance/reproduction, NOT (i) master neighboring rights (no commercial instrumentals/karaoke tracks without label permission) and NOT (ii) arrangement/alteration (Art. 27 sits outside the collective mandate). Japanese remix culture works by re-performing compositions over self-made backing tracks; recombining masters is outside every blanket license. [VERIFIED-PRIMARY (Japanese Law Translation; CRIC) + VERIFIED-SECONDARY (NexTone/JASRAC FAQs; Monolith Law) + INFERENCE]

### Cross-cutting

- **100% consent rule**: clearance requires the master owner(s) AND every co-writer's publisher; one hold-out blocks the song; non-response is common. PROs license performance only; MLC/HFA mechanical only — no collective licenses derivatives. [VERIFIED-SECONDARY]
- **Moral rights survive contracts**: France (droit moral perpetual, inalienable, unwaivable — CPI L121-1); Germany (§§12–14 UrhG non-transferable); Japan (Art. 20 non-assignable). Even with label+publisher sign-off, an author can later object to a distorting mashup; blanket derivative licenses cannot fully extinguish this. [VERIFIED-SECONDARY + INFERENCE]
- **Scale-licensing precedents are voluntary/opt-in, not collective**: Dubset MixBANK (fingerprinting + label/publisher deals; Sony; Apple Music distribution; acquired by Pex 2020, Pex by Vobile 2025 — never comprehensive); Tracklib (~100k tracks/400+ partners, subscription + rev-share). No collective/statutory scheme anywhere licenses derivative remixing at scale. [VERIFIED-SECONDARY; the negative is INFERENCE well-supported]

### AI angle

- US Copyright Office, *Copyright and AI, Part 2: Copyrightability* (29 Jan 2025): human authorship required; prompts alone insufficient; human selection/arrangement/modification of AI output can support protection of the human-authored aspects — an auto-generated mashup arrangement is protectable only to the extent of the creator's expressive choices; document the human contribution. [VERIFIED-PRIMARY — copyright.gov/ai]
- EU AI Act Art. 50 transparency duties apply from 2 Aug 2026: machine-readable marking of synthetic audio; lighter regime for evidently artistic content. [VERIFIED-PRIMARY]

### Stream's "could not verify"

Exact operative wording of Pelham II (egress-blocked; reconstructed); full-text fetch of Canada s.29.21 (blocked; confirmed via excerpts); precise JASRAC trust-contract clause excluding Art. 27 (secondary commentary only); whether the BGH has applied Pelham II post-April-2026 (nothing found); any US court applying *Warhol* squarely to a music mashup (likely none exists); Dubset clearance system's operational status under Vobile.

### Stream's key open questions

How national courts will apply Pelham II's "artistic dialogue" + three-step test to monetized mashups; whether Art. 17(7)/UrhDaG pastiche gives a *platform* (vs its users) any protection when the platform curates/automates/monetizes; whether majors will grant catalog-wide derivative licenses or opt-in only; operational mitigation of moral-rights objections; whether the Bridgeport/VMG split matters for a fully licensed platform (it should not); ownership/royalty layering for forked derivatives (§103(b) + USCO AI guidance — chain-of-title must account for both).

---

## Appendix A.2 — Technology & competitive stream (round 1, research date 2026-08-08)

### Automatic mashup generation — the science

- **AutoMashUpper** (Davies, Hamel, Yoshii, Goto; ISMIR 2013 + IEEE/ACM TASLP 2014): phrase-level segmentation; "mashability" from beat-synchronous chromagram similarity across allowable key-shift/tempo ranges, rhythmic similarity, spectral balance. ISMIR 2015 extension added "vertical" (simultaneous-layer) mashability. [VERIFIED-PRIMARY — ISMIR archives, IEEE Xplore]
- **Neural successors**: "Modeling the Compatibility of Stem Tracks to Generate Music Mashups" (Huang, Wang, Smith et al., AAAI 2021 — ByteDance): self/semi-supervised neural compatibility over separated stems with automatic key/tempo adjustment (arXiv:2103.14208). **Stem-JEPA** (ISMIR 2024): embedding-based stem-compatibility estimation (arXiv:2408.02514). [VERIFIED-PRIMARY]
- No end-to-end generative "mashup arranger" product/paper surfaced for 2025–26 — the pipeline remains modular (separate → analyze → align → mix). [INFERENCE from absence across multiple searches]
- **Source separation**: HT-Demucs v4 ~9.0–9.2 dB SDR on MUSDB18-HQ; BS-RoFormer current SOTA (mainly bass gains); htdemucs_ft recommended production default (2026 benchmark roundups; facebookresearch/demucs; Nature Sci. Reports 2025 Mamba-based model). Offline separation is consumer-grade "good enough" for mashups on most pop material; real-time separation noticeably worse. [VERIFIED-SECONDARY]
- **Structure segmentation**: MIREX 2025 runs a 7-class functional segmentation task; SpecTNT-style transformers lead boundary/chorus detection. Good-not-perfect; expect editorial QA or human-in-the-loop for chorus boundaries. [VERIFIED-SECONDARY + INFERENCE]
- **Beat/downbeat/key**: mature (TCN/CRNN trackers, BeatNet, Apple's tempo-invariant downbeat CNN); Camelot-wheel harmonic matching commoditized (Mixed In Key). [VERIFIED-SECONDARY/PRIMARY]
- **Time-stretch/pitch-shift**: zplane élastique de-facto commercial standard; RubberBand v3 "finer" near-hi-fi open alternative; neural approaches (CLPCNet) match DSP on speech but haven't displaced DSP in music. [VERIFIED-SECONDARY]

### Existing tools, status Aug 2026

- **Rave.dj** — alive (uptime monitors; glitch complaints through 2025–26); fully automatic two-track mashups from YouTube/Spotify links; no evidence of licensing — legally gray; famously hit-or-miss ("cursed mashups" compilations exist). [VERIFIED-PRIMARY/SECONDARY + SINGLE-SOURCE on sentiment]
- **MashApp** (Ian Henderson, ex-Spotify) — launched US iOS Feb 18, 2025 with UMG, Sony, WMG and Kobalt licenses after 4 years of negotiation; real-time two-track blending (vocals/instrumental, tempo, duration); free tier (2 tracks, ads), MashApp+ $9.99/mo (4 tracks, 3-min mashups); playback in-app. Stems via **AudioShake separation, licensed by the majors**. iOS-only as of mid-2026. Key gap vs the Mashups concept: manual/real-time blending — no auto-generated arrangements. [VERIFIED-PRIMARY/SECONDARY (MBW, MusicTech, Music Ally, audioshake.ai) + INFERENCE]
- **Hook** — licensed AI remix/mashup app; $10M Series A led by Khosla (total $16M); catalog via Downtown/FUGA, Too Lost, Primary Wave, Avex; UMG campaign partnerships; ≤30-second clips at the time of the round-1 stream, AI speed/reverb/genre effects, "can generate mashups with other songs"; output shared to TikTok/IG under its licenses. Short-clip social content, not full-song structured arrangements. [VERIFIED-PRIMARY/SECONDARY]
- **Fadr** — free unlimited stems + auto remix/mashup tools + browser DJ auto beat-match; Plus $10/mo; unlicensed user-upload model. [VERIFIED-SECONDARY]
- **Mixed In Key "Mashup"** — desktop manual mashup tool with key/tempo matching; DJ-prosumer niche; no auto-arrangement. [VERIFIED-SECONDARY]
- **Moises / Music AI** — 70M+ users; models trained on licensed audio (Tracklib, SourceAudio, Soundstripe); enterprise API at music.ai; "AI Studio" launched Aug 2025. [VERIFIED-SECONDARY]
- **Serato** — Stems across DJ Pro/Lite and Studio; by 2026 every serious DJ platform has stems. [VERIFIED-SECONDARY]
- **Algoriddim djay** — Apple Music streaming integration exists, but **Neural Mix is disabled on Apple Music streams** and streamed tracks can't be recorded/exported — the canonical in-app-only precedent. [VERIFIED-PRIMARY — Algoriddim support]
- **AudioShake** — B2B licensed separation for UMG/WMG/Sony/Disney/Paramount/NFL; Disney deal (July 2024) explicitly to open catalog lacking stems; real-time SDK June 2025. [VERIFIED-PRIMARY]
- **Suno/Udio post-settlement**: UMG–Udio (Oct 2025) building a 2026 licensed walled-garden create/stream platform — no downloads/off-platform posting, fingerprinting + filtering; WMG–Suno partnership with licensed models in 2026 and download restrictions. Generative platforms, not two-catalog-track mashup tools. [VERIFIED-PRIMARY]

### Legal-tech plumbing

- **Fingerprinting**: Audible Magic is the standard UGC content-ID + licensing/payout rail; Udio adopted it Apr 2025. Pex offers similar attribution/licensing tech. [VERIFIED-PRIMARY + INFERENCE]
- **Watermarking**: viable but imperfect — AudioSeal (Meta, weaker on music), Google SynthID-Audio (Google-only), XAttnMark (ICML 2025) more attack-robust; SoK papers show post-hoc watermarks remain strippable. Industry answer: the walled garden. [VERIFIED-SECONDARY/PRIMARY]
- **Catalog ingestion**: DDEX ERN 4.x feeds (ISRCs, territories, deal terms); each published mashup is a new derived master ⇒ new ISRC linked to source ISWCs; DDEX RIN captures contributor credits. [VERIFIED-SECONDARY]
- **Stems**: labels mostly do NOT deliver stems (older catalog often has none); Disney–AudioShake and MashApp precedents show majors permit licensed AI separation via an approved vendor. [VERIFIED-PRIMARY]

### Remix-tree prior art

ccMixter (CC remix attribution chains since 2004); BandLab Forks (full project access for derivatives); Audius (remix uploads must link the original); Endlesss shut down May 31, 2024. Data model: straightforward DAG (arrangement params + parent ID + source ISRCs), attribution persisted via source ISRC/ISWC per node and DDEX metadata on publish. No competing fork-tree patent or blocker found. [VERIFIED-PRIMARY/SECONDARY + INFERENCE]

### Quality-bar reality check

Failure modes: time-stretch transparent within ~10–15% (audible artifacts beyond ~20–25%); vocal pitch-shift ~±5 semitones max (use less); stem artifacts on dense/reverb-heavy mixes (bleed, smeared tails, "watery" noise; worse in real time); structural misalignment (verse-over-chorus clashes) — the exact problem AutoMashUpper-class phrase-level mashability addresses. Rave.dj demonstrates the floor: fully automatic, zero curation ⇒ meme-tier hit-rate. "Three musically structured arrangements" requires compatibility-gated pair scoring, structure-aware section alignment, energy/spectral matching, constrained transforms — all published technique, none exotic; three *diverse* arrangements is a search/ranking problem over section-pairing templates. [VERIFIED-SECONDARY/PRIMARY + INFERENCE]

### Competitive scan + mashups.agency

No one ships the exact shape (licensed catalog, two user-chosen tracks, auto-generated multiple full arrangements, in-app publish, fork tree). Spotify shipped only playlist transitions ("Mix," Aug 19, 2025) and Smart Reorder (Feb 25, 2026) — explicitly not remixing. mashups.agency: unreachable from the research environment; no search footprint. **Tech feasibility verdict: yes, with caveats** — every stage is published/benchmarked/productized; caveats: pair-dependent quality (gate combinations), real MIR engineering required for three good arrangements (no off-the-shelf), artifact-y stems on dense sources, and licensing (not tech) as the multi-year critical path. **Closest competitors ranked**: 1. MashApp (same product minus auto-generation/forks; all-majors licensed), 2. Hook, 3. UMG–Udio platform (2026, adjacent), 4. Fadr, 5. Rave.dj, 6. Suno/Moises/Serato/Algoriddim (adjacencies). [Stream's "could not verify": mashups.agency content; MashApp traction/Android; Pex 2026 status; Rave.dj ownership; UMG-Udio final feature set; any end-to-end generative mashup paper.]
## Appendix A.3 — Platform precedents stream (round 1, research date 2026-08-08)

*Tags: [VP]=verified-primary, [VS]=verified-secondary (2+ independent trade press), [SS]=single-source, [INF]=inference. Note the fact-check correction: the first Dubset–Spotify agreement was announced May 2016, not 2018.*

1. **Dubset Media / MixBANK (dead — the closest historical precedent).** MixSCAN fingerprinted every track inside a DJ mix/remix from ~3-second snippets, identified start/end points, mapped rightsholders; MixBANK cleared and distributed. First client Apple Music (March 2016) [VS]; **Sony first major label to license remixing** (TechCrunch, 2017-08-22) [VS]; Merlin deal for indies [VS]; Spotify deal (May 2016 per primary; never shipped at scale [INF]). Economics: royalties pro-rata by seconds-of-track-played; labels and publishers paid first, DJ retained a share after [VS]. $4M Series A led by Cue Ball (Feb 2017) [VP]. Why hard: one mix = 25–30 songs, 2–10 publishers per track, up to ~600 rightsholders per mix; incomplete publisher data; label restricted-track lists [VS]. Fate: acquired by Pex ~$25M+ (March 2020) for the licensing infrastructure/rights database; MixBANK quietly wound down; thefuture.fm already closed [VS/SS]. Ex-CRO Bob Barbiere resurfaced co-founding ClearBeats (2024) [VS]. **Lesson: per-track identification + splits tech works; clearance friction, publisher data gaps, DSP dependency and thin royalty pools killed the business; the durable asset was the rights database.**
2. **Hook (alive — the consumer flagship).** "CapCut for music": AI stems, tempo/pitch, mashups of licensed songs, remixes ~≤60 seconds. iOS fall 2024 after $3.5M seed [VS]. Rights: UMG (campaign partnerships), Downtown/FUGA, Too Lost, Primary Wave, Avex — claimed 20M+ licensed songs, 1,200+ artists (Billboard Pro, Feb 2026) [VS — see fact-check: 1M in-app / 18K per Hook's own listing]. Downtown deal explicitly monetizes sped-up/slowed fan versions [VS]. Funding $16M total: $3.5M seed (2024), $3M extension (Mar 2025 — Kygo's Palm Tree Crew, Raine, Avex, KSHMR), $10M Series A led by Khosla (Feb 2026; Waverley/Bronfman Jr.) [VS]. Output NOT strictly in-app-only: sharing to TikTok/IG since launch; **July 2025 SoundCloud integration** publishes remixes directly (launch campaign: Lil Wayne "Tha Carter VI" Remix Challenge) [VS]. Rightsholders get paid + usage data; creators earn via leaderboards, label campaigns, referrals, rev-share promised "over time" [VS]. Claims 250M+ views from label campaigns [SS]; no public MAU/downloads. **Lesson: labels license consumer remixing when it's short-form, opt-in, tracked, marketing-shaped.**
3. **MashApp (launched 2025, traction unproven).** Founded by Ian Henderson (ex-Spotify senior global head of label licensing); ~4 years negotiating. Launched US iOS 2025-02-18 with UMG, Sony, WMG, Kobalt; attribution to artists/songwriters [VS]. Freemium; Premium unlocks full catalog + unlimited ad-free listening; mashups live inside MashApp only [VS]. Backed by Precursor [VP]. No funding/growth/user announcements since launch — silence suggests limited traction [INF]. **Lesson: all-majors licensing is achievable — with ~4 years, an insider, "select tracks," and a walled garden. A license is not a hit product.**
4. **Spotify covers/remixes (announced, not launched).** Landmark UMG deal (recorded + publishing) announced 2026-05-21 for a tool letting fans create covers and remixes of participating artists' songs; **Merlin followed 2026-08-04** (~15% of the market, ~30k indie labels), opt-in per artist [VP]. Paid add-on; AI-generated; research preview to limited users first; no Sony or Warner deals; Spotify says it doesn't need all majors to launch [VS]. Nothing shipped to general users as of Aug 2026 [VS]. **Lesson: the remix-rights dam broke in 2026 — via incumbents doing direct opt-in deals, monetized as premium add-ons. A startup must explain why labels need it when Spotify/UMG built the pipes.**
5. **UMG × Udio JV (2026 launch pending).** Oct 2025 settlement + JV: 2026 subscription platform combining AI creation/consumption/streaming — mashups and vocal-swap remixes of opt-in UMG artists, trained on licensed music, artist compensation for training and outputs; creations stay exclusive to the service; fingerprinting/filtering added to legacy Udio [VS]. **Lesson: even the most aggressive label-sanctioned remix future is in-app-only. Off-platform export is the line.**
6. **Tracklib vs. Splice (both alive — the two solved economics).** Tracklib: subscription from ~$5.99/mo; Lite: $50 clearance + 2–20% revenue share by sample length (incl. publishing share); Premium/Max unlimited clearances; Feb 2025 "Bespoke Clearance" for major deals [VP/VS]. Pre-negotiated standardized terms on a bounded catalog is what works [INF]. Splice: $9.99–$29.99/mo credits; pre-cleared work-for-hire samples, zero downstream clearance; FY2025 revenue $112M (+28% YoY), ~75% subscription [SS]. Splice acquired **Indaba Music** (2018-02-26), kept the sample library — the contest business evaporated [VS]. **Lesson: the only proven profitable adjacents either pre-negotiate fixed terms upfront or eliminate third-party rights entirely. Nobody has made per-use clearance of hit catalog profitable.**
7. **BandLab (fork trees at scale, UGC-only).** 100M+ registered creators; "Forks" (since 2015) copy a public project's multitrack with lineage/attribution — the remix-tree mechanic working at scale because content is user-generated and users license each other via ToS [VP]. No licensed major-catalog remixing in the DAW. A "Splits" tool could not be verified (likely DistroKid's feature name) [INF]. **Lesson: fork-tree UX is proven and loved; licensing is the wall, not the mechanic.**
8. **Dead community-remix graveyard.** Metapop (Native Instruments): closed 2023-04-30 after 700 challenges/280k community tracks [VS]. Indaba absorbed 2018 [VS]. MacJams/Kompoz dormant [INF]. ccMixter: launched 2004 by Creative Commons explicitly to expose remix genealogy; community-run since 2009; still online — legally clean because inputs are CC/PD; the attribution/fork model works legally at tiny, non-commercial scale [VP]. SKIO Music alive: official-stem remix contests (Hardwell/Revealed, Seeb) under contest-specific licenses; "instant remix licensing" marketing [VP]. **Lesson: community remix sites without a revenue engine die when the patron loses interest; contest licenses (one song, one window) are the cheap, label-comfortable format that survives.**
9. **Mixcloud vs SoundCloud (long-form mixes).** Mixcloud is licensed as non-interactive/"interactive radio": direct deals with all three majors + Merlin (250+ indies) + publishers/PROs; constraints: no on-demand track access inside mixes, hidden tracklists, limited seeking, ~3 replays/show per rolling two weeks [VP/VS]. Mixcloud Select: rightsholders first, then 60/40 creator/Mixcloud [VP]. Alive 17+ years, niche. SoundCloud: Audible Magic fingerprinting (block, not monetize); UMG direct takedown tooling since ~2014; 2016–17 label deals reduced but didn't eliminate DJ-mix takedowns [VS]; in 2025 SoundCloud **partnered with Hook** for legal remixes rather than building clearance [VS]. **Lesson: labels price interactivity. Radio-like passive playback is licensable cheaply; on-demand track-addressable remixing is a different, expensive class.**
10. **Streaming-DJ integrations (what labels will and won't allow).** Apple Music "DJ with Apple Music" (2024, expanded 2025-03-25) into djay, Serato, rekordbox, Engine DJ — full catalog mixable in real time incl. stems in djay; streamed tracks cannot be recorded/exported [VS]. TIDAL: Dec 2023 disabled stem separation of streams in Serato/rekordbox/djay/VirtualDJ explicitly at rightsholders' insistence; May 2024 moved DJ access behind a $9/mo DJ Extension; the extension remains marketed into 2025–26 (claim of a full late-2024 shutdown NOT verified) [VS/VP]. Beatport Streaming/Beatsource: DJ subscriptions ($9.99–$29.99), encrypted offline locker at top tier, no file export [VS]. **Lesson: labels repeatedly allow real-time in-app manipulation of full catalog and repeatedly refuse recording/export/derivative distribution; permissions can be yanked mid-flight — platform risk is existential if the product depends on a DSP's license.**
11. **De-facto regimes.** YouTube Content ID: mashups survive via monetize-not-takedown; >90% of claims monetized; multiple claimants split ad revenue pro rata at YouTube's discretion; uploader gets 0% when claimed; $12B cumulative paid to rightsholders by May 2025 [VS/VP] — the world's largest involuntary licensed-mashup economy; attribution and splits exist, creator compensation doesn't. TikTok/Instagram blanket UGC licenses are on-platform only; TikTok's Commercial Music Library likewise; export requires fresh licenses [VS]. **Lesson: every mass-scale "legal" remix regime is platform-bound. Off-platform portability is the universally unlicensed act.**
12. **Japan micro-precedents.** Niconico: JASRAC/NexTone blankets cover compositions (covers/remixes uploadable) but NOT masters; culture runs on self-recorded covers and Vocaloid originals; IP-holder derivative guidelines (e.g., hololive) formalize fan-remix permissions [VS/VP]. Tofubeats' *REFLECTION* (Warner Japan, 2022) shipped with public stems + remix album [SS]. **Lesson: the world's friendliest composition-side blanket regime never solved masters.**
13. **Artist-sanctioned stem drops.** Radiohead "Nude" stems (2008; pushed the single to UK #21), TKOL RMX; NIN full multitracks for *Year Zero*/*The Slip*; Kanye Stem Player ($2.2M claimed day-one around the Donda 2 exclusive; ~$9.5M net lifetime reported, figures conflict) [VS]. All promo-shaped, artist-controlled, non-recurring.
14. **Crypto/on-chain.** Audius: ~6M users claimed; upgraded remix-contest tooling (2025) with $AUDIO rewards; indie/EDM only [VP/SS]. Story Protocol: programmable on-chain IP licensing; onboarding of large IP holders "slow and uncertain"; vapor for this use case [VS/INF].
15. **New entrants 2025–26.** **ElevenMusic** (ElevenLabs): launched 2026-04-29 as streaming + AI creation + licensed remixing of existing songs — Kobalt, Merlin, SourceAudio deals; 4,000+ indie artists at launch; artist monetization + attribution [VP/VS]. **ClearBeats** (May 2024): B2B derivative-works clearance from the Music Rightz team + Nick Ditri + ex-Dubset's Barbiere; pitch: the "90/90 irony" — 90% of derivative creators want exposure not royalties; 90% of rightsholders would rather monetize than takedown [VS].

**Stream's graveyard pattern analysis:** (1) clearance economics never close at hit-catalog scale (Dubset's 600-rightsholder chains; survivors pre-negotiate bounded catalogs, own content outright, or license as radio); (2) catalog gaps kill the consumer promise (opt-in delivers "some songs"; the promise/library gap churns users); (3) labels ration interactivity and forbid export (in-app-only across MashApp, Hook core, UMG×Udio, DJ streaming, TikTok CML); (4) permission is revocable — a startup's core feature can be un-licensed overnight (TIDAL stems); (5) patron-dependency kills communities (Metapop, Indaba, thefuture.fm); (6) demand is real but campaign-shaped (stem drops, contests, short-form marketing; sustained WTP for open-ended mashup creation is thin — MashApp's silence is the tell); (7) window risk from incumbents (Spotify+UMG/Merlin, UMG×Udio): the startup's realistic wedge is what incumbents won't do — fork-tree attribution and creator-to-creator splits on opt-in catalog with in-app output. [Stream's "could not verify": why Spotify never shipped Dubset; Dubset total funding/shutdown announcement; Hook user/revenue scale and direct WMG/Sony licenses; MashApp traction/splits/catalog size; a BandLab "Splits" feature; Creofuga; Mixcloud financial health; precise multi-claim Content ID split mechanics.]

---

## Appendix A.4 — Label/AI dealmaking & economics stream (round 1, research date 2026-08-08)

### The AI litigation → licensing pivot

- **Lawsuits**: UMG, Sony, Warner (via RIAA) sued Suno (D. Mass.) and Udio (SDNY) June 2024. [VERIFIED-SECONDARY]
- **UMG–Udio (Oct 29–30, 2025)**: settlement + licensed platform for 2026 — trained only on authorized music; artist/songwriter opt-in (tool-by-tool); artists paid for training AND per-use; subscription walled garden ("customize, stream and share" inside Udio only — no export/download); interim product amended with fingerprinting/filtering. [VERIFIED-PRIMARY — PR Newswire; MBW] Udio disabled downloads overnight, then re-opened a 48-hour window after user outcry. [VERIFIED-SECONDARY — Billboard FAQ et al.]
- **Warner–Udio (Nov 19, 2025)**: same architecture; explicitly frames the product as "remixes, covers, and new songs" using opt-in artists' voices and songwriters' compositions, credited and paid — functionally a mashup/remix product spec from a major label. [VERIFIED-PRIMARY]
- **Warner–Suno (Nov 25, 2025)**: settlement + license; licensed models 2026 (old models deprecated); **downloads become paid-only with monthly caps**; Suno dropped its fair-use defense; acquired Songkick. [VERIFIED-PRIMARY/SECONDARY]
- **Status Aug 2026**: Sony settled with NEITHER; UMG+Sony v. Suno continues — settlement impasse April 2026 ("no path forward"); labels moved to add 61,026 recordings May 2026; SJ activity July 2026. Public sticking point: labels demand walled gardens; Suno insists on free export ("Open Studios, not walled gardens," Suno CMO, Feb 2026). The licensed Udio had NOT launched; pre-launch deals kept signing — **Merlin (Jan 20, 2026), Kobalt (Apr 9, 2026), NMPA (Jun 10, 2026), BuyDRM (Jul 17, 2026 — DRM for the walled garden)** [last item SINGLE-SOURCE]. Settlements reportedly include licensing payments AND equity; terms undisclosed [VERIFIED-SECONDARY]. A "$0.002–$0.005 per generation" UMG–Udio rate circulates — [SINGLE-SOURCE, unverified]. Governance: the **AFM musicians' union sued UMG and WMG over the settlements**; Music Artists Coalition (Azoff) demanded transparency. [VERIFIED-SECONDARY]
- **What labels now require for interactive products**: opt-in artist consent; walled garden (no export, DRM, fingerprinting); payment at training AND per-use layers; credit/attribution; paid-tier gating; catalog monitoring.

### Other licensed-AI signals

- **KLAY (Klay Vision)**: Nov 20, 2025 — first AI company licensed by ALL three majors including their publishing arms (UMPG, Sony Music Publishing, Warner Chappell) for a subscription platform that "enables listeners to customize existing music while compensating copyright owners"; still pre-launch late April 2026; NMPA deal "launching later this summer." The closest structural comp to Mashups. [VERIFIED-SECONDARY — Music Week, Variety, MBW]
- **ElevenLabs**: Eleven Music launched Aug 5, 2025 with Merlin + Kobalt opt-in licenses; reported **50/50 split between recorded and publishing** and a Kobalt MFN clause; then **ElevenMusic relaunched Apr 29, 2026** as a licensed create/remix/stream fan platform with ~4,000 opt-in (mostly emerging) artists. [VERIFIED-PRIMARY/SECONDARY]
- **YouTube Dream Track / Music AI Incubator**: Nov 2023 experiment (9 artists' voices, US Shorts only); no evidence it became a general consumer remix product by 2026. [VERIFIED-SECONDARY; 2026 status unconfirmed]
- Pricing pattern: all deal financials undisclosed; reported components are advances/licensing payments, equity, and per-output/usage royalties.

### TikTok–UMG and Spotify

- TikTok–UMG: catalog pulled Jan 31, 2024; May 2024 renewal included improved remuneration, removal of unauthorized AI music, better attribution, new monetization tools; further multi-year renewal signed May 22, 2026. [VERIFIED-PRIMARY]
- Spotify: the rumored "Music Pro" remix tier materialized as the May 21, 2026 UMG deal (recorded + publishing) for fan-made AI covers and remixes — opt-in per artist/songwriter, "consent, credit, compensation," paid Premium add-on, unlaunched, no pricing/date; Merlin signed Aug 4, 2026 (~15% of the market). [VERIFIED-PRIMARY/SECONDARY]

### Who must say yes; catalog routes

A mashup is a derivative of each composition — §115 doesn't cover it; explicit permission needed from each master owner and every publisher of every co-writer on both songs (2 tracks ≈ often 8+ writers across 4+ publishers) [VERIFIED-SECONDARY + INFERENCE]. Startup cost history: Sonific (2008) died citing "very large cash advances, fixed per-stream minimums, pressure for free equity"; Spotify's 2008 launch licenses gave majors+Merlin ~18% equity for €8,804; standard structure remains advance + MG + rev share [VERIFIED-SECONDARY]. Routes, easiest first: (1) direct-to-artist opt-in (Udio design; ElevenMusic's 4,000 artists); (2) Merlin (has licensed three creation/remix products); (3) NMPA template licenses (see below); (4) aggregators/indies — Hook's 20M+ pipeline via Downtown/FUGA, Too Lost, Primary Wave, Avex; note **UMG's $775M Downtown acquisition received final EU approval Feb 13, 2026** (Curve divestiture condition) — CD Baby/FUGA now UMG-owned. [VERIFIED-PRIMARY/SECONDARY]

### Remix economics precedents

Official remixes: flat work-for-hire $500–$10k (up to ~$20k), usually NO royalties, no publishing [VERIFIED-SECONDARY — CD Baby; A-Trak in Forbes]. Tracklib: fees ~$50/$500/$1,500 + 2–20% rev share by sample length [VERIFIED-PRIMARY]. Dubset: per-second time-pro-rata splits to all source rightsholders; DJ share small, unpublished [VERIFIED-SECONDARY]. YouTube Content ID: claimants split pro-rata; mashup uploader gets reach, not money [VERIFIED-PRIMARY]. TikTok: view-based micro-royalties (~$0.007–$0.013 per 1,000 qualified views reported) [VERIFIED-SECONDARY, estimates vary]. Hook: consumption-based artist payouts; creators via campaigns, rev-share "over time" [VERIFIED-SECONDARY].

**Illustrative royalty stack (MODELED INFERENCE, not a reported deal)** — $1.00 attributable revenue, ~70% content pool, 50/50 recording:composition parity (NMPA/ElevenLabs convention), 50/50 time-split: Master A 17.5% · Master B 17.5% · Composition A 17.5% · Composition B 17.5% · **Platform ~22%** · **Creator ~8%**; on a fork, the creator share subdivides (e.g., 5/3) while underlying shares flow undiluted. Sensitivity: at a 75–80% content pool + per-play minima, platform+creator ≤20% and free-tier plays go underwater → paid-tier gating (Spotify's choice).

### Attribution/split infrastructure

DDEX: ERN (releases), RIN (credits), MEAD (enrichment); late-2025 AI-disclosure extension — Spotify adopted it Sept 25, 2025 alongside removing 75M spam tracks [VERIFIED-PRIMARY/SECONDARY]. Identifiers: ISRC/ISWC/ISNI. The MLC: $424–427M historical unmatched "black box"; >90% match rate claimed; ~$175M still owed per Billboard — split accuracy at mashup scale is a real operational risk [VERIFIED-PRIMARY]. Session (ex-Auddly): split-sheet capture at creation; partners incl. ASCAP, PRS, STIM, PPL, UMPG [VERIFIED-SECONDARY]. AudioShake: B2B stems for Disney/UMG/Warner-family [VERIFIED-PRIMARY]. Enforcement: Audible Magic; Pex (acquired by Vobile); Udio added BuyDRM (Jul 2026) [SINGLE-SOURCE]. A UMG-backed patent portfolio targeting AI music derivatives reported [SINGLE-SOURCE — diligence flag]. Story Protocol pivoted to AI training data ("DATA Foundation") — no meaningful music adoption [VERIFIED-SECONDARY].

### Publishing side

Mashups sit under the derivative/adaptation right — priced ad hoc by each publisher; neither compulsory mechanical nor standard sync covers them. Publisher hostility context: the 2024 Spotify bundling war (~$480–500M cost to writers/publishers since 2024; MLC suit dismissed; FTC complaint/CRB fight continue) [VERIFIED-PRIMARY — NMPA]. **But the blanket-derivative answer flipped in 2026: on June 10, 2026 the NMPA unveiled industry-wide template AI licenses with Udio and KLAY that any indie US publisher can opt into, valuing songs and recordings equally (50/50)** — the first industry-wide pacts with AI music firms [VERIFIED-SECONDARY — MBW, CMU]. NMPA also runs opt-in model licenses with Spotify for audiovisual uses.

### Market-demand signals

BandLab 100M+ registered (Mar 2024); ~$48M ARR estimate [SINGLE-SOURCE]. **Suno: 2M paid subscribers, $300M ARR; $400M Series D at $5.4B post (June 2026)** — despite active litigation [VERIFIED-SECONDARY]. Hook: 45× active-user growth in 12 months; $10M Series A (Feb 18, 2026) [VERIFIED-SECONDARY]. Consumer appetite: Rave.dj viral spread; official sped-up versions at streaming scale (Raye "Escapism" sped-up 114M+; Cafuné "Tek It" sped-up 95M+); the strongest signal is Spotify+UMG+Merlin building a paid fan remix product. [Stream's "could not verify": financial terms of any settlement; per-generation rates; launch status of Udio platform/KLAY/Suno licensed models/Spotify add-on (all announced-not-shipped); Dubset exact splits; Hook payout rates; RaveDJ stats; BandLab actives; Stability AI audio licensing; Dream Track 2025-26 status; Sony–Udio (treat as unsettled).]

**Stream's deal-structure recommendations (evidence-backed):** (1) artist/songwriter opt-in at track level; (2) walled garden — no export/download at free tier, DRM + fingerprinting + content ID; paid download caps as the only export precedent; (3) dual payment layers (ingest + per-use); (4) 50/50 recording:composition parity; (5) credit via DDEX (ERN/RIN + AI-disclosure), ISRC/ISWC mapping, creation-time split capture; (6) expect advances/MGs + equity asks; MFN propagation; (7) sequencing — v1 direct artist opt-in + Merlin + NMPA template + indie aggregators; majors after traction (Downtown/CD Baby/FUGA now resolve to UMG); (8) budget for artist-relations scrutiny (AFM suits, MAC letters) — transparent per-use statements as differentiator; (9) fork/attribution chains have no industry rail (Story pivoted) — build proprietary derivative-graph accounting modeled on Dubset time-pro-rata splits.
## Appendix B.1 — Mandatory fact-check stream (round 2, checked 2026-08-08)

*The full 25-row verdict table appears in Part I, §5 — not repeated here. This appendix records the stream's methodology, its disambiguation finding, and the detailed per-claim notes behind the verdicts.*

**Methodology note:** most news domains (Billboard, MBW, newsroom.spotify.com, prnewswire) and several primary sites (mash.app, hookmusic.com, tracklib.com, mwm.ai, help.soundcloud.com) were egress-blocked for direct fetch; verification rests on multiple independent server-side search corroborations; snippet-only evidence capped at medium confidence.

**Critical disambiguation:** the premise that "MashApp Music" is a separate MWM app is **wrong**. App Store ID 6475177484 "MashApp Music" is published by MashApp Music, Inc. — Ian Henderson's company (Apple developer ID 1559661965). The mwm.ai/apps/* pages are a third-party app directory (it also lists Hook and Jammable). There is one relevant licensed app, and the SoundCloud Help Center article "MashApp" describes it (matching its MashApp+ tier exactly).

**Per-claim notes (where nuance matters):**
- **Claim 4 (MashApp export).** Launch coverage: free users "share their creations via web links"; indexed mash.app terms bar copying/distributing content or "uploading any mashups to other digital services" outside MashApp's own share functions. No source describes downloadable standalone audio. However, a dedicated SoundCloud Help Center article for MashApp now exists (structurally parallel to Hook's) — strong circumstantial evidence of a MashApp→SoundCloud share pathway added post-launch, format unconfirmed (page egress-blocked). "Links only, no export" is accurate at launch but possibly stale.
- **Claim 5 (Hook catalog).** Both figures real, different measures/dates: Hook's current App Store listing (Aug 2026) says "1M songs / 18K artists" — the in-app remixable catalog; Feb 2026 funding coverage says "access to more than 20 million licensed songs" via Downtown/FUGA, Too Lost, Primary Wave, Avex — the contractual pipeline. "1,200+ artists" reads as featured/opted-in partners at time of writing (Swae Lee, Soulja Boy, Jaden Smith, Killer Mike, Cash Cobain cited). No UMG blanket catalog license should be inferred — UMG is cited for campaigns.
- **Claim 6 (what leaves Hook).** Remixes are short-form (≤60s) shared natively to TikTok, Instagram, Snapchat as clips; free-tier shares carry a watermark ("watermark-free sharing" is an enumerated premium benefit). Since July 22, 2025, users can publish up to 60-second remix audio to SoundCloud pages under the Hook–SoundCloud integration (PRWeb primary; Lil Wayne *Tha Carter VI* challenge). Legal basis: Hook's own opt-in rightsholder agreements + the bilateral integration. No general MP3 download documented.
- **Claim 7 (Hook mashups vs effects).** Hook's own App Store listing enumerates "Mashups: Blend two tracks into one" alongside AI effects (genre, mood, structure) — permission extends to two-song cross-catalog mashups, presumably within its opted-in catalog. Verified from the primary store listing, not press paraphrase.
- **Claim 8 (Hook metrics).** Public, sourced: 45× active-user growth over 12 months (company-sourced, no absolute base); 250M+ views from label campaigns; $10M Series A led by Khosla with Point72, Imaginary, Waverly (Feb 18, 2026); total ~$16M ($3M seed Oct 2023, $3.5M Sept 2024, $3M 2025). NOT public: MAU/DAU, retention, subscription revenue/ARPU, payout totals. All usage metrics company-supplied.
- **Claims 13–14 (Spotify scope and announced facts).** The announcement covers "fan-made covers and remixes": users can "use generative AI to create their own versions of hit songs — whether it's a new vocal take on a cover or a full remix with altered beats, structures, or styles" — single-source transformation via genAI; **the word "mashup" does not appear** in the release language found. Announced facts: UMG deal covers recorded music AND publishing (May 21, 2026); Merlin added Aug 4, 2026; opt-in ("only those who choose to join will have their catalogues available"); "consent, credit, and compensation" framing; ships as a paid Premium add-on creating income "on top of what they already earn." Not announced: launch date (tool not live as of Aug 8, 2026), price, attribution mechanics, export/download rules, per-stream economics, Sony/Warner participation (Spotify publicly said it doesn't need all majors to launch). Newsroom pages egress-blocked; language reconstructed from three independent carriers quoting the release verbatim — manual confirmation recommended before quoting.
- **Claim 15 (Tracklib).** Tracklib's support pages draw exactly the three-way line: (a) sample licenses cover sampling a catalog track (up to 60 seconds; interpolations included) into a new derivative work; (b) "A sample license from Tracklib is for sampling, not remixing, and it doesn't allow for remixes of any songs on Tracklib"; (c) remixes of your own derivative song containing Tracklib samples are permitted but must be registered and revenue-reported. The clearest public articulation of sampling-vs-derivative boundaries in the market.
- **Claim 17 (standardized derivative-licensing services).** **bushido** — a music "Licensing Exchange" (white-label) where rightsholders pre-clear catalogs for sampling, remixes and edits with per-song fees/splits/approval rights; AudioShake partnership for instant stems. IS standardized derivative licensing, but boutique/early-stage — no disclosed scale, no consumer app. **Chordal** — sync licensing network/marketplace (InstantClear API; Kobalt partnership); not derivative licensing. **Synchtank** — B2B SaaS for rights/royalty/sync management; not a licensor. **Musiqmesh** — appears only in AudioShake's ecosystem material; negligible independent footprint. Adjacent: SKIO's "instant remix licensing." Bottom line: no consumer-scale standardized mashup rights exist; bushido is the closest concept.
- **Claim 18 (BandLab).** Terms + official explainer establish more than collaboration: users retain ownership, but setting a track "Forkable" is expressly "granting other users a licence to use your song however they wish" — copy, modify, republish, "even potentially commercialise" — with automatic lineage attribution ("Inspired By" tag). Real license chains and provenance — but among user-owned content only; governed by ToS, not per-work contracts.
- **Claims 19–21 (law).** Pelham II per the Grand Chamber judgment PDF (Courthouse News-hosted): the three-condition pastiche concept; humour not required; three-step test preserved; remitted to BGH; commentators uniformly read "no blanket licence for sampling." Claim 20 ("EU most permissive"): misleading as a flat statement — Art. 17 direct platform liability + Pelham II limits + UrhDaG remuneration cut the other way; what IS true: Art. 17(7) mandatory user exceptions and Germany's unique remunerated-UGC mechanic (§5 UrhDaG). "Structured," not permissive. Claim 21 (UK): s.30A in force 1 Oct 2014; *Shazam v Only Fools* [2022] EWHC 1379 (IPEC) still the leading (nearly only) authority; no UK music-mashup pastiche case; Pelham II persuasive post-Brexit; UKIPO's Dec 2024–Feb 2025 consultation is AI/TDM (11,000+ responses; government response pending as of Aug 2026).
- **Claim 22 (Dubset).** Verified arc with date correction: Apple Music 2016; **Spotify agreement announced May 2016** (PR Newswire primary; a distinct 2018 deal could not be sourced); Sony first major 2017; Merlin 2017; $4M Series A Feb 2017; Spotify integration never materially launched; Pex acquired Dubset March 2020 (~$25M+); MixBANK absorbed into Pex's Attribution Engine — "wound down" fair as to the product, tech persisted.
- **Claim 23 (Pex).** Vobile completed the acquisition April 2025 (Pex's own release + trade press). Current offering: audio identification (fingerprinting, melody matching, voice ID robust to sped-up/slowed/pitch-shifted alterations), AI-music detection, real-time search, social monitoring, licensing/royalty *support*. Nothing Pex sells conveys permission — ID ≠ licensing, confirmed by Pex's own positioning.
- **Claim 25 (launched vs announced).** UMG–Udio: settled + platform announced Oct 29, 2025, target 2026 (H1 per coverage), walled garden; **not launched** as of mid-2026 — no launch release exists. WMG–Udio (Nov 19–20, 2025): "coming in 2026," not launched. WMG–Suno (Nov 25, 2025): licensed models promised 2026, launch not confirmed; Songkick acquired. Sony: no settlement with either; litigation active (Suno fighting discovery of WMG settlement terms; "active litigation" as of May 2026). Udio iOS app live since Jan 28, 2026 with downloads/video/stem exports disabled (Udio Help Center primary). **Live rightsholder-licensed fan-remix products today: Hook, MashApp, ElevenMusic (elevenmusic.io, launched Apr 29, 2026: streaming + AI creation + licensed remixing of an opted-in 4,000+ indie-artist catalog on the Merlin/Kobalt-licensed model, 50/50 composition:recording), plus BandLab for user-owned content.** Spotify's and Udio's are announced, unlaunched.

**Stream's "could not verify":** MashApp→SoundCloud share format and date; independent confirmation of MashApp's "four years"; Musiqmesh operations; Hook absolute users/retention/revenue; the "1,200+ artists" definition/vintage; any 2018 Spotify–Dubset re-announcement; exact newsroom paragraph text for claims 13–14.

---

## Appendix B.2 — Consumer-demand & app-market stream (round 2, research date 2026-08-08)

*Evidence types: Primary = store listing/pricing/company statement; Self-reported = company-claimed, unaudited; Secondary = trade press/aggregator; Anecdotal = user reviews. Store fetches egress-blocked; metrics from search-snippets of store pages/aggregators, labeled.*

### App-store evidence

- **Hook** (Hook Media, iOS id6476193312; App Store launch Sept 26, 2024; free; licensed catalog): **~4.7/5 from ~109 US ratings** (store-page snippet; order of magnitude = low hundreds ≈ very small installed base ~2 years post-launch). One aggregator snippet: "4.6/5, 100k+ downloads" (low confidence). No public subscription pricing found. Review themes — praise: "makes remixing fun and accessible," "their contests are top notch," "a surprising amount of variety for the small fanbase" (reviewer's own admission). Complaints: "There are barely any actual REAL songs that people listen to"; a user who came to make one specific mashup found both songs missing; recurring requests to import personal songs; developer replies apologize for catalog and promise expansion.
- **MashApp** (MashApp Music, Inc. — Henderson; iOS-only US launch Feb 18, 2025, id6475177484; licensed by UMG/Sony/WMG incl. Warner Chappell, Kobalt, UMPG): **~3.7/5; "50,000+ downloads" per aggregator** (low-med confidence). **MashApp+ $9.99/mo or $99.99/yr**, one free month. Praise: "effortless and fun," works "even for those with zero musical experience," tracks "sync together" well. Complaints: crashes/lag during creation; **"inability to export creations without premium access"**; limited song/artist availability; one-star reviews citing limited free access.
- **Others**: Moises — Apple iPad App of the Year 2024, 2025 Apple Design Award finalist; Play ~4.5; JTBD is practice/karaoke/stems, not consumer mashups. BandLab — Play **100,000,000+ downloads**, ~4.3. Fadr — web-first; free unlimited stems/remixes (MP3); Plus $10/mo; stem-quality complaints ("bleed, artifacts"). Rave.dj — web-only, still online (Oct 31, 2025 status check), Patreon-funded; no store ratings. DJ.Studio — desktop, metrics unavailable. edjing Mix (MWM) — **100M+ Play downloads, 4.53/5 from ~1.5M ratings** — the scale outlier; a freemium DJ-toy, not licensed-mashup creation. Algoriddim djay — Play ~4.2. Serato — desktop only, $14.99/mo or $499. rekordbox — $12–36/mo tiers. Suno — iOS ~4.9. **Udio — iOS app launched Jan 28, 2026 with downloads/video/stem exports disabled during the post-settlement transition (Udio Help Center, primary) — currently a degraded product.**
- **Read-through:** the only two true consumer licensed-mashup apps show rating volumes of hundreds (Hook) versus 1.5M for a casual DJ toy — a 3–4 order-of-magnitude gap. The gap, not the star averages, is the finding.

### Download/user estimates

No Sensor Tower/Appfigures/data.ai estimates for Hook or MashApp found in press — unavailable. Hook "45× in 12 months" is self-reported with no absolute base, compatible with the ~109-rating footprint; "250M views" is a views metric from label campaigns, not users. BandLab 100M **registered** (Bloomberg-reported claim; ~30% US; no MAU). Moises "crossed 70M users" (+15M in 2025; registered/cumulative). **Suno: 2M paid subscribers, $300M ARR (Feb 2026), 100M+ cumulative users → ~2% paid conversion; $400M+ Series D at $5.4B post (June 2026)** — self-reported, widely covered. MIDiA: 148.7M global "music creators" 2025 (+167% since 2020); gen-AI music MAU nearly tripled 2023–25; MIDiA's own framing: "content creation remains a niche activity."

### Transformed-music demand: consumption vs creation

Consumption is mass-market and label-endorsed: Raye "Escapism." hit the Hot 100 (#22 peak, her first US entry) after a fan's sped-up TikTok edit; official sped-up version 114M+ Spotify streams; labels routinely ship official sped-up versions; a WMG-linked "sped up nightcore" Spotify page reported near 2M plays/day; #spedup ≈16B TikTok views (Billboard-reported; TikTok has since hidden hashtag counts). Mashup consumption is old and durable: DJ Earworm "United State of Pop 2009" 43M+ YouTube views (4M first week); There I Ruined It 1M+ YouTube subs / 3M+ TikTok; Girl Talk's free albums (372 samples on *All Day*) were a genuine cultural moment — all *one skilled producer, millions of listeners*. Creation is a thin layer: Rave.dj claims "millions of mashups" cumulatively; its 8-year history is novelty spikes (HN front pages 2018/2021, YouTuber meme cycles) settling into a Patreon niche — the observable pattern of one-and-done experimentation (no retention data either way). TikTok mashup content is plentiful but mostly *consumed* compilations by a small set of editor accounts. Google Trends direction for "mashup maker": could not be verified from this environment. The asymmetry: sped-up editing (one slider, lowest possible barrier) still resolved into labels producing official versions for passive consumption — the market kept the listening and industrialized the creating.

### Willingness to pay

Verified price points: Suno Pro $10/mo, Premier $30/mo; Moises Premium ~$3.99–5.99/mo (varies by store); BandLab Membership $14.95/mo (~$8.25/mo annual); Hook free (no public sub found); MashApp+ $9.99/mo/$99.99/yr; **Monstercat Gold $7.49/mo or $75/yr — content use "in its existing form," remixing NOT permitted; rebranded toward "SoundScout" ~Aug 4, 2026**; Fadr Plus $10/mo; rekordbox $12–36/mo; Serato $14.99/mo/$499; Splice $12.99–19.99/mo. Conversion/retention: the only public datapoint in-cluster is Suno's ~2% (2M paid / 100M+ cumulative); nothing public for Hook/MashApp/BandLab/Moises/Fadr; treat 1–3% of cumulative users as the observed ceiling for a breakout music-creation product. Subscription fatigue (Deloitte Digital Media Trends 2025, n≈3,500): 41% say streaming video isn't worth the price (+5pts YoY); 47% pay too much; 73% frustrated by hikes; **61% would cancel a favorite service over a $5 increase**; 22% churn-and-return within 6 months. Deloitte's 2026 edition pivots to **superfan monetization** as the growth engine — consistent with mashup creation being superfan behavior. Anecdotal corroboration: MashApp's most-cited complaint is the export paywall at $9.99.

### Habit vs novelty

No retention, DAU/MAU, or cohort data is public for any mashup-specific product — **that absence is itself the finding** (companies publicize cumulative users, funding, growth multiples; never repeat usage). Hook's contest mechanics appear to drive repeat use within its niche (anecdotal). Rave.dj's trajectory is the strongest longitudinal signal and points to novelty. Moises's repeat use is a musician's practice JTBD. Suno's 2M payers is the one demonstrated repeat-paying creation behavior — but prompt-to-song is lower-effort than mashup assembly, and its retention is also not public.

### What users say they value (anecdotal, consistent)

(1) **Licensed real music — specifically *their* songs** (the dominant Hook complaint is catalog; the archetypal user arrives with one specific mashup in mind and churns when a song is missing). (2) **Ease over power** (MashApp praised for zero-experience auto-sync; complaints are crashes, not missing knobs). (3) **Shareability** (export/social posting is the payoff; MashApp's export paywall is its most-resented decision; both apps built SoundCloud/TikTok integrations). (4) **Social identity/competition** (Hook's contests are its best-loved feature). (5) **Quality tolerance is moderate** (Rave.dj's jank was part of its meme charm; Fadr's artifacts draw criticism when intent is serious).

### Stream verdict

**Weak — and unproven as a repeat habit.** Proven at mass scale: consumption of transformed music. The two purpose-built, fully licensed consumer mashup apps — the cleanest possible tests, with major catalogs and VC backing — show footprints of roughly hundreds of App Store ratings (Hook) and ~tens of thousands of downloads (MashApp) after 1–2 years, versus 100M+ downloads for casual DJ toys and 2M payers for prompt-based generation. For whom it IS real: (a) superfans playing inside a specific artist's catalog; (b) meme-makers/editors creating for social clout; (c) aspiring DJs/hobbyists — who graduate to better-served DJ tools. One strong counter-signal: when creation got maximally easy (sped-up), equilibrium was passive listening to official versions. Willingness to pay unproven at $9.99 for mashup-only value; the realistic model is Suno-shaped — free-first, 1–3% conversion, requiring millions of users, which no mashup app has demonstrated.

**Evidence unavailable (not public anywhere found):** Hook downloads/DAU/MAU/base/retention/revenue/rank; MashApp downloads (beyond "50K+"), actives, retention, conversion; BandLab & Moises MAU/paid counts; Suno/Udio retention; any analyst estimates for Hook/MashApp; TikTok #mashup totals; Google Trends direction; r/mashups size; creative-tool retention benchmarks as a class; DJ.Studio pricing/users; djay iOS rating count.

**Stream's five product-experiment implications:** (1) instrument repeat creation (W1→W4) as the primary metric — treat a Rave.dj-shaped curve as the null hypothesis to disprove; (2) test the "my favorite song" gap with a search-first landing page capturing wanted pairs (validates demand AND builds the licensing priority queue); (3) lead with consumption, convert to creation — measure listener→creator crossover, design for superfans; (4) make contests/social identity the retention engine, not a feature; (5) don't paywall the share moment — keep create+share free, monetize length/stems/status at $3.99–4.99 first, model ≤2–3% conversion.
## Appendix B.3 — Platform-license boundaries & added jurisdictions stream (round 2, research date 2026-08-08)

*Method: first-party terms pages cited; where egress-blocked, content corroborated via search snippets quoting those pages — labeled "P (snippet-corroborated)". Confidence H/M/L.*

**TikTok.** Two libraries split by account type: personal accounts get the General Music Library (personal, non-commercial use only); Business accounts see only the Commercial Music Library (~1M pre-cleared tracks) [P, H]. CML User Terms: users "may only post or share videos that include Commercial Sounds within TikTok and by using the sharing features made available to TikTok users" — no off-platform distribution [P, H]. Branded content requires CML or certified owned rights (a "Music Usage Confirmation" prompt) [P+S, M-H]. Original Sound uploads: policy bars infringing audio (matching mutes/removes; repeat infringers banned); practice: pre-edited/mashup audio uploads circulate until claimed; sped-up/pitched versions routinely evade fingerprinting until manually claimed [P policy H / S practice M]. Export: CML terms bar off-platform sharing; TikTok strips audio from some downloads; behavior varies per track [S, M]. Creator Rewards requires original 1-minute-plus content; licensed-music content ineligible [P, M-H]. **For a mashup app: TikTok's licenses cover sounds sourced inside TikTok's libraries, not third-party files; an exported mashup uploaded as Original Sound is user-warranted and survives only until caught.**

**Instagram/Facebook (Meta).** Music Guidelines govern recorded music in video: more full-length tracks → more likely limited (muted/blocked); shorter clips recommended; a visual component required ("recorded audio should not be the primary purpose") [P, H]. "You may not use videos on our Products to create a music listening experience" [P, H]. Business/branded: restricted or no access to the popular-music library; Meta Sound Collection (~14,000 royalty-free tracks) licensed for use "on the Meta Company Products only" and may not be used "separately from the Meta Company Products" [P, H]. Enforcement: automated muting/blocking mid-video/live [P+S, H]. **A mashup file uploads outside these licenses; Rights Manager will match two recordings.**

**YouTube + Shorts.** Content ID scans uploads; multiple claims per mashup (recording + composition, per source, per territory); "whichever policy results in the most restrictive action will be applied"; multi-claim revenue held/escrowed [P, H]. Creator Music (US YPP only): buy a per-video license or rev-share (<30s of song in >3-min video); **explicitly not permitted: "Creator B buys a license for a song and uses third-party editing software to remix the song and add a new verse"** — license termination + removal [P, H]. Shorts library: commercial clips usable only inside Shorts ≤60s, on-platform [S, M-H]. **None of YouTube's music programs license third-party-made mashup audio.**

**Snapchat.** Sounds catalog pre-licensed for Snaps/Lenses; personal, non-commercial only ("may not… promote or advertise any brand") [P, H]. **"You may not alter the fundamental character of the melody or lyrics of Sounds or create adaptations"** — the license itself bans mashup-style transformation; on-platform only ("may not [be] post[ed]… on third-party services") [P, H].

**Twitch.** Music Guidelines prohibit unlicensed DJ sets, radio-style broadcasts, karaoke, lip-sync; VODs/Clips actively muted/deleted [P, H]. DJ Program (announced 2024-06-06): licenses live-streaming catalog tracks as part of a live performance; majors + hundreds of independents; cost split ~50/50 with Twitch; subsidy phased out by ~July 2025. Deliberate exclusions: live only ("no audio-only or automated broadcasts"); participants "will not be able to save or allow viewers to save VODs, Clips, Highlights, or Uploads" — different rights [P+S, H]. Soundtrack by Twitch discontinued 2023-07-17 [S+P, H]. **No recorded-mashup path exists on Twitch.**

**SoundCloud.** Upload policy: remixes, DJ mixes and mashups require explicit permission from all rights holders — "purchasing a track or downloading it… does not grant the rights to publish the track, either in an original or edited way"; proof of permission can reinstate [P, H]. Upload + monetization-submission scanning [P, M-H]. Monetization requires 100% ownership — "unofficial covers and remixes, mashups, DJ sets… are not monetizable" [P, H]. The July 2025 Hook integration is the sanctioned lane: fans make up to 60-second remixes of opted-in licensed songs, shared to SoundCloud, rightsholders opt in song-by-song, feature-by-feature and get paid [P+S, H]. **Culturally the most receptive platform; legally identical — permission or takedown.**

**Spotify + Apple Music.** No UGC upload path; Spotify's artist rules list unauthorized remixes as prohibited; **Spotify Developer Policy prohibits "synchronizing any sound recordings with any visual media" and "using Spotify's catalog to segue, mix, re-mix, or overlap any Spotify Content with any other audio content"** [P (snippet-corroborated; exact section numbering unverified), H on substance]. Apple MusicKit is playback-only; creating shareable audio/video requires sync/adaptation rights from rights-holders directly [P, H]. **Cannot build mashup features on either API; delivery to DSPs requires a distributor + full clearances (the Hook→Too Lost licensed route).**

**Australia.** Closed fair-dealing list; no fair use: research/study, criticism/review (s 41), news, parody or satire (s 41A, 2006); the dealing must be genuinely for that purpose and fair [P, H]. No UGC exception; ALRC's *Copyright and the Digital Economy* (2013): "sampling, mashups or remixes will not usually fall within the scope of these exceptions"; reform never enacted [P, H]. Moral rights Part IX (attribution + integrity; inalienable; consent-based carve-outs) [P+S, H]. Individual: s 41A only for genuine parody/satire — a purely aesthetic A-vs-B mashup almost certainly fails. Platform: cannot borrow users' purposes and faces **authorisation liability** (ss 36(1A)/101(1A); *Cooper v Universal Music* [2006] FCAFC 187) [P, H]. 2024–26: CAIRG is AI-focused; the Attorney-General ruled out a TDM exception (2025-10-26); no UGC/remix exception on the table [P+S, H].

**Canada (recap).** S.29.21 permits an individual's non-commercial UGC creation/dissemination with attribution, non-infringing source belief, and no substantial adverse effect; shields the individual's non-commercial act, not a commercial platform's reproduction/communication or monetization; fair dealing (incl. parody/satire since 2012) sits alongside [P, H].

**Brazil.** Lei 9.610/98 Art. 47 frees only paraphrases and parodies "that are not true reproductions… nor imply discredit"; remixes/mashups are reproduction + derivative uses requiring authorization; ECAD collects for public performance only. Moral rights (Arts. 24, 27) inalienable and irrevocable, including integrity — an independent objection even when masters are licensed. A mashup is by construction substantially a reproduction, outside Art. 47 [P law H / M-H application]. **Mexico.** LFDA Art. 21 moral rights (disclosure, paternity, integrity — perpetual, inalienable); Art. 148 narrow limitations; nothing covers commercial UGC remixing [P, H law / M parody nuance]. **No LatAm market permits an unlicensed commercial mashup platform** [H].

**Comparative conclusion.** The US is the right initial launch jurisdiction for a *licensed* platform: contract-based clearance makes exceptions mostly moot; clearest, most-litigated safe harbor (DMCA §512); largest market; minimal music moral rights (VARA excludes sound recordings). Caveat: in France, Germany, Japan, and Brazil, inalienable integrity rights mean even a fully licensed mashup can be attacked by the songwriter personally — expansion needs author-level consents/objection-takedown mechanics [M-H synthesis].

**Stream's "could not verify":** exact current section numbering of Spotify Developer Terms and TikTok CML terms; whether TikTok currently strips licensed audio from every watermarked download; a claimed 2025-07-25 TikTok business-account enforcement date (single source); full current text of Mexico's post-2020 parody provisions; 2026 changes to Twitch DJ Program scope.

**Stream's top 5 sharing-design implications:** (1) no destination platform licenses your users' mashup files — your licenses must grant distribution on named services or export stays off; (2) design for fingerprint collision (register catalog with each platform's rights tools so matches resolve "licensed"); (3) separate personal and commercial share paths (every platform bifurcates); (4) keep licensed remixing in-app; export short capped clips — the only sanctioned precedents share that shape (Hook→SoundCloud, Shorts library, Snap Sounds: ≤60s, on-platform, opt-in per song/feature); (5) monetization travels worst — build revenue-share in-platform, never promise off-platform monetization; launch US-first with author-consent mechanics reserved for FR/DE/JP/BR.

---

## Appendix B.4 — Catalog supply & beachhead stream (round 2, research date 2026-08-08)

### Proven remix-friendly supply models (status Aug 2026)

- **NCS**: free-use-with-attribution for creators (usage policy); ~34.2M YouTube subscribers; claims 500B+ plays generated since 2011; monetizes via DSP royalties driven by creator exposure + YouTube; artists sign term licensing deals with royalty splits and can decline renewal. **Grants content-use, not remix/derivative rights — Mashups' ask is one step beyond.** [P/S, H/M]
- **Monstercat**: Gold creator license was $7.49/mo or $75/yr — catalog use in videos/streams "in its existing form"; **remixing/edits explicitly not permitted**; reported transition of Gold/Player into "SoundScout" ~Aug 4, 2026. Scale: 3 imprints, 200M+ monthly streams, $60M+ paid to artists, 9M YouTube subs. **Acquired by Create Music Group, May 2025** ($50M investment pledged). **A paid consumer license for a whole EDM catalog works at ~$75/yr — and the remix right is still white space.** [P, H; SoundScout M — very recent]
- **mobygratis**: relaunched Apr–May 2025 — 500+ instrumentals (~more added through 2026), downloadable **including multitrack WAV stems**, explicitly usable by "remixers"; free for non-commercial or "commercially insignificant" uses; separate license for clearly commercial use; credit "mobygratis." Precedents: NIN *Ghosts I–IV* CC BY-NC-SA (2008) with remixing invited; Radiohead sold "Nude" stems via iTunes (2008, non-commercial restriction). **Name artists will release stems for derivatives when framed as fan creativity + non-commercial default + upgrade path — the shape of an artist-direct deal.** [P/S, H]
- **Stem/remix-contest culture**: deadmau5 sold solo + mau5trap catalogs (4,000+ songs, ~$55M, March 2025) to Create Music Group, which explicitly plans licensing/gaming/VR exploitation — **the famous remix-comp catalog is now licensable at one desk**. Kanye Stem Player: $1.3M in 24h / claimed $2.2M day-one around the Donda 2 exclusive; ~$9.5M lifetime net reported. SKIO: 650k+ producers, 500+ contests, $1.5M prizes, active 2025 contests; contest terms bar DSP distribution of entries. Official acapella/stem supply is a commercial norm (Beatport "DJ Tools/Acapellas" genre; Splice cleared vocal packs). [S/P, H/M-H]
- **Production libraries (the one-stop ownership model)**: Epidemic Sound acquires 100% of master + publishing (~50k tracks; ~$9.99–30/mo) but its license covers audiovisual/podcast use only and **explicitly prohibits distributing covers/remixes or standalone music experiences**; Artlist bars derivatives/remixes; Uppbeat allows edits only if the original stays "distinctly recognisable" with no change of style/arrangement; Chillhop runs a free claim-release creator program. **The buy-both-rights model is proven at scale and is the cleanest legal architecture — but no incumbent library grants consumer remix rights; replicate the ownership model, don't resell theirs.** [P, H]
- **Distributor/aggregator opt-in precedents**: Hook's 20M+ pipeline via UMG (flagship campaigns), Downtown/FUGA, **Too Lost** (300k+ artists/labels, ~7M songs, ~150k releases/mo; deal Feb–Mar 2025), Primary Wave, Avex. Eleven Music launched on **opt-in** Merlin (30k indie labels/distributors) + Kobalt licenses. **Symphonic** opened its catalog to opt-in AI/dataset licensing via Musical AI (Aug 2024) and works with Sureel. EMPIRE bought Dirtybird outright (Oct 2022). **Distributor-level opt-in deals with creation apps are an established deal type; Too Lost and Symphonic are the proven "yes" desks.** [P/S, H]

### Genre beachhead evidence

- **Rights concentration**: chart pop averages 4+ writers (~4.6 on chart-toppers vs 1.87 in the 1960s) and ~6 publishers per hit; electronic music inverts this — the producer typically writes alone, self-publishes, and often owns the master via an artist-owned imprint (structural evidence: headliner-owned label density; one-desk catalog acquisitions — deadmau5→CMG, Dirtybird→EMPIRE). [S, H; inference M-H]
- **Musical compatibility**: house 120–128 (core 124–128); techno 130–150 (hard 150–180+); trance 135–145; DnB 160–180 (core 170–175); dubstep ~140 felt half-time at 70; UKG ~130–135. Tight intra-genre tempo bands + quantized 4/4 grids + 8/16-bar phrase structure make electronic uniquely automatable; **dubstep/trap's 140≈70 half-time grid is natively compatible with hip-hop vocal tempos — the structural bridge for vocal supply.** [S/P, H]
- **Remix culture**: SKIO's 650k producers; Hypeddit's download-gate economy of bootlegs/edit packs; DJcity's 25-year edit pool; GRiZ gave away 24 unreleased edits/flips pre-hiatus (Sept 2023); Pretty Lights free-download catalog since the 2000s. **No comparable label-sanctioned derivative culture exists in mainstream pop.** [P/S, H/M]
- **Short-form relevance 2024–26**: phonk 31B+ TikTok views, Spotify phonk playlist ~11.25M followers; Afro house fastest-growing Beatport genre (23rd→4th in producer searches in a year; Keinemusik's "Move" among 2024's top streamed); hard techno + dubstep the fastest-growing genres on SoundCloud; UKG uploads +100% YoY. [P/S, M-H]
- **Vocal availability (the honest weakness)**: mashups want recognizable vocals; most electronic supply is instrumental (mobygratis 100% instrumental). Strongest vocal-supply corners: melodic bass/future bass (Ophelia-style topline-driven releases), vocal house/UKG (long acapella tradition), lo-fi worst. Mitigations with precedent: cleared vocal packs (Splice), commissioned acapellas, one-stop self-releasing rappers/singers via Too Lost/Symphonic-style opt-ins over half-time bass and 4/4 house instrumentals.

### Prospect raw material and exclusions

(The full 30-artist / 20-label / communities lists with per-row evidence appear in Part I §31.) Stream-level notes: **Bassnectar flagged unsuitable** (abuse lawsuit settled confidentially Feb 2025, dismissed with prejudice; reputational risk regardless of ownership). **Phonk producers**: individual ownership unverifiable publicly — route via distributor-level opt-ins, not named artists. **Lo-fi**: Chillhop's claim-release program is a model; Lofi Girl's label (Lofi Records) has publishing administered by Warner Chappell France — not a pure one-stop. Dirtybird = EMPIRE-owned (2022); Monstercat + mau5trap = CMG-owned (2025); Defected = independent (owner-CEO since 2022); Hospital Records' current independence not re-verified.

**Stream's recommended beachhead:** North American bass music (dubstep/melodic bass/flip culture) — the Ophelia/Subsidia/Cyclops/WAKAAN/Deadbeats/HypnoVizion cluster, US+Canada — with house/tech-house (124–128 grid) fast-follow. Rationale: rights concentration is the binding constraint and nowhere else do headliners own their labels so densely; flip contests/edit packs are the scene's native marketing (a rights-cleared mashup app extends existing behavior); the 140/70 half-time grid bridges to hip-hop vocals; sequence bass-cluster artist deals → CMG and EMPIRE as single-signature catalog unlocks → house grid for auto-mashup quality. Afro house/hard techno are hotter but rights sit with fewer, harder counterparties and vocals are scarcer; phonk is huge but ownership-opaque.

**Stream's "could not verify":** r/mashups size; Digital DJ Tips/The Drop community sizes; phonk producer ownership; Hospital Records independence; Mad Decent structure; explicit creation-app opt-in programs at CMG/ONErpm/EMPIRE/Believe (directional only; Too Lost and Symphonic are the verified precedents); Eleven Music's "~4,000 artists" channel composition; exact SoundScout terms.

**Paths that look attractive but do NOT convey needed rights:** Beatport catalog / DJ Tools purchases (performance/personal-use downloads); DJ record pools (promo use for working DJs); production-library subscriptions (remix-excluded); SKIO contest stems (contest-scoped, no DSP distribution); Monstercat Gold/SoundScout-type creator licenses (existing-form content use only); NCS attribution use (content sync, not derivatives); standard distribution deals (distributors hold no remix-grant rights absent explicit artist opt-in); CC BY-NC-SA catalogs like NIN *Ghosts* (non-commercial + share-alike conflict with a monetized platform).

---

## Appendix B.5 — Economics inputs stream (round 2, research date 2026-08-08)

*All prices USD; P = vendor/official/filing, S = press/aggregator; confidence H/M/L. Replicate/Modal official pages egress-blocked — corroborated via multiple secondary trackers.*

**Compute:** Replicate T4 $0.000225/s; L40S $0.000975/s; A100-80GB $0.0014/s [P-corroborated, H]. Replicate Demucs (cjwbw/demucs): **~$0.019/run, ~85s typical, T4** [P-corroborated, M-H]. Modal: T4 $0.000164/s; A10 $0.000306/s; A100-80GB $0.000694/s; H100 $0.001097/s; CPU $0.0000131/core-s; $30/mo free credits [P-corroborated, H/M]. AWS g4dn.xlarge $0.526/hr; g5.xlarge $1.006/hr [S mirrors list, H]. Demucs runtime benchmarks: ~24s per 4-min song (RTX 3090); CPU-only 3–4 min/song [S, M]. **Derived: $0.01–0.03 per track separated; a 2-track mashup ≈ $0.02–0.06 (near-zero if labels/artists deliver stems); beat/key analysis <$0.001/track.**

**Storage/CDN:** Cloudflare R2 $0.015/GB-mo, **$0 egress** [P, H]; S3 $0.023/GB-mo + $0.09/GB egress; CloudFront ~$0.085/GB [P-corroborated/S, H/M]; Supabase Pro $25/mo (100GB storage incl., $0.021/GB over; 250GB egress incl., $0.09/GB over) [P-corroborated, H]; Vercel Pro $20/seat (1TB incl., then $0.15/GB US) [P-corroborated, H]. File-size math: 320kbps MP3 = 2.4MB/min; 128kbps AAC = 0.96MB/min; 16/44.1 WAV ≈ 10.1MB/min. Per-mashup bundle (~50–150MB) ≈ $0.00075–0.00225/mo on R2. **Serving audio from R2 (zero egress) is the single biggest COGS lever — do not stream through Vercel.**

**App-store & payments (2026):** Apple 30% standard / 15% Small Business (<$1M); Google Play 15% first $1M and 15% subscriptions [P-corroborated/S, H]. Epic v. Apple: district contempt order (Apr 30, 2025) barred commission on external-link purchases; **Ninth Circuit affirmed contempt Dec 11, 2025 but vacated the blanket zero-commission remedy and remanded**; en banc denied Mar 30, 2026; **SCOTUS granted cert ~Jun 30, 2026** — US link-out currently ~0% but unresolved; model 0% / 12–27% / 15–30% scenarios [P/S, H]. Stripe 2.9% + $0.30 (+0.7% Billing; +1.5% intl) — a $9.99 web sub costs ~$0.66 (6.6%) vs $1.50–3.00 store take [P-corroborated, H].

**Content-cost anchors:** Spotify gross margin 33.1% (Q4 2025) / 33.0% (Q1 2026) [P — SEC]; ~two-thirds of every music dollar to rightsholders; $11B paid 2025 (Loud & Clear) [P, H]. **Twitch DJ Program: ~30% of channel revenue (range 25–40%) allocated to music rights, split 50/50 Twitch/DJ; subsidy glide ~12 months** — the closest comp for a UGC-remix rights pool [P, H]. YouTube 55/45 with Creator Music adjustments [P, H]. Mixcloud Select: rightsholders first, then 60/40 creator/Mixcloud [P, M]. Anchors a content-pool range: 50% (Twitch-like all-in) / 65–70% (Spotify norm) / 75% (aggressive ask).

**Subscription benchmarks:** RevenueCat State of Subscription Apps (2025: 75k apps; 2026: 115k apps): median download→paid ≈ **1.7%** within 30 days; trial-to-paid up to 45.7% (17–32-day trials); ~30% of annual subs cancel in month 1; median renewal fell 18.8%→17.0% monthly / 47.1%→44.1% annual; median monthly churn ~13–14% [P/S, H/M]. Verified prices: Suno $10/$30; Moises ~$3.99–5.99; BandLab $14.95 ($8.25 annual eff.); Fadr $10; **MashApp+ $9.99/$99.99yr**; Hook free at launch; Monstercat Gold $7.49/$75yr; Splice $12.99/$19.99. **Cluster: $8–13/mo is the defensible band.** CPI (Business of Apps 2025): iOS ~$4.70, Android ~$3.70, NA ~$5.30, music apps among the cheapest (~$1–3). **Derived paid CAC = CPI ÷ conversion ≈ $70–235/paid sub — the model's most dangerous assumption; organic/viral mix required.**

**Rights-ops overheads:** ACRCloud reseller-listed tiers ambiguous (validate directly) [S, LOW]; Audible Magic via Music.AI marketplace **$0.076–0.08/audio-minute** [P, M]; DDEX membership **$291/yr** (Full Individual; Charter $29,378/yr; fee schedule effective 2026-01-01) [P, H]; The MLC free to writers/publishers, funded by a DSP assessment (a new DMP's share small but nonzero — needs validation) [P, H]; human moderation $8–14/agent-hr offshore (~$1,300–2,200/mo/seat; ~$0.05–0.25/item derived) [S, M]; tech E&O ~$110/mo average, $1,200–5,000+/yr small-co range; music-specific quotes unpublished [S, M].

**Advances/MG public evidence:** Spotify 2008 — majors+Merlin got 352,176 shares (~18% combined) for €8,804.40 alongside licenses [S, H]; TikTok–UMG dispute: UMG called TikTok's offer "a fraction of the rate similarly situated major social platforms pay" (~1% of UMG revenue); settled May 1, 2024, rates undisclosed [S, H]; Twitch DJ co-pay ~50% shows platforms subsidize rights during growth [P, H]; Epidemic Sound contrast: buys 100% of master+publishing upfront, splits streaming royalties 50/50 with composers — the zero-per-use-royalty model [P, H]. **Current major-label MG/advance figures are NOT public; MashApp's four-year timeline is the only public evidence of deal difficulty.**

**Stream's model-input table (base / range):** GPU per track separated $0.019 / $0.01–0.03 · compute per mashup $0.04 / $0.02–0.08 · storage per mashup-month $0.0015 / $0.00075–0.003 (≈10× if WAV stems on Supabase) · egress per 1,000 3-min plays @320kbps **$0 (R2)** / $0.61–1.08 elsewhere · payment take 6.6% web / 0–30% by channel · content pool 65% / 50–75% · sub price $9.99 / $7.49–12.99 · download→paid 1.7% / 1–3% · trial→paid ~40% / 30–46% · monthly churn 13% / 10–17% · CPI $2.50 / $1–5.30 · rights-ID $0.076–0.08/audio-min + $0.05–0.25/item human · fixed: DDEX $291/yr, E&O $1.3–5k/yr, Supabase $25/mo, Vercel $20/seat, moderation $2–15k/mo at scale. **Pure assumptions requiring validation:** major-label MG/advance sizes and per-use minima; whether labels deliver stems; The MLC assessment applicability; ACRCloud USD tiers; music-specific E&O; mashup publishing (adaptation-right) pricing; paid-CAC organic offset; storage policy (WAV vs compressed); durability of US 0% link-out post-SCOTUS (term starting Oct 2026).

---

*End of appendices. Compiled 2026-08-08/09 from the session's research record; stream texts lightly reformatted (headings, list normalization) with content, figures, tags, and caveats preserved as recorded.*
