import { NextRequest, NextResponse } from "next/server"
import { enforceTierLimit } from "@/lib/billing/enforce-tier"
import { getOpenAI, isOpenAIConfigured } from "@/lib/ai/openai"

export async function POST(request: NextRequest) {
  try {
    const tierCheck = await enforceTierLimit("ai_generations")
    if (tierCheck instanceof NextResponse) return tierCheck

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 503 })
    }

    const body = (await request.json()) as {
      title: string
      genre?: string
      mood?: string
    }

    if (!body.title) {
      return NextResponse.json({ error: "title required" }, { status: 400 })
    }

    const openai = getOpenAI()!

    const genreHint = body.genre ? ` in the ${body.genre} genre` : ""
    const moodHint = body.mood ? `, ${body.mood} mood` : ""

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Album cover art for a music mashup titled "${body.title}"${genreHint}${moodHint}. Abstract, vibrant, modern music art style. No text or words in the image.`,
      n: 1,
      size: "1024x1024",
    })

    const firstImage = response.data?.[0]
    if (!firstImage?.url) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 })
    }

    return NextResponse.json({
      url: firstImage.url,
      revisedPrompt: firstImage.revised_prompt || "",
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 })
  }
}
