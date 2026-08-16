# Audio Quality Operations

## Release Gate

Run `npm run benchmark:audio` before every audio-engine release. The command writes `public/reports/audio-quality-benchmark.html` from 72 deterministic cases:

- 12 ordered source pairs.
- Three structural arrangements per pair.
- Two energy profiles per arrangement.

Compatible renders must score at least 78 for share-worthiness. Incompatible pairs pass the gate only when preflight rejects them before rendering.

## Listening Review

For every new catalog track:

1. Run master validation, BPM/key analysis, phrase confidence, loudness, true peak, sample scan, and stem quality checks.
2. Generate every allowed pairing and all three arrangements.
3. Have two independent reviewers mark each candidate `keep`, `reject`, or `technical-failure`.
4. Record timing, harmony, collision, transition, loudness, and clipping observations.
5. Publish only after rights, automated quality, and listening gates all pass.

Known-bad combinations must remain fixtures. Never remove a regression because the engine learned to hide rather than solve the artifact.

## Quality Priorities

1. Correct phrase boundaries.
2. No simultaneous competing toplines.
3. Non-destructive tempo and key changes.
4. Clean transitions and controlled low-frequency energy.
5. Loudness and true-peak compliance.
6. Listener pride and share intent.

No score can override a missing permission.
