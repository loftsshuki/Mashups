# Mashups Product Execution Plan

**Status:** Authoritative rights and commercial infrastructure backlog
**Version:** 1.0
**Created:** August 6, 2026
**Target branch:** `claude/mashups-dev`
**Strategy source:** `docs/MASHUPS_BUSINESS_MODEL.html`
**Supersedes for priority:** `docs/Backend Implementation Master Plan.md`

> **August 7, 2026 strategy amendment:** `docs/PRODUCT_RESET_GREEN_ROOM.md` is
> authoritative for the public consumer product and feature sequence. This plan
> remains authoritative for rights, security, campaigns, settlement, and partner
> infrastructure. Campaign infrastructure must support the consumer remix loop;
> it no longer defines the public homepage or primary navigation.

## 1. Objective

Build three connected products on one trustworthy campaign and rights core:

1. **Mashups Creator:** Create and publish campaign-ready short-form content.
2. **Mashups Campaigns:** Test releases, activate creators, approve work, measure results, and settle payments.
3. **Mashups Rights:** Encode, evaluate, verify, report, and enforce music and creator permissions.

The north-star metric is **qualified campaigns shipped per week**.

A campaign is qualified only when it is properly licensed, exported, actually published, attributable or otherwise verifiable, free of unresolved harmful claims after the survival period, reporting performance data, and financially reconciled.

## 2. Execution Rules

### Status values

| Status | Meaning |
|---|---|
| `READY` | Dependencies are satisfied and implementation can start |
| `IN_PROGRESS` | Work is actively being implemented |
| `BLOCKED` | A named dependency prevents completion |
| `REVIEW` | Implementation awaits technical or operational validation |
| `DONE` | Acceptance criteria, tests, and rollout requirements passed |
| `DEFERRED` | Intentionally outside the current release |

### Definition of done

A ticket is not `DONE` until:

- Code and migrations are committed.
- Authentication, authorization, and RLS behavior are tested.
- Unit or integration coverage exists for material business rules.
- Relevant browser flows are tested.
- Privileged state changes emit audit events.
- Failure behavior is explicit and production-safe.
- Operational and rollout notes are updated.
- `npm run check` passes.
- Applicable Playwright tests pass.

### Source-of-truth order

When requirements disagree, use this order:

1. Executed supplier, creator, brand, and partner agreements.
2. Counsel-approved rights and prohibited-use matrices.
3. This execution plan.
4. `docs/MASHUPS_BUSINESS_MODEL.html`.
5. `docs/SESSION_HANDOFF.md`.
6. Older backend plans and feature notes.

### Change control

Material rights, license, payout, claims, or campaign-compliance changes require:

- A written architecture or policy decision.
- A named business owner.
- Migration, validation, and rollback plans.
- Updated policy fixtures and tests.
- Rights operations review.
- Legal review when represented permission or obligations change.

## 3. Product Invariants

```text
No license is issued without an active verified grant snapshot.
No export proceeds when the policy decision is block.
No user can verify or adjudicate their own rights evidence.
No private agreement is available through a public storage URL.
No public verification response exposes raw contracts or private commercial data.
No payout occurs without qualified activity and balanced ledger entries.
No historical certificate mutates when a policy or contract changes later.
No withdrawn recording can produce a new license.
No client-supplied risk field is treated as authoritative permission.
No production route silently falls back to demo data or development secrets.
```

## 4. Baseline

Useful foundations already exist:

- Next.js 16 and React 19.
- Supabase Auth, Postgres, and RLS.
- Stripe checkout, portal, signed webhooks, and webhook idempotency.
- Usage reservation and entitlement enforcement.
- Vercel Blob uploads.
- Campaign, challenge, analytics, monetization, and rights interfaces.
- Audit events and admin routes.
- Unit tests, Playwright, lint, typecheck, and build gates.

Critical prototype gaps:

| Capability | Current limitation | Required replacement |
|---|---|---|
| Campaigns | Browser-local draft | Durable organization-scoped projects |
| Hooks | Duration heuristics | Audio-derived candidates with manual control |
| Rights | Declaration and draft proof | Verified grants and deterministic policy |
| Fingerprinting | Exact/segment hashes | Cryptographic hashes plus perceptual recognition |
| License proof | Simple license row | Immutable grant and export snapshots |
| Attribution | Signed redirect | Links, clicks, posts, conversions, and fraud controls |
| Analytics | Partly inferred metrics | Observed publication and platform data |
| Payouts | Thin payout records | Double-entry ledger, KYC, holds, statements, reconciliation |
| Claims | Basic status records | Role-separated evidence, SLA, counter-notice, and appeal workflows |
| RLS | Permissive legacy policies | Organization and role-scoped least privilege |

## 5. Launch Lane

The first commercial lane is:

```text
One-stop independent catalog
+ Bring Your Own License
+ closed creator cohorts
+ manually reviewed campaigns
+ grant-backed exports and verification
```

Do not promise a broad famous-music subscription catalog in the first release.

Use a modular monolith initially:

- Next.js owns interfaces and authenticated API boundaries.
- Supabase Postgres is the transactional source of truth.
- Private object storage holds source media and rights documents.
- Durable workers process media, exports, checks, and imports.
- Append-only events record material state changes.
- External providers handle payments, payouts, fingerprinting, email, scanning, and live transport.

Build internally:

- Rights graph and policy evaluation.
- Grant snapshots and evidence.
- Campaign lifecycle.
- Creator workflow.
- Demand exchange.
- Publication qualification.
- Lift methodology.
- Partner rights and campaign experience.

Buy or integrate:

- Card payment and subscription processing.
- Connected payouts, identity verification, and tax collection.
- Commercial audio recognition.
- Electronic signatures.
- Malware scanning.
- Error monitoring and log retention.
- Live-stream transport.

## 6. Release Map

| Release | Outcome | Estimate |
|---|---|---:|
| `R0` | Production cannot overstate rights or expose privileged data | 2-3 weeks |
| `R1` | Catalog and BYOL grants can be reviewed and evaluated | 6-8 weeks |
| `R2` | Approved music can produce grant-backed exports | 6-8 weeks |
| `R3` | Closed campaigns can publish, report, and settle | 6-8 weeks |
| `R4` | Rights Requests and Hook Labs create B2B value | 8-12 weeks |
| `R5` | Partners integrate catalog, policy, usage, claims, and statements | 8-16 weeks |
| `R6` | Official remixes, mature lane, and live-only rights | Separate programs |

A credible closed commercial pilot is approximately 4-6 months with parallel legal, supply, rights operations, and engineering work. The complete platform is a 9-15 month program.

## 7. R0 - Production Safety

**Objective:** Fail closed, scope privileged data correctly, and stop representing declarations as verified commercial grants.

**Entry:** Current branch passes build and tests.

**Exit:** Migration 019 is verified, unsafe issuance is disabled, secrets are mandatory, legacy RLS is locked down, assets are private, and production-path E2E tests pass.

### R0 tickets

| ID | Status | Deliverable | Depends on | Owner |
|---|---|---|---|---|
| `R0-001` | `READY` | Verify production schema, environment, backup, webhook, and rollback baseline | Production access | Platform |
| `R0-002` | `BLOCKED` | Organizations, memberships, legal entities, channels, and database roles | `R0-001` | Backend |
| `R0-003` | `BLOCKED` | Replace permissive legacy RLS with least-privilege policies | `R0-002` | Backend/Security |
| `R0-004` | `BLOCKED` | Replace public license-table access with minimal verification projection | `R0-003` | Backend |
| `R0-005` | `BLOCKED` | Disable unsupported active-license self-issuance | `R0-004` | Rights/Backend |
| `R0-006` | `BLOCKED` | Authenticate and harden attribution signing | `R0-001` | Backend/Security |
| `R0-007` | `BLOCKED` | Private, quarantined, organization-scoped uploads | `R0-002` | Media/Platform |
| `R0-008` | `BLOCKED` | Replace static admin allowlists with database roles | `R0-002` | Backend |
| `R0-009` | `BLOCKED` | Correlation IDs, workflow traces, alerts, and runbooks | `R0-001` | Platform |
| `R0-010` | `BLOCKED` | Production-path security and E2E test suite | `R0-003` to `R0-009` | QA/Engineering |

### `R0-001` Verify production baseline

Deliverables:

- Verify migrations through `019_production_foundations.sql` in production.
- Record migration hashes and application timestamps.
- Compare production environment variable names without exposing values.
- Confirm both demo flags are false.
- Confirm the Stripe production webhook and signing secret.
- Confirm backup and recovery configuration.
- Record the active and rollback deployments.

Acceptance:

- Production schema matches repository migrations.
- Missing production services return explicit `503` responses.
- No production route returns sample results outside a dedicated preview environment.

### `R0-002` Add organizations and roles

Schema:

```text
organizations
organization_memberships
organization_invitations
legal_entities
organization_clients
creator_channels
channel_verifications
organization_billing_accounts
approval_authorities
```

Roles:

```text
creator
manager
agency_operator
brand_operator
label_operator
rights_reviewer
claims_reviewer
finance_operator
platform_admin
```

Acceptance:

- New campaign, catalog, license, rights, and financial records belong to an organization.
- Membership and role are evaluated in database policies.
- Invitations expire and cannot be replayed.
- Cross-organization private reads and writes fail.

### `R0-003` Lock down legacy RLS

Scope:

- Remove authenticated-authoritative writes for packs, scores, fork contests, winners, and challenge operations.
- Restrict studio sessions to explicit participants.
- Restrict referral revenue to its owner and finance operators.
- Remove public reads from studio artifacts and referrals.
- Test anonymous, creator, organization admin, rights reviewer, finance, and platform admin access.

Acceptance:

- Public access is limited to explicit public projections.
- Creators cannot write rankings, winners, earnings, or ops events.
- Service-role routes fully authenticate and authorize before bypassing RLS.

### `R0-004` Replace public license access

Deliverables:

- Remove public selection from `creator_licenses`.
- Add a security-definer verification function or public projection.
- Return only state, permitted summary, relevant timestamps, recording identity, and digest.
- Add rate limits and enumeration resistance.

Acceptance:

- Anonymous callers cannot query arbitrary license rows.
- Valid codes expose minimum verification data.
- Raw agreements, pricing, internal notes, and user IDs remain private.

### `R0-005` Disable unsupported issuance

Deliverables:

- Disable or replace `POST /api/licenses/issue` until policy evaluation exists.
- Remove language implying a declaration is a commercial license.
- Distinguish `DECLARED`, `UNDER_REVIEW`, and `LICENSED`.
- Inventory existing unsupported licenses for review.

Acceptance:

- An authenticated user cannot create an active license directly.
- A declaration never produces a commercial-safe badge.

### `R0-006` Harden attribution

Deliverables:

- Remove production fallback secrets.
- Authenticate signing requests.
- Validate campaign, creator, and organization ownership.
- Restrict destinations to approved HTTPS hosts.
- Add token ID, key ID, expiry, nonce, and version.
- Use timing-safe comparison.
- Support revocation and key rotation.

Acceptance:

- Anonymous callers cannot sign URLs.
- Tokens expire and can be revoked.
- Signed routes cannot become open redirects.

### `R0-007` Make uploads private

Deliverables:

- Create asset records before upload.
- Use private objects and short-lived URLs.
- Validate signatures, limits, hashes, and media decodability.
- Add quarantine, scan, accepted, rejected, and deleted states.
- Remove placeholder success outside demo mode.

Acceptance:

- Source media and contracts have no permanent public URL.
- Failed storage never returns production success.
- Every asset has hash, owner, uploader, type, size, state, and audit history.

### `R0-008` Replace admin allowlists

Acceptance:

- Database membership, not an email environment variable, grants authority.
- Rights, claims, finance, and platform roles are independent.
- High-risk actions support recent-authentication checks.
- Role changes and impersonation are audited.

### `R0-009` Add observability

Alert on:

- Stripe webhook failure.
- License issuance or policy errors.
- Storage and media queue failure.
- Elevated authorization failures.
- Claims SLA breach.
- Payout reconciliation failure.
- Attribution redirect failure.
- Unusual privileged actions.

Acceptance:

- Critical workflows have correlation IDs.
- Operators can trace upload through export, publication, and settlement.
- Alerts link to runbooks without exposing secrets.

### `R0-010` Expand tests

Scenarios:

- Non-demo authenticated campaign creation.
- Cross-organization isolation.
- Minimal public license verification.
- Rejected direct license issuance.
- Private media access.
- Attribution expiry and invalid destination.
- Stripe webhook replay.
- Privileged route authorization.

Acceptance:

- The primary E2E path no longer tests only `?demo=1`.
- CI blocks invariant, RLS, and authorization regressions.

## 8. R1 - Rights Core

**Objective:** Ingest one-stop catalog or BYOL evidence, review authority, encode restrictions, and evaluate exact uses.

**Entry:** R0 complete and first counsel-approved policy fixtures available.

**Exit:** At least ten recordings have reviewed authority and can be safely evaluated for a closed cohort.

| ID | Status | Deliverable | External dependency |
|---|---|---|---|
| `R1-001` | `BLOCKED` | Rights graph: parties, works, recordings, versions, contributors, ownership | Counsel field definitions |
| `R1-002` | `BLOCKED` | Contracts, versions, schedules, documents, withdrawals | Supplier templates |
| `R1-003` | `BLOCKED` | Versioned usage policy schema | Rights matrix |
| `R1-004` | `BLOCKED` | Deterministic allow/review/block policy engine | `R1-003` |
| `R1-005` | `BLOCKED` | Internal rights-review queue and emergency quarantine | `R1-004` |
| `R1-006` | `BLOCKED` | Supplier catalog portal and bulk import | Supplier design partner |
| `R1-007` | `BLOCKED` | Bring Your Own License upload and review | BYOL review standard |
| `R1-008` | `BLOCKED` | Perceptual recognition integration and match review | Vendor agreement |
| `R1-009` | `BLOCKED` | Use-specific catalog badges and explanations | `R1-004` |

### Rights graph schema

```text
rights_parties
party_identifiers
musical_works
sound_recordings
recording_versions
contributors
contributor_roles
ownership_claims
ownership_shares
publishing_administrators
rights_mandates
territory_sets
samples_and_interpolations
content_id_administrators
catalog_conflicts
supplier_contracts
contract_versions
contract_schedules
contract_recordings
rights_documents
rights_reviews
approval_requirements
withdrawal_events
```

Acceptance:

- Works and recordings are separate.
- Versions and clips have lineage.
- Ownership varies by right, territory, and term.
- Conflicts are preserved rather than overwritten.
- Every grant references an active contract version or approved BYOL document.
- Contract replacement never mutates historical evidence.

### Policy dimensions

```text
recording and version
creator and organization
verified channel
campaign
platform
territory
use category
content category
clip duration
edit and remix permission
publication window
post-survival rule
paid-media allowance and cap
required disclosure
exclusivity
Content ID handling
```

Policy output:

```text
allow | review | block
reason codes
grant IDs
required approvals
required disclosures
fees
expiry
policy version
evaluation hash
```

Policy acceptance:

- Authoritative inputs are resolved server-side.
- Every allow result references sufficient active grants.
- Conflicts route to review rather than choosing the most permissive result.
- Overrides require reviewer role, reason, evidence, and expiry.
- Counsel-approved golden fixtures pass in CI.

### Rights operations views

- Intake queue.
- Metadata completeness.
- Master and composition authority.
- Samples and contributor approvals.
- Contract and territory coverage.
- Content ID administration.
- Conflicts and withdrawals.
- Decision and override history.
- Emergency quarantine.

### BYOL acceptance

- Documents are private.
- Extracted terms remain unverified until human approval.
- Grants are scoped by creator, client, campaign, platform, territory, and term.
- Expiration, renewal, conflict, and withdrawal are supported.
- AI assistance is not represented as legal verification.

### Fingerprint acceptance

- Cryptographic hashes continue to prove exact-file integrity.
- Perceptual recognition finds transcoded and clipped test recordings.
- Provider, version, confidence, candidates, and review result are stored.
- Match confidence never acts as permission without policy evaluation.

## 9. R2 - Creator Loop

**Objective:** A verified creator selects approved music, generates audio-derived hooks, creates a package, passes policy, and receives a durable evidence-backed export.

**Entry:** R1 supports ten approved recordings and one approved BYOL grant.

**Exit:** Complete non-demo flow passes E2E and creates reproducible exports.

| ID | Status | Deliverable | Depends on |
|---|---|---|---|
| `R2-001` | `BLOCKED` | Durable projects, members, assets, hooks, versions, and events | `R0-002` |
| `R2-002` | `BLOCKED` | Idempotent media jobs and derived-asset lineage | `R0-007`, `R2-001` |
| `R2-003` | `BLOCKED` | Audio-derived hook candidates and manual adjustment | `R2-002` |
| `R2-004` | `BLOCKED` | Video upload, shot analysis, and music-to-cut fitting | `R2-002` |
| `R2-005` | `BLOCKED` | Captions, disclosures, CTAs, and honest post recommendations | `R1-004` |
| `R2-006` | `BLOCKED` | Server audio/video rendering and platform packages | `R2-003`, `R2-004` |
| `R2-007` | `BLOCKED` | Immutable grant, license, policy, and export snapshots | `R1-004`, `R2-006` |
| `R2-008` | `BLOCKED` | Production verification replaces draft proof | `R2-007` |
| `R2-009` | `BLOCKED` | Approved, review, block, expiry, retry, and mobile E2E flows | `R2-008` |

### Project schema

```text
projects
project_members
project_assets
project_tracks
project_hooks
project_rights_requests
project_versions
project_events
```

Project acceptance:

- Projects survive browser and device changes.
- Local storage is recovery only, not source of truth.
- Every mutation checks organization membership and project role.
- State and material changes are versioned and audited.

### Media jobs

```text
validate
transcode
waveform
loudness
tempo
onset
structure
vocal analysis
fingerprint
hook analysis
render
package
```

Media acceptance:

- Jobs are idempotent, retryable, observable, and resumable.
- Browser closure does not interrupt work.
- Outputs record source, tool version, settings, lineage, and hash.
- Failures produce actionable states.

### Hook signals

- Section boundaries.
- Onset density.
- Energy changes.
- Vocal entry.
- Drops and beat switches.
- Loop boundary quality.
- Silence and clipping.
- Platform duration constraints.

Hook acceptance:

- Recommendations reference observed audio features.
- Three distinct candidates are produced where material permits.
- Users can manually adjust every boundary.
- Reasons and algorithm version are stored.

### Export package

```text
video.mp4
audio.wav
thumbnail.jpg
captions.txt
platform-instructions.json
campaign-manifest.json
license-certificate.pdf
verification-url.txt
```

Export acceptance:

- Output is reproducible from versioned project state.
- Every file is hashed and linked to source lineage.
- Policy must return allow and required approvals must be complete.
- Licenses and snapshots cannot be edited after issuance.
- Revocation adds a new current-state event without changing history.

## 10. R3 - Closed Campaigns

**Objective:** An agency, label, or brand funds a controlled campaign; creators deliver compliant posts; Mashups verifies outcomes and settles money.

**Entry:** R2 complete and campaign legal templates approved.

**Exit:** One real campaign completes funding, production, publication, verification, claims monitoring, and reconciliation.

| ID | Status | Deliverable | External dependency |
|---|---|---|---|
| `R3-001` | `BLOCKED` | Campaign lifecycle and guarded transitions | Operating model |
| `R3-002` | `BLOCKED` | Creator eligibility, recruitment, offers, cohorts | Creator cohort |
| `R3-003` | `BLOCKED` | Creator-content copyright and likeness grants | Creator terms |
| `R3-004` | `BLOCKED` | Deliverables, revisions, and brand/label/legal approvals | `R3-003` |
| `R3-005` | `BLOCKED` | Publication, audio, disclosure, survival, and metric verification | Platform access |
| `R3-006` | `BLOCKED` | Double-entry ledger, splits, statements, reserves, reconciliation | Finance model |
| `R3-007` | `BLOCKED` | Creator and supplier payouts, KYC, tax, holds | Payout provider |
| `R3-008` | `BLOCKED` | Judged-contest and open-campaign compliance | Legal templates |
| `R3-009` | `BLOCKED` | Claims cases, evidence, SLA, counter-notice, appeal, holds | Claims policy |
| `R3-010` | `BLOCKED` | Run and reconcile first closed pilot | All R3 tickets |

### Campaign states

```text
draft
rights_review
approved
recruiting
producing
brand_review
revision
scheduled
live
reporting
settlement
archived
canceled
```

Campaign acceptance:

- Transitions enforce role, rights, budget, and approval preconditions.
- Cancel and rollback behavior is explicit.
- Material changes trigger re-approval and policy evaluation.
- Approved media versions are immutable.

### Three-rights bundle

Every applicable campaign must separately represent:

1. Music rights.
2. Copyright and usage rights in creator-submitted content.
3. Creator name, image, voice, and likeness permission.

Missing required permission blocks activation.

### Publication schema

```text
attribution_links
attribution_tokens
link_clicks
campaign_posts
publication_checks
platform_metric_snapshots
conversion_events
fraud_flags
event_deduplication_keys
```

Qualified publication requires:

- Correct creator channel.
- Publication URL.
- Correct approved audio.
- Required disclosure.
- Publication within the permitted window.
- Continued post accessibility through the survival period.
- Platform or reviewed evidence.
- Fraud-qualified state.

Link clicks alone never prove publication.

### Financial schema

```text
billing_accounts
orders
invoices
payments
refunds
ledger_accounts
ledger_transactions
ledger_entries
split_rules
royalty_accruals
statements
payout_accounts
payouts
tax_profiles
reserves
reconciliation_runs
```

Financial acceptance:

- Every transaction balances.
- Balances cannot be directly edited.
- Refunds, chargebacks, holds, and releases use ledger entries.
- Payouts require verified identity and tax state.
- Campaign, referral, producer, prize, and royalty sources remain distinct.

### Claims schema

```text
claimants
claim_cases
claim_notices
claim_assets
claim_events
claim_deadlines
claim_evidence
claim_actions
counter_notices
appeals
repeat_infringer_events
financial_holds
```

Claims acceptance:

- Claimants, affected creators, and reviewers have separate permissions.
- Creators cannot adjudicate their own claims.
- Emergency quarantine, counter-notice, restoration, and appeal work.
- Deadlines and SLA state are visible to operators.

### Closed pilot target

- 10-20 reviewed recordings.
- 20 verified creators.
- One funded campaign.
- At least 50 publication attempts.
- Manual rights and claims coverage.
- Complete settlement and supplier statement.

Pilot gate:

- Unsupported allow decisions: zero.
- Export snapshots: 100 percent.
- Financial transactions: 100 percent ledger-backed.
- Harmful claims: below the approved threshold.
- Every payout reconciles to qualified activity.

## 11. R4 - Demand And Intelligence

**Objective:** Produce demand and release intelligence before broad music access.

| ID | Status | Deliverable | Depends on |
|---|---|---|---|
| `R4-001` | `BLOCKED` | Rights Request Exchange | R3 pilot and rightsholder partner |
| `R4-002` | `BLOCKED` | Embargoed Pre-release Hook Lab | Label partner and private-test terms |
| `R4-003` | `BLOCKED` | Causal Lift Engine | Sufficient campaign data |
| `R4-004` | `BLOCKED` | Verified Momentum Feed and Creator Scoreboard | Publication and fraud signals |
| `R4-005` | `BLOCKED` | Weekly packs generated from qualified supply | Catalog depth and outcomes |

### Rights Request schema

```text
music_requests
request_recordings
request_creators
request_channels
request_use_cases
request_budgets
request_aggregates
rightsholder_responses
alternative_offers
campaign_proposals
budget_expressions
```

Acceptance:

- Unlicensed music is metadata-searchable but not playable or exportable.
- Demand aggregates enforce privacy thresholds.
- Rightsholders can approve, restrict, reject, or offer alternatives.
- Budget expressions are never represented as licenses.

### Hook Lab acceptance

- Unreleased recordings use embargoed organization workspaces.
- Previews are individual, watermarked, expiring, and logged.
- Cohorts can rank randomized hooks and submit private drafts.
- Leak tracing and emergency revocation exist.
- Private-test permission never becomes public export permission.
- Labels receive reproducible reports even when no campaign launches.

### Causal Lift acceptance

- Experiments record baselines, cohorts, treatment, control, exclusions, and contamination.
- Reports distinguish observed, attributed, and incremental outcomes.
- Confidence and sample warnings are visible.
- Causal language is unavailable without defensible comparison design.

### Momentum, scoreboard, and pack acceptance

- Scores are generated server-side from qualified events.
- Minimum samples and confidence thresholds apply.
- Fraud, deletion, and claims affect eligibility.
- Paid placement is labeled and cannot bypass rights or quality gates.
- Withdrawn or expired pack clips are automatically restricted.

## 12. R5 - Partner Infrastructure

**Objective:** Partners can exchange catalog, policy, usage, claims, and statements without manual database operations.

| ID | Status | Deliverable | Depends on |
|---|---|---|---|
| `R5-001` | `BLOCKED` | Label, distributor, publisher, and agency portal | Two design partners |
| `R5-002` | `BLOCKED` | Scoped partner API, sandbox, signed webhooks, retries | Partner requirements |
| `R5-003` | `BLOCKED` | DDEX-ready repertoire, usage, statement, and claim exchange | Required profiles |
| `R5-004` | `BLOCKED` | Signed export manifests and C2PA-compatible proof | Stable snapshots |
| `R5-005` | `BLOCKED` | Rights Operations SaaS packaging | Repeated enterprise demand |

Partner portal:

- Organization administration.
- Catalog and policy imports.
- Demand Requests and Hook Labs.
- Campaign approvals.
- Usage reports.
- Claims and withdrawals.
- Revenue statements.
- API clients and webhooks.

API requirements:

- Scoped credentials.
- OAuth where required.
- Idempotency keys.
- Signed webhooks.
- Retry and dead-letter handling.
- Versioned schemas.
- Sandbox environment.
- Usage quotas.
- Audit exports.

DDEX-ready data:

- ISRC, ISWC, IPI, and proprietary identifiers.
- Recording, version, work, contributor, and party relationships.
- Territory-specific ownership claims.
- Qualified usage and adjustments.
- Revenue statements.
- Rights-controller and claims responses.

Portable proof acceptance:

- Export manifests are cryptographically signed.
- Keys rotate and assertions can be revoked.
- Server verification survives stripped media metadata.
- Product language states that signing proves issuer and integrity, not ownership by itself.

## 13. R6 - Advanced Rails

These remain `DEFERRED` until earlier gates pass.

### `R6-001` Sponsored Hit Unlocks

Required:

- Sponsor or rightsholder funds music rights.
- Exact recording, hook, cohort, platforms, territories, term, fees, incentives, and paid media are contracted.
- R3 campaign and settlement systems are operational.

### `R6-002` Official remix-to-release

Required:

- Stem access controls.
- Derivative-work consent.
- New-master ownership election.
- Composition splits and sample declarations.
- Artist and label approvals.
- Distribution authority.
- Remix fees, royalties, credits, and statements.
- Nonwinner takedown and portfolio rules.

### `R6-003` Mature rights lane

Required:

- Explicit supplier opt-in.
- Separate catalog policy and taxonomy.
- Age and identity verification.
- Platform, territory, sponsor, and advertising restrictions.
- Separate partner, discovery, moderation, claims, and indemnity controls where required.

### `R6-004` Live-only music

Required:

- Dedicated licensed rooms and approved participants.
- Real-time track reporting.
- No download, automatic VOD, or clips without separate permission.
- Emergency mute.
- Room-revenue accounting.
- Explicit `LIVE` state that never implies export rights.

Use an established live-stream provider instead of building global transport.

## 14. Cross-Cutting Work

### Fraud and quality

- Channel ownership verification.
- Duplicate and near-duplicate media detection.
- Approved-audio verification.
- Engagement and traffic anomalies.
- Audience-country consistency.
- Creator completion, deletion, and claims history.
- Post survival checks.
- Holds, audits, and appeals.

### Notifications

- Rights review submission and decision.
- Contract, grant, and license expiration.
- Campaign invitation, revision, approval, and schedule.
- Export completion and failure.
- Publication compliance and survival.
- Claim deadline, action, and resolution.
- Payout onboarding, hold, failure, and completion.
- Partner import and webhook failure.

### Privacy and retention

- Data classification.
- Agreement and identity-document retention.
- Creator audience-data retention.
- Deletion and anonymization.
- Legal holds.
- Access and export requests.
- Analytics consent.
- Vendor processing records.

### Accessibility and mobile

- Keyboard operation and visible focus.
- Screen-reader labels and announcements.
- Reduced motion.
- Color contrast.
- Mobile campaign creation and approval.
- Interrupted upload and processing recovery.

## 15. API Rules

All new APIs must:

- Authenticate before reading request-controlled resource IDs.
- Resolve organization and role server-side.
- Validate explicit schemas.
- Use idempotency for creation and money movement.
- Return stable error codes.
- Hide raw provider errors.
- Record correlation IDs.
- Rate-limit by actor and operation.
- Audit privileged changes.
- Version public partner contracts.
- Use cursor pagination for events and operations.
- Fully authorize before using service-role database access.

## 16. Migration Sequence

```text
020_organizations_and_rbac.sql
021_security_policy_lockdown.sql
022_rights_graph.sql
023_catalog_contracts_and_policies.sql
024_campaigns_projects_and_deliverables.sql
025_policy_evaluations_and_licenses.sql
026_media_jobs_exports_and_evidence.sql
027_attribution_publications_and_metrics.sql
028_ledger_statements_and_payouts.sql
029_claims_cases_and_enforcement.sql
030_rights_requests_and_hook_labs.sql
```

Migration rules:

- Add before destructively cleaning up.
- Make backfills idempotent and resumable.
- Run large backfills separately from request-path deploys.
- Keep old and new reads during cutover.
- Include a validation query for every migration.
- Confirm backups before destructive cleanup.
- Enable RLS before exposing tables to application clients.

## 17. Test Matrix

| Domain | Unit | Integration | RLS | E2E | Operational drill |
|---|---:|---:|---:|---:|---:|
| Organizations | Yes | Yes | Yes | Yes | Role revocation |
| Rights graph | Yes | Yes | Yes | Yes | Conflict quarantine |
| Policy engine | Yes | Yes | Yes | Yes | Emergency withdrawal |
| Catalog imports | Yes | Yes | Yes | Yes | Failed import recovery |
| BYOL | Yes | Yes | Yes | Yes | Expiration and renewal |
| Media jobs | Yes | Yes | Limited | Yes | Retry and outage |
| Export evidence | Yes | Yes | Yes | Yes | Key rotation |
| Campaigns | Yes | Yes | Yes | Yes | Cancellation |
| Attribution | Yes | Yes | Yes | Yes | Event outage |
| Ledger/payouts | Yes | Yes | Yes | Yes | Reconciliation failure |
| Claims | Yes | Yes | Yes | Yes | Emergency quarantine |
| Partner APIs | Yes | Yes | Yes | Yes | Webhook replay |

## 18. Release Gates

### R0

- Production schema verified.
- Demo and development fallbacks disabled in production.
- Legacy RLS locked down.
- Unsupported issuance disabled.
- Private storage active.
- Production E2E passes.

### R1

- Contracts and policy fixtures approved.
- Ten recordings reviewed.
- Every allow references sufficient grants.
- BYOL human review works.
- Fingerprints route through policy.

### R2

- Projects are durable.
- Hooks use audio-derived signals.
- Exports are server-rendered and hashed.
- Snapshots are immutable.
- Non-demo creator E2E passes.

### R3

- One funded campaign settles.
- Qualified posts have evidence.
- Payouts are ledger-backed and reconciled.
- Claims and quarantine are operational.
- Harmful claims remain below the approved threshold.

### R4

- Rights Request aggregation meets privacy thresholds.
- Hook Lab embargo controls pass review.
- Lift reports disclose methodology.
- Scoreboards and packs use qualified signals.

### R5

- Two partners use versioned APIs.
- Statements reconcile to ledger and usage.
- Portable proof survives metadata stripping through server verification.
- Import conflicts are visible and reversible.

## 19. Metrics

Primary:

- Qualified campaigns shipped per week.
- Qualified uses per active creator.
- Export-to-publication conversion.
- Time from approved track to package.
- Harmful claims per qualified use.
- Track utilization within 60 days.
- Gross margin by rights rail.
- Payout accuracy.

Rights:

- Complete-authority rate.
- Allow, review, and block rates.
- Review turnaround.
- Expiration lead time.
- Conflicts and withdrawals.
- Claims by supplier, track, use, and platform.

Campaign:

- Invitation acceptance.
- Draft completion.
- Approval cycles.
- Publication compliance.
- Post survival.
- Cost per qualified post.
- Observed, attributed, and incremental outcomes.

Operations:

- Media job success and retry rate.
- Export latency.
- Verification uptime.
- Claim SLA compliance.
- Reconciliation differences.
- Payout failures.
- Partner import and webhook failures.

## 20. Non-Engineering Dependencies

Engineering cannot create commercial music permission.

| Work | Required output | Owner |
|---|---|---|
| Music counsel | Supplier, creator, campaign, paid-media, remix, and claim templates | Legal |
| Rights policy | Rights and prohibited-use matrices | Legal/Rights Ops |
| DMCA | Agent, notice, counter-notice, repeat-infringer procedure | Legal/Trust |
| Founding supply | 10-100 one-stop recordings with evidence | Partnerships/A&R |
| Design partners | Creator, agency, label, and brand cohorts | Product/Partnerships |
| Claims operations | SLA, staffing, escalation, quarantine runbook | Rights Ops |
| Finance | Ledger, payouts, reserves, tax, reconciliation | Finance |
| Insurance | Media and technology coverage | Operations/Legal |
| Vendors | Fingerprint, payout, e-sign, scan, monitoring contracts | Operations/Engineering |

## 21. Team

Engineering and product:

- Product or general manager.
- Technical lead.
- Two full-stack engineers.
- Media engineer.
- Data engineer or scientist.
- Product designer.
- QA and automation engineer.
- Shared platform and security support.

Operations:

- Music licensing counsel.
- Rights operations lead.
- Music partnerships lead.
- Creator campaign operator.
- Finance operations owner.
- Trust and safety support.

## 22. Immediate Sprint

**Objective:** Complete the production audit and prepare organization/RLS migrations without prematurely changing represented rights behavior.

Order:

1. Execute `R0-001` production baseline audit.
2. Inventory every service-role route and RLS policy.
3. Inventory every production demo and placeholder fallback.
4. Design organizations and memberships.
5. Write authorization matrix tests before policy changes.
6. Implement `020_organizations_and_rbac.sql`.
7. Implement server organization context resolution.
8. Implement `021_security_policy_lockdown.sql`.
9. Replace public license verification.
10. Disable unsupported license issuance.
11. Harden attribution signing.
12. Add production-path E2E coverage.

Validation:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

Ship rule:

- Map existing production data to organizations first.
- Confirm no orphaned owners.
- Test old and new authorization paths in staging.
- Document rollback migration or deployment.
- Pass rights, billing, admin, and campaign smoke tests.

## 23. Next Session Prompt

```text
Start in repo C:\Dev\Mashups on branch claude/mashups-dev.
Read app/docs/SESSION_HANDOFF.md and app/docs/PRODUCT_EXECUTION_PLAN.md first.
Treat PRODUCT_EXECUTION_PLAN.md as the authoritative backlog.

Identify the first READY ticket whose dependencies are satisfied. Verify git status
and preserve unrelated user changes. Implement the ticket end to end, including
migrations, RLS, tests, documentation, and rollout notes. Run npm run check and
relevant Playwright tests. Update ticket status and SESSION_HANDOFF.md, then commit
and push to origin/claude/mashups-dev.

Never represent a declaration, fingerprint, risk score, or payment as a commercial
license unless an active verified grant snapshot supports the exact use.
```

## 24. Decision Log

| Date | Decision | Consequence |
|---|---|---|
| 2026-08-06 | Launch one-stop independent catalog plus BYOL before broad famous music | Music access expands through controlled rails |
| 2026-08-06 | Use a modular monolith initially | Lower operational complexity with domain boundaries |
| 2026-08-06 | Risk scores cannot authorize use | Permission requires deterministic policy and verified grants |
| 2026-08-06 | Historical license snapshots are immutable | Withdrawal changes current state without rewriting history |
| 2026-08-06 | Music, creator content, and likeness are separate grants | Campaign readiness requires all applicable permissions |
