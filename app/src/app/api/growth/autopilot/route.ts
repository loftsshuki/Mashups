import { NextResponse } from "next/server"
import { z } from "zod"

import { decideAutopilotActions } from "@/lib/growth-os/autopilot"
import { DEMO_GROWTH_OS } from "@/lib/growth-os/demo"
import { isDemoRequest } from "@/lib/demo/runtime"
import { runAutopilotForLaunch } from "@/lib/growth-os/autopilot-service"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ launchSlug: z.string().min(2).max(100), trigger: z.enum(["operator", "event_threshold"]).default("operator") })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid autopilot request." }, { status: 400 })
  if (isDemoRequest(request)) return NextResponse.json({ ok: true, actions: decideAutopilotActions(DEMO_GROWTH_OS.signals), demo: true })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "growth.autopilot", user.id), limit: 6, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Autopilot storage is not configured." }, { status: 503 })
  const { data: launch } = await admin.from("viral_launches").select("id").eq("slug", parsed.data.launchSlug).eq("owner_id", user.id).maybeSingle()
  if (!launch) return NextResponse.json({ error: "Launch not found." }, { status: 404 })
  try {
    const result = await runAutopilotForLaunch({ launchId: launch.id, initiatedBy: user.id, trigger: parsed.data.trigger })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Autopilot run failed." }, { status: 500 })
  }
}
