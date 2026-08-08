import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { chatJSON } from "@/lib/ai/chat"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { isDemoMode } from "@/lib/config/runtime"
import { getMashupById } from "@/lib/data/mashups"

interface TranslationResult {
  originalGenre: string
  targetGenre: string
  newBpm: number
  newKey: string
  replacedStems: { original: string; replacement: string; reason: string }[]
  previewDescription: string
}

const requestSchema = z.object({
  mashupId: z.string().trim().min(1).max(100),
  targetGenre: z.string().trim().min(2).max(60),
})

const translationSchema = z.object({
  newBpm: z.number().min(40).max(240),
  newKey: z.string().min(1).max(24),
  replacedStems: z.array(z.object({
    original: z.string().min(1).max(120),
    replacement: z.string().min(2).max(120),
    reason: z.string().min(8).max(260),
  })).max(16),
  previewDescription: z.string().min(10).max(360),
})

const SYSTEM_PROMPT = `You are a music theory expert for a creator platform. Build an actionable genre-translation plan from the supplied track facts. Choose authentic tempo, harmony, instrumentation, and production techniques. Explain each replacement with a concrete music-theory or production reason. Do not claim that audio has already been rendered.`

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

function demoTranslation(
  mashup: { genre?: string | null; source_tracks?: { title: string }[] | null },
  targetGenre: string,
): TranslationResult {
  const preset = genrePresets[targetGenre] ?? genrePresets.edm
  const newBpm = Math.round((preset.bpmRange[0] + preset.bpmRange[1]) / 2)
  const newKey = preset.keys[0]
  const replacedStems = (mashup.source_tracks ?? []).map((track, index) => ({
    original: track.title,
    replacement: `${preset.instruments[index % preset.instruments.length]} in ${targetGenre} style`,
    reason: `Uses the rhythmic and tonal vocabulary expected in ${targetGenre}.`,
  }))

  return {
    originalGenre: mashup.genre ?? "Various",
    targetGenre,
    newBpm,
    newKey,
    replacedStems,
    previewDescription: `A ${targetGenre} treatment centered at ${newBpm} BPM in ${newKey}.`,
  }
}

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "mashupId and targetGenre are required." }, { status: 400 })
  }

  const { mashupId, targetGenre } = parsed.data
  const mashup = await getMashupById(mashupId)
  if (!mashup) {
    return NextResponse.json({ error: "Mashup not found." }, { status: 404 })
  }

  let usageEventId: string | null = null
  try {
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId

    const tracks = mashup.source_tracks?.map((track) => track.title).join(", ") || "none"
    const ai = await chatJSON({
      system: SYSTEM_PROMPT,
      user: `Translate from ${mashup.genre || "Various"} to ${targetGenre}. Current BPM: ${mashup.bpm || "unknown"}. Source tracks: ${tracks}.`,
      schema: translationSchema,
      schemaName: "genre_translation",
      workload: "create",
    })

    if (ai) {
      await finalizeUsage(usageEventId, "completed", { operation: "translate_genre" })
      return NextResponse.json({
        translation: {
          originalGenre: mashup.genre ?? "Various",
          targetGenre,
          ...ai,
        } satisfies TranslationResult,
      })
    }

    if (isDemoMode()) {
      await finalizeUsage(usageEventId, "completed", { operation: "translate_genre", mode: "demo" })
      return NextResponse.json({ translation: demoTranslation(mashup, targetGenre), mode: "demo" })
    }

    await finalizeUsage(usageEventId, "failed", { operation: "translate_genre", reason: "not_configured" })
    return NextResponse.json({ error: "Genre translation is not configured." }, { status: 503 })
  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "translate_genre" })
    console.error("[AI Translate] Failed:", error)
    return NextResponse.json({ error: "Failed to translate genre." }, { status: 502 })
  }
}
