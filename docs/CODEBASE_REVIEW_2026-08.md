# Mashups — Codebase Review

**Date:** 2026-08-08 · **Reviewer:** Claude Code (4 parallel read-only review agents + direct verification) · **Scope:** the `app/` Next.js 16 application — 410 TS/TSX files, 56 top-level routes, 66 API routes, 154 components, 19 Supabase migrations (65 tables), the Modal audio service, and the legal docs. **Method:** read-only. Findings are cited `file:line`; the highest-severity claims were re-verified by hand against source.

> This review reads the code against the product the strategy documents (`docs/RIGHTS_CLEARED_*.md`) describe: a rights-cleared Stage-0 loop — two tracks → three arrangements → publish in-app → link-share → battle → fork. That lens matters, because the gap between what's built and what's *claimed* is the headline.

---

## 1. Executive summary

**There is a real product in here, and it is smaller than the app pretends.** The genuinely working spine is: Supabase auth, client-direct upload to Vercel Blob, **real Demucs stem separation** (Modal, Replicate fallback), a competent Web Audio mixer/player substrate, WAV export, Stripe checkout wiring, an admin-gated DMCA claims console, signed attribution short-links, and — notably — **row-level security enabled on all 65 tables** (the #1 Supabase footgun, avoided). That spine is worth keeping.

Around it sit three problems that dominate everything else:

1. **Cost & security exposure is live and exploitable today.** Anonymous users can trigger paid GPU separation, OpenAI calls, and DALL·E image generation, and can mint Vercel Blob upload tokens — with no working auth, metering, or shared rate limit on the expensive paths. The Modal GPU endpoint is shipped *in the browser bundle*. Separately, the Stripe webhook can't actually upgrade a paying customer (it writes with the anon key against RLS-protected tables and never checks the error), and several RLS policies let any logged-in user write money and reputation rows (`challenge_winners.prize_cents`, fan-subscription entitlements, self-awarded XP, referral economics).
2. **The "AI" between upload and render is theater.** Key detection is fabricated (assigned by array index), the six "vibe presets" differ only by playback speed (which also shifts pitch — the chipmunk effect), there is no structure detection, no time-stretch, no key matching, and no crossfade. The strategy's central feature — "three genuinely different, structure-aware arrangements" — **does not exist in the code**. Timeline edits and automation are visual-only and never reach playback or export.
3. **The app markets fiction as fact, including against its own rights posture.** The landing page shows fabricated metrics ("18,000+ creators," "99.2% clearance rate"); ~75% of the route surface is mock/demo/off-core; and the product still ships detection-evasion coaching ("Reduce volume of matched segments," "Apply more transformative effects (pitch, tempo)") plus a one-click, **unwatermarked** WAV extractor of unlicensed source audio branded "rights-safe for your next short" — directly contradicting the rights-cleared strategy and the app's own Terms.

**Overall grade: a strong prototype spine wrapped in ~3× its volume of demo-ware, with a handful of genuinely urgent security/cost bugs.** None of the security issues are subtle or hard to fix; the strategic gap (arrangements, battles, rights enforcement) is larger and is exactly where the roadmap should go.

**Build/test/lint state (verified directly):** `next build` passes; `npm test` passes but is **5 assertions in 2 files** (referral math only) against 410 source files; `eslint` reports **100 errors / 232 warnings** — lint is not a gate. No `.github/` CI anywhere. No committed secrets or `.env` files found.

---

## 2. What is real, partial, and theater (the honest map)

| Layer | Real | Partial (real path, silent mock fallback) | Theater (labeled live, isn't) |
|---|---|---|---|
| **Auth** | Supabase email auth, callbacks, password reset | — | Server-route protection (client-only `AuthGuard`; no `middleware.ts`; `/earnings` unguarded) |
| **Create → publish** | Blob upload, Demucs separation, Web Audio mix, WAV export, Supabase insert with fork lineage | — | "Three arrangements," timeline/automation edits (visual-only), publish >4.5 MB (413s) |
| **Audio "AI"** | Demucs stem separation | BPM (naive energy peaks) | Key detection (index-mod-7), vibe presets (playbackRate only), structure/beat-match, refine (`setTimeout`), quality score (title-length heuristic) |
| **Monetization** | Stripe checkout redirect | Subscriptions page (mock plans) | Webhook fulfillment (RLS-blocked, unchecked), self-issued licenses, earnings (`user_001` mock), revenue-split "smart contracts" (`Math.random` tx hashes) |
| **Rights** | Admin DMCA claims console (service-role, admin-gated), attribution short-links, RLS on all tables | rights_declarations (best-effort client write, never read) | Fingerprinting (SHA-256 of bytes; "confidence" = first hex byte → random), Content-ID (simulated), watermarking (none), territory gating (columns only) |
| **Social loop** | Fork write path (`remix_relations`), realtime studio presence | feed/discover/profile/search (hybrid) | **Battle voting (`console.log`)**, thunderdome matchmaking (`setTimeout`), voice chat (`simulateConnection`), map ("real-time" = `Math.random()` dots) |
| **Data** | ~23 DB-backed modules, RLS enabled everywhere | ~45 modules "try DB, silently serve mock on any error" | marketplace, chains, drops, annual, enterprise, stem-royalties (100% mock) |

Route-surface tally: **~13 REAL · ~18 PARTIAL · ~20 MOCK · ~3 BROKEN/DEAD · 3 redirects.** Only ~25% of routes serve the Stage-0 loop; ~75% is scope sprawl (thunderdome, roulette, marketplace, map, annual, six AI-tool pages, features, launchpad, `/daily` which is a byte-identical duplicate of `/daily-flip`, etc.).

---

## 3. Critical findings (fix before any real users or launch claims)

Every item here was verified against source.

**C1 — Anonymous, unmetered access to paid compute.** `lib/billing/enforce-tier.ts:27` maps unauthenticated callers to `userId="anon"` and skips usage counting, so the check is always "allowed"; and no route ever *records* usage, so even signed-in users never accumulate counts. Affected: `/api/audio/separate` (GPU Demucs), `/api/ai/thumbnail` (DALL·E-3, ~$0.04–0.12/image), `/api/ai/complete|generate-stem`, and the three fully-unauthenticated OpenAI routes `/api/ai/suggest|extract-sound|translate-genre`. No shared rate limit (the limiter is an in-memory per-instance `globalThis` Map keyed on spoofable `x-forwarded-for`). **A curl loop is a direct line to your OpenAI/Replicate/Modal bill.**

**C2 — The GPU endpoint is in the browser bundle.** The auto-mashup flow calls Modal directly via `NEXT_PUBLIC_MODAL_STEM_ENDPOINT` (`lib/data/auto-mashup.ts:447`) — unauthenticated, unmetered, bypassing even the (broken) tier check. Verified present. Anyone who views source can script your GPU.

**C3 — Unauthenticated blob upload tokens.** `/api/upload/client-token/route.ts` `onBeforeGenerateToken` has **no auth** (verified) — only a path-prefix and a 50 MB cap; content-type is client-asserted. Anyone can fill your paid Blob store and use you as a public file host.

**C4 — Paying customers are never upgraded.** `/api/billing/webhook/route.ts` verifies the Stripe signature correctly (good, timing-safe), then writes `subscriptions`/`checkout_sessions` with the **anon** client (a webhook has no user session) against tables whose RLS has no service-side write policy — and never checks the returned error. Money is taken; tier stays "free." Must use `createAdminClient()` and check errors. (`migrations/004:65-78`.)

**C5 — Any logged-in user can write money & reputation rows.** `migrations/005:184-235` uses `for all using (auth.uid() is not null)` on `challenge_winners` (including `prize_cents`, `payout_status`), `creator_weekly_scores`, `fork_contests`, `viral_pack_clips`. `010_fan_subscriptions.sql:66-71` lets users INSERT/UPDATE their own `status='active'`/`total_paid_cents` — **entitlements are forgeable client-side**. `014_gamification.sql:60-74` lets users self-award XP. `005:221-225` lets anon rewrite referral `rev_share_bps` (≤50%) on any invite with `user_id is null`, and the payout webhook trusts that value.

**C6 — Rights posture is contradicted in code.** Verified still present: `lib/data/content-id.ts:202-204` coaches users to "Reduce volume of matched segments" and "Apply more transformative effects (pitch, tempo)" to dodge Content-ID; `docs/SOCIAL_MEDIA_MUSIC_LICENSING.md:22` still recommends clips that "minimize detection." And `lib/audio/hook-export.ts` exports a **clean, unwatermarked** 15-second WAV of the (unlicensed) source audio, captioned "Rights-safe clip for your next short" with TikTok/IG/YouTube posting tips. This is the opposite of the rights-cleared thesis and undercuts the DMCA safe-harbor good-faith posture; remove first.

**C7 — Fabricated key/rights data drives real UI.** Key detection does not exist: `beat-detector.ts:206-248` hash-picks from an 8-key list with hardcoded `confidence: 0.6`; the auto flow assigns key by `["C","G","D","A","F","Am","Em"][i % 7]` (`auto-mashup.ts:191`). Every key badge, "harmonic mix" suggestion, and the key half of the compatibility score is fiction. The rights-risk panel's "fingerprint confidence" is derived from the **first hex byte of a SHA-256** (`mashup-detail-client.tsx:66-72`) — a uniform random number dressed as a safety signal.

**C8 — Unauthenticated rights-claim moderation endpoint.** `/api/rights/claims/[id]/route.ts:9-34` PATCH lets anyone set any claim to `resolved`/`rejected` with no auth. It currently fails closed only because the table has no UPDATE policy — one migration away from an anonymous DMCA-dismissal backdoor. A correct admin-gated version already exists; delete this one.

---

## 4. High-severity findings

- **H1 — Publishing a real mix breaks.** `handlePublish` POSTs the exported WAV to `/api/upload` (Vercel serverless ~4.5 MB body limit); a 16-bit/44.1k stereo WAV is ~10 MB/min, so real mixes **413**, and the unguarded `uploadRes.json()` (`create/page.tsx:475`) then throws inside the transition; `createMashup`'s `{error}` return is ignored (`:482`). Publish via client-direct Blob upload instead. (`lib/audio/hook-export`/`auto-mashup.ts:521` documents the limit.)
- **H2 — Silent corruption via fake fallback URLs.** `lib/storage/upload.ts:25-27,50` returns a fabricated `/audio/dev-upload-*.mp3` (and a placehold.co image) on upload failure, so a user can "successfully" publish a mashup whose audio **404s forever**, with no error shown.
- **H3 — SSRF.** `/api/fingerprint/route.ts:56-59` fetches any user-supplied URL server-side and resolves it relative to `request.url` (reaches internal/metadata hosts); same arbitrary-URL-to-vendor pattern in `/api/audio/separate:88`. Allowlist hosts.
- **H4 — Signed open redirect + forgeable tokens.** `/api/attribution/sign` is unauthenticated and signs *any* destination (`/a/[token]` 302s to it → phishing on your domain); `lib/attribution/signing.ts:10` falls back to a hardcoded `"dev-signing-secret"` when the env var is unset (tokens forgeable offline) and verifies with non-timing-safe `!==`.
- **H5 — Self-service license issuance.** `/api/licenses/issue:33-43` mints an `active` license with arbitrary term, unlinked to payment (currently blocked only by a missing INSERT policy). Should be webhook-driven.
- **H6 — DMCA history cascade-deletes.** `claims.mashup_id ... on delete cascade` (`002:60`) + user-deletable mashups (`001:90`) means deleting a mashup **erases its claims and enforcement history** — breaks `REPEAT_INFRINGER_POLICY.md §7` recordkeeping. Also `creator_licenses` is world-readable including `verification_code` + buyer (`004:71`), and `voice_rooms` leaks Daily.co join URLs (`011:74`).
- **H7 — No rights gating at publish.** `mashups-mutations.ts:40` sets `is_published: true` immediately; no `rights_declarations` row is written or checked, though `TERMS.md §3` promises exactly that. The rights schema is a credible skeleton the app never populates or enforces.
- **H8 — Battle voting is non-functional.** `battles/[id]/page.tsx:184-196` — `handleVote` is `console.log` + local state; the battle is hardcoded (`:40-158`) despite a `013_battle_votes.sql` table existing. A core-loop step is a façade.
- **H9 — Fabricated metrics on the landing page.** `page.tsx` claims "18,000+ creators" (`:192`), "99.2% clearance rate" (`:71`), "10x faster," "built-in video chat," "one-click publishing to all platforms" — none real; `/annual` compounds it. A trust/legal liability the moment a real user or journalist looks. The real capabilities are more credible than the fake numbers.

---

## 5. Medium / lower

- **Silent mock-fallback in ~45 `lib/data/*` modules** (`mashups.ts:79-81` is the template): a production DB/RLS failure is indistinguishable from success and quietly serves demo content — dangerous on money/rights surfaces, and it will mask outages.
- **"Supabase-unconfigured" no-op client** (`lib/supabase/server.ts:21-43`) makes auth checks `if (isSupabaseConfigured() && !user) 401` — any env slip silently flips routes to unauthenticated, writing `mock-user` rows. Fail closed.
- **Cron is a scheduled no-op**: `/api/cron/trending` fails open when `CRON_SECRET` is unset and writes `trending_sounds` with the anon client against a no-write-policy table.
- **Client-component sprawl**: 138/154 components are `"use client"`; discovery/list pages fetch via `useEffect` (skeleton flash, no SEO for a discovery product).
- **Whisper captions are dead**: `auto-caption.ts:53` gates on a non-`NEXT_PUBLIC` env var in browser code → users always get mock lyrics.
- **Web Audio lifecycle**: AudioContexts leak on decode-error paths (`beat-detector.ts:47-74`, `waveform-analyzer.ts`); `StemEngine` holds ~500 MB of Float32 for a two-track/8-stem session → iOS Safari jetsam; no `webkitAudioContext` fallback.
- **Duplicate/internal routes shipped publicly**: `/daily` ≡ `/daily-flip`, `/features` (internal concept deck), `/launchpad` (internal status). Two parallel voice components; 45 copies of an `isSupabaseConfigured()` helper.
- **Accessibility/quality debt**: 17 `aria-label`s app-wide; 17 raw `<img>` vs 7 `next/image`; off-token hardcoded palettes in `thunderdome`/`features`; 100 eslint errors.
- **Schema hygiene**: no soft-delete, no `updated_at` triggers; money is integer-cents in some tables but `numeric` dollars in `015`; `battle_votes.battle_id` has no FK (no battles table exists); `001` ships zero indexes (patched later).

---

## 6. What's genuinely good (keep and build on)

- **RLS is enabled on all 65 tables** — the hard part was done; the fix is policy quality on 3 migrations, not a rewrite.
- **Real Demucs deployment** (`modal/demucs_app.py`, htdemucs on T4) with a Replicate fallback — the one real vendor integration, and the right one.
- **The mixer substrate**: `StemEngine`, the Howler-based `use-audio-player.ts` (proper unload/cancel guards), and the WAV encoder are solid and reusable.
- **Stripe signature verification** (`lib/billing/stripe.ts:98-128`) is timing-safe and tolerance-checked.
- **The admin claims console** (`api/admin/claims/*`, `challenges/ops`) is the reference pattern in the repo: admin allowlist + service role + rate limit + audit log. Make everything else look like this.
- **The rights schema skeleton** (declarations, claims, enforcement_actions, remix_relations lineage) is a credible foundation — it needs population and enforcement, not redesign.

---

## 7. Recommendations, in priority order

**Now (security & cost — days, not weeks; these are live exposures):**
1. Put every paid endpoint (`ai/*`, `audio/separate`, `upload*`) behind real auth + server-side usage recording; delete the client-exposed `NEXT_PUBLIC_MODAL_STEM_ENDPOINT` and proxy it (C1, C2).
2. Auth-gate `/api/upload/client-token` and `/api/attribution/sign`; remove the default signing secret (C3, H4).
3. Switch webhook/cron/license writes to `createAdminClient()` with checked errors (C4).
4. Fix the permissive RLS in `005/010/014` — money/reputation/entitlement tables must be service-role-write only (C5).
5. Move rate limiting to a shared store (Upstash/Vercel KV) and cover the expensive routes; allowlist URLs in `fingerprint`/`separate` (H3); delete `rights/claims/[id]` PATCH (C8).

**Next (rights posture & honesty — the strategy depends on this):**
6. Delete the detection-evasion copy (`content-id.ts:202-204`) and edit `SOCIAL_MEDIA_MUSIC_LICENSING.md`; either watermark the hook export and gate it to owned/licensed catalog, or remove it (C6).
7. Remove fabricated metrics from `/` and `/annual`; show real numbers or none (H9).
8. Gate publish on a written rights declaration; stop the fake-URL fallbacks so failures surface (H1, H2, H7).
9. Fix DMCA record retention (don't cascade-delete claims) and close the world-readable `creator_licenses`/`voice_rooms` (H6).

**Then (make the core loop true — the actual roadmap):**
10. Build real musical analysis in the Modal container (beat grid, downbeat, key via librosa/madmom/essentia) and persist it per track — kills the fabricated key/beat data at the root (C7).
11. Add time-stretch + independent pitch-shift (Rubber Band WASM or server render).
12. Build the arrangement engine: segment both tracks, generate three *structurally different* plans (A-vocal/B-instrumental, alternating 8/16-bar blocks, drop-swap) with bar-aligned crossfades — this is the product.
13. Make timeline clips + automation the single source of truth for both playback and export; publish via client-direct Blob upload.
14. Wire battle voting to `battle_votes` (H8); pick the ~13 core-loop routes to keep and flag-off or delete the ~40 off-core ones.

**Hygiene (ongoing):** add CI (build + lint + test as gates), make eslint pass, add tests around splits/RLS/rights (the money paths), consolidate the 45 `isSupabaseConfigured()` copies and the two voice components, and fix `CLAUDE.md`'s stale `C:\Dev\Mashups` path.

---

## 8. The one-paragraph verdict

Mashups today is a **convincing demo reel with a real engine inside it**. The engine — auth, upload, Demucs separation, a solid mixer, Stripe, RLS-on-everything, a rights schema skeleton — is genuinely a foundation. But the app ships live cost/security holes (anonymous paid compute, a browser-exposed GPU endpoint, a Stripe webhook that doesn't upgrade payers, money rows any user can write), an "AI" creation layer that is almost entirely simulated (no real key detection, no structure, no arrangements — the strategy's centerpiece), and a marketing-and-rights surface that actively works against the rights-cleared thesis (fake metrics, detection-evasion coaching, an unwatermarked "rights-safe" extractor). The path forward is not more features — it is to **shrink to the true core, close the security holes this week, retire the rights-contradicting code, and spend the reclaimed energy building the one thing that would make this real: two tracks in, three genuinely different arrangements out.** That is exactly the Stage-0 bet the research recommended, and the codebase is closer to it than its 56 routes suggest — once the theater is cleared away.
