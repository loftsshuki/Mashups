import assert from "node:assert/strict"
import test from "node:test"

import { modelFor, reasoningFor } from "../src/lib/ai/models.ts"

test("model router maps workloads to the GPT-5.6 family", () => {
  assert.equal(modelFor("classify"), process.env.OPENAI_MODEL_LUNA || "gpt-5.6-luna")
  assert.equal(modelFor("create"), process.env.OPENAI_MODEL_TERRA || "gpt-5.6-terra")
  assert.equal(modelFor("diagnose"), process.env.OPENAI_MODEL_SOL || "gpt-5.6-sol")
})

test("reasoning stays off for latency-sensitive work", () => {
  assert.equal(reasoningFor("classify"), "none")
  assert.equal(reasoningFor("create"), "none")
  assert.equal(reasoningFor("diagnose"), "low")
})
