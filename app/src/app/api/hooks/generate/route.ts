import { NextResponse } from "next/server"

import { generateHookCuts } from "@/lib/growth/hook-generator"
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

    let mashup: { title?: string | null; bpm?: number | null; duration?: number | null } | undefined
    if (body.mashupId) {
      const { data } = await supabase
        .from("mashups")
        .select("title,bpm,duration")
        .eq("id", body.mashupId)
        .maybeSingle()
      mashup = (data as { title?: string | null; bpm?: number | null; duration?: number | null } | null) ?? undefined
    }

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
