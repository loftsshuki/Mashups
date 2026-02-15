import { NextRequest, NextResponse } from "next/server"
import { chatJSON } from "@/lib/ai/chat"

interface Suggestion {
  id: string
  type: "structural" | "stem" | "effect"
  title: string
  description: string
  confidence: number
}

const SYSTEM_PROMPT = `You are a music production AI assistant for a mashup creation platform. Given the current state of a mashup project, generate exactly 3 creative suggestions to improve it. Each suggestion should be one of three types: "structural" (arrangement changes), "stem" (add/replace audio elements), or "effect" (mixing/processing). Return valid JSON with this schema: { "suggestions": [{ "type": "structural"|"stem"|"effect", "title": string (max 6 words), "description": string (1-2 sentences, actionable advice referencing specific bars, frequencies, or techniques), "confidence": number (0.60-0.95) }] }. Vary the types across the 3 suggestions. Be specific and musically knowledgeable.`

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
  try {
    const body = (await request.json()) as {
      mashupState?: {
        stems?: { instrument?: string; title?: string }[]
        bpm?: number
        key?: string
        genre?: string
      }
    }

    const state = body.mashupState ?? {}
    const parts: string[] = ["Analyze this mashup and suggest improvements."]
    if (state.stems?.length) {
      parts.push(`Current stems: ${state.stems.map((s) => s.instrument || s.title || "unknown").join(", ")}`)
    }
    if (state.bpm) parts.push(`BPM: ${state.bpm}`)
    if (state.key) parts.push(`Key: ${state.key}`)
    if (state.genre) parts.push(`Genre: ${state.genre}`)
    if (!state.stems?.length) parts.push("The project is just starting out with no stems yet.")

    const ai = await chatJSON<{ suggestions: Omit<Suggestion, "id">[] }>({
      system: SYSTEM_PROMPT,
      user: parts.join(" "),
    })

    if (ai?.suggestions) {
      const suggestions: Suggestion[] = ai.suggestions.map((s, i) => ({
        ...s,
        id: `sug-${Date.now()}-${i}`,
      }))
      return NextResponse.json({ suggestions })
    }

    return NextResponse.json({ suggestions: mockSuggestions })
  } catch {
    return NextResponse.json({ suggestions: mockSuggestions })
  }
}
