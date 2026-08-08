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
