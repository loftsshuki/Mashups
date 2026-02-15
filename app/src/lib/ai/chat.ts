import { getOpenAI, isOpenAIConfigured } from "./openai"

interface ChatOptions {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
}

/**
 * Call GPT-4o-mini with JSON mode. Returns parsed JSON or null if unavailable.
 */
export async function chatJSON<T>(options: ChatOptions): Promise<T | null> {
  if (!isOpenAIConfigured()) return null

  const openai = getOpenAI()!
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
  })

  const text = response.choices[0]?.message?.content
  if (!text) return null
  return JSON.parse(text) as T
}
