# Green Room Pilot Runbook

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

## Pilot Gates

Progress to boutique-label outreach only when:

- Day-30 retention is at least 15%.
- Render completion is at least 60%.
- Share-start rate is at least 20%.
- Severe audio failure is below 25% of candidate renders.
- Rights claim or social muting rate is below 5% for controlled exports.
- At least 15 of 100 qualified one-stop artists accept the pilot terms.

Pivot to a B2B artist campaign/remix layer if Day-30 retention is below 10%. Do not pursue major-label advances before the consumer loop and controlled exports are proven.
