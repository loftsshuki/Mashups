import { NextResponse } from "next/server"

import { getRuntimeCapabilities } from "@/lib/config/runtime"
import { checkSupabaseHealth } from "@/lib/config/service-health"
import { logServerEvent } from "@/lib/observability/logger"

export const dynamic = "force-dynamic"

export async function GET() {
  const capabilities = getRuntimeCapabilities()
  const { auth, database } = await checkSupabaseHealth(process.env)
  const healthy = auth === "healthy" && database === "healthy" && capabilities.ai.configured && capabilities.storage.configured

  logServerEvent(healthy ? "info" : "warn", "health_check", { healthy, auth, database })

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checkedAt: new Date().toISOString(),
      services: {
        auth,
        database,
        ai: capabilities.ai.configured ? "configured" : "unconfigured",
        storage: capabilities.storage.configured ? "configured" : "unconfigured",
        billing: capabilities.billing.configured ? "configured" : "unconfigured",
        separation: capabilities.separation.configured ? "configured" : "unconfigured",
        analytics: capabilities.analytics.configured ? "configured" : "unconfigured",
        cron: capabilities.cron.configured ? "configured" : "unconfigured",
      },
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  )
}
