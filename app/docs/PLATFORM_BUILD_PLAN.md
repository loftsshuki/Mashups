# Mashups platform build plan

Updated: September 12, 2026. Status: foundation fixes and saved-project recovery
implemented on feature branches; the milestones below are not complete. See
[the foundation sprint](FOUNDATION_SPRINT.md) and
[saved projects](SAVED_PROJECTS.md) for verification and recovery steps.

This document is authoritative for product scope and build order. It supersedes
older instructions that postpone native apps until a user-count threshold or
automatically change the whole business to an artist-only product.

## Product decision

Mashups helps people create, listen to, discover, and share mashups. Fans,
hobbyists, DJs, professional creators, artists, and catalog partners use the same
platform. Emerging-artist discovery is one use case and pilot opportunity.

The creation flow supports two approved catalog songs. Using an artist's own
original is an additional source option. Artist onboarding is optional; listeners
can arrive through a shared link and hear music before creating an account.

Web, iOS, and Android are in the first release programme. One React Native/Expo
client will serve both native platforms, using the same backend as the web app.
Native implementation can begin as the shared API contracts become ready.

## First milestone: a mashup that survives the handoff

An invited creator selects two approved real tracks, hears three arrangements,
keeps one, signs in without losing the project, publishes it, and shares an HTTPS
link. Another person opens that link on a different phone, plays the mashup,
explores its credited creators and source artists, and can follow or create their
own version within the source permissions.

The project and audio must survive a refresh, sign-out, and later return. Public
playback works without an app installation. Reviewers must be able to trace the
sources, permissions, processing cost, and actual listening events.

## Build order

| Phase | Deliverable | Completion evidence |
| --- | --- | --- |
| 1. Foundation | Working database/authentication, controlled catalog approval, consistent event contracts, correct checkout identifiers | Real records persist; authorization checks pass; events reach storage; a test checkout reaches the intended plan |
| 2. Complete web loop | Real catalog sources, asynchronous audio rendering, saved projects, public playback, sharing, and discovery | The first-milestone journey works across two phones and survives authentication and reloads |
| 3. Native betas | Shared iOS/Android client for discovery, playback, profiles, creation, saved projects, and native sharing | Installable TestFlight and Android internal-test builds complete the same journey against staging |
| 4. Measured pilot | Free/Pro access, operating-cost measurement, general listener/creator cohorts, and one optional artist campaign | Real use, repeat listening/creation, reliable attribution, and paid conversion can be inspected |

Phase 3 starts alongside phase 2 once its API and authentication boundaries are
defined. App-store release also needs billing/restoration, moderation,
reporting/blocking, account deletion, privacy disclosures, and device testing.

## First engineering sprint

1. Diagnose database connectivity and restore a working staging environment.
   Inspect existing data and migrations before choosing a recovery path. Verify
   authentication, private storage, and the health/readiness responses with real
   reads and writes.
2. Restrict catalog approval and grant changes to authorized reviewers. Check
   ownership, expiry, territory, and requested use at render and publication time.
3. Align pricing identifiers with the checkout API and verify Stripe test-mode
   checkout and subscription updates. Commercial catalog access remains bounded
   by the grants actually obtained.
4. Align event names across clients, API validation, and database constraints.
   Report persistence failures; define sessions and deduplication explicitly.
5. Define shared project, render-job, publication, playback, and entitlement
   contracts. Choose one durable publication identity consumed by discovery,
   profiles, and share pages.

Keep these as independently reviewable changes. Use authorization regression
checks, test-mode billing, and an actual event write/read to verify the foundation.

## Completing the audio and sharing loop

- Connect the creator to the durable approved catalog. Keep the two-catalog-song
  path and add reviewed original uploads without forcing either source type.
- Start the real-audio pilot with supplied vocal/instrumental stems where possible.
  Add asynchronous jobs, bounded retries, progress, and stored output assets.
  The current processor's analysis path is not a finished arrangement engine.
- Evaluate the actual rendered audio and conduct human listening reviews. Report
  measured failures and latency; metadata compatibility alone is not proof of
  musical quality.
- Save source IDs, arrangement parameters, job state, and selected output before
  authentication redirects. Re-check permission when publishing and exporting.
- Publish playable HTTPS pages with creator and source-artist credits, profile
  links, permitted video exports, and remix lineage. Make discovery a listening
  surface for published mashups.
- Extend general profiles with optional original-track sections. Listening-only
  original uploads and permission for others to remix them are separate choices.

## Pilot and commercial work

Recruit a small mix of listeners and creators, including people who simply want
to combine familiar songs. Run an emerging-artist campaign as a separate cohort
if suitable participants and repertoire are available. Partner conversations and
catalog-permission work can start while engineering proceeds.

Free access should provide a useful first creation and a public profile. Pro can
offer expanded approved catalog access, creation/export allowances, and analytics
to hobbyists and professionals. Artist tools and label-funded release/catalog
campaigns are additional commercial offers. Set prices after inspecting licensing,
processing, storage, support, and store/payment costs.

Track qualified listening, successful creations, kept versions, shared-link
visitors, repeat listeners/creators, and paid conversion. For artist campaigns,
also measure profile visits, original-track listening, follows, and return visits.
Identify paid or incentivized traffic and distinguish existing fans from newly
reached listeners where evidence permits. External service clicks are not proof
of streams or purchases. Small-cohort results are exploratory, not causal lift.

A live-event sponsorship can test audience acquisition once the playback and
profile journey works. It does not become a prerequisite for launching the app.

## Dependencies and boundaries

- Real recognizable repertoire depends on agreements covering the intended uses;
  no catalog deal or participant commitment is implied by this plan.
- Production database recovery, processor provisioning, and app-store signing
  depend on the relevant account access and configuration. Record the specific
  missing input after inspection rather than treating every dependency as blocked.
- Keep source grants, contributor permissions, costs, and operating instructions
  documented so a future operator can assess and run the platform.
- Existing experimental commercial and social modules can be reused when needed.
  Additional gamification, city competitions, complex payouts, and speculative
  scoring are outside the first milestone.

## Related documents

- [Public product principles](PRODUCT_RESET_GREEN_ROOM.md)
- [Session handoff](SESSION_HANDOFF.md)
- [Mobile architecture](MOBILE_PRODUCT_ARCHITECTURE.md)
- [Native application handoff](NATIVE_APP_HANDOFF.md)
- [Controlled catalog pilot operations](GREEN_ROOM_PILOT_RUNBOOK.md)
