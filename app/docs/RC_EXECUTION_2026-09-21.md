# RC execution record: September 21, 2026

Branch: `codex/release-candidate-1`; draft PR #11. This is an implementation and evidence record, not a launch declaration.

## Pre-Supabase implementation state

The repository now contains the complete planned pre-hosted spine:

1. Real catalog studio with durable create/render/status/play/select/publish/fork flows.
2. Revision-checked candidate selection and two-independent-review publication gates.
3. Canonical publication identity, private preview proxy, range-aware playback, credits and lineage.
4. Forks that preserve parent lineage without inheriting selected audio or reviews.
5. Deployable Demucs separation bridge and private stem upload path.
6. FFmpeg/Rubber Band three-arrangement renderer with conservative tempo-warp refusal, measured LUFS/peak, input hashes and renderer provenance.
7. Source-hash-bound fingerprint callback contract. A provider is intentionally not invented.
8. Read-only Supabase preflight plus migrations through 031 and isolated SQL regression runners.
9. Read-only Stripe sandbox preflight. No live-mode operation.
10. Opt-in hosted Playwright acceptance for real render/reload/keep, anonymous playback/range/fork, and fail-closed boundaries.
11. Real-audio listening-panel protocol and deterministic synthetic renderer regression.
12. Expo beta source sharing the web contracts plus sign-in, projects, rendering, playback, Keep/Publish/share/fork, report/block, and a reversible deletion-request workflow.

## Reliability hardening added before hosted integration

Migration 030 adds:

- processor dispatch tokens and time-bounded leases
- bounded attempts with exponential handoff retry
- stale-worker lease recovery
- immutable master/source SHA-256 bindings
- provenance-bound stem/render manifests
- one serialized processing-evidence row per track/source version
- atomic analysis/fingerprint/separation evidence merge
- stale callback rejection after a job is re-leased
- a service-only private catalog-audition path for bootstrapping the first approved catalog without bypassing rights or listening-review rules
- a fake-hosted SQL journey covering source evidence -> private audition -> catalog -> render -> keep -> reviews -> publish -> anonymous read -> fork -> rights revocation

Migration 031 adds private service-mediated content reports, creator blocks, and reversible account-deletion requests. It does not automatically delete an auth user or claim store-complete deletion handling.

## Verification obtained so far

- Previous focused Node contract tests passed.
- Previous FFmpeg renderer regression passed on synthetic stems.
- Vercel preview builds were Ready through the processing/renderer hardening commits.
- A later source-generation batch introduced literal source escapes in `studio-contract.ts`, `studio-service.ts`, and `verify-rc.mjs`; this was identified from the Vercel build cliff and corrected. The post-fix deployment must be checked before calling the web branch build-clean.
- GitHub Actions still fails before executing job steps because of the existing account-level execution problem. The workflow now points its database job at the complete RC database suite rather than the old foundation-only suite.

Not yet proven:

- migrations 030/031 executing successfully in PostgreSQL
- the fake-hosted SQL journey
- hosted Supabase auth/storage/RPC behavior
- a deployed Modal separation/render callback chain
- real fingerprint-provider evidence
- Stripe checkout/webhook/cancellation
- authorized commercial/artist audio quality
- human listening-panel results
- Expo dependency install/typecheck/EAS builds
- physical iOS/Android behavior

The current runtime has FFmpeg/Rubber Band but no PostgreSQL client/server and no outbound GitHub DNS, so it cannot independently run the SQL suite or clone a clean checkout. Do not silently convert authored tests into claimed test results.

## Verification commands

From `app/`:

```sh
npm run verify:rc
```

With an isolated PostgreSQL cluster configured:

```sh
RC_REQUIRE_DB=1 FOUNDATION_PG_PORT=<isolated-port> FOUNDATION_PG_USER=<isolated-user> npm run verify:rc
```

The database stage runs foundation controls, studio actions, the fake-hosted journey, and native safety regressions against a uniquely named disposable database.

Renderer-only verification:

```sh
cd modal
python -m unittest -v test_green_render.py
```

Hosted acceptance remains explicit and staging-only:

```sh
MASHUPS_ACCEPTANCE_WRITE_OK=staging-only MASHUPS_STAGING_ORIGIN=https://<approved-staging-host> npx playwright test --config=acceptance/playwright.config.ts
```

## Remaining gates before production

These are now primarily evidence/deployment gates rather than missing application architecture:

- run migrations 025-031 in an isolated/local PostgreSQL suite, then inspect and apply to the correct staging Supabase project
- prove hosted auth, private Blob, processor callbacks, lease recovery, publication and revocation
- configure a real fingerprint provider or keep sample evidence in manual review
- prove Stripe sandbox lifecycle
- run authorized real-audio and independent listening review
- install/build/sign the native app and complete physical-device/store-policy testing
- repair GitHub Actions account execution and obtain green CI

Current decision: **NO-GO for public production.** Keep PR #11 draft. Retain #4-#9 until #11 has green integration evidence and is deliberately promoted.
