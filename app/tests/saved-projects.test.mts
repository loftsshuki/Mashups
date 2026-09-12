import assert from "node:assert/strict"
import test from "node:test"
import { buildAuthCallbackUrl, buildAuthPath, safeReturnPath } from "../src/lib/auth/return-path.ts"
import { signupSchema } from "../src/lib/auth/form-schema.ts"
import { greenProjectInputSchema } from "../src/lib/green-room/project-schema.ts"
import { newLocalDraft, parseLocalDraft, recipeFingerprint, renderFingerprint, restoreDraftAudio } from "../src/lib/green-room/local-draft.ts"
import { GREEN_CATALOG } from "../src/lib/catalog/green-catalog.ts"
import { renderGreenMashup } from "../src/lib/audio/green-demo-engine.ts"

test("auth return destinations reject external, encoded, malformed and looping paths", () => {
  for (const path of [undefined, "https://other.example", "//other.example", "/\\other.example", "/%2fother.example", "/%255cother.example", "/%0a/other.example", "/auth/callback?code=secret", "/%61uth/callback", "/foo/../login", "/signup", "/%zz", "/".repeat(3000)]) assert.equal(safeReturnPath(path), "/create", String(path))
  for (const path of ["/projects", "/create?project=50000000-0000-4000-8000-000000000001", "/create?left=a&right=b#versions"]) {
    assert.equal(safeReturnPath(path), path)
    assert.equal(new URL(buildAuthPath("signup", path), "https://app.example").searchParams.get("next"), path)
    const callback = new URL(buildAuthCallbackUrl("https://preview.example", path))
    assert.equal(callback.origin, "https://preview.example")
    assert.equal(callback.pathname, "/auth/callback")
    assert.equal(callback.searchParams.get("next"), path)
  }
})

test("signup rejects mismatched passwords, missing terms and invalid handles before contacting auth", () => {
  const valid = { email: "listener@example.com", username: "night-mix", password: "long-enough-password", confirmPassword: "long-enough-password", terms: "on" }
  assert.equal(signupSchema.safeParse(valid).success, true)
  for (const change of [{ confirmPassword: "different-password" }, { terms: null }, { username: "a" }, { username: "with space" }, { email: "bad-email" }, { password: "short", confirmPassword: "short" }]) assert.equal(signupSchema.safeParse({ ...valid, ...change }).success, false)
})

test("project validation preserves a stable UUID and rejects unusable recipes", () => {
  const { input } = newLocalDraft(GREEN_CATALOG[0].id, GREEN_CATALOG[1].id)
  assert.equal(greenProjectInputSchema.safeParse(input).success, true)
  for (const change of [{ id: "not-a-uuid" }, { expectedRevision: -1 }, { intensity: 101 }, { intensity: 82.5 }, { title: "   " }, { title: "x".repeat(121) }, { selectedArrangement: "invented" }, { sources: { ...input.sources, rightId: input.sources.leftId } }]) assert.equal(greenProjectInputSchema.safeParse({ ...input, ...change }).success, false)
  assert.equal(Object.hasOwn(greenProjectInputSchema.parse({ ...input, creator_id: "spoofed" }), "creator_id"), false)
})

test("cached audio survives serialization, validates WAV data and retains its kept arrangement", async () => {
  const draft = newLocalDraft(GREEN_CATALOG[0].id, GREEN_CATALOG[1].id)
  const render = await renderGreenMashup(GREEN_CATALOG[0], GREEN_CATALOG[1], "drop-swap", 82)
  URL.revokeObjectURL(render.audioUrl)
  const { audioUrl: _url, ...stored } = render
  const saved = { ...draft, localRevision: 1, renders: [stored], input: { ...draft.input, selectedArrangement: "drop-swap" as const } }
  const parsed = parseLocalDraft(structuredClone(saved))!
  assert.equal(parsed.input.selectedArrangement, "drop-swap")
  assert.equal(parsed.renders[0].audioBlob.size, render.audioBlob.size)
  const restored = await restoreDraftAudio(parsed)
  assert.equal(restored.length, 1)
  assert.equal((await (await fetch(restored[0].audioUrl)).blob()).size, render.audioBlob.size)
  URL.revokeObjectURL(restored[0].audioUrl)
  assert.deepEqual(await restoreDraftAudio({ ...parsed, renders: [{ ...parsed.renders[0], audioBlob: new Blob([new Uint8Array(100)], { type: "audio/wav" }) }] }), [])
})

test("recipe changes invalidate only the relevant audio cache and never erase the saved recipe", () => {
  const draft = newLocalDraft(GREEN_CATALOG[0].id, GREEN_CATALOG[1].id)
  assert.equal(renderFingerprint({ ...draft.input, title: "My new title", selectedArrangement: "drop-swap" }), draft.renderKey)
  assert.notEqual(renderFingerprint({ ...draft.input, intensity: 90 }), draft.renderKey)
  assert.notEqual(recipeFingerprint({ ...draft.input, selectedArrangement: "drop-swap" }), recipeFingerprint(draft.input))
  assert.equal(recipeFingerprint({ ...draft.input, expectedRevision: 7 }), recipeFingerprint(draft.input))
  const old = { ...draft, rendererVersion: "obsolete", localRevision: 1, input: { ...draft.input, title: "Keep my idea" } }
  assert.equal(parseLocalDraft(old)?.input.title, "Keep my idea")
  assert.deepEqual(parseLocalDraft(old)?.renders, [])
  assert.equal(parseLocalDraft({ ...old, input: { ...old.input, sources: { ...old.input.sources, leftId: "removed-track" } } }), null)
  assert.equal(parseLocalDraft({ ...old, localRevision: 0 }), null)
})
