# Mashups

Mashups is a rights-aware campaign studio for short-form music creators. The core loop is:

1. Choose or upload a track.
2. Cut three hook-ready shorts.
3. Resolve usage rights before export.
4. Attach attribution and campaign links.
5. Read performance and decide what to post next.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth/Postgres/RLS
- Stripe Checkout, Portal, and signed webhooks
- OpenAI Responses API with GPT-5.6 role routing
- `gpt-image-2` cover generation
- `gpt-4o-transcribe-diarize` timestamped transcription
- Vercel Blob, Vercel Cron, Modal/Replicate stem separation

## Local Setup

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Set `DEMO_MODE=true` only when intentionally running sample behavior. Production routes fail closed when auth, metering, Stripe, cron security, or storage is missing.

## Database

Apply migrations in `supabase/migrations/` in order. Migration `019_production_foundations.sql` adds:

- idempotent Stripe webhook claims
- durable usage reservations
- distributed API rate-limit buckets
- unique provider-event accounting

The deployed app requires `SUPABASE_SERVICE_ROLE_KEY` for webhook, cron, rate-limit, and metering operations. Never expose it through a `NEXT_PUBLIC_` variable.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run check` runs the complete sequence. Lint currently reports legacy warnings from experimental surfaces but has zero errors.

## Deployment

The Vercel project root must be `app`. Configure all variables in `.env.local.example`, apply Supabase migrations, then attach `mashups.agency` in Vercel Project Settings > Domains. Set both `mashups.agency` and `www.mashups.agency`, choose the canonical redirect, and set `NEXT_PUBLIC_APP_URL=https://mashups.agency` in Production.
