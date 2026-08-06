import { zodTextFormat } from "openai/helpers/zod"
import type { z } from "zod"

import { modelFor, reasoningFor, type AIWorkload } from "./models"
import { getOpenAI, isOpenAIConfigured } from "./openai"

interface StructuredOptions<TSchema extends z.ZodType> {
  system: string
  user: string
  schema: TSchema
  schemaName: string
  workload?: AIWorkload
  maxTokens?: number
}

/** Generate a validated object through Responses API Structured Outputs. */
export async function chatJSON<TSchema extends z.ZodType>(
  options: StructuredOptions<TSchema>,
): Promise<z.infer<TSchema> | null> {
  if (!isOpenAIConfigured()) return null

  const workload = options.workload ?? "create"
  const response = await getOpenAI()!.responses.parse({
    model: modelFor(workload),
    store: false,
    reasoning: { effort: reasoningFor(workload) },
    max_output_tokens: options.maxTokens ?? 1200,
    input: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
    text: {
      verbosity: "low",
      format: zodTextFormat(options.schema, options.schemaName),
    },
  })

  return response.output_parsed
}
