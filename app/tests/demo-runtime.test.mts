import assert from "node:assert/strict"
import test from "node:test"

import {
  buildDemoAttributionUrl,
  isDemoQuery,
  isDemoRequest,
} from "../src/lib/demo/runtime.ts"

test("demo mode requires an explicit accepted query value", () => {
  assert.equal(isDemoQuery("1"), true)
  assert.equal(isDemoQuery("true"), true)
  assert.equal(isDemoQuery("yes"), false)
  assert.equal(isDemoQuery(null), false)
})

test("demo requests are query-gated when environment mode is disabled", () => {
  const previousServerMode = process.env.DEMO_MODE
  const previousPublicMode = process.env.NEXT_PUBLIC_DEMO_MODE
  process.env.DEMO_MODE = "false"
  process.env.NEXT_PUBLIC_DEMO_MODE = "false"
  try {
    assert.equal(isDemoRequest(new Request("https://mashups.agency/api/example")), false)
    assert.equal(isDemoRequest(new Request("https://mashups.agency/api/example?demo=1")), true)
  } finally {
    process.env.DEMO_MODE = previousServerMode
    process.env.NEXT_PUBLIC_DEMO_MODE = previousPublicMode
  }
})

test("demo attribution URLs are deterministic and clearly namespaced", () => {
  assert.equal(
    buildDemoAttributionUrl("Monday Launch #04"),
    "https://www.mashups.agency/a/demo-monday-launch-04",
  )
})
