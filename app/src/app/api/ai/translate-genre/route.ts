import { NextRequest, NextResponse } from "next/server"
import { getMashupById } from "@/lib/data/mashups"
import { chatJSON } from "@/lib/ai/chat"

interface TranslationResult {
  originalGenre: string
  targetGenre: string
  newBpm: number
  newKey: string
  replacedStems: { original: string; replacement: string; reason: string }[]
  previewDescription: string
}

const SYSTEM_PROMPT = `You are a music theory expert for a mashup platform. Given a mashup with its current genre, stems, BPM, and key, produce a detailed genre translation plan to transform it into a target genre. Use real music theory — choose BPM ranges, keys, and instruments authentic to the target genre. Return valid JSON: { "newBpm": number, "newKey": string (e.g. "Am", "Bb", "F#m"), "replacedStems": [{ "original": string (original track title), "replacement": string (new instrument/sound in genre style), "reason": string (1 sentence music theory justification) }], "previewDescription": string (1-2 sentences summarizing the transformation) }. Be specific about WHY each change fits the target genre.`

const genrePresets: Record<string, { bpmRange: [number, number]; keys: string[]; instruments: string[] }> = {
  edm: { bpmRange: [128, 140], keys: ["Am", "Cm", "Em"], instruments: ["synth", "drums", "bass"] },
  jazz: { bpmRange: [90, 130], keys: ["Bb", "Eb", "F"], instruments: ["piano", "bass", "drums"] },
  classical: { bpmRange: [60, 120], keys: ["C", "G", "D"], instruments: ["strings", "woodwinds", "piano"] },
  trap: { bpmRange: [130, 160], keys: ["Am", "Dm", "Gm"], instruments: ["808", "hi-hat", "synth"] },
  lofi: { bpmRange: [70, 90], keys: ["Cm", "Am", "Em"], instruments: ["piano", "vinyl", "drums"] },
  "bossa-nova": { bpmRange: [120, 140], keys: ["C", "Am", "Dm"], instruments: ["guitar", "percussion", "bass"] },
  reggaeton: { bpmRange: [88, 100], keys: ["Dm", "Am", "Gm"], instruments: ["dembow", "synth", "bass"] },
  synthwave: { bpmRange: [100, 120], keys: ["Am", "Em", "Cm"], instruments: ["synth", "drums", "arps"] },
}

function mockTranslation(mashup: { genre?: string | null; source_tracks?: { title: string }[] | null }, targetGenre: string): TranslationResult {
  const preset = genrePresets[targetGenre] ?? genrePresets.edm
  const newBpm = preset.bpmRange[0] + Math.floor(Math.random() * (preset.bpmRange[1] - preset.bpmRange[0]))
  const newKey = preset.keys[Math.floor(Math.random() * preset.keys.length)]
  const replacedStems = (mashup.source_tracks ?? []).map((track, i) => ({
    original: track.title,
    replacement: `${preset.instruments[i % preset.instruments.length]} — ${targetGenre} style`,
    reason: `Replaced with ${targetGenre}-appropriate ${preset.instruments[i % preset.instruments.length]}`,
  }))

  return {
    originalGenre: mashup.genre ?? "Various",
    targetGenre,
    newBpm,
    newKey,
    replacedStems,
    previewDescription: `Translated from ${mashup.genre ?? "Various"} to ${targetGenre}: adjusted BPM to ${newBpm}, key to ${newKey}, replaced ${replacedStems.length} stems.`,
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { mashupId: string; targetGenre: string }
  const { mashupId, targetGenre } = body

  if (!mashupId || !targetGenre) {
    return NextResponse.json({ error: "mashupId and targetGenre required" }, { status: 400 })
  }

  const mashup = await getMashupById(mashupId)
  if (!mashup) {
    return NextResponse.json({ error: "Mashup not found" }, { status: 404 })
  }

  try {
    const tracks = mashup.source_tracks?.map((t) => t.title).join(", ") || "no tracks"
    const userMsg = `Translate this mashup from ${mashup.genre || "Various"} to ${targetGenre}. Current BPM: ${mashup.bpm || "unknown"}. Current tracks: ${tracks}.`

    const ai = await chatJSON<{
      newBpm: number
      newKey: string
      replacedStems: { original: string; replacement: string; reason: string }[]
      previewDescription: string
    }>({ system: SYSTEM_PROMPT, user: userMsg })

    if (ai) {
      const result: TranslationResult = {
        originalGenre: mashup.genre ?? "Various",
        targetGenre,
        newBpm: ai.newBpm,
        newKey: ai.newKey,
        replacedStems: ai.replacedStems,
        previewDescription: ai.previewDescription,
      }
      return NextResponse.json({ translation: result })
    }

    return NextResponse.json({ translation: mockTranslation(mashup, targetGenre) })
  } catch {
    return NextResponse.json({ translation: mockTranslation(mashup, targetGenre) })
  }
}
