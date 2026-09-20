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
