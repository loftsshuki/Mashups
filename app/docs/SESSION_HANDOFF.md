# Mashups Session Handoff

## Current Baseline
- Project: `Mashups`
- Repo path: `c:\Dev\Mashups`
- Branch: `claude/mashups-dev`
- Baseline commit: `1fa23d9`
- Status: clean working tree

## What Is Already Shipped
- Legal center + policies (terms, copyright, repeat infringer)
- Rights + monetization schema migrations
- Admin moderation + claim actions
- Realtime studio presence + shared transport sync
- Billing/license API foundations (checkout/webhook/license issue)
- For-you ranking + recommendation event tracking
- Campaign Builder + signed attribution links + redirect short links
- Launchpad + partner/enterprise/sponsor surfaces
- Pink Neon-style UI system rolled out across core pages
- Brand/Figma starter tokens + plugin/seed automation files

## Read First (New Session)
- `app/docs/ship-checklist.md`
- `app/docs/of-creator-growth-plan.md`
- `app/src/components/marketing/neon-page.tsx`
- `app/src/app/page.tsx`
- `app/src/app/launchpad/page.tsx`
- `app/src/app/campaigns/page.tsx`
- `app/src/app/dashboard/page.tsx`
- `app/supabase/migrations/002_rights_and_monetization.sql`
- `app/supabase/migrations/003_growth_collab_and_reco.sql`
- `app/supabase/migrations/004_billing_and_creator_licenses.sql`

## New Session Prompt (Feature-Forward)
Copy/paste this into a new chat and fill the placeholders:

```md
Project: Mashups
Repo: c:\Dev\Mashups
Branch: claude/mashups-dev
Baseline commit: 1fa23d9
Deploy URL: [paste Vercel preview/prod URL]

Objective for this session:
- Expand product features and ship production-ready increments.

Already shipped (do not re-implement):
- Legal + rights + monetization foundations
- Admin moderation + claims
- Realtime studio sync
- Campaign Builder + signed attribution loop
- For-you ranking + recommendation events
- Launchpad/partner/enterprise/sponsor surfaces

New features to build (priority order):
1. [Feature A]
2. [Feature B]
3. [Feature C]

Business constraints:
- Preserve rights/compliance flows.
- Keep creator attribution links in share paths.
- Do not regress existing pages/routes.

Execution requirements:
- Implement code (not just planning).
- Run `npm run lint` and `npm run build`.
- Commit in logical chunks.
- Push to `origin/claude/mashups-dev`.
- Return a shipped summary with file-level references.
```

## Suggested Next Feature Tracks
- Mobile foundation: Expo app (`mobile/`) with auth/feed/player/create flow
- Creator growth engine: cohort invites, referral mechanics, campaign templates
- Rights automation: fingerprint confidence scoring + auto-routing policies
- Monetization upgrades: payout thresholds, subscription entitlements, invoices
- Collaboration upgrades: comments/markers/versioning in studio sessions
