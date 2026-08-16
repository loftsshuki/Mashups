# Mashups Native Application Handoff

## Decision

Build mobile and desktop from the same product contracts now. Do not maintain native UI code until the Green Room loop proves repeat behavior.

Native implementation starts only when all gates hold for a qualified beta cohort:

- At least 1,000 qualified beta users.
- Day-30 retention at or above 15%.
- Render completion at or above 60%.
- Share-start rate at or above 20%.
- Rights-related muting or claims below 5%.
- At least two demonstrated native-only advantages.

If Day-30 retention is below 10%, reposition the consumer loop before investing in app-store clients.

## Shared Contract

`packages/contracts` is the portable dependency for web and a future Expo Router application. Native code must import arrangement IDs, event names, rights types, and link builders from this package rather than copying them.

Canonical links:

- Web: `https://www.mashups.agency/create?left=signal-bloom&right=heat-map`
- App scheme: `mashups://create?left=signal-bloom&right=heat-map`
- Proposed iOS bundle ID: `agency.mashups.app`
- Proposed Android application ID: `agency.mashups.app`

Bundle identifiers are proposals until registered in Apple Developer and Google Play Console.

## Native-Only Advantages To Validate

1. Reliable camera-to-cut workflow for building the visual around the mashup.
2. Push notifications for artist drops, challenge deadlines, and completed renders.
3. Background upload/render status with resumable jobs.
4. Native share sheets with generated video files.
5. Audio-session recovery across calls, lock screen, Bluetooth changes, and other apps.

## Proposed Expo Structure

```text
apps/native/
  app/
    _layout.tsx
    create.tsx
    project/[id].tsx
  src/
    audio/
    catalog/
    analytics/
packages/contracts/
```

The native client should call the same HTTP APIs and never receive private master URLs, storage credentials, processor secrets, or standalone stems.

## App-Store Preparation

- Produce privacy nutrition labels only after analytics and crash providers are final.
- Explain user-generated derivative content and moderation during app review.
- Provide reviewer credentials for the permissioned catalog.
- Declare microphone or camera permissions only when a feature actually invokes them.
- Configure universal links only after Apple Team ID and Android signing fingerprints are available. Do not publish placeholder association files.
