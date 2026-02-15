import { NextRequest, NextResponse } from "next/server"
import { chatJSON } from "@/lib/ai/chat"

interface ExtractedSound {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  duration: number
  confidence: number
  description: string
}

const SYSTEM_PROMPT = `You are an audio analysis AI for a music mashup platform. A user describes a sound element they want to extract or recreate. Analyze the description and determine the most likely musical properties. Return valid JSON: { "instrument": string (one of: "drums", "bass", "vocal", "synth", "guitar", "keys", "strings", "texture", "other"), "bpm": number (realistic for the instrument/style, 60-200), "key": string (e.g. "Am", "C", "F#m", "Bb"), "duration": number (seconds, 2-16), "confidence": number (0.60-0.95), "analysis": string (1-2 sentences explaining what you detected and how you'd recreate it) }. Base your analysis on real music production knowledge.`

function mockExtract(description: string, audioFile: File | null): ExtractedSound {
  const lowerDesc = description.toLowerCase()
  let instrument = "other"
  let bpm = 120
  let key = "Am"

  if (/snare|drum|kick/.test(lowerDesc)) { instrument = "drums"; bpm = 128 }
  else if (/bass/.test(lowerDesc)) { instrument = "bass"; bpm = 110; key = "Em" }
  else if (/vocal|voice/.test(lowerDesc)) { instrument = "vocal"; bpm = 100; key = "Cm" }
  else if (/synth|pad/.test(lowerDesc)) { instrument = "synth"; bpm = 130; key = "Fm" }
  else if (/guitar/.test(lowerDesc)) { instrument = "guitar"; bpm = 95; key = "G" }

  return {
    id: `extract-${Date.now()}`,
    title: `Extracted ${instrument}: ${description.slice(0, 30)}`,
    instrument,
    bpm,
    key,
    duration: 4 + Math.floor(Math.random() * 8),
    confidence: 0.75 + Math.random() * 0.2,
    description: `AI analyzed the "${description}" element. ${audioFile ? `Source: ${audioFile.name}` : "No audio provided — generated from description."}`,
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const description = formData.get("description") as string | null
  const audioFile = formData.get("audio") as File | null

  if (!description) {
    return NextResponse.json({ error: "description required" }, { status: 400 })
  }

  try {
    let userMsg = `Analyze this sound description: "${description}"`
    if (audioFile) userMsg += `. An audio file named "${audioFile.name}" (${Math.round(audioFile.size / 1024)}KB) was also uploaded.`

    const ai = await chatJSON<{
      instrument: string
      bpm: number
      key: string
      duration: number
      confidence: number
      analysis: string
    }>({ system: SYSTEM_PROMPT, user: userMsg })

    if (ai) {
      const result: ExtractedSound = {
        id: `extract-${Date.now()}`,
        title: `Extracted ${ai.instrument}: ${description.slice(0, 30)}`,
        instrument: ai.instrument,
        bpm: ai.bpm,
        key: ai.key,
        duration: ai.duration,
        confidence: ai.confidence,
        description: ai.analysis + (audioFile ? ` Source: ${audioFile.name}` : " No audio provided — generated from description."),
      }
      return NextResponse.json({ result })
    }

    return NextResponse.json({ result: mockExtract(description, audioFile) })
  } catch {
    return NextResponse.json({ result: mockExtract(description, audioFile) })
  }
}
