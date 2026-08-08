import assert from "node:assert/strict"
import test from "node:test"

import { normalizePostHogKey } from "../src/lib/analytics/config.ts"

test("PostHog configuration rejects missing and placeholder keys", () => {
  assert.equal(normalizePostHogKey(undefined), null)
  assert.equal(normalizePostHogKey("  "), null)
  assert.equal(normalizePostHogKey("placeholder"), null)
  assert.equal(normalizePostHogKey("YOUR_POSTHOG_KEY"), null)
})

test("PostHog configuration preserves a configured project key", () => {
  assert.equal(normalizePostHogKey("  phc_live_project_key  "), "phc_live_project_key")
})
