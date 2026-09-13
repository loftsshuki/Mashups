# Collision: visual mashup concept

An isolated player experiment at `/concepts/collision/index.html`. The public version uses a newly synthesized two-part electronic sketch, explicitly labeled. No existing catalog license or third-party recording is used by that default demo.

The charcoal sculpture represents the backing; the orange ribbon represents the lead. Separate Web Audio analysers measure each part. The backing's low-frequency energy drives scale and surface motion, and lead RMS controls ribbon width and deformation. Art-directed rotation provides continuity. These visual mappings express source activity, not tempo alignment or musical compatibility.

The native WebGL scene has studio lighting, procedural geometry, responsive framing and no third-party graphics dependency. Playback is gesture initiated, with both decoded buffers scheduled on one AudioContext clock. Solo controls adjust gain at the same position and preserve relative mix levels. Seek, pause, replay, natural ending and background interruption are supported. Still artwork keeps the audio playing while freezing spatial motion. Reduced-motion users start in still mode; lack/loss of WebGL keeps the audio controls available with a CSS artwork fallback.

This is a concept demonstration, not a main-app redesign or an export feature. The comparison is experiential; no engagement uplift is claimed or measured. To test the business hypothesis later, compare the same music with still and reactive treatments using listener retention, replay and artist-profile visits.

For private auditions, a separate protected deployment can supply `mode: "files"` and matching local-relative `backingUrl`/`leadUrl` values in its `demo.json`. The current private demo trims 30 seconds from the previously reviewed mix buses with identical trim/fades and unchanged relative gain. Private recordings, manifests, prepared builds and verification artifacts remain under the ignored `.audio-bench/` directory and are never committed. Do not replace the public demo manifest with private audio references or disable preview protection.

Checks cover the real browser audio graph, muted source levels, same-clock starts, preserved timeline, static versus changing canvas output, reduced motion, WebGL fallback, decode errors and responsive layout. These verify the demonstration; native iOS/Android behavior and real-device frame rates still need hardware testing.
