# Mashups native beta starter

One Expo SDK 56 application for iOS and Android. Implements password sign-in with secure session storage, account project list, approved source selection, render status, private candidate playback, Keep, guarded publishing, native sharing and `mashups://listen/<id>` links. Uses the shared contracts and the same studio API as web. Prototype device recipes remain on web.

This source has not been dependency-installed, fully typechecked, built, or run on hardware in this session. It is not an installable beta yet. No credentials, EAS project ID or signing material are supplied. Bundle identifiers are proposals, not registrations.

1. Install dependencies and commit the generated lockfile: `npm install` in this directory.
2. Set the three public staging variables from `.env.example`. Never add a service-role key, private Blob token, processor secret, or Stripe secret to Expo public variables.
3. Run `npx expo-doctor`, `npm run typecheck`, then `npx expo start` against verified staging.
4. Register/link the actual EAS project and owned Apple/Google app identifiers. Run EAS internal builds; use TestFlight only after signing and reviewer access are configured.

The starter pauses audio when backgrounded and refreshes authentication on foreground. It does not claim background audio, resumable uploads, purchase restoration, universal-link association files, OAuth, reporting/blocking or account deletion. Those app-store requirements remain unfinished. Physical tests must cover lock/unlock, calls, Bluetooth changes, headphones, bad network and expired authentication.

Official version references: https://docs.expo.dev/versions/v56.0.0/ and https://github.com/expo/expo/blob/sdk-56/packages/expo/bundledNativeModules.json .
