# RC execution record: September 21, 2026

Branch: `codex/release-candidate-1`; draft PR #11. Do not merge or promote this record into a launch claim. The platform plan still governs scope; this record updates the implementation/evidence matrix in RELEASE_READINESS.md.

## Twelve workstreams

| # | Workstream | Repository work in this session | Evidence still needed |
|---|---|---|---|
| 1 | Real catalog studio | Catalog-only create flow, server render requests, persisted status polling, private candidate playback, errors and reload | Hosted authorized catalog and complete browser run |
| 2 | Keep a candidate | Owner/revision-checked selection RPC and action, identical retry support, selected identity persisted | Apply migration 029 and run real PostgreSQL regressions |
| 3 | Publish/share | Guarded publish action, old publish URL uses same action, studio share link, no-store public metadata, byte-range audio | Hosted rights/review/storage tests and physical phone seeking |
| 4 | Fork lineage | Public Make your version link, clean child recipe, parent identity, idempotent child create | Hosted fork after actual published audio |
| 5 | Separation | Deployable Modal GPU Demucs bridge with private output upload | Image build, credentials, provider terms review, real authorized job |
| 6 | Renderer | Eight input stems, independent tempo/pitch handling, three WAV arrangements, measured levels, signed callback path | Deployment, musical timing/phrase quality, real-song latency/cost |
| 7 | Fingerprinting | Provenance-bound adapter-side evidence validator and regression test; no invented provider result | Select/configure actual licensed provider, integrate hash-bound evidence into durable callback transaction |
| 8 | Supabase | Read-only schema/Auth preflight and isolated migration test runner through 029 | Connect correct project, inspect backups/history, recover approved staging, apply full prerequisite chain, real login/OAuth |
| 9 | Stripe sandbox | Read-only test-key/price verifier with fail-closed live-key and live-price tests | Sandbox keys/prices, signed webhook, completed checkout, entitlements, cancellation/replay |
| 10 | Two-device acceptance | Opt-in hosted Playwright scenarios for real render/save/reload/keep, anonymous listen/range request, fork | Run scenarios against staging, then physical iPhone/Android; no positive reviews are manufactured |
| 11 | Audio evaluation | Authorized real-audio panel protocol, provenance checklist, existing blind bench integration instructions | Actual recordings, independent listener reviews and measured failures |
| 12 | Native | Expo SDK 56 starter sharing contracts and APIs, secure sign-in, saved projects, playback, Keep/Publish/share/fork | Dependency install/lockfile, full typecheck, EAS/signing, TestFlight/Android builds, hardware and store compliance |

## Verification actually performed

- Eight focused Node tests passed: four studio/range/permission-state tests, three preflight safety tests and one fingerprint-evidence test. No credentials or provider requests were used.
- Three Python tests passed, including actual FFmpeg/Rubber Band processing of eight synthesized source stems into three distinct WAV previews. Output duration, finite measurements and peak bounds were checked. Tests do not represent licensed-song quality or human approval.
- Eighteen TS/TSX/MTS files in the partial patch workspace passed TypeScript transpiler syntax diagnostics. This is NOT a full project typecheck, dependency install, lint or build.
- Python source compilation and JSON parsing passed for the new source/configuration files.
- Vercel reported the first studio batch (`bf29bcf`) READY. Check the latest PR head deployment separately; Ready does not execute SQL migrations or prove hosted audio.
- No full repository checkout/dependency environment was available in this container. PostgreSQL and hosted Playwright suites were authored but NOT RUN. No native build or human/physical-device test ran.

## Commands

From `app/`:

```sh
node --experimental-strip-types --test tests/studio-contract.test.mts tests/release-preflight.test.mts tests/fingerprint-evidence.test.mts
node scripts/release-preflight.mjs
node scripts/test-studio-db.mjs
npx playwright test --config=acceptance/playwright.config.ts
```

The preflight is read-only and never claims release approval. Missing configuration reports unverified. The database runner requires an isolated loopback PostgreSQL cluster via FOUNDATION_PG_PORT and FOUNDATION_PG_USER, creates its own unique database, and drops only that test database. It does not exercise the entire historical hosted Supabase chain.

Hosted acceptance requires `MASHUPS_ACCEPTANCE_WRITE_OK=staging-only`, an explicit non-production HTTPS `MASHUPS_STAGING_ORIGIN`, an owned creator token, two approved source IDs and, for anonymous playback/fork, a publication already reviewed by real independent listeners. Credentials and reports/traces must stay private. The test is outside the normal e2e directory and does not silently write against production. It leaves its test projects for operator inspection/cleanup.

## Remaining engineering risks before launch

Do not mistake contract coverage for production reliability. Inherited processing still needs atomic analysis/fingerprint/separation result merging, immutable source-version bindings, bounded dispatch retries, expired-job lease recovery, and robust hosted idempotency tests. The first approved real catalog also needs an operator-controlled audition/bootstrap path; source approval must not depend on bypassing its own review gates. The new renderer provides manual start/pitch controls, not automatic musical alignment.

Native store release additionally needs OAuth/recovery, purchase restoration/entitlements, account deletion, reporting/blocking, privacy disclosures and device interruption testing. No placeholder universal-link association files or fake store credentials were added.

## Operator dependencies

The correct Supabase connection, Stripe sandbox configuration, worker deployment credentials, reviewed source permissions/audio, independent listeners, physical devices and Apple/Google signing remain external gates. A Supabase connection was offered in the conversation. No unrelated project, live Stripe mode, public source upload or paid GPU deployment was used.

Current decision: NO-GO for public production. Continue controlled implementation and staging validation. Retain #4–#9 until #11 is validated and safely promoted.
