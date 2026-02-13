# Mashups.com — Project Instructions

## REPO LOCATION (READ FIRST)
- **Active repo: `C:\Dev\Mashups`** — always use this path
- All builds, edits, and git operations must happen in `C:\Dev\Mashups`

## What is this?
A music mashup creation platform built with Next.js 16 + React 19 + Tailwind CSS 4. Users can create, share, and discover mashups of songs. Audio player, mixer UI, user uploads, community features.

## How things work
- Next.js app lives in `app/` subdirectory
- Build with `cd app && npx next build` — must pass before committing
- Dynamic routes require `generateStaticParams` — always add it

## Brand & Design Rules
- Colors: TBD — will define a custom palette for the music brand
- Fonts: TBD — will select fonts that match the creative/music vibe
- Terminology: "mashups", "tracks", "mixes" — keep it casual and music-native
- Tone: Fun, creative, community-driven. Speak to music lovers and creators. Energy over formality.

## Code Patterns
- JSX in lib files requires `.tsx` extension (not `.ts`)
- Standard Next.js App Router patterns

## Edge Cases & Mistakes
- Don't launch more than 4 background agents simultaneously (they timeout)
- Must re-read files after linter modifies them before making further edits
- `generateStaticParams` returns must match the dynamic segment name exactly

## Key File Locations
- App entry: `app/src/app/page.tsx`
- Global styles: `app/src/app/globals.css`
- Layout: `app/src/app/layout.tsx`

## How we work
- IMPORTANT: Plan before building. Use plan mode for anything non-trivial. Go back and forth until the plan is solid, then switch to auto-accept and execute.

## Deployment Workflow (MUST FOLLOW)
Production deploys ONLY when `main` is pushed. Feature branches are where ALL work happens.

### The Pipeline (use `/ship` to run automatically)
1. **Pre-flight** — `git status`, confirm on feature branch, check for changes
2. **Build** — `cd app && npx next build` — must pass. Fix errors before continuing.
3. **Commit** — stage all changes (NOT .env, node_modules, .next), descriptive message
4. **Push feature branch** — `git push origin <feature-branch>`
5. **Merge to main** — `git checkout main && git pull origin main && git merge <feature-branch> --no-edit && git push origin main`
6. **Switch back** — `git checkout <feature-branch>` (MANDATORY)
7. **Verify** — check Vercel deployment reaches READY

### Rules
- NEVER push directly to main. Always merge from the feature branch.
- NEVER leave uncommitted changes. If you edited files, commit them before ending a session.
- After merging to main, ALWAYS switch back to the feature branch for continued work.
- NEVER skip the build check.
- Before starting work, run `git status` to check for stale uncommitted changes from previous sessions.
