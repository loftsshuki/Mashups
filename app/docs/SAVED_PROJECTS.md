# Saved projects and sign-in recovery

September 12, 2026. This implements the saved-draft portion of the
[platform build plan](PLATFORM_BUILD_PLAN.md). The hosted database remains
unavailable; account persistence and sign-in still need verification against
the recovered staging environment. The app is not ready for a public launch.

## What people can do

- Name a prototype mashup, choose its sources and energy, generate three
  arrangements, and keep a favorite. The recipe and actual preview WAVs are saved
  in this browser's IndexedDB, with a stable project URL after a successful save.
- Refresh or return from the sign-in screen and reopen that draft without
  regenerating its cached audio. Corrupt, outdated, or mismatched audio is
  discarded while a valid recipe remains available for regeneration.
- Open **My saved mashups** to find device drafts and account recipes. A new copy
  gets its own UUID. Conflicting edits from another tab cannot silently overwrite
  the previous device save.
- Use **Save to account** for a private recipe. The UI confirms an account save
  only after a validated server receipt. Preview audio stays in this browser;
  opening an account recipe on another device requires regenerating the preview.
  Clearing browser data removes device copies. Device storage alone does not
  guarantee that a bookmarked project page can load without a connection.

The previous “Publish after sign-in” button is removed. Private recipe storage
does not create a public listening page, upload audio, or grant distribution
rights. The broader listener/creator product and optional artist-discovery
angle remain; the account screens now reflect that scope.

## Authentication and project boundary

Password sign-in, signup links, Google redirects, and email confirmation carry a
validated internal return destination. Confirmation-only signup displays an
email notice rather than attempting an unauthenticated profile insert. Profile
creation runs after authentication, preserves existing profiles, and handles a
username collision. Callback redirects stay relative to the current site so
preview and production hosts do not exchange cookies or device drafts. Callback
logs contain no authorization codes or user email addresses.

`GET /api/green/projects` returns the verified user's latest 50 private recipes;
`?id=UUID` returns one owned recipe. `PUT` accepts the portable
`GreenProjectInput` contract. Cookies and Supabase Bearer tokens are supported.
The server chooses the owner from verified authentication, validates the signed
prototype catalog, applies rate limits, and calls a service-only database RPC.

Migration **026_saved_projects.sql**, after 024 and 025, extends `green_projects`
instead of creating a competing project identity. Prototype sources are explicit
and cannot masquerade as real catalog foreign keys. Real catalog sources require
active grants checked inside the save transaction. Writes use a stable UUID and
expected revision. Identical retries return the original receipt; conflicting
changes, published projects, and projects with stored render candidates require
a new copy. Recipe edits cannot relabel reviewed audio. Browser clients cannot
call the write RPC directly or bypass these checks with table writes.

The service worker excludes account pages and specific draft URLs from its shell
cache. It can still cache the generic creation entry used by the PWA. It does
not cache project API responses or move device audio into a shared cache.

## Verification

- `npm run check`: lint, TypeScript, 68 unit tests, and production build passed.
- All 36 targeted browser checks passed on the local production build: 18 saved
  project/auth/cache checks and 18 foundation/audio regressions, across desktop
  Chrome and Pixel 7 viewports. The recovered mobile studio was visually checked.
- Actual migrations 024–026 passed the isolated PostgreSQL fixture, including
  ownership, stale revisions, identical retry receipts, source constraints,
  catalog grants, and protections for published/reviewed projects.

Browser tests use real IndexedDB and synthesized WAV playback. Successful account receipts,
fresh-device account loading, and 409 conflicts are simulated at the HTTP
boundary because the hosted Supabase project is unavailable. Database ownership,
revision, rights, and idempotency checks run against actual migrations in an
isolated PostgreSQL database. These tests do not establish working hosted login,
OAuth, confirmation delivery, or cross-device cloud persistence.

## Staging rollout and next work

1. Recover the correct Mashups Supabase project and inspect its data/migration
   history. Apply 025 and 026 in staging before enabling account saves.
2. Set the production/preview Supabase redirect allowlist and verify the email
   confirmation flow with its PKCE callback. Complete password and Google login,
   profile creation, save/reopen, and conflicting edits with two real accounts
   and two devices. Verify Bearer-token access for the native client.
3. Connect approved real audio, durable render jobs/output storage, publication,
   public listening links, and source/creator discovery. Browser prototype
   synthesis remains the audio source in this slice.
4. Continue the shared Expo iOS/Android client alongside those interfaces. Both
   platforms remain in the first release programme; this change adds portable
   project contracts, not installable native builds.

Stripe setup and a real sandbox checkout are also outstanding. Keep this branch
in draft review until the hosted integration checks pass; a preview deployment
alone is not production readiness.
