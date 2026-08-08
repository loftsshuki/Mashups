# Mashups

Mashups is a rights-cleared social playground for creating and forking mashups. The public loop is:

1. Choose two green-catalog tracks.
2. Generate three phrase-aligned arrangements.
3. Keep, export, or publish one version.
4. Let another creator fork it.
5. Preserve source credit and permission through the remix tree.

The existing rights, campaign, attribution, and partner systems remain the infrastructure and future artist product underneath this consumer experience. See `docs/PRODUCT_RESET_GREEN_ROOM.md`.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth/Postgres/RLS
- Stripe Checkout, Portal, and signed webhooks
- OpenAI Responses API with GPT-5.6 role routing
- `gpt-image-2` cover generation
- `gpt-4o-transcribe-diarize` timestamped transcription
- Vercel Blob, Vercel Cron, Modal/Replicate stem separation
- Browser-native Web Audio rendering for the green-catalog prototype

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

Migrations `020_viral_launch_network.sql`, `021_growth_operating_system.sql`, and
`022_domination_operating_layer.sql` add the launch network, growth execution
rails, standardized rights, causal measurement, public Index, commercial offers,
and service-credit protection.

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
