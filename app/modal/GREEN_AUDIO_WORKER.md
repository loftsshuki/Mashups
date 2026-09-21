# Deployable Green Room audio bridge

The repository contains a deployable Demucs separation bridge and a CPU FFmpeg/Rubber Band renderer. Deployment remains opt-in and can incur provider charges.

## Durable job contract

Migrations through 030 must be applied before enabling these workers.

Each dispatch now includes:

- `jobId`
- unique `dispatchToken`
- a bounded database lease
- source asset/hash provenance for track jobs
- signed per-asset URLs plus frozen stem/source hashes for project render jobs
- an HMAC-signed callback URL

Callbacks must return the active dispatch token. If a worker outlives its lease and the job is reissued, the stale worker is rejected.

Handoff failures are bounded by `max_attempts`. Expired leases are requeued or failed explicitly. Analysis, fingerprint and separation evidence is merged transactionally for one exact source version rather than racing through independent table updates.

## Configuration

Modal secret `mashups-green-audio`:

- `GREEN_ROOM_PROCESSOR_SECRET`
- `GREEN_ROOM_READ_WRITE_TOKEN`
- `GREEN_ROOM_APP_ORIGIN`

Deploy only after reviewing compute limits:

```sh
modal deploy modal/green_audio_worker.py
```

Set the returned bridge URL in the matching staging environment for:

- `GREEN_ROOM_SEPARATION_PROCESSOR_URL`
- `GREEN_ROOM_RENDER_CANDIDATES_PROCESSOR_URL`

Keep the analysis worker separate. A fingerprint provider remains a separate adapter and must return evidence bound to the exact source SHA.

## Audio behavior

Separation uses pinned Demucs/htdemucs dependencies and returns vocal, drums, bass and other stems to private Blob storage.

Renderer v2:

- requires eight canonical stems
- refuses tempo ratios outside 0.84-1.19
- permits only bounded +/-3 semitone pitch changes from the API contract
- reports nearest-beat offset for manual excerpt starts but does not claim automatic downbeat/phrase detection
- uses short fades around the drop-swap boundary
- measures integrated loudness and peak
- stores input hashes, tempo ratios, start-alignment data, pitch settings and renderer version in candidate metrics
- never labels an output musically approved automatically

Passing technical measurements remain `manual_review`. Two genuine independent Keep reviews are required before publication.

## Local renderer regression

```sh
cd app/modal
python -m unittest -v test_green_render.py
```

FFmpeg/ffprobe with Rubber Band must be installed. Fixtures are synthesized and are not evidence of quality on authorized songs.

## Remaining operational gates

- execute migrations 030/031 in PostgreSQL before hosted enablement
- build the Modal image and verify private Blob permissions
- exercise callback retries, lease expiry and stale-callback rejection in staging
- review Demucs/model/component licensing for the intended commercial use
- measure real-song latency, cost, artifacts and musical timing
- configure a real fingerprint provider if automated sample evidence is required
- rotate processor secrets only with an explicit in-flight-job strategy
