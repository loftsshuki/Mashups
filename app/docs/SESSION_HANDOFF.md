# Mashups Session Handoff

## Current Baseline

- Repo: `C:\Dev\Mashups`
- App: `C:\Dev\Mashups\app`
- Branch: `claude/mashups-dev`
- Production domain: `https://mashups.agency`
- Baseline commit: run `git log -1 --oneline`

## Product Direction

Mashups is a consumer creation product first. The active public loop is:

`two green tracks -> three arrangements -> keep one -> publish -> fork`

Primary navigation is Create, Discover, Challenges, Remix Trees, and Crates. The
rights, campaign, attribution, growth, and operator systems remain implemented as
infrastructure and a later `Mashups for Artists` product. They must not dictate the
consumer homepage or primary navigation.

`app/docs/PRODUCT_RESET_GREEN_ROOM.md` is authoritative for public product direction
and feature sequence. `app/docs/PRODUCT_EXECUTION_PLAN.md` remains authoritative for
rights, security, campaign, settlement, and partner infrastructure.

## Green Room Reset Shipped

- Rebuilt `/` around the consumer promise: pick two cleared tracks, hear three
  arrangements, keep one, and let the next creator fork it.
- Replaced `/create` with a public, mobile-first green-catalog studio. It scores BPM
  and Camelot compatibility, chooses a topline source and energy, renders Clean
  Blend, Drop Switch, and Back to Back arrangements in the browser, plays them,
  and exports a personal WAV preview.
- Added four deterministic Mashups Original prototype sources with no third-party
  recordings or samples. Each exposes a narrow prototype Rights Passport allowing
  create, share, and personal preview export while disallowing paid media.
- Rebuilt `/discover` around the green crate, recommended source collisions, and
  public remix branches.
- Removed commercial-song audio files and mock records from the public bundle. The
  old standalone mashup demo is retired and routes visitors to the green studio.
- Redirected the legacy arbitrary-upload `/create/ai` route to `/create`; its
  implementation components remain available for verified-source refactoring.
- Removed internal campaign and operator systems from public navigation, sitemap,
  and crawler discovery without deleting their implementation.

The electronic-music entry and label-acquisition package is documented in:

- `app/docs/MASHUPS_CLUB_GO_TO_MARKET.html`: internal market thesis, founding-label
  offer, rights boundary, targeting, outreach cadence, scripts, qualification,
  objections, sales operations, and 90-day pilot plan.
- `app/docs/MASHUPS_CLUB_PARTNER_BRIEF.html`: external partner-facing explanation
  of the controlled one-track creator campaign. Share this brief, not the internal
  playbook.

## Modernization Shipped

- Editorial sound-laboratory design system: warm paper, ink, signal orange, acid accents, Archivo Black, Space Grotesk, and IBM Plex Mono.
- Rebuilt homepage around the campaign loop with responsive campaign-tape visualization and live-only momentum data.
- Create defaults to Fast Campaign; Pro Studio and 5-Minute Flip remain optional modes.
- GPT-5.6 model router: Luna for classification, Terra for creative generation, Sol for diagnostics.
- Responses API Structured Outputs with Zod instead of Chat Completions JSON mode.
- `gpt-image-2` cover generation and `gpt-4o-transcribe-diarize` timestamped transcription.
- Stripe SDK checkout/webhook handling, service-role writes, event claiming, and referral idempotency.
- Authenticated Blob upload tokens, SSRF-resistant audio URLs, durable usage reservations, and distributed rate limits.
- Cron routes fail closed without `CRON_SECRET`.
- Global route error and not-found experiences.
- CI now runs lint, typecheck, tests, and build.

## Viral Launch Network Shipped

- `/launches` is the authenticated operator command center for creator K-factor,
  test/scale/blast raids, winning template genomes, squad standings, community
  unlocks, bounties, and artist commitments. Use `?demo=1` for the labeled demo.
- `/launches/new` creates a complete 72-hour launch protocol with three creative
  genomes, three native packages per genome, creator waves, squads, outcome
  bounties, chain royalty rules, save destinations, unlocks, and artist actions.
- `/launches/[slug]` is the public participation surface for audio playback,
  music saves, private sharing, template forks, lineage, Fan A&R calls, squad
  joins, native posting packages, community unlocks, and artist follow-through.
- Viral event, fork, squad, and launch APIs are under `/api/viral/launches`.
  Production writes require auth where appropriate, use distributed rate limits,
  and mutate fork/squad counters atomically. Explicit demo requests never write.
- `supabase/migrations/020_viral_launch_network.sql` is the production schema for
  launches, genomes, raids, squads, activations, bounties, unlocks, commitments,
  events, predictions, royalty rules, and platform packages.

## Growth Operating System Shipped

- `/network?demo=1` is the unified control room for fourteen connected systems:
  Launch Autopilot, connected platform accounts, one-tap music saving, dynamic
  bounties, creator escrow and Stripe Connect, rightsholder supply, zero-follower
  opportunity scoring, city competition, Fan A&R, paid-media handoff, venue QR
  activation, embeds, proof passports, and private pre-release rooms.
- `/supply?demo=1` is the rightsholder intake and campaign-readiness ledger.
  Production submissions require an authenticated organization rights role and
  store versioned rights attestations, permitted uses, territories, and sources.
- `/exchange?demo=1` is the invitation-only pre-release floor. Accepted members
  acknowledge the embargo, hear the private preview, identify the hook, and stake
  Fan A&R reputation on a sealed call.
- `/passport/[username]` publishes verified lift, reliability, rights standing,
  paid-use clearances, and recent proofs without exposing private account data.
- `/club/[code]` turns venue QR scans into attributed saves and city-cell joins.
- `/embed/launch/[slug]` plus `public/mashups-launch.js` provides a compact launch
  web component for label, artist, agency, and media sites.
- Growth APIs live under `/api/growth`. Explicit `?demo=1` requests exercise the
  contract without external writes. Production OAuth uses signed state and stores
  AES-256-GCM encrypted tokens. Spotify saving uses the current generic library
  endpoint; paid amplification requires creator consent and a rights re-check.
- `supabase/migrations/021_growth_operating_system.sql` adds platform connections,
  music-save evidence, Autopilot decision logs, dynamic offers, immutable escrow,
  rightsholder organizations and tracks, opportunity scores, city cells, Fan A&R,
  paid-media handoffs, venue and embed events, proof snapshots, and embargo rooms.
- `/api/cron/autopilot` evaluates active launch genomes every 15 minutes and writes
  reversible, human-overridable decisions. It fails closed without `CRON_SECRET`.

## Required Deployment Work

1. Create/link the replacement Supabase project, then apply migrations in order,
   including `019_production_foundations.sql`, `020_viral_launch_network.sql`,
   `021_growth_operating_system.sql`, and `022_domination_operating_layer.sql`.
2. Configure every production variable in `app/.env.local.example`.
3. Set `NEXT_PUBLIC_APP_URL=https://mashups.agency`.
4. Add `mashups.agency` and `www.mashups.agency` to the Vercel project and choose a canonical redirect.
5. Register the production Stripe webhook URL: `https://mashups.agency/api/billing/webhook`.
6. Enable Stripe Connect and verify the platform business profile before creator payouts.
7. Register these OAuth callbacks with each reviewed provider app:
   `https://mashups.agency/api/growth/connections/spotify/callback`,
   `/youtube/callback`, `/tiktok/callback`, and `/instagram/callback`.
8. Configure `PLATFORM_TOKEN_ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`, and provider
   client credentials. Do not reuse either secret or rotate encryption keys without
   a token re-encryption procedure.
9. Complete required Google, TikTok, and Meta app verification before enabling
   public posting. Unreviewed apps must remain test-only.
10. Keep `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false` in production.
11. Configure `PARTNER_DELIVERY_URL` and `PARTNER_DELIVERY_SECRET` before enabling
    signed Linkfire, Feature.fm, distributor, or paid-media deliveries.

## Domination Operating Layer Shipped

- `/domination?demo=1` is the fourteen-system commercial control plane: Guaranteed
  Launch, Campaign Truth Graph, Mashups Growth License, exclusive rights inventory,
  creator liquidity, five-city EDM/house scenes, organic-to-paid allocation, artist
  obligations, partner delivery, fraud/trust, Mashups Index, A&R intelligence,
  campaign pricing, and non-insurance Launch Protection.
- `/index?demo=1` is the public weekly evidence ranking. Live inclusion requires an
  accepted growth license, credible matched-control lift, minimum trust, and
  qualified posts. Paid reach cannot buy rank.
- `/growth-license?demo=1` is the signer-facing terms and attestation surface.
  Production acceptance is authorized against rightsholder ownership or a rights
  role and seals the versioned terms snapshot and verification code.
- `/reports/[slug]?demo=1` is the owner-only A&R decision memo with lift cohorts,
  confidence gates, hook/city recommendations, paid readiness, and a traceable
  campaign truth graph.
- Domination write APIs live under `/api/domination`; explicit demo requests do not
  persist. `/api/cron/domination` publishes the weekly Index, snapshots creator
  liquidity, and expires elapsed licenses, inventory windows, and protection terms.
- `022_domination_operating_layer.sql` is the production schema and seeds the
  versioned MGL 1.0 instrument plus the Miami, London, Berlin, New York, and Los
  Angeles electronic scene programs.
- Launch Protection is an operational platform-fee service credit. It is explicitly
  not insurance and never guarantees streams, revenue, chart position, or virality.

## Quality State

- `npm run build`: passes
- `npm run typecheck`: passes
- `npm test`: passes
- `npm run lint`: zero errors; legacy experimental surfaces still emit warnings
- Browser fallback screenshots verified desktop and 500px layouts. `agent-browser` could not start its Windows daemon socket in this environment.

## Next Session Prompt

```md
Start in C:\Dev\Mashups on branch claude/mashups-dev.
Read app/docs/SESSION_HANDOFF.md and app/docs/PRODUCT_RESET_GREEN_ROOM.md first.
Verify migration 019 and production environment variables before changing live billing or AI routes.
Continue the green creator loop, not broad feature count: two tracks -> three arrangements -> keep -> publish -> fork.
Do not reintroduce arbitrary commercial uploads, Spotify/YouTube audio ingestion, or
campaign language into the consumer path. Keep the public catalog green-only.
Implement directly, run npm run check, commit only in-scope files, and push origin/claude/mashups-dev.
```
# Pilot Operations Release

The feature-forward continuation now includes a production-backed founding pilot workflow. See `docs/PILOT_OPERATIONS.md` for the executable offer, qualification rules, local validation, and production launch gates.

- `/pilot/new?demo=1`: rightsholder and track intake
- `/operator?demo=1`: guarantees, rights, participation, measurement, economics, and protection
- `/outreach?demo=1`: rightsholder CRM, stage movement, playbooks, and CSV export
- `/readiness?demo=1`: evidence-based launch blockers
- `/partner`: public founding-label offer with a portable, device-local planning path
- `supabase/migrations/023_pilot_operations.sql`: operating schema and production-safe EDM/house configuration
