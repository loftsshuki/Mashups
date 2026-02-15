import { NextRequest, NextResponse } from "next/server"
import { enforceTierLimit } from "@/lib/billing/enforce-tier"
import { getOpenAI, isOpenAIConfigured } from "@/lib/ai/openai"

interface CompletionOption {
  id: string
  label: string
  description: string
  style: string
  confidence: number
  suggestedStems: { instrument: string; description: string }[]
}

// Template-based completion options (fallback when no API key)
function generateCompletions(
  stemCount: number,
  bpm: number | null,
  key: string | null
): CompletionOption[] {
  const templates: CompletionOption[] = [
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

  if (stemCount >= 3) {
    templates.forEach((t) => (t.confidence = Math.min(t.confidence + 0.05, 0.99)))
  }

  return templates
}

export async function POST(request: NextRequest) {
  try {
    // Check AI generation limit
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck

    const body = (await request.json()) as {
      prompt?: string
      stems?: { instrument?: string; title?: string }[]
      bpm?: number | null
      key?: string | null
    }

    // Use OpenAI if configured
    if (isOpenAIConfigured() && body.prompt) {
      const openai = getOpenAI()!
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a music production assistant. Suggest creative mashup ideas based on the user's current project. Keep responses concise and actionable."
        }, {
          role: "user",
          content: body.prompt
        }],
      })

      return NextResponse.json({
        suggestion: response.choices[0].message.content
      })
    }

    // Fallback to template-based completions
    const stemCount = body.stems?.length ?? 0
    const completions = generateCompletions(stemCount, body.bpm ?? null, body.key ?? null)

    return NextResponse.json({ completions })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
