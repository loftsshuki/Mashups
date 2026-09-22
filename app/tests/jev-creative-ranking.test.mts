import assert from "node:assert/strict"
import test from "node:test"

import {
  rankArrangements,
  rankSuggestions,
  type ArrangementCandidate,
  type ArrangementContext,
  type SuggestionCandidate,
} from "../src/lib/jev/creative-ranker.ts"

const ENV_KEYS = [
  "MASHUPS_JEV_ENABLED",
  "MASHUPS_JEV_SUGGESTION_MODE",
  "MASHUPS_JEV_ARRANGEMENT_MODE",
  "MASHUPS_JEV_CONFIDENCE",
  "AI_GATEWAY_API_KEY",
  "VERCEL_OIDC_TOKEN",
]

async function withEnv(values: Record<string, string>, fn: () => Promise<void>) {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))
  try {
    for (const [key, value] of Object.entries(values)) process.env[key] = value
    await fn()
  } finally {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
}

function answer(choice: string, probability = 0.96) {
  return { type: "choice", choice, probabilities: { [choice]: probability } }
}

function suggestionFetch(
  rows: Array<{ usefulness: string; actionability: string; specificity: string; external: string }>,
  capture: { body?: Record<string, any> } = {},
): typeof fetch {
  return (async (_input: string | URL | Request, init?: RequestInit) => {
    capture.body = JSON.parse(String(init?.body))
    const answers: Record<string, unknown> = {}
    rows.forEach((row, index) => {
      answers[`usefulness_${index}`] = answer(row.usefulness)
      answers[`actionability_${index}`] = answer(row.actionability)
      answers[`specificity_${index}`] = answer(row.specificity)
      answers[`external_${index}`] = answer(row.external)
    })
    return new Response(JSON.stringify({
      answers,
      providerMetadata: { gateway: { gatewayCost: "0.000006", generationId: "gen_suggest" } },
    }), { status: 200, headers: { "content-type": "application/json" } })
  }) as typeof fetch
}

function arrangementFetch(
  rows: Array<{ promise: string; distinct: string; explain: string }>,
  capture: { body?: Record<string, any> } = {},
): typeof fetch {
  return (async (_input: string | URL | Request, init?: RequestInit) => {
    capture.body = JSON.parse(String(init?.body))
    const answers: Record<string, unknown> = {}
    rows.forEach((row, index) => {
      answers[`promise_${index}`] = answer(row.promise)
      answers[`distinct_${index}`] = answer(row.distinct)
      answers[`explain_${index}`] = answer(row.explain)
    })
    return new Response(JSON.stringify({
      answers,
      providerMetadata: { gateway: { gatewayCost: "0.000006", generationId: "gen_arrange" } },
    }), { status: 200, headers: { "content-type": "application/json" } })
  }) as typeof fetch
}

const suggestions: SuggestionCandidate[] = [
  {
    id: "a",
    type: "structural",
    title: "Early drop",
    description: "Move the drop four bars earlier after the current eight-bar intro.",
    confidence: 0.9,
  },
  {
    id: "b",
    type: "effect",
    title: "Bridge space",
    description: "Automate a short hall reverb only across the vocal bridge.",
    confidence: 0.7,
  },
  {
    id: "c",
    type: "stem",
    title: "External vocal",
    description: "Replace the current vocal with a different recorded singer.",
    confidence: 0.8,
  },
]

const mashupState = {
  stems: [{ instrument: "vocal" }, { instrument: "drums" }],
  bpm: 124,
  key: "Am",
  genre: "house",
}

const arrangements: ArrangementCandidate[] = [
  {
    id: "a",
    title: "A Voice / B Body",
    description: "A vocal over B groove",
    qualityScore: 90,
    sidechainDuckDb: -3.5,
    segments: [],
  },
  {
    id: "b",
    title: "B Voice / A Body",
    description: "B vocal over A groove",
    qualityScore: 72,
    sidechainDuckDb: -3.5,
    segments: [],
  },
  {
    id: "c",
    title: "Drop Swap",
    description: "Phrase-matched drop swap",
    qualityScore: 80,
    sidechainDuckDb: -2.5,
    segments: [],
  },
]

const arrangementContext: ArrangementContext = {
  left: { id: "left", title: "Left", artist: "Mashups", bpm: 122, key: "Am", genre: "house" },
  right: { id: "right", title: "Right", artist: "Mashups", bpm: 126, key: "C", genre: "house" },
  assessment: {
    compatible: true,
    score: 86,
    tempoDelta: 4,
    warpPercent: 3.2,
    harmonicFit: "relative",
    vocalCollisionRisk: "low",
    reasons: [],
  },
}

test("suggestion Shadow preserves original ordering while recording Jev", async () => {
  await withEnv({
    MASHUPS_JEV_ENABLED: "true",
    MASHUPS_JEV_SUGGESTION_MODE: "shadow",
    MASHUPS_JEV_CONFIDENCE: "0.8",
  }, async () => {
    const result = await rankSuggestions(suggestions, mashupState, {
      token: "test",
      fetchImpl: suggestionFetch([
        { usefulness: "low", actionability: "low", specificity: "low", external: "no" },
        { usefulness: "high", actionability: "high", specificity: "high", external: "no" },
        { usefulness: "medium", actionability: "medium", specificity: "medium", external: "yes" },
      ]),
    })
    assert.deepEqual(result.map((item) => item.id), ["a", "b", "c"])
    assert.equal(result[0].jev?.decision.action, "observed")
  })
})

test("suggestion Assist promotes stronger idea but cannot demote baseline score", async () => {
  await withEnv({
    MASHUPS_JEV_ENABLED: "true",
    MASHUPS_JEV_SUGGESTION_MODE: "assist",
    MASHUPS_JEV_CONFIDENCE: "0.8",
  }, async () => {
    const result = await rankSuggestions(suggestions, mashupState, {
      token: "test",
      fetchImpl: suggestionFetch([
        { usefulness: "low", actionability: "low", specificity: "low", external: "no" },
        { usefulness: "high", actionability: "high", specificity: "high", external: "no" },
        { usefulness: "medium", actionability: "medium", specificity: "medium", external: "yes" },
      ]),
    })
    assert.equal(result[0].id, "b")
    const a = result.find((item) => item.id === "a")
    assert.equal(a?.jev?.effectiveScore, 90)
    assert.equal(a?.jev?.decision.action, "preserved")
  })
})

test("suggestion Enforce may demote a weak or external-source-dependent idea", async () => {
  await withEnv({
    MASHUPS_JEV_ENABLED: "true",
    MASHUPS_JEV_SUGGESTION_MODE: "enforce",
    MASHUPS_JEV_CONFIDENCE: "0.8",
  }, async () => {
    const result = await rankSuggestions(suggestions, mashupState, {
      token: "test",
      fetchImpl: suggestionFetch([
        { usefulness: "low", actionability: "low", specificity: "low", external: "no" },
        { usefulness: "high", actionability: "high", specificity: "high", external: "no" },
        { usefulness: "high", actionability: "high", specificity: "high", external: "yes" },
      ]),
    })
    assert.equal(result[0].id, "b")
    assert.equal(result.at(-1)?.id, "a")
    assert.ok((result.find((item) => item.id === "c")?.jev?.effectiveScore ?? 100) < 95)
  })
})

test("arrangement ranking is metadata-only and preserves all three candidates", async () => {
  await withEnv({
    MASHUPS_JEV_ENABLED: "true",
    MASHUPS_JEV_ARRANGEMENT_MODE: "enforce",
    MASHUPS_JEV_CONFIDENCE: "0.8",
  }, async () => {
    const capture: { body?: Record<string, any> } = {}
    const result = await rankArrangements(arrangements, arrangementContext, {
      token: "test",
      fetchImpl: arrangementFetch([
        { promise: "medium", distinct: "medium", explain: "medium" },
        { promise: "high", distinct: "high", explain: "high" },
        { promise: "high", distinct: "high", explain: "medium" },
      ], capture),
    })
    assert.deepEqual(result.map((item) => item.id).sort(), ["a", "b", "c"])
    assert.equal(result[0].id, "b")
    assert.equal(capture.body?.model, "typesafe-ai/jev")
    assert.equal(capture.body?.providerOptions.gateway.zeroDataRetention, true)
    assert.deepEqual(capture.body?.providerOptions.gateway.only, ["typesafe-ai"])
    assert.ok(capture.body?.providerOptions.gateway.tags.includes("jev-decision-spec-v1"))
    assert.equal(capture.body?.state.context.assessment.compatible, true)
  })
})

test("missing Jev auth safely preserves suggestion order", async () => {
  await withEnv({
    MASHUPS_JEV_ENABLED: "true",
    MASHUPS_JEV_SUGGESTION_MODE: "enforce",
    AI_GATEWAY_API_KEY: "",
    VERCEL_OIDC_TOKEN: "",
  }, async () => {
    const result = await rankSuggestions(suggestions, mashupState, { token: "" })
    assert.deepEqual(result, suggestions)
  })
})
