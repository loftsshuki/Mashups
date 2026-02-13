import { NextResponse } from "next/server"

import { generateHookCuts } from "@/lib/growth/hook-generator"
import { getMockMashup } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"

interface HookRequestBody {
  mashupId?: string
  title?: string
  bpm?: number
  durationSec?: number
}

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HookRequestBody
    if (!body.mashupId && !body.title) {
      return NextResponse.json(
        { error: "Provide mashupId or title for hook generation." },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (isSupabaseConfigured() && !user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const mashup = body.mashupId ? getMockMashup(body.mashupId) : undefined
    const result = generateHookCuts({
      mashupId: body.mashupId ?? "adhoc-hook",
      title: body.title ?? mashup?.title ?? "Untitled Hook",
      bpm: body.bpm ?? mashup?.bpm,
      durationSec: body.durationSec ?? mashup?.duration,
    })

    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ error: "Invalid hook generation payload." }, { status: 400 })
  }
}
