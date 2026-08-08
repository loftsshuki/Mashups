import { NextResponse } from "next/server"
import { z } from "zod"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { saveSpotifyItem } from "@/lib/integrations/spotify"
import { getValidPlatformAccessToken } from "@/lib/growth-os/platform-tokens"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), spotifyUri: z.string().min(10).max(300), anonymousKey: z.string().min(8).max(120) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid save request." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, result: "saved", provider: "spotify", demo: true })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Music saving is not configured." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Connect a Mashups account before saving." }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "growth.save", user.id), limit: 20, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Music saving is unavailable." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("is_public", true).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  try {
    await saveSpotifyItem(await getValidPlatformAccessToken(user.id, "spotify"), parsed.data.spotifyUri)
    await Promise.all([
      admin.from("music_save_events").insert({ user_id: user.id, launch_id: launch.id, provider: "spotify", provider_track_id: parsed.data.spotifyUri, result: "saved", anonymous_key: parsed.data.anonymousKey }),
      admin.rpc("increment_viral_launch_counter", { p_launch_id: launch.id, p_counter: "saves", p_amount: 1 }),
    ])
    return NextResponse.json({ ok: true, result: "saved", provider: "spotify" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save on Spotify."
    const reconnect = /connect|reconnect/i.test(message)
    return NextResponse.json({ error: message, connectUrl: reconnect ? "/api/growth/connections/spotify" : undefined }, { status: reconnect ? 409 : 502 })
  }
}
