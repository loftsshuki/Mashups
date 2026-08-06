export type AIWorkload = "classify" | "create" | "diagnose"

const DEFAULT_MODELS: Record<AIWorkload, string> = {
  classify: "gpt-5.6-luna",
  create: "gpt-5.6-terra",
  diagnose: "gpt-5.6-sol",
}

export function modelFor(workload: AIWorkload): string {
  const override = {
    classify: process.env.OPENAI_MODEL_LUNA,
    create: process.env.OPENAI_MODEL_TERRA,
    diagnose: process.env.OPENAI_MODEL_SOL,
  }[workload]
  return override || DEFAULT_MODELS[workload]
}

export function reasoningFor(workload: AIWorkload): "none" | "low" {
  return workload === "diagnose" ? "low" : "none"
}
