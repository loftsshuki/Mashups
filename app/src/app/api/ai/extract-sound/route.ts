import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { chatJSON } from "@/lib/ai/chat"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { isDemoMode } from "@/lib/config/runtime"

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

const extractionSchema = z.object({
  instrument: z.enum(["drums", "bass", "vocal", "synth", "guitar", "keys", "strings", "texture", "other"]),
  bpm: z.number().min(40).max(240),
  key: z.string().min(1).max(24),
  duration: z.number().min(2).max(16),
  confidence: z.number().min(0).max(1),
  analysis: z.string().min(10).max(320),
})

const SYSTEM_PROMPT = `You are a music-production analyst. Infer a practical recreation recipe from the user's written sound description. Return conservative confidence when evidence is limited. If a filename is supplied, treat it only as context; never claim to have listened to the audio.`

function demoExtract(description: string): ExtractedSound {
  const lower = description.toLowerCase()
  const instrument = /snare|drum|kick/.test(lower)
    ? "drums"
    : /bass|808/.test(lower)
      ? "bass"
      : /vocal|voice/.test(lower)
        ? "vocal"
        : /synth|pad/.test(lower)
          ? "synth"
          : /guitar/.test(lower)
            ? "guitar"
            : "other"

  return {
    id: `extract-${Date.now()}`,
    title: `${instrument}: ${description.slice(0, 30)}`,
    instrument,
    bpm: 120,
    key: "Am",
    duration: 8,
    confidence: 0.68,
    description: "Demo analysis generated from the written description only.",
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const description = z.string().trim().min(3).max(600).safeParse(formData.get("description"))
  const audioFile = formData.get("audio")
  if (!description.success) {
    return NextResponse.json({ error: "A sound description is required." }, { status: 400 })
  }
  if (audioFile instanceof File && audioFile.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file exceeds 50 MB." }, { status: 400 })
  }

  let usageEventId: string | null = null
  try {
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId

    const fileContext = audioFile instanceof File
      ? ` Context filename: ${audioFile.name}. Do not imply that you heard it.`
      : ""
    const ai = await chatJSON({
      system: SYSTEM_PROMPT,
      user: `Sound description: ${description.data}.${fileContext}`,
      schema: extractionSchema,
      schemaName: "sound_recipe",
      workload: "classify",
    })

    if (ai) {
      const result: ExtractedSound = {
        id: `extract-${Date.now()}`,
        title: `${ai.instrument}: ${description.data.slice(0, 30)}`,
        instrument: ai.instrument,
        bpm: ai.bpm,
        key: ai.key,
        duration: ai.duration,
        confidence: ai.confidence,
        description: ai.analysis,
      }
      await finalizeUsage(usageEventId, "completed", { operation: "sound_recipe" })
      return NextResponse.json({ result })
    }

    if (isDemoMode()) {
      await finalizeUsage(usageEventId, "completed", { operation: "sound_recipe", mode: "demo" })
      return NextResponse.json({ result: demoExtract(description.data), mode: "demo" })
    }

    await finalizeUsage(usageEventId, "failed", { operation: "sound_recipe", reason: "not_configured" })
    return NextResponse.json({ error: "AI sound analysis is not configured." }, { status: 503 })
  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "sound_recipe" })
    console.error("[AI Extract] Failed:", error)
    return NextResponse.json({ error: "Failed to analyze sound description." }, { status: 502 })
  }
}
