# Ship Checklist
Date: February 13, 2026

## 1. Required Environment Variables
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY` (required for admin moderation APIs)
4. `NEXT_PUBLIC_APP_URL` (used in verification and checkout links)
5. `ADMIN_EMAIL_ALLOWLIST` (comma-separated emails for admin endpoints)

## 2. Billing Variables (when switching from stub to live Stripe)
1. `STRIPE_SECRET_KEY`
2. `STRIPE_WEBHOOK_SECRET`
3. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. `STRIPE_PRICE_ID_PRO_CREATOR`
5. `STRIPE_PRICE_ID_PRO_STUDIO`

## 3. Database Migrations to Apply
1. `001_initial_schema.sql`
2. `002_rights_and_monetization.sql`
3. `003_growth_collab_and_reco.sql`
4. `004_billing_and_creator_licenses.sql`

## 4. Legal and Policy Links
1. `/legal/terms`
2. `/legal/copyright`
3. `/legal/repeat-infringer`
4. Verify footer and signup link routing in production.

## 5. Runtime Verification
1. `npm run lint`
2. `npm run build`
3. Test routes:
- `/`
- `/explore`
- `/mashup/[id]`
- `/create`
- `/challenges`
- `/studio`
- `/pricing`
- `/dashboard`
- `/dashboard/analytics`
- `/dashboard/rights`
- `/dashboard/monetization`
- `/admin/moderation`
- `/licenses/[code]`

## 6. Rights + Moderation Ops Checks
1. Issue shorts license from mashup detail and verify link opens.
2. Create claim and test moderation actions.
3. Confirm repeat infringer event is written on strike path.
4. Confirm admin API rejects non-allowlisted users.

## 7. Realtime Collaboration Checks
1. Open `/studio` in two browser sessions.
2. Confirm presence count updates.
3. Confirm transport values (play/pause, BPM, playhead) sync across sessions.

## 8. Launch Decision Gates
1. No lint/build errors.
2. Critical paths above pass.
3. Admin and rights workflows tested end-to-end.
4. Rollback path identified (previous stable Vercel deploy).
