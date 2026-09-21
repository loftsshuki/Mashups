# Mashups Release Readiness

Updated: September 21, 2026.

This checklist is subordinate only to [PLATFORM_BUILD_PLAN.md](./PLATFORM_BUILD_PLAN.md). Older launch documents are historical unless referenced here.

## Release candidate

Branch: `codex/release-candidate-1`  
Draft PR: #11

The RC consolidates PRs #4-#9 and adds the durable real-audio, publication, native, reliability and acceptance work described in [RC_EXECUTION_2026-09-21.md](./RC_EXECUTION_2026-09-21.md).

Do not merge to `main` merely because Vercel builds.

## First milestone

A defensible milestone completes this journey with real approved audio:

1. two approved sources
2. immutable source hashes and durable analysis/fingerprint/separation evidence
3. eight private provenance-bound stems
4. three durable candidate renders
5. Keep one candidate
6. sign in/save/reload without losing the project
7. two independent reviews
8. permission-checked publication
9. anonymous second-device playback with credits
10. permitted fork with lineage
11. source-rights revocation removes public playback

## Evidence matrix

| Area | Repository state | Evidence still required |
| --- | --- | --- |
| CI | Workflow now runs the complete RC DB suite plus lint/typecheck/tests/build/browser checks | GitHub account execution restored and all jobs green |
| Database | Migrations 024-031; fake-hosted and safety SQL regressions authored | Execute in isolated PostgreSQL, then staging Supabase |
| Processor reliability | Dispatch leases/tokens, max attempts, stale recovery, atomic evidence merge | Hosted concurrency/retry/lease-loss tests |
| Provenance | Master SHA at intake; source/stem/render hash bindings | Real hosted upload + provider callback proof |
| Catalog bootstrap | Private operator audition path preserves rights/review gates | Execute with two authorized sources and real reviewers |
| Separation | Demucs/Modal bridge source implemented | Build/deploy image, verify credentials/licensing/cost/latency |
| Rendering | FFmpeg/Rubber Band v2; conservative warp refusal; LUFS/peak/provenance | Hosted callback chain + authorized-song listening quality |
| Fingerprinting | Source-hash-bound evidence contract integrated | Select/configure real provider or remain manual review |
| Studio | Real catalog project/render/status/candidate/select flow | Hosted account/device run |
| Publication | Canonical project identity; rights recheck; private audio proxy; range support | Anonymous second-phone playback and seeking |
| Forks | Clean child project with parent lineage | Hosted publication-to-fork proof |
| Billing | Existing checkout/webhook implementation + read-only sandbox preflight | Real sandbox checkout, webhook replay, entitlements, cancel |
| Safety | Report/block/deletion-request API; web/native controls | Hosted moderation ops and deletion-completion policy |
| Native | Expo beta source for shared product loop | Install/typecheck/EAS/signing/TestFlight/Android/device tests |
| Audio evaluation | Blind bench + real-audio review protocol | Authorized recordings and genuine independent ratings |

## Processing contract

Every durable processor attempt receives a unique `dispatchToken` and lease. A callback must present the active token. If a lease expires, the job can be requeued with a new token and the old worker can no longer commit.

Track jobs bind to:

- `source_asset_id`
- `source_sha256`
- one serialized processing-evidence record for that exact source version

Render jobs freeze the eight stem asset IDs plus stem/source hashes. Render output requires SHA-256 digests before it can become a durable candidate.

A technically valid render remains `manual_review` until independent people approve it. Technical measurements are not a musical-quality probability.

## Pre-Supabase verification order

1. Run `RC_REQUIRE_DB=1 npm run verify:rc` with isolated PostgreSQL.
2. Fix any migration/SQL/TypeScript/browser failures locally.
3. Restore GitHub Actions execution and obtain green CI.
4. Inspect the actual Supabase project and migration history before applying anything.
5. Apply only the missing migrations in order to staging.
6. Configure private Blob and processor endpoints/secrets.
7. Bootstrap two authorized tracks through private audition/review.
8. Run the staged two-device acceptance flow.
9. Configure and test Stripe sandbox.
10. Run real-audio listening and native physical-device acceptance.

## Operator inputs

Still external:

- correct Supabase project and database history
- Stripe sandbox credentials/prices/webhook
- Vercel/Modal private environment configuration
- actual fingerprint service credentials if automated scanning is desired
- authorized audio
- independent reviewers
- Apple/Google signing and physical devices
- GitHub account/Actions execution repair

## Go / no-go

A public production **go** requires successful CI plus the hosted real-audio journey across two devices with durable storage, active rights, private source handling, reviewed publication, anonymous playback, fork lineage, and revocation behavior.

Until then the RC is a controlled staging build.
