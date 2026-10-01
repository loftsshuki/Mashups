# Mashups — Main Workflow Bug Report

**Date:** 2026-10-01 · **Scope:** the primary create→publish→share→fork user workflow, traced end-to-end for failure cases, bad inputs, and missing data. Every item below was verified by reading the current source this session; each cites `file:line`, the impact, and the smallest practical fix. Security/cost/RLS issues are covered separately in `docs/CODEBASE_REVIEW_2026-08.md` and only cross-referenced where they sit directly on this path.

> **Workflow traced:** land → `AuthGuard` → `/create` (upload tracks → client-side blob upload → optional stem separation → Step 2 mixer loads `StemEngine` → Step 3 `PublishForm`) → `handlePublish` (export WAV → upload → `createMashup`) → redirect to `/mashup/[id]` → fork/remix back into `/create`.

## Priority summary

| # | Bug | Severity | Where | Effect on user |
|---|---|---|---|---|
| 1 | Final mix uploaded via size-capped server route | **P0** | `create/page.tsx:474` | Any mashup longer than ~25s fails to publish |
| 2 | `uploadRes.json()` unguarded → silent publish abort | **P0** | `create/page.tsx:475` | Publish button resets, no error, nothing saved |
| 3 | Fake-success upload fallback publishes dead audio | **P0** | `upload.ts:26`, `api/upload/route.ts:70` | "Published" mashup whose audio 404s forever |
| 4 | `createMashup` error return ignored | **P1** | `create/page.tsx:482` | All publish errors (incl. "log in") are invisible |
| 5 | Remix lineage silently dropped | **P1** | `create/page.tsx:1108` | Remixes never join the remix tree (the differentiator) |
| 6 | Failed upload still shows 100% / advances | **P1** | `create/page.tsx:309-318` | User proceeds on a broken track; publish no-ops |
| 7 | Publishing without mixing emits a raw source track | **P2** | `create/page.tsx:468,523` | A single unedited song gets published as a "mashup" |

---

## Confirmed problems

### 1 — P0 · The final mix is uploaded through the 4.5 MB server route
**Where:** `app/src/app/create/page.tsx:470-480` (`handlePublish`). The exported WAV is sent with `fetch("/api/upload", { method: "POST", body: uploadForm })` (`:474`).
**Why it breaks:** `/api/upload` is a Vercel serverless function, which caps request bodies at ~4.5 MB. A 16-bit/44.1 kHz stereo WAV is ~10 MB per minute, so **any mix longer than ~25-27 seconds exceeds the limit and the upload fails.** The irony: the per-track *input* uploads already solve this by going client-side straight to Blob (`:277-285`, `@vercel/blob/client` `upload()` with `handleUploadUrl: "/api/upload/client-token"`) — the publish path just doesn't use it.
**Impact:** the core manual-mixer publish path fails for essentially every real mashup.
**Smallest fix:** in `handlePublish`, upload `wavBlob` with the same client-side helper the inputs use, instead of POSTing to `/api/upload`:
```ts
const { upload } = await import("@vercel/blob/client")
const blob = await upload(`audio/${Date.now()}-mashup-mix.wav`, wavBlob, {
  access: "public", handleUploadUrl: "/api/upload/client-token",
})
formData.set("audio_url", blob.url)
```

### 2 — P0 · `uploadRes.json()` is unguarded, so publish dies silently
**Where:** `create/page.tsx:475` — `const { url } = await uploadRes.json()`.
**Why it breaks:** there is no `uploadRes.ok` check. When the upload returns 413 (from #1), 429 (tier limit), or 500 — often with an empty or non-JSON body — `.json()` throws. The throw happens inside `startTransition`, so it unwinds `handlePublish` before `createMashup` runs, with no `catch`. The spinner stops and the form looks idle.
**Impact:** the single most common failure (an oversized or rejected upload) produces zero feedback — the user thinks they published and didn't.
**Smallest fix:** guard it and surface the error:
```ts
if (!uploadRes.ok) { setPublishError("Upload failed — try a shorter mix"); return }
const data = await uploadRes.json().catch(() => null)
if (data?.url) formData.set("audio_url", data.url)
```
(Pairs with #1; fixing #1 removes the most frequent trigger, but the guard is still needed.)

### 3 — P0 · Blob-failure fallback returns a fake URL, publishing dead audio
**Where:** `app/src/lib/storage/upload.ts:24-27` (`return { url: "/audio/dev-upload-${Date.now()}.mp3" }`) and the same pattern in `app/src/app/api/upload/route.ts:69-73`.
**Why it breaks:** when Vercel Blob is unconfigured or errors, both paths return a placeholder path instead of an error. That path 404s, but `createMashup` stores it as a valid `audio_url` and `is_published: true` (`mashups-mutations.ts:37,40`).
**Impact:** a mashup that reports success but whose audio never loads for anyone, with no signal to the creator — the worst kind of silent data corruption.
**Smallest fix:** return `{ error: "Upload failed" }` on the catch in both places and have callers (`handlePublish`, `handleFilesAdded`) surface it, rather than fabricating a URL.

### 4 — P1 · `createMashup`'s error result is discarded
**Where:** `create/page.tsx:482` — `await createMashup(null, formData)` ignores the return value.
**Why it breaks:** `createMashup` returns `{ error }` for "You must be logged in" (`mashups-mutations.ts:27`), "Title and audio are required" (`:19`), and any DB error (`:46,89`). On success it `redirect()`s (which correctly throws `NEXT_REDIRECT` and navigates), so only the failure branch matters — and it's dropped.
**Impact:** every recoverable publish error (expired session, missing audio from #1/#3, RLS rejection) is invisible; the user is stuck on the form with no explanation.
**Smallest fix:** capture and display it:
```ts
const res = await createMashup(null, formData)
if (res?.error) setPublishError(res.error)
```
(Add a small error state near the Publish button; `PublishForm` already has the layout room.)

### 5 — P1 · The `remix=` path never records lineage
**Where:** `create/page.tsx:1108` passes `forkParentId={forkedFrom?.id}`; `forkedFrom` is only populated from the `?fork=` param (`:111,128-129`). The separate `?remix=` entry (`:112,172-174`) loads the parent's stems into the editor and sets `remixSource` (`:154`) but never sets `fork_parent_id`. `createMashup` only writes a `remix_relations` edge when `fork_parent_id` is present (`mashups-mutations.ts:66-71`).
**Why it matters:** "remix" is the richer of the two derivative entry points (it pulls in the parent's stems), yet it's the one that drops the lineage edge. The visible remix tree — the product's stated core differentiator — silently loses exactly these edges.
**Impact:** remixed mashups don't appear as children of their source; the tree under-counts real derivatives.
**Smallest fix:** keep the remix parent id in state (set it in `loadRemixStems` alongside `remixSource`) and feed it through:
```ts
forkParentId={forkedFrom?.id ?? remixParentId}
```

### 6 — P1 · A fully-failed upload still shows 100% and lets the user proceed
**Where:** `create/page.tsx:309-318` — when both client and server uploads fail, the track is set to `uploadProgress: 100, uploadedUrl: ""`. `uploadedCount` / `canProceedStep1` count `uploadProgress === 100` (`:492-493`).
**Why it breaks:** a failed upload is indistinguishable from a successful one in the UI. The user advances; at publish, `firstAudioUrl` skips empty URLs (`:523-524`), so if the mixer also produces no blob, `audio_url` is empty and `createMashup` returns the (ignored, per #4) "Title and audio are required" error.
**Impact:** broken track masquerades as ready; publish later no-ops with no explanation.
**Smallest fix:** represent failure distinctly — e.g. set an `uploadError` flag (or `uploadProgress: -1`) in the failure branch, exclude it from `uploadedCount`, and show a retry affordance in `TrackList`.

### 7 — P2 · Publishing without entering the mixer emits a raw source track
**Where:** `create/page.tsx:468` (`exportWav()` returns `null` when the engine has no tracks — `use-stem-engine.ts:74-77`) → `handlePublish` skips the upload and falls back to `firstAudioUrl`, the first uploaded *original* track (`:523-524`; `audio_url` is only overridden when a blob exists, `:477-479`).
**Why it matters:** a user who uploads one song and clicks through to Publish without blending anything will "publish a mashup" that is a single unmodified track. It's both a correctness/expectation bug and a rights problem (an unmodified copyrighted upload published as original content).
**Impact:** low-effort/empty "mashups"; rights exposure.
**Smallest fix:** gate Publish on a real mix — require `wavBlob` (a rendered mix) or ≥2 blended engine tracks before enabling the button; otherwise show "Blend at least two tracks first."

---

## Needs investigation

- **Step-jump to Publish skips engine load.** The engine only loads in `goToStep` for the `2`-from-`1` transition (`create/page.tsx:498-516`). If the step indicator lets a user click Step 3 directly from Step 1, `exportWav()` is always null → raw-track publish (#7). Verify the stepper's click handlers enforce sequential advance.
- **`exportToWav()` on a zero-track engine.** `stem-engine.ts:201` — behavior when the engine exists but has 0 tracks (e.g., all `addTrack` calls got empty URLs) is unverified: it may throw or return an empty/invalid WAV that then uploads "successfully."
- **Beat analysis silently skips remix/roulette entries.** `beatAnalysisUrl = firstTrack?.localBlobUrl` (`:108`), but remix (`:157-164`) and roulette (`:557-564`) tracks set only `uploadedUrl`, no `localBlobUrl` — so analysis never runs for those paths. Confirm that's intended (BPM/key would then be absent for remix-sourced mixes).
- **Duplicate-filename upload race.** `handleFilesAdded` finds rows by `t.file === file && uploadProgress < 100` (`:231-233,265-267,296-298`). File reference-equality makes true collisions unlikely and the `await` loop is sequential, but two same-named in-flight files could mis-target a `setTracks` update. Worth a unit test; low likelihood.
- **Tier limit coverage is uneven on this path.** `enforceTierLimit("mashups")` runs on the mix upload (`api/upload/route.ts:7`) but is bypassed when publishing a raw track (#7, no upload call) and for all per-track inputs via `/api/upload/client-token` (no auth/tier — see `CODEBASE_REVIEW_2026-08.md` C3). Confirm intended metering.

## Fix order

1. **#1 + #2 together** — the manual-mixer publish path is the product's spine and it fails, silently, for any real-length mashup. One change (client-side mix upload) plus the response guard restores it.
2. **#3** — stop fabricating URLs; a dead-audio "success" is worse than an honest failure and undermines trust.
3. **#4** — make publish errors visible; cheap, and it's what surfaces #1/#3/#6 to the user today.
4. **#5** — restore remix lineage; without it the remix-tree differentiator under-reports itself.
5. **#6**, then **#7** — upload-state honesty and the raw-track guard.
6. Work the investigation list, starting with the stepper (gates #7) and the zero-track export.

Net: items 1-4 are small, localized edits in `handlePublish`, `upload.ts`, and `api/upload/route.ts`, and together they move "publish" from *silently broken for real mixes* to *works, or tells you why not*.
