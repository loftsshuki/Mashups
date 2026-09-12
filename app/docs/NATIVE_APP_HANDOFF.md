# Mashups Native Application Handoff

## Decision

Updated September 12, 2026: web, iOS, and Android are in the first release
programme. Build one React Native/Expo client for both native platforms using the
same product contracts and backend as the existing web app. Implementation starts
as those API and authentication boundaries become ready, alongside the complete
web loop. This replaces the earlier 1,000-user and retention prerequisites.

Follow [PLATFORM_BUILD_PLAN.md](PLATFORM_BUILD_PLAN.md) for milestones. General
listening and creation are core; artist-specific tools are additional capabilities.
The first native deliveries are TestFlight and Android internal-test builds.

## Shared Contract

`app/packages/contracts` is the existing portable dependency for web and the
planned Expo Router application. Native code must import arrangement IDs, event
names, rights types, and link builders from this package rather than copying them.

Canonical links:

- Web: `https://www.mashups.agency/create?left=signal-bloom&right=heat-map`
- App scheme: `mashups://create?left=signal-bloom&right=heat-map`
- Proposed iOS bundle ID: `agency.mashups.app`
- Proposed Android application ID: `agency.mashups.app`

Bundle identifiers are proposals until registered in Apple Developer and Google Play Console.

## Native Capabilities To Build And Verify

1. Reliable camera-to-cut workflow for building the visual around the mashup.
2. Push notifications for artist drops, challenge deadlines, and completed renders.
3. Background upload/render status with resumable jobs.
4. Native share sheets with generated video files.
5. Audio-session recovery across calls, lock screen, Bluetooth changes, and other apps.

## Proposed Expo Structure (Repository-Root Paths)

```text
apps/native/
  app/
    _layout.tsx
    index.tsx
    create.tsx
    project/[id].tsx
    profile/[username].tsx
  src/
    audio/
    catalog/
    analytics/
app/packages/contracts/   existing shared package
```

The native client should call the same HTTP APIs and never receive private master URLs, storage credentials, processor secrets, or standalone stems.

## App-Store Preparation

- Produce privacy nutrition labels only after analytics and crash providers are final.
- Explain user-generated derivative content and moderation during app review.
- Provide reviewer credentials for the permissioned catalog.
- Declare microphone or camera permissions only when a feature actually invokes them.
- Configure universal links only after Apple Team ID and Android signing fingerprints are available. Do not publish placeholder association files.
- Include subscription entitlement sync and purchase restoration, reporting and
  blocking, account deletion, and recovery across network and audio interruptions.
- Shared links must retain an HTTPS web fallback for people without the app.
