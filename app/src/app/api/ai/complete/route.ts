import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"
import { chatJSON } from "@/lib/ai/chat"
import { isDemoMode } from "@/lib/config/runtime"

interface CompletionOption {
  id: string
  label: string
  description: string
  style: string
  confidence: number
  suggestedStems: { instrument: string; description: string }[]
}

const SYSTEM_PROMPT = `You are a music production AI for a mashup platform. Given the user's current stems, BPM, and key, suggest exactly 3 ways to complete/extend their mashup. Each option should have a distinct style/mood. Return valid JSON: { "completions": [{ "label": string (2-4 words), "description": string (1-2 sentences), "style": string (one of: "high-energy", "ambient", "drop", "groove", "cinematic", "experimental"), "confidence": number (0.65-0.95), "suggestedStems": [{ "instrument": string, "description": string (specific detail with key/BPM) }] }] }. Each completion should suggest 2-3 stems. Be musically specific.`

const requestSchema = z.object({
  stems: z.array(z.object({ instrument: z.string().optional(), title: z.string().optional() })).max(24).optional(),
  bpm: z.number().min(40).max(240).nullable().optional(),
  key: z.string().trim().max(24).nullable().optional(),
})

const completionSchema = z.object({
  completions: z.array(z.object({
    label: z.string().min(2).max(40),
    description: z.string().min(10).max(280),
    style: z.enum(["high-energy", "ambient", "drop", "groove", "cinematic", "experimental"]),
    confidence: z.number().min(0).max(1),
    suggestedStems: z.array(z.object({
      instrument: z.string().min(1).max(40),
      description: z.string().min(5).max(180),
    })).min(2).max(3),
  })).length(3),
})

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
  let usageEventId: string | null = null
  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid project state." }, { status: 400 })
    }

    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck
    usageEventId = tierCheck.usageEventId
    const body = parsed.data

    const stemList = body.stems?.map((s) => s.instrument || s.title || "unknown").join(", ") || "none yet"
    const userMsg = `Current project stems: ${stemList}. BPM: ${body.bpm ?? "not set"}. Key: ${body.key ?? "not set"}. Suggest 3 creative completion options.`

    const ai = await chatJSON({
      system: SYSTEM_PROMPT,
      user: userMsg,
      schema: completionSchema,
      schemaName: "mashup_completions",
      workload: "create",
    })

    if (ai?.completions) {
      const completions: CompletionOption[] = ai.completions.map((c, i) => ({
        ...c,
        id: `comp-${Date.now()}-${i}`,
      }))
      await finalizeUsage(usageEventId, "completed", { operation: "complete" })
      return NextResponse.json({ completions })
    }

    if (isDemoMode()) {
      await finalizeUsage(usageEventId, "completed", { operation: "complete", mode: "demo" })
      return NextResponse.json({ completions: generateFallback(body.bpm ?? null, body.key ?? null), mode: "demo" })
    }
    await finalizeUsage(usageEventId, "failed", { operation: "complete", reason: "not_configured" })
    return NextResponse.json({ error: "AI completion is not configured." }, { status: 503 })
  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "complete" })
    console.error("[AI Complete] Failed:", error)
    return NextResponse.json({ error: "Failed to generate completion options." }, { status: 502 })
  }
}
