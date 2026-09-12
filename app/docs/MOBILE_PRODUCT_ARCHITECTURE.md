# Mashups Mobile Product Architecture

## Decision

Updated September 12, 2026: build the existing Next.js web product and one
React Native/Expo client serving both iOS and Android. All three are in the first
release programme. Start native implementation alongside the web loop as the
shared API contracts become ready. See [PLATFORM_BUILD_PLAN.md](PLATFORM_BUILD_PLAN.md).

The mobile web app provides immediately playable shared links. Native betas add
device integration and use the same catalog, projects, permissions, and accounts.

## Why

- Rights, catalog, projects, render jobs, attribution, analytics, and beta access are product contracts. They must be shared by every client.
- Web, iOS, and Android audio engines have different runtime constraints. Pretending the current WebAudio implementation is reusable native UI would create false velocity.
- Responsive web links reach invitees immediately and work without installation.
- Native clients provide playback/audio-session recovery, native sharing, upload
  and render-job status, and notifications. Long-running music rendering remains
  on the shared backend.

## Current Client Boundary

The web client may:

- Read only tracks that are `green`, rights-verified, and quality-passed.
- Preview owned prototype synthesis locally.
- Request server render jobs for artist-direct assets once the processor is active.
- Emit the server-validated Green Room funnel.
- Install to a home screen through the web manifest and service worker.

The web client may never:

- Receive private masters or stems.
- Decide rights status.
- Publish a track by bypassing quality and listening gates.
- Export artist-direct standalone MP3, WAV, or stems.
- Cache private audio or authenticated API responses in the service worker.

## Native Start And Release Checks

Start `apps/native` with Expo Router once the shared authentication and catalog,
project, render-job, and publication interfaces are defined. User-count and
retention thresholds are measures for later product decisions, not prerequisites
for this implementation.

Before wider release, verify the core journey, rights enforcement, billing,
privacy/moderation flows, HTTPS deep-link fallback, and playback recovery on real
iOS and Android devices. Evaluate repeat use across general listener/creator
cohorts as well as optional artist campaigns.

## Native Repository Shape

Use repository-root paths without relocating the existing web application:

```text
app/                         existing Next.js product
  packages/contracts/        existing portable product contracts
apps/native/                 planned Expo Router iOS + Android client
```

Do not share React DOM components with React Native. Share pure TypeScript contracts, state machines, test fixtures, and generated API clients.

Add workspace configuration and extract additional packages only where both
clients need them. This structure is a plan, not a claim that native code exists.

## API Contract

- `GET /api/green/catalog`: public fail-closed catalog response.
- `POST /api/green/events`: anonymous or authenticated funnel events.
- `POST /api/green/intake`: authenticated rightsholder intake after private upload.
- `POST /api/green/uploads/path`: authenticated private pathname allocation.
- `POST /api/green/uploads/token`: scoped private client-upload token.
- `GET /api/green/assets/:jobId`: expiring processor-only master stream.
- `POST /api/green/processing/callback`: authenticated quality result.
- `GET|POST /api/admin/green-room`: allowlisted rights and publication operations.

Version these routes before a native public release. The native app must tolerate additive response fields and reject unsupported breaking schema versions.

## Release Sequence

1. Repair the foundation and define shared contracts against staging.
2. Complete the web create/save/publish/listen journey and scaffold the native
   client alongside it as the interfaces stabilize.
3. Implement native discovery, playback, profiles, creation, saved projects, and
   sharing; reuse the backend for real-audio processing.
4. Ship TestFlight and Google Play internal-test builds against that staging API.
5. Run general listener/creator cohorts and an optional artist-discovery pilot.
6. Complete app-store requirements and device checks before wider release; measure
   repeat use and acquisition by platform and use case.
