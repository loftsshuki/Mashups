import { NextResponse } from "next/server"

import { runAutopilotForLaunch } from "@/lib/growth-os/autopilot-service"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Autopilot storage is not configured." }, { status: 503 })
  const { data: launches, error } = await admin.from("viral_launches").select("id").in("phase", ["testing", "mobilizing", "live"]).limit(50)
  if (error) return NextResponse.json({ error: "Unable to load active launches." }, { status: 500 })
  const outcomes = await Promise.allSettled((launches ?? []).map((launch) => runAutopilotForLaunch({ launchId: launch.id, trigger: "schedule" })))
  return NextResponse.json({ ok: true, launches: outcomes.length, completed: outcomes.filter((result) => result.status === "fulfilled").length, failed: outcomes.filter((result) => result.status === "rejected").length })
}
