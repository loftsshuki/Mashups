import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { chatJSON } from "@/lib/ai/chat"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { isDemoMode } from "@/lib/config/runtime"

interface Suggestion {
  id: string
  type: "structural" | "stem" | "effect"
  title: string
  description: string
  confidence: number
}

const SYSTEM_PROMPT = `You are a music production AI assistant for a mashup creation platform. Given the current state of a mashup project, generate exactly 3 creative suggestions to improve it. Each suggestion should be one of three types: "structural" (arrangement changes), "stem" (add/replace audio elements), or "effect" (mixing/processing). Return valid JSON with this schema: { "suggestions": [{ "type": "structural"|"stem"|"effect", "title": string (max 6 words), "description": string (1-2 sentences, actionable advice referencing specific bars, frequencies, or techniques), "confidence": number (0.60-0.95) }] }. Vary the types across the 3 suggestions. Be specific and musically knowledgeable.`

const requestSchema = z.object({
  mashupState: z.object({
    stems: z.array(z.object({ instrument: z.string().optional(), title: z.string().optional() })).max(24).optional(),
    bpm: z.number().min(40).max(240).optional(),
    key: z.string().trim().max(24).optional(),
    genre: z.string().trim().max(60).optional(),
  }).optional(),
})

const suggestionSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(["structural", "stem", "effect"]),
    title: z.string().min(2).max(48),
    description: z.string().min(10).max(280),
    confidence: z.number().min(0).max(1),
  })).length(3),
})

const mockSuggestions: Suggestion[] = [
  {
    id: "sug-1",
    type: "structural",
    title: "Move the Drop Earlier",
    description: "Try moving the drop 4 bars earlier — it would catch listeners off guard and increase energy retention.",
    confidence: 0.82,
  },
  {
    id: "sug-2",
    type: "stem",
    title: "Add a Brass Stab",
    description: "A brass stab at bar 16 would complement the existing synth pad and add warmth to the transition.",
    confidence: 0.74,
  },
  {
    id: "sug-3",
    type: "effect",
    title: "Reverb on the Vocal Bridge",
    description: "Adding a hall reverb to the vocal in the bridge section would create more space and emotional depth.",
    confidence: 0.88,
  },
]

export async function POST(request: NextRequest) {
  let usageEventId: string | null = null
  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid project state." }, { status: 400 })
    }

    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId

    const state = parsed.data.mashupState ?? {}
    const parts: string[] = ["Analyze this mashup and suggest improvements."]
    if (state.stems?.length) {
      parts.push(`Current stems: ${state.stems.map((s) => s.instrument || s.title || "unknown").join(", ")}`)
    }
    if (state.bpm) parts.push(`BPM: ${state.bpm}`)
    if (state.key) parts.push(`Key: ${state.key}`)
    if (state.genre) parts.push(`Genre: ${state.genre}`)
    if (!state.stems?.length) parts.push("The project is just starting out with no stems yet.")

    const ai = await chatJSON({
      system: SYSTEM_PROMPT,
      user: parts.join(" "),
      schema: suggestionSchema,
      schemaName: "production_suggestions",
      workload: "create",
    })

    if (ai?.suggestions) {
      const suggestions: Suggestion[] = ai.suggestions.map((s, i) => ({
        ...s,
        id: `sug-${Date.now()}-${i}`,
      }))
      await finalizeUsage(usageEventId, "completed", { operation: "suggest" })
      return NextResponse.json({ suggestions })
    }

    if (isDemoMode()) {
      await finalizeUsage(usageEventId, "completed", { operation: "suggest", mode: "demo" })
      return NextResponse.json({ suggestions: mockSuggestions, mode: "demo" })
    }
    await finalizeUsage(usageEventId, "failed", { operation: "suggest", reason: "not_configured" })
    return NextResponse.json({ error: "AI suggestions are not configured." }, { status: 503 })
  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "suggest" })
    console.error("[AI Suggest] Failed:", error)
    return NextResponse.json({ error: "Failed to generate suggestions." }, { status: 502 })
  }
}
