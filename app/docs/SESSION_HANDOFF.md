# Mashups Session Handoff

## Current Baseline

- Repo: `C:\Dev\Mashups`
- App: `C:\Dev\Mashups\app`
- Branch: `claude/mashups-dev`
- Production domain: `https://mashups.agency`
- Baseline commit: run `git log -1 --oneline`

## Product Direction

Mashups is no longer positioned as a generic mashup community. It is the short-form music operating system for the loop:

`track -> hook cuts -> rights proof -> attributed export -> performance brief -> next post`

Primary navigation is deliberately limited to Discover, Create, Challenges, Analytics, and Earnings. Broader experiments live under Labs.

## Modernization Shipped

- Editorial sound-laboratory design system: warm paper, ink, signal orange, acid accents, Archivo Black, Space Grotesk, and IBM Plex Mono.
- Rebuilt homepage around the campaign loop with responsive campaign-tape visualization and live-only momentum data.
- Create defaults to Fast Campaign; Pro Studio and 5-Minute Flip remain optional modes.
- GPT-5.6 model router: Luna for classification, Terra for creative generation, Sol for diagnostics.
- Responses API Structured Outputs with Zod instead of Chat Completions JSON mode.
- `gpt-image-2` cover generation and `gpt-4o-transcribe-diarize` timestamped transcription.
- Stripe SDK checkout/webhook handling, service-role writes, event claiming, and referral idempotency.
- Authenticated Blob upload tokens, SSRF-resistant audio URLs, durable usage reservations, and distributed rate limits.
- Cron routes fail closed without `CRON_SECRET`.
- Global route error and not-found experiences.
- CI now runs lint, typecheck, tests, and build.

## Required Deployment Work

1. Apply `app/supabase/migrations/019_production_foundations.sql`.
2. Configure every production variable in `app/.env.local.example`.
3. Set `NEXT_PUBLIC_APP_URL=https://mashups.agency`.
4. Add `mashups.agency` and `www.mashups.agency` to the Vercel project and choose a canonical redirect.
5. Register the production Stripe webhook URL: `https://mashups.agency/api/billing/webhook`.
6. Keep `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false` in production.

## Quality State

- `npm run build`: passes
- `npm run typecheck`: passes
- `npm test`: passes
- `npm run lint`: zero errors; legacy experimental surfaces still emit warnings
- Browser fallback screenshots verified desktop and 500px layouts. `agent-browser` could not start its Windows daemon socket in this environment.

## Next Session Prompt

```md
Start in C:\Dev\Mashups on branch claude/mashups-dev.
Read app/docs/SESSION_HANDOFF.md first.
Verify migration 019 and production environment variables before changing live billing or AI routes.
Continue the core creator loop, not broad feature count: track -> hooks -> rights -> attributed export -> analytics.
Implement directly, run npm run check, commit only in-scope files, and push origin/claude/mashups-dev.
```
