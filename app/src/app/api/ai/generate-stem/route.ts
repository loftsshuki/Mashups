import { NextRequest, NextResponse } from "next/server"

interface GeneratedStem {
  id: string
  title: string
  instrument: string
  genre: string
  bpm: number
  key: string
  duration_seconds: number
  audio_url: string
  source: "ai_generated"
}

// Mock stem generation — in production this calls Replicate or similar
function generateMockStem(
  prompt: string,
  instrument?: string,
  bpm?: number,
  key?: string,
  duration?: number
): GeneratedStem {
  const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  // Infer instrument from prompt if not specified
  const inferredInstrument = instrument ??
    (prompt.match(/\b(cello|violin|strings?|orchestra)\b/i) ? "strings" :
     prompt.match(/\b(drum|percussion|beat|kick|snare)\b/i) ? "drums" :
     prompt.match(/\b(bass|sub|808)\b/i) ? "bass" :
     prompt.match(/\b(vocal|voice|sing|choir)\b/i) ? "vocal" :
     prompt.match(/\b(synth|pad|lead|arp)\b/i) ? "synth" :
     prompt.match(/\b(guitar|acoustic|electric)\b/i) ? "guitar" :
     prompt.match(/\b(piano|keys|organ)\b/i) ? "keys" :
     "texture")

  // Infer genre from prompt
  const inferredGenre =
    prompt.match(/\b(hip.?hop|rap|trap)\b/i) ? "hip-hop" :
    prompt.match(/\b(house|techno|edm|electronic)\b/i) ? "electronic" :
    prompt.match(/\b(jazz)\b/i) ? "jazz" :
    prompt.match(/\b(classical|orchestra)\b/i) ? "classical" :
    prompt.match(/\b(ambient|chill|lo.?fi)\b/i) ? "ambient" :
    prompt.match(/\b(rock|metal)\b/i) ? "rock" :
    "various"

  return {
    id,
    title: `AI: ${prompt.slice(0, 50)}`,
    instrument: inferredInstrument,
    genre: inferredGenre,
    bpm: bpm ?? 120,
    key: key ?? "C minor",
    duration_seconds: duration ?? 30,
    audio_url: `/api/placeholder-audio?type=${inferredInstrument}&duration=${duration ?? 30}`,
    source: "ai_generated",
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      prompt: string
      instrument?: string
      bpm?: number
      key?: string
      duration?: number
    }

    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const stem = generateMockStem(
      body.prompt,
      body.instrument,
      body.bpm,
      body.key,
      body.duration
    )

    return NextResponse.json({ stem })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
