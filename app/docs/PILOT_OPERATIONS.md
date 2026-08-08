# Mashups Founding Pilot Operations

This runbook turns the EDM/house business thesis into one executable path:

1. Qualify a rightsholder in `/outreach`.
2. Capture track, authority, market, creator, and budget inputs in `/pilot/new`.
3. Bind deliverables, the Growth License, measurement, economics, and protection in `/operator`.
4. Refuse launch until required infrastructure and operating evidence pass `/readiness`.
5. Operate the campaign through `/domination` and preserve the resulting evidence graph.

Until hosted persistence is available, `?demo=1` enables a labeled device-local operating kit. Intake, operator terms, and outreach records can be restored from the same browser. Export campaign packets and pipeline CSVs after every working session; local browser storage is not an encrypted team database.

## Founding Offer

- Program: `FOUNDING-HOUSE-001`
- Genre beachhead: independent electronic, beginning with house and adjacent dance catalogs
- Markets: Miami, London, Berlin, New York, and Los Angeles
- Test window: 14 days
- Standard floor: 50 creator opportunities, 50 qualified posts, and three hook-genome tests
- Measurement: matched geographic or audience holdout with at least 100 observations per cohort
- Rights: explicit master authority, edit permission, organic short-form use, creator whitelisting, territories, term, paid cap, and takedown SLA
- Protection: service credit against the Mashups platform fee when contracted operating deliverables fail
- Explicit exclusions: stream, revenue, chart-position, and virality guarantees

## Prospect Qualification

Prioritize active independent releases where a founder, manager, distributor, or artist controls the master and can approve campaign edits. Disqualify major-controlled masters, unclear territories, absent artist participation, or teams that only want vanity reach.

The migration seeds market and segment configuration plus outreach copy. It intentionally inserts no fabricated people, companies, tracks, campaign results, or pipeline activity. Demo prospects use the reserved `.example` domain and only appear when `?demo=1` is explicit.

## Local Validation

Mashups Supabase uses isolated ports so it does not disturb other local projects:

```powershell
npx supabase start
npx supabase db reset --local
docker exec supabase_db_app psql -U postgres -d postgres -Atc "select count(*) from public.pilot_market_configs;"
```

Expected operating seed counts after reset:

- `pilot_market_configs`: 5
- `pilot_program_templates`: 1
- `pilot_target_segments`: 5
- `outreach_playbook_templates`: 3
- `outreach_prospects`: 0

## Quality Gates

```powershell
npm run check
npm run test:e2e
```

The Playwright suite runs desktop Chromium and a Pixel 7 viewport. It verifies intake submission, operator configuration, outreach advancement, CSV export, production blockers, mobile containment, and all fourteen Domination systems.

The ten-day acquisition cadence and qualification script live in `docs/OUTREACH_SPRINT.md`.

## Production Launch Gate

Do not onboard real rightsholders until `/readiness` has no required blockers. At minimum:

- Create a replacement hosted Supabase project and apply every migration.
- Set production and preview Supabase URL, anon key, and service-role key in Vercel.
- Provision Vercel Blob and set `BLOB_READ_WRITE_TOKEN`.
- Set `CRON_SECRET` and verify scheduled jobs fail closed.
- Set `OPENAI_API_KEY` for hook and campaign intelligence workloads.
- Verify `mashups.agency` and `www.mashups.agency` resolve to the intended production deployment.

Stripe, partner delivery, and platform OAuth are attention gates until the pilot charges customers, pays creators, or sends data through external rails. They must be complete before those specific capabilities are advertised as live.
