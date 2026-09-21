# Foundation sprint — September 12, 2026

This branch implements the first foundation fixes from the
[platform build plan](PLATFORM_BUILD_PLAN.md). Hosted database recovery and a real
Stripe test checkout remain outstanding. This is not a launch announcement.

## Changes

- Pricing sends the subscription IDs accepted by the checkout API. Product types
  are validated together, and an unknown or unconfigured product cannot silently
  select a different Stripe price. The page displays the actual API error.
- Migration `025_foundation_controls.sql` removes browser writes to catalog
  approval, rights grants, processing, publication, and event tables. Owners can
  still read their submissions and projects. Existing server intake and review
  routes use the service role; administrator routes retain the allowlist check.
- Rights verification and catalog publication use database transactions. Public
  catalog reads require verified, active grants with the necessary derivative
  and playback permissions. Regional grants stay private until territory can be
  enforced during delivery. Publication also requires passing stored analysis
  and two distinct reviewers of the same passing candidate, excluding the source
  owner and project creator.
- All 16 shared event names are accepted by the API and database. New events carry
  a unique ID for deduplication, a persistent browser visitor ID, and a separate
  session that expires after 30 minutes without activity. Legacy clients remain
  compatible, although only clients supplying event IDs get retry deduplication.
- Event storage failures return HTTP 503; rate limits return 429. The browser
  retries a transient failure once with the same event ID and records an
  observable warning if storage remains unavailable.
- Pilot metrics aggregate in PostgreSQL, avoiding the REST row limit. Completion,
  keep, and share rates use activity sessions. D30 means a return on the 30th UTC
  calendar day after a visitor's first recorded event, and excludes cohorts whose
  day 30 has not finished. An immature cohort reports `null`, not zero retention.
  Signup clicks no longer count as sharing. Unavailable analytics are labelled.
- Health checks probe Auth and the application schema separately, with the API
  key header, and report missing configuration, rejected credentials, missing
  schema, or network failure without returning credentials.

The current prototype creation flow and the broader product direction remain:
fans and creators can combine two catalog songs, and emerging-artist discovery is
an additional use case. iOS and Android remain in the first release programme.

## Verification

- `npm run check`: lint, TypeScript, 63 unit tests, and production build passed.
- Actual migrations 024 and 025 applied to an isolated PostgreSQL database. Tests
  exercised anonymous, authenticated-owner, and service-role access; approval
  rollback; expired, future, revoked, and regional grants; independent reviews;
  event compatibility and deduplication; a 1,100-session dataset; and exact D30
  cohorts. The fixture supplies minimal Supabase Auth/organization prerequisites;
  this does not verify the full hosted Supabase migration chain or sign-in flow.
- All 10 foundation browser checks passed across desktop and Pixel 7 viewports.
  They cover pricing requests and errors, event failure
  responses, private-route protection, health responses, and client event retries
  on the local production build. A simulated lost event receipt tests the
  browser retry path; it is not evidence of hosted event persistence.
- Another 10 desktop/phone regression checks passed for the existing catalog,
  creation, audio rendering, legacy redirects, and readiness screens. The
  prototype UI/audio tests stub telemetry receipts to isolate those flows from
  the unavailable analytics service; failure behavior is tested separately.
- CI includes a dedicated disposable PostgreSQL job for the database regressions.

Run the database checks against an isolated local PostgreSQL cluster with a
superuser, after setting `FOUNDATION_PG_PORT` and `FOUNDATION_PG_USER`:

```sh
npm run test:foundation:db
```

The runner connects only to loopback, creates a uniquely named test database, and
drops that database on completion. The cluster needs `anon`, `authenticated`, and
`service_role` test roles; the fixture creates them when absent. Do not point it
at a cluster serving application data. CI provisions its own disposable cluster.

## Hosted recovery and rollout

The configured production Supabase hostname does not resolve. The referenced
project is absent from the connected Supabase account. The first recovery step
is identifying the existing Mashups project or agreeing on a replacement and
checking any recoverable data. No unrelated project's database was reused.

The Vercel production/preview configuration lists no Stripe secret, webhook
secret, or product price variables. Configure a Stripe sandbox and the matching
prices before testing checkout, signed webhooks, and subscription entitlements.

Once the correct database is accessible:

1. Inspect data and migration history, and restore the baseline in staging.
2. Apply migration 025 before deploying this server code. Older servers can still
   insert the legacy event format. Approval work should stay paused during the
   deployment interval because older servers do not call the new approval RPCs.
3. Verify password and OAuth sign-in, profile persistence, one authorized catalog
   intake/review, and real event writes/reads through the hosted API.
4. Verify each configured Stripe test price, checkout completion, webhook
   idempotency, entitlement updates, and cancellation in the sandbox.
5. Promote only after those checks pass. Reverting the UI alone does not undo
   migration 025; retain the controls and fix forward if an integration fails.

Real audio jobs, saved projects across authentication, playable share pages,
shared native project/render/publication contracts, and installable iOS/Android
builds are subsequent work. This sprint does not claim those flows are complete.
