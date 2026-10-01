-- 019_fix_permissive_rls.sql
--
-- SECURITY HARDENING — tighten money/reputation/entitlement RLS policies.
--
-- Migrations 005/010/014 shipped policies of the form
--   `for all using (auth.uid() is not null)`
-- which let ANY logged-in user insert/update/delete rows in tables that control
-- prize money, subscription entitlements, leaderboards, and XP. This migration
-- removes those write grants so the tables can only be written by the
-- service-role client (which bypasses RLS) from trusted server code.
--
-- ⚠️ BEFORE APPLYING: make sure every legitimate write to these tables goes
-- through a server route using the service-role client (createAdminClient()).
-- Any remaining client-side writes with the anon key WILL start failing once
-- this is applied. Review, then apply via the Supabase migration workflow.
--
-- Not auto-applied by this change; it is a reviewable artifact in the repo.

-- ---------------------------------------------------------------------------
-- 005: leaderboards, contests, winners, referral economics
-- ---------------------------------------------------------------------------

drop policy if exists "Viral pack clips auth write" on public.viral_pack_clips;
drop policy if exists "Creator weekly scores auth write" on public.creator_weekly_scores;
drop policy if exists "Fork contests auth write" on public.fork_contests;
drop policy if exists "Fork contest templates auth write" on public.fork_contest_social_templates;
drop policy if exists "Challenge winners auth write" on public.challenge_winners;
drop policy if exists "Challenge ops events auth write" on public.challenge_ops_events;
-- (public read policies are left intact; service role still writes these.)

-- Referral invites: an anonymous actor could rewrite rev_share_bps on any
-- invite whose user_id was null. Restrict updates to the invite's owner.
drop policy if exists "Referral invites update own user or anon" on public.referral_invites;
create policy "Referral invites update own" on public.referral_invites
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 010: fan subscriptions — entitlements must be set by the billing webhook
-- (service role), never self-asserted by the subscriber.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can subscribe" on public.fan_subscriptions;
drop policy if exists "Users can update own fan subscriptions" on public.fan_subscriptions;
-- "Users can view own fan subscriptions" (select) is kept.

-- ---------------------------------------------------------------------------
-- 014: gamification — XP and totals must be awarded by server code, not the
-- client, otherwise users can mint arbitrary XP.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can insert own XP" on public.xp_transactions;
drop policy if exists "Users can insert own gamification" on public.user_gamification;
drop policy if exists "Users can update own gamification" on public.user_gamification;
-- "Users can view own XP" / "Users can view own gamification" (select) are kept.

-- ---------------------------------------------------------------------------
-- TODO (follow-ups that need a bit more care than a policy drop):
--   * creator_licenses: `for select using (true)` exposes verification_code and
--     buyer user_id for every license. Replace with an owner-only select policy
--     plus a SECURITY DEFINER function for public verify-by-code (so a single
--     code lookup doesn't require exposing the whole table).
--   * voice_rooms: public select leaks provider_room_url (Daily.co join links).
--     Restrict select to room participants.
--   * claims/enforcement_actions: currently `on delete cascade` from mashups, so
--     a user deleting their mashup erases DMCA history. Re-point to `on delete
--     set null` (or restrict) to preserve the repeat-infringer record.
-- ---------------------------------------------------------------------------
