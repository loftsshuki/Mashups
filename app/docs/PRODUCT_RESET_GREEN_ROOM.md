# Mashups Product Reset: Green Room

**Status:** Active public product direction
**Date:** August 7, 2026
**Branch:** `claude/mashups-dev`

## Decision

Mashups is a consumer creation product first:

```text
two cleared tracks -> three musical arrangements -> keep one -> publish -> fork
```

The rights, campaign, attribution, and label systems already built are not deleted. They become infrastructure and a later artist-facing product. They no longer define the public homepage or primary navigation.

## Product Promise

Mashups helps a creator make the version they wish existed without starting from a blank digital audio workstation or guessing whether the source music can be used.

The product must win on three things:

1. The output sounds intentionally arranged rather than crossfaded.
2. Every available source has explicit, use-specific permission.
3. Every published version can become the source of a visible remix branch.

## Public Surface

Primary navigation:

- Create
- Discover
- Challenges
- Remix Trees
- Crates

Artist and rightsholder workflows remain under the separate `For artists` entry point. Operator, campaign, supply, growth, and commercial-control routes remain implemented but are removed from public navigation and the public sitemap.

## Green Catalog Rule

The public creator cannot select arbitrary Spotify, YouTube, or commercial-release audio. A track enters the creator only after its Rights Passport is green for the requested use.

The prototype catalog uses deterministic Mashups synthesis with no third-party recordings or samples. Its grant is intentionally narrow:

- In-product creation: allowed.
- Public sharing through the eventual Mashups publishing flow: allowed.
- Personal preview export: allowed.
- Paid media: not allowed.
- DSP distribution: not allowed.
- Implied ownership, exclusivity, or claim immunity: never represented.

Production partner catalog requires counsel-approved agreements and verified authority before the prototype grant labels can be expanded.

## Rights States

### Green

Authority and scope are verified for the exact operation. The UI may expose only the actions expressly allowed by the active grant.

### Yellow

Evidence is incomplete or under review. Yellow material must not enter public creation, export, or publishing in the initial launch.

### Red

Third-party commercial recordings, unresolved samples, expired grants, withdrawals, ownership conflicts, and prohibited uses are blocked and quarantined.

For the first public release, only Green is implemented in the creation surface.

## Creation Experience

The first working creator surface at `/create`:

1. Selects two green sources.
2. Displays source Rights Passport identifiers and exact prototype scope.
3. Scores BPM and Camelot compatibility.
4. Refuses combinations outside the compatibility policy.
5. Lets the creator choose the topline source and energy.
6. Renders three six-bar prototype arrangements locally with Web Audio.
7. Provides playback and a deliberate keep decision.
8. Exports a personal WAV preview.
9. Routes public publishing through sign-in and a future final policy evaluation.

The three structures are:

- Clean Blend: one source's topline over the other source's groove.
- Drop Switch: a two-bar setup followed by a phrase-aligned switch.
- Back to Back: alternating two-bar phrases followed by a combined finish.

## Audio Quality Standard

The current deterministic engine is a safe, functional product prototype. It proves source selection, compatibility, arrangement choice, playback, and export without external audio infrastructure.

It is not the final production music engine. Production readiness requires:

- Accurate downbeat and phrase detection on supplied masters and stems.
- Key detection and independent time-stretch/pitch-shift.
- Vocal and instrumental collision detection.
- Stem-aware transitions and energy curves.
- Loudness normalization, limiting, and clipping checks.
- Three arrangements that are structurally distinct.
- A refusal gate for bad combinations.
- Human listening tests across headphones, phone speakers, and club systems.

The existing stem-separation and phrase-arrangement code remains available for that progression.

## Existing System Map

| Existing capability | New role |
|---|---|
| Mixer, stem separation, beat analysis | Production audio engine |
| Rights Passport, declarations, proof | Green catalog admission and export gate |
| Forks, chains, lineage | Core consumer network effect |
| Challenges and battles | Concentrated creation events |
| Profiles, follows, feeds | Consumer social layer |
| Attribution and signed links | Source credit and downstream measurement |
| Earnings, splits, referrals | Creator and producer economy |
| Campaigns and analytics | Later Mashups for Artists product |
| Supply, operator, outreach, readiness | Internal rights and partnership operations |
| Growth and domination systems | Later commercial activation layer |

## Safety Actions In This Release

- Removed two commercial-song audio files from the public deployable bundle.
- Removed their mock catalog records.
- Retired the public HTML page that linked to the commercial-song mashup.
- Replaced the public creator with a green-only source selector.
- Redirected the legacy arbitrary-upload `/create/ai` route into the green studio.
- Removed campaign and operator systems from public navigation and sitemap discovery.
- Preserved internal implementation for later reuse.
- Added unit coverage for catalog identity, scope, sample status, and compatibility.

DMCA procedures, fingerprinting, and user attestations are not substitutes for permission. They remain necessary operational controls but cannot turn an unauthorized recording green.

## Next Build Sequence

### R1: Green Catalog Foundation

- Move prototype catalog records into a durable catalog schema.
- Create reviewed recording, work, contributor, and grant entities.
- Add track-level preview assets and private stems.
- Add deterministic allow, review, and block policy evaluation.
- Issue immutable render snapshots.
- Recruit 20 to 50 one-stop electronic tracks.

### R2: Production Arrangement Engine

- Process cleared stems asynchronously.
- Detect phrases, hooks, downbeats, keys, and energy.
- Render three candidate structures server-side.
- Add transition, source, and duration controls.
- Add objective quality checks and human listening review.

### R3: Publishing And Lineage

- Persist projects and chosen renders.
- Publish playable mashup pages.
- Fork from an existing render or approved source.
- Preserve graph lineage and source credits.
- Add follows, reactions, comments, and share cards.

### R4: Creator Economy

- Add paid subscriptions for higher-quality and longer exports.
- Allocate contributor pools from qualified uses.
- Add paid stem packs and sponsored challenges.
- Require a separate commercial-use policy decision for brand or paid-media use.

### R5: Mashups For Artists

- Let artists open official remix challenges.
- Reuse campaign, attribution, analytics, and creator activation systems.
- Show artists which hooks, combinations, creators, and regions produce qualified lift.

## Non-Engineering Gates

Before external music enters the green catalog:

- Music counsel approves contributor, creator, remix, export, and claim terms.
- Mashups registers and publishes a DMCA agent and process.
- Rights operations can validate master and composition authority.
- Contributor contracts expressly cover derivative edits, sublicensing, platform use, term, territory, monetization, Content ID cooperation, samples, and withdrawals.
- A rapid quarantine and claim-response workflow is staffed.
- Product language avoids guarantees of ownership, fair use, claim immunity, or virality.

## Immediate Success Criteria

- A new visitor understands the product in under ten seconds.
- A mobile visitor can generate and hear three versions without authentication.
- Every public source shown in Create is green.
- No arbitrary URL import or third-party commercial audio is exposed.
- At least 60 percent of test users reach a first render.
- At least 30 percent keep or download a version.
- Human listeners prefer a generated version over a naive crossfade in blind testing.
