# Green Room Pilot Runbook

This is the operating reference for a controlled catalog/artist pilot. Product
scope and build order follow [PLATFORM_BUILD_PLAN.md](PLATFORM_BUILD_PLAN.md).
This cohort is one test of the broader consumer platform.

## Infrastructure Gate

- Apply `supabase/migrations/024_green_room_pilot.sql` to a production Supabase project.
- Create a separate private Vercel Blob store and link its generated `GREEN_ROOM_READ_WRITE_TOKEN`.
- Set `GREEN_ROOM_PROCESSOR_URL` and a high-entropy `GREEN_ROOM_PROCESSOR_SECRET` on the app and processor.
- Keep the existing public `BLOB_READ_WRITE_TOKEN` separate.
- Confirm `/api/pilot/readiness` reports the Green schema, private store, and processor ready.

## First Artist Intake

1. Sign in as the rightsholder and open `/supply`.
2. Upload the private master and complete every rights attestation.
3. Confirm the database contains one track, one rights grant, one private master record, and queued fingerprint/analyze jobs.
4. Verify rights in `/admin/green-room` only after reviewing chain-of-title evidence outside the automated attestation.
5. Confirm the cron hands jobs to the processor without exposing a permanent master URL.
6. Record analysis and reject anything outside the quality thresholds.
7. Obtain two independent blind `keep` reviews before publication.
8. Publish and confirm the track appears in `/api/green/catalog` only after every gate passes.

## Pilot Measurement Targets

The original pilot proposed the following targets. Treat them as hypotheses to
evaluate with explicit cohort definitions and adequate samples; they do not gate
native development or exploratory partner conversations:

- Day-30 retention is at least 15%.
- Render completion is at least 60%.
- Share-start rate is at least 20%.
- Severe audio failure is below 25% of candidate renders.
- Rights claim or social muting rate is below 5% for controlled exports.
- At least 15 of 100 qualified one-stop artists accept the pilot terms.

Weak retention should trigger diagnosis by audience and acquisition source.
An artist pilot alone does not determine a pivot of the whole app. Validate
commercial commitments against actual product performance, catalog permissions,
and operating costs.
