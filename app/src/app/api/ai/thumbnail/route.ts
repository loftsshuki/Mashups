import { randomUUID } from "node:crypto"
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getOpenAI, isOpenAIConfigured } from "@/lib/ai/openai"
import { enforceTierLimit, finalizeUsage } from "@/lib/billing/enforce-tier"

const requestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  genre: z.string().trim().max(60).optional(),
  mood: z.string().trim().max(60).optional(),
})

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cover request." }, { status: 400 })
  }

  const tierCheck = await enforceTierLimit("ai_generations")
  if (tierCheck instanceof NextResponse) return tierCheck
  const usageEventId = tierCheck.usageEventId

  if (!isOpenAIConfigured()) {
    await finalizeUsage(usageEventId, "failed", { operation: "cover", reason: "not_configured" })
    return NextResponse.json({ error: "Image generation is not configured." }, { status: 503 })
  }

  try {
    const { title, genre, mood } = parsed.data
    const response = await getOpenAI()!.images.generate({
      model: "gpt-image-2",
      prompt: [
        `Create square cover art for a music mashup titled "${title}".`,
        genre ? `Genre signal: ${genre}.` : "",
        mood ? `Mood: ${mood}.` : "",
        "Art direction: editorial music magazine, tactile print texture, strong single focal idea, dramatic crop, no gradients, no text, no letters, no logos, no watermark.",
      ].filter(Boolean).join(" "),
      n: 1,
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
    })

    const image = response.data?.[0]
    if (!image?.b64_json) throw new Error("Image API returned no image data.")

    const bytes = Buffer.from(image.b64_json, "base64")
    let url: string
    try {
      const blob = await put(
        `covers/${tierCheck.userId}/${randomUUID()}.png`,
        bytes,
        { access: "public", contentType: "image/png" },
      )
      url = blob.url
    } catch (error) {
      console.warn("[AI Cover] Blob storage unavailable; returning inline image.", error)
      url = `data:image/png;base64,${image.b64_json}`
    }

    await finalizeUsage(usageEventId, "completed", {
      operation: "cover",
      model: "gpt-image-2",
    })
    return NextResponse.json({ url, model: "gpt-image-2" })
  } catch (error) {
    await finalizeUsage(usageEventId, "failed", { operation: "cover" })
    console.error("[AI Cover] Failed:", error)
    return NextResponse.json({ error: "Failed to generate cover art." }, { status: 502 })
  }
}
