# Codex operating rules

## Usage discipline
- Start from the smallest plausible file/path scope. Search before reading whole directories or large files.
- Do not reread files already summarized unless a later change makes it necessary.
- Use the main model for planning, ambiguous reasoning, integration decisions, and final review.
- Do not spawn subagents for simple tasks. For broad read-only discovery, prefer the project `explorer`; for a small well-scoped implementation, prefer `worker`; for review, prefer `reviewer`.
- Keep at most two subagents active, and use one when one is enough.
- Successful tool/command results should be summarized in one line. Preserve only the relevant error excerpt on failure.
- Run the narrowest relevant test first. Do not run the full build or E2E suite unless the change has broad blast radius or the user explicitly asks.
- Final responses should normally contain only: changed files, verification, and unresolved blockers.

## Project
The app lives under `app/`.

Useful commands:
- `cd app && npm run lint`
- `cd app && npm run typecheck`
- `cd app && npm test`
- `cd app && npm run build`
- `cd app && npm run test:e2e`

For long or interruptible work, maintain a tiny `.codex/TASK_STATE.md` with only Done / Current / Next / Blocked. Do not create it for one-shot tasks.

## Context router

Before broad repository exploration, read `.codex/ROUTER.md` and open only the referenced files needed for the task. If RTK is already installed, follow `.codex/RTK.md` for terminal-heavy work.


## Portfolio Context Fabric bootstrap

Before material architecture or implementation work, request a current HOSS Context
Capsule for `mashups` and the concrete task through `hoss_get_context` (MCP)
or the authenticated `POST /v1/intelligence/portfolio/context` API. Host
configuration supplies credentials. Read the capsule's ownership, related
repositories, provenance, open work, freshness and gaps; then inspect current
code and relevant PRs. The repository-owned contract is `.hoss/repo.yaml`.

Extend the canonical shared owner where appropriate: HOSS owns portfolio
orchestration, context and Decision Fabric; Brain owns durable reviewed
cross-repository knowledge; this repository owns its product logic. Do not
create a second generic context, evidence, decision, review or memory system
without checking those owners. Context does not grant spend, deployment,
publication, merge or canonical promotion authority.

After work, submit an implementation receipt with `hoss_record_receipt`.
Report missing, stale, incorrect or unnecessary context with
`hoss_report_context_feedback`. These are agent attestations and review
inputs, not automatic canonical truth. If HOSS is unavailable, inspect current
repository and GitHub state directly and record that context was unavailable.
