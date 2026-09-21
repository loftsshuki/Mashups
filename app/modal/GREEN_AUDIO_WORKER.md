# Deployable Green Room audio bridge

Implementation status: the local FFmpeg renderer passes three focused Python tests, including real PCM processing into three different previews. The Modal image, GPU separation, private Blob upload and hosted callbacks have not been executed in this session.

## Configuration and deployment

From `app/`, use an authenticated Modal account and the official Modal CLI. Create the `mashups-green-audio` secret in Modal with:

- `GREEN_ROOM_PROCESSOR_SECRET`: the shared server-side HMAC secret used by this Mashups staging environment.
- `GREEN_ROOM_READ_WRITE_TOKEN`: token for the dedicated PRIVATE Green Room Blob store.
- `GREEN_ROOM_APP_ORIGIN`: the exact HTTPS origin of that staging app, without paths. Do not disable preview protection; configure an approved worker-reachable staging host instead.

Run `modal deploy modal/green_audio_worker.py` only after reviewing the account's compute limits. This creates an L4 separation function and a CPU render function; it can incur provider charges. No deployment or paid processing was performed here.

Set BOTH `GREEN_ROOM_SEPARATION_PROCESSOR_URL` and `GREEN_ROOM_RENDER_CANDIDATES_PROCESSOR_URL` in the matching Vercel environment to the returned bridge endpoint. Keep the existing analysis endpoint separate. All server secrets stay outside Git and the browser/native bundle. Apply and verify migrations 025 through 029 in staging before enabling studio writes.

The bridge returns 202 and spawns work. It accepts only separation/render jobs, checks signed source URL origins, forbids redirects, bounds downloads, writes outputs into private Blob, and signs callbacks. It never receives general database access. Preserve the shared secret until in-flight work is finished; rotation requires coordinating Vercel and Modal.

## Actual audio behavior

Separation uses pinned Demucs/htdemucs dependencies, returning four private stem assets. No reference-ground-truth SDR or bleed measurement is fabricated. Rendering uses supplied source BPM, manually selected starts, target tempo and bounded optional pitch shifts; FFmpeg Rubber Band separates tempo change from pitch change. It produces A-vocal/B-backing, B-vocal/A-backing, and a two-section drop swap. This is a bounded preview engine, not automatic beat-grid/chord/phrase alignment. The swap point is half the selected duration, not claimed to be a verified downbeat.

Rendered previews are measured for integrated loudness and oversampled peak via FFmpeg loudnorm, hashed, and tagged with renderer provenance. Passing technical measurements leave `qualityStatus: manual_review` and musical quality `not_evaluated`. Human keep reviews are still required. The zero composite score is not a quality probability.

Run local regression from `app/modal`: `python -m unittest -v test_green_render.py`. FFmpeg/ffprobe with Rubber Band must already be installed. These fixtures contain newly synthesized tones, not third-party recordings.

## Remaining operational gates

Build the Modal image; verify private Blob permissions; exercise retries and callback receipts in hosted staging; add atomic result merging, bounded job leases and stale-worker recovery; bind stems/scan evidence to immutable source versions; review component/model licensing for commercial deployment; measure real-song separation/render latency, quality and cost. A fingerprint provider remains separate and unconfigured. Do not interpret an analysis result as clearance.

References: https://modal.com/docs/reference/modal.Image ; https://modal.com/docs/guide/webhooks ; https://github.com/facebookresearch/demucs ; https://ffmpeg.org/ffmpeg-filters.html .
