# Mashups native beta starter

One Expo SDK 56 application for iOS and Android. Implements password sign-in with secure session storage, account project list, approved source selection, render status, private candidate playback, Keep, guarded publishing, native sharing and `mashups://listen/<id>` links. Uses the shared contracts and the same studio API as web. Prototype device recipes remain on web.

This source has not been dependency-installed, fully typechecked, built, or run on hardware in this session. It is not an installable beta yet. No credentials, EAS project ID or signing material are supplied. Bundle identifiers are proposals, not registrations.

1. Install dependencies and commit the generated lockfile: `npm install` in this directory.
2. Set the three public staging variables from `.env.example`. Never add a service-role key, private Blob token, processor secret, or Stripe secret to Expo public variables.
3. Run `npx expo-doctor`, `npm run typecheck`, then `npx expo start` against verified staging.
4. Register/link the actual EAS project and owned Apple/Google app identifiers. Run EAS internal builds; use TestFlight only after signing and reviewer access are configured.

The starter pauses audio when backgrounded and refreshes authentication on foreground. It now exposes authenticated publication reporting, creator blocking, and an explicit reversible account-deletion request. The request does not silently delete an auth user; operator-side completion, retention/privacy handling, and deletion verification still require staging and store-policy review. Background audio, resumable uploads, purchase restoration, universal-link association files, OAuth/recovery, and production privacy disclosures remain unfinished. Physical tests must cover lock/unlock, calls, Bluetooth changes, headphones, bad network, expired authentication, reports/blocks, and deletion-request recovery.

Official version references: https://docs.expo.dev/versions/v56.0.0/ and https://github.com/expo/expo/blob/sdk-56/packages/expo/bundledNativeModules.json .
