# Real-audio evaluation protocol

Status: harness implemented; no real-song listener results collected in this session.

Use only recordings and stems whose owners have authorized these processing and listening uses. Keep all source masters, private bundles, provider receipts and listener identifiers outside Git/public. A fingerprint match result does not confer remix permission.

## Trial manifest

For each pair retain a private record of source hashes, grant IDs and scope, source/stem versions, checked BPM/start offsets, pitch settings, renderer/FFmpeg version, processing time, provider invoice or cost evidence, candidate hashes, and review assignments. Do not label a synthetic fixture as real-song evidence.

Include clean supplied stems and imperfect separated stems; sung vocals and rap; stable and drifting tempos; same-key and difficult harmonic examples. Hold arrangement and loudness constant when comparing separation providers. Hold stems constant when comparing arrangements. Include failed/abstained examples.

Use the existing `benchmark:listening -- --manifest <private-manifest>` bench to prepare blind, loudness-matched excerpts. Serve only its listener bundle on source-approved private hosting, never its operator directory. Preserve About equal and Neither responses. Counterbalance A/B assignments across panels.

## Human review

Ask independent listeners to record vocal clarity, timing/phrasing, audible artifacts, musical coherence, and whether they would keep or share the result. The new review action stores musicality, artifact quality and share-confidence ratings, plus notes. Only allowlisted reviewers may submit; the creator and both source owners cannot serve as the two independent keep reviewers. A script must not submit fabricated positive ratings to unblock a test.

Review action: POST `/api/green/studio` with `action: review`, candidateId, decision (keep/reject/rework), musicality, artifacts, share (each 1–5), notes. Sign in as the actual reviewer; never share a service-role key. Private candidate playback is available to allowlisted reviewers with the project and candidate IDs.

Two reviews plus stored technical measurements control the initial permissioned pilot workflow. This is an operating rule, not proof of market demand or statistical superiority. Report counts and disagreements rather than claiming a calibrated quality probability.

## Evidence still required

Authorized recordings, independent human reviews, measured latency/cost on the deployed worker, physical iPhone and Android playback, and signed hosted storage receipts remain mandatory. Synthetic FFmpeg regression tests prove implementation behavior only.
