# Mashups Release Readiness

Updated: September 20, 2026.

This is the operational release checklist for the current Mashups product. It is subordinate only to [PLATFORM_BUILD_PLAN.md](./PLATFORM_BUILD_PLAN.md), which defines product scope and milestone order. Older launch and backend plans are historical unless explicitly referenced here.

## Release candidate

Integration branch: `codex/release-candidate-1`

The branch starts from the tip of PR #9 and therefore contains the stacked work from PRs #4 through #9:

- foundation controls and billing/event contract fixes
- saved projects and authentication handoff
- audio-engine review
- FFmpeg listening bench
- local Blend Fit analysis
- Collision audiovisual concept

Do not promote this branch to `main` until the hosted evidence below exists.

## First milestone

A defensible release candidate must complete this journey:

1. Select two approved real tracks.
2. Start real processing with durable job state.
3. Produce three playable arrangements.
4. Keep one arrangement.
5. Sign in without losing the project.
6. Reopen the project after refresh/sign-out.
7. Publish a permission-checked playable result.
8. Open the HTTPS share on a second phone without an account.
9. Play the result and inspect creator/source credits and lineage.
10. Start a permitted fork/new creation from that result.

Synthetic demos are useful regression fixtures but do not satisfy this milestone.

## Evidence matrix

| Area | Current evidence | Release gate |
| --- | --- | --- |
| Vercel build | Preview deployments for PRs #4-#9 reached Ready | Release-candidate preview and production build succeed |
| GitHub CI | Workflow exists; recent runs did not execute successfully because of the GitHub account/billing restriction | `foundation-database` and `quality` jobs complete successfully on the release-candidate head |
| Database controls | Migrations 024-026 pass isolated PostgreSQL regressions locally | Correct hosted Supabase project recovered/replaced; migration history inspected; required migrations applied in staging |
| Authentication | Browser behavior and HTTP boundaries are covered locally | Password, email confirmation and Google login verified against hosted staging |
| Saved projects | IndexedDB recovery, revision conflicts and database rules are covered locally | Two real accounts on two devices can save, reload and conflict safely |
| Billing | Checkout/webhook implementation and contracts exist | Stripe test prices configured; checkout, signed webhook, entitlement update and cancellation verified |
| Catalog rights | Rights/publication rules exist and are regression-tested | At least two authorized pilot tracks complete hosted intake/review |
| Audio analysis | Modal analysis worker exists | Hosted analyzer processes an authorized master through the durable job queue |
| Fingerprinting/sample scan | Job type exists | A configured provider/bridge returns evidence required by the publication policy, or publication policy is explicitly revised |
| Stem separation | Legacy/direct Replicate and Modal/Demucs clients exist | One separation path is selected, versioned, connected to durable Green Room jobs and benchmarked |
| Candidate rendering | Prototype browser synthesis exists | Real stems create three durable candidate assets with measured output |
| Listening quality | FFmpeg blind A/B bench works | Authorized real-song panel results recorded with difficult/rejected examples included |
| Publication/share | Older mashup pages and new saved-project contracts both exist | One durable publication identity connects project, selected candidate, credits, rights and public HTTPS playback |
| Native | Shared contracts and Expo architecture are documented | TestFlight + Android internal builds complete the same staging journey after shared APIs stabilize |
| Collision visual | Concept preview validated in Chromium/mobile viewport | Not a release blocker; physical-device performance is required before making it a default surface |

## Processing routing contract

Green Room jobs are now routed only to explicitly configured processor bridges.

All bridges use the same authenticated envelope and callback contract:

- Bearer authentication with `GREEN_ROOM_PROCESSOR_SECRET`
- signed expiring master-asset URL
- `jobId`, `trackId`, `jobType`, `provider`, `assetUrl`, and `callbackUrl`
- HMAC-signed callback to Mashups

Route precedence is:

1. provider-specific URL, for example `GREEN_ROOM_PEX_PROCESSOR_URL`
2. job-specific URL, for example `GREEN_ROOM_SEPARATION_PROCESSOR_URL`
3. legacy `GREEN_ROOM_PROCESSOR_URL` for analysis only

The admin queue requires a configured analyzer. Optional jobs such as fingerprinting are skipped when their route is absent. The cron dispatcher marks an already-queued unsupported job as `PROCESSOR_NOT_CONFIGURED` instead of sending it to the wrong worker.

## Next implementation order

### P0: restore trustworthy integration

- Resolve the GitHub Actions account/billing restriction and rerun CI.
- Recover or replace the Mashups Supabase project.
- Inspect migration state before applying 025 and 026.
- Configure staging Auth redirect allowlists.
- Configure Green Room private Blob storage.
- Deploy/configure the analysis processor and prove one hosted analysis job.
- Configure Stripe sandbox prices and webhook.

### P1: real audio spine

- Select one durable separation provider path.
- Connect `separate` to the Green Room job queue.
- Store stem assets as private `green_track_assets`.
- Define/render `render_candidates` for the three canonical arrangements.
- Persist candidate assets, duration, measured quality and processing metadata.
- Run authorized real-audio comparisons through the listening bench.
- Keep provider/model/version/settings in operator-visible provenance.

### P2: publish and second-phone playback

- Define one publication identity rather than maintaining parallel old/new identities.
- Re-check grants at publication time.
- Bind the selected candidate asset to the publication.
- Serve public playback without exposing private masters/stems.
- Show source artists, creator credits and remix lineage.
- Add anonymous second-phone Playwright coverage where feasible and retain physical-device acceptance.

### P3: native beta

- Scaffold the Expo client from the shared contracts package.
- Implement auth, project loading, playback, creation, render status and native sharing.
- Produce TestFlight and Android internal-test builds.
- Verify audio-session recovery, universal-link fallback and account deletion/reporting requirements.

## Inputs that require account/operator access

The following cannot be proven by repository changes alone:

- GitHub billing/account state
- the correct Supabase project or approval to replace it
- Stripe sandbox keys, prices and webhook registration
- Vercel environment-variable configuration
- deployed processor endpoints/secrets
- authorized real audio or stems for pilot evaluation
- Apple Developer and Google Play signing/configuration

Missing operator inputs should block only the dependent gate. Continue implementing and testing independent work.

## Go / no-go rule

A Vercel `Ready` badge alone is not a go decision.

The first milestone is a **go** only after the hosted two-track journey completes across two devices with durable storage, real audio, permission checks, public playback, and successful CI. Anything less remains a preview or pilot build.
