# Mashups.com — Production Setup Checklist

Everything you need to configure for a fully working production deployment.
Check items off as you complete them.

---

## 1. Supabase (Database & Auth) — DONE

- [x] Create Supabase project (ref: `jhaedolevtiwyytvmlvm`)
- [x] Push all 12 migrations (`npx supabase db push --linked --include-all`)
- [x] Set `NEXT_PUBLIC_SUPABASE_URL` on Vercel (production + preview)
- [x] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` on Vercel (production + preview)
- [x] Set `SUPABASE_SERVICE_ROLE_KEY` on Vercel (production + preview)
- [ ] Configure Supabase Auth email templates (optional — uses defaults)
- [ ] Set Auth redirect URL in Supabase dashboard → Authentication → URL Configuration:
  - Site URL: `https://mashups-yourdomain.vercel.app`
  - Redirect URLs: `https://mashups-yourdomain.vercel.app/auth/callback`

---

## 2. Vercel App URL

- [ ] Set `NEXT_PUBLIC_APP_URL` on Vercel → production: `https://your-production-url.vercel.app`
- [ ] Set `NEXT_PUBLIC_APP_URL` on Vercel → preview: `https://your-preview-url.vercel.app` (or leave unset — defaults to `http://localhost:3000`)

Used by: OAuth callbacks, referral links, attribution signing, billing redirects

---

## 3. Stripe (Billing & Payments)

### Get your keys
1. Go to https://dashboard.stripe.com/test/apikeys (use test mode first)
2. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### Create products & prices
1. Go to https://dashboard.stripe.com/test/products
2. Create these products with recurring prices:
   - **Pro Creator** — monthly subscription → copy the price ID (`price_...`)
   - **Pro Studio** — monthly subscription → copy the price ID (`price_...`)
3. Create these products with one-time prices:
   - **License: Organic Shorts** → copy the price ID
   - **License: Paid Ads Shorts** → copy the price ID

### Set up webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://your-production-url.vercel.app/api/billing/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_...`)

### Set env vars on Vercel
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
- [ ] `STRIPE_PRICE_ID_PRO_CREATOR` = `price_...`
- [ ] `STRIPE_PRICE_ID_PRO_STUDIO` = `price_...`
- [ ] `STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS` = `price_...`
- [ ] `STRIPE_PRICE_ID_LICENSE_PAID_ADS_SHORTS` = `price_...`

### When ready for production
- [ ] Switch to live keys at https://dashboard.stripe.com/apikeys
- [ ] Recreate products/prices in live mode
- [ ] Update webhook endpoint to use live signing secret
- [ ] Replace all `sk_test_` / `pk_test_` vars with live keys

---

## 4. Replicate (AI Stem Separation)

1. Sign up at https://replicate.com
2. Go to https://replicate.com/account/api-tokens
3. Create a token

- [ ] Set `REPLICATE_API_TOKEN` on Vercel

Used by: `api/audio/separate/route.ts` — runs DEMUCS model for stem separation

---

## 5. Admin Access

- [ ] Set `ADMIN_EMAIL_ALLOWLIST` on Vercel — comma-separated admin emails (e.g. `you@email.com,cofounder@email.com`)
- [ ] Optionally set `ADMIN_USER_ID_ALLOWLIST` — comma-separated Supabase user UUIDs

Used by: `lib/auth/admin.ts` — gates access to admin dashboard pages

---

## 6. Attribution Signing (Optional)

- [ ] Set `ATTRIBUTION_SIGNING_SECRET` on Vercel — any random string for signing attribution URLs

Falls back to `"dev-signing-secret"` if not set. Only matters for tamper-proof attribution links.

---

## 7. Future / Not Yet Wired

These env vars appear in deferred/ignored code and aren't needed yet:

| Variable | Service | Status |
|----------|---------|--------|
| `OPENAI_API_KEY` | Whisper transcription | Planned for auto-captions |
| `SPOTIFY_CLIENT_ID` | Spotify API | File exists but ignored (`.ts.ignore`) |
| `SPOTIFY_CLIENT_SECRET` | Spotify API | File exists but ignored |
| `YOUTUBE_API_KEY` | YouTube Data API | Planned for trending sounds |
| `DAILY_API_KEY` | Daily.co video/voice | Planned for voice rooms |

---

## Quick Reference — All Env Vars

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Vercel deployment URL |
| `STRIPE_SECRET_KEY` | For billing | Stripe dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | For billing | Stripe dashboard → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe dashboard → API Keys |
| `STRIPE_PRICE_ID_PRO_CREATOR` | For billing | Stripe dashboard → Products |
| `STRIPE_PRICE_ID_PRO_STUDIO` | For billing | Stripe dashboard → Products |
| `STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS` | For billing | Stripe dashboard → Products |
| `STRIPE_PRICE_ID_LICENSE_PAID_ADS_SHORTS` | For billing | Stripe dashboard → Products |
| `REPLICATE_API_TOKEN` | For AI stems | Replicate dashboard → API Tokens |
| `ADMIN_EMAIL_ALLOWLIST` | For admin | Your admin email(s) |
| `ADMIN_USER_ID_ALLOWLIST` | Optional | Supabase user UUIDs |
| `ATTRIBUTION_SIGNING_SECRET` | Optional | Any random string |

---

## Post-Deploy Verification

After setting env vars, trigger a new deployment (push to main or redeploy from Vercel dashboard), then verify:

- [ ] Homepage loads without errors
- [ ] Sign up / login works (creates user in Supabase Auth)
- [ ] Data pages load real data instead of mock data
- [ ] Stripe checkout redirects correctly (if Stripe keys set)
- [ ] Stem separation processes (if Replicate token set)
- [ ] Admin pages accessible with allowlisted email
