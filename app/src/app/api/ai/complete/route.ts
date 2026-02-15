import { NextRequest, NextResponse } from "next/server"
import { enforceTierLimit } from "@/lib/billing/enforce-tier"
import { chatJSON } from "@/lib/ai/chat"

interface CompletionOption {
  id: string
  label: string
  description: string
  style: string
  confidence: number
  suggestedStems: { instrument: string; description: string }[]
}

const SYSTEM_PROMPT = `You are a music production AI for a mashup platform. Given the user's current stems, BPM, and key, suggest exactly 3 ways to complete/extend their mashup. Each option should have a distinct style/mood. Return valid JSON: { "completions": [{ "label": string (2-4 words), "description": string (1-2 sentences), "style": string (one of: "high-energy", "ambient", "drop", "groove", "cinematic", "experimental"), "confidence": number (0.65-0.95), "suggestedStems": [{ "instrument": string, "description": string (specific detail with key/BPM) }] }] }. Each completion should suggest 2-3 stems. Be musically specific.`

function generateFallback(bpm: number | null, key: string | null): CompletionOption[] {
  return [
    {
      id: "energetic-build",
      label: "Energetic Build",
      description: "Layer a driving drum pattern and ascending synth line to build tension toward a drop.",
      style: "high-energy",
      confidence: 0.87,
      suggestedStems: [
        { instrument: "drums", description: `Driving four-on-the-floor at ${bpm ?? 128} BPM` },
        { instrument: "synth", description: `Ascending saw lead in ${key ?? "C major"}` },
      ],
    },
    {
      id: "chill-fade",
      label: "Chill Fade",
      description: "Add a soft pad and gentle reverb to create a smooth, ambient wind-down.",
      style: "ambient",
      confidence: 0.74,
      suggestedStems: [
        { instrument: "pad", description: `Warm analog pad in ${key ?? "A minor"}` },
        { instrument: "texture", description: "Vinyl crackle and rain ambience" },
      ],
    },
    {
      id: "dramatic-drop",
      label: "Dramatic Drop",
      description: "Build a riser, cut everything, then slam back in with full bass and percussion.",
      style: "drop",
      confidence: 0.81,
      suggestedStems: [
        { instrument: "fx", description: `White noise riser, 8 bars at ${bpm ?? 128} BPM` },
        { instrument: "bass", description: `Sub bass hit in ${key ?? "F minor"}` },
      ],
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck

    const body = (await request.json()) as {
      stems?: { instrument?: string; title?: string }[]
      bpm?: number | null
      key?: string | null
    }

    const stemList = body.stems?.map((s) => s.instrument || s.title || "unknown").join(", ") || "none yet"
    const userMsg = `Current project stems: ${stemList}. BPM: ${body.bpm ?? "not set"}. Key: ${body.key ?? "not set"}. Suggest 3 creative completion options.`

    const ai = await chatJSON<{ completions: Omit<CompletionOption, "id">[] }>({
      system: SYSTEM_PROMPT,
      user: userMsg,
    })

    if (ai?.completions) {
      const completions: CompletionOption[] = ai.completions.map((c, i) => ({
        ...c,
        id: `comp-${Date.now()}-${i}`,
      }))
      return NextResponse.json({ completions })
    }

    return NextResponse.json({ completions: generateFallback(body.bpm ?? null, body.key ?? null) })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
