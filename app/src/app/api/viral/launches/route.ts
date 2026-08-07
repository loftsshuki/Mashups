import { NextResponse } from "next/server"
import { z } from "zod"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { DEMO_VIRAL_LAUNCH } from "@/lib/viral/demo"
import { createViralLaunch, getViralLaunches } from "@/lib/viral/service"

const launchSchema = z.object({
  title: z.string().trim().min(3).max(100),
  artistName: z.string().trim().min(2).max(80),
  trackTitle: z.string().trim().min(2).max(100),
  objective: z.string().trim().min(10).max(500),
  startsAt: z.iso.datetime(),
  releaseAt: z.iso.datetime().nullable().optional(),
  bountyCents: z.number().int().min(0).max(100_000_000),
  testCreators: z.number().int().min(5).max(500),
  scaleCreators: z.number().int().min(20).max(10_000),
  niches: z.array(z.string().trim().min(2).max(40)).min(1).max(3),
  artistReactionCount: z.number().int().min(1).max(100),
  saveDestinations: z.array(z.object({
    platform: z.enum(["spotify", "apple", "youtube"]),
    url: z.url(),
  })).max(3),
})

export async function GET(request: Request) {
  const demo = isDemoRequest(request)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const launches = await getViralLaunches({ userId: user?.id, demo })
  return NextResponse.json({ launches })
}

export async function POST(request: Request) {
  const demo = isDemoRequest(request)
  const parsed = launchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid launch configuration.", issues: parsed.error.issues }, { status: 400 })
  if (demo) return NextResponse.json({ launch: DEMO_VIRAL_LAUNCH, demo: true }, { status: 201 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isSupabaseConfigured() || !user) return NextResponse.json({ error: "Production launch storage and authentication are required." }, { status: 401 })

  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "viral.launches", user?.id), limit: 8, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } })

  try {
    const created = await createViralLaunch(parsed.data, user!.id)
    return NextResponse.json({ launch: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create launch." }, { status: 500 })
  }
}
