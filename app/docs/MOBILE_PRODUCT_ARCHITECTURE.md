# Mashups Mobile Product Architecture

## Decision

Build the current Green Room sprint mobile-first in the existing Next.js product. Do not wait for a “finished desktop,” and do not maintain three UI codebases before the core loop is proven.

The installable web app is the first iPhone and Android beta surface. A native Expo app starts only after the product demonstrates repeat use and identifies device capabilities the web cannot deliver reliably.

## Why

- Rights, catalog, projects, render jobs, attribution, analytics, and beta access are product contracts. They must be shared by every client.
- Web, iOS, and Android audio engines have different runtime constraints. Pretending the current WebAudio implementation is reusable native UI would create false velocity.
- A responsive PWA reaches invitees immediately, avoids app-review delay, and gives one funnel dataset.
- Native code is justified by measured needs: reliable background rendering, low-latency audio, share-sheet integration, push notifications, offline drafts, or web audio failures.

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

## Native Trigger

Start `apps/mobile` with Expo Router when all of these are true:

1. At least 1,000 qualified beta users have entered the creation funnel.
2. Day-30 retained creator rate is at least 15%.
3. At least 20% of activated sessions start a compliant share.
4. At least 60% of started render sessions complete.
5. Rights-related muting or claims remain below 5% for controlled video exports.
6. User evidence identifies at least two native-only advantages worth the maintenance cost.

Kill or reposition the consumer loop if Day-30 retention is below 10% after a representative artist-direct beta.

## Native Repository Shape

When the trigger is met:

```text
apps/
  web/                 Next.js product
  mobile/              Expo Router iOS + Android
packages/
  green-domain/        Zod schemas, types, quality and compatibility rules
  api-client/          Typed HTTP client and auth/session adapters
  analytics-contract/  Event names and property schemas
  brand-tokens/        Color, spacing, type scale, icon assets
```

Do not share React DOM components with React Native. Share pure TypeScript contracts, state machines, test fixtures, and generated API clients.

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

1. Mobile web closed beta on iPhone and Android.
2. Instrument browser, operating system, render latency, audio failures, keeps, and shares.
3. Run artist-direct pilot and evaluate progression gates.
4. Scaffold Expo Router and extract pure packages only after the gate passes.
5. Ship TestFlight and Google Play internal tracks against the same staging API.
6. Compare native and PWA cohorts before moving acquisition to app stores.
