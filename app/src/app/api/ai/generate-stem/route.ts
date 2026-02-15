import { NextRequest, NextResponse } from "next/server"
import { enforceTierLimit } from "@/lib/billing/enforce-tier"
import { chatJSON } from "@/lib/ai/chat"

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

const SYSTEM_PROMPT = `You are a music production AI. A user wants to generate an audio stem. Given their description and optional parameters, determine the best metadata for this stem. Return valid JSON: { "title": string (concise, max 50 chars, e.g. "Punchy 808 Trap Kick"), "instrument": string (one of: "drums", "bass", "synth", "guitar", "keys", "strings", "vocal", "texture"), "genre": string (one of: "hip-hop", "electronic", "jazz", "classical", "ambient", "rock", "pop", "r&b", "various"), "bpm": number (60-200, appropriate for the described sound), "key": string (e.g. "C minor", "F# major"), "duration_seconds": number (5-60) }. Use real music production knowledge for all values.`

function mockStem(prompt: string, instrument?: string, bpm?: number, key?: string, duration?: number): GeneratedStem {
  const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const inferredInstrument = instrument ??
    (prompt.match(/\b(cello|violin|strings?|orchestra)\b/i) ? "strings" :
     prompt.match(/\b(drum|percussion|beat|kick|snare)\b/i) ? "drums" :
     prompt.match(/\b(bass|sub|808)\b/i) ? "bass" :
     prompt.match(/\b(vocal|voice|sing|choir)\b/i) ? "vocal" :
     prompt.match(/\b(synth|pad|lead|arp)\b/i) ? "synth" :
     prompt.match(/\b(guitar|acoustic|electric)\b/i) ? "guitar" :
     prompt.match(/\b(piano|keys|organ)\b/i) ? "keys" : "texture")

  return {
    id,
    title: `AI: ${prompt.slice(0, 50)}`,
    instrument: inferredInstrument,
    genre: "various",
    bpm: bpm ?? 120,
    key: key ?? "C minor",
    duration_seconds: duration ?? 30,
    audio_url: `/api/placeholder-audio?type=${inferredInstrument}&duration=${duration ?? 30}`,
    source: "ai_generated",
  }
}

export async function POST(request: NextRequest) {
  try {
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck

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

    let userMsg = `Generate a stem: "${body.prompt}"`
    if (body.instrument) userMsg += `. Instrument: ${body.instrument}`
    if (body.bpm) userMsg += `. BPM: ${body.bpm}`
    if (body.key) userMsg += `. Key: ${body.key}`
    if (body.duration) userMsg += `. Duration: ${body.duration}s`

    const ai = await chatJSON<{
      title: string
      instrument: string
      genre: string
      bpm: number
      key: string
      duration_seconds: number
    }>({ system: SYSTEM_PROMPT, user: userMsg })

    if (ai) {
      const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const stem: GeneratedStem = {
        id,
        title: ai.title,
        instrument: ai.instrument,
        genre: ai.genre,
        bpm: body.bpm ?? ai.bpm,
        key: body.key ?? ai.key,
        duration_seconds: body.duration ?? ai.duration_seconds,
        audio_url: `/api/placeholder-audio?type=${ai.instrument}&duration=${body.duration ?? ai.duration_seconds}`,
        source: "ai_generated",
      }
      return NextResponse.json({ stem })
    }

    return NextResponse.json({ stem: mockStem(body.prompt, body.instrument, body.bpm, body.key, body.duration) })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
