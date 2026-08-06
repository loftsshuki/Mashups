import { NextResponse } from "next/server"

import { getRuntimeCapabilities } from "@/lib/config/runtime"
import { logServerEvent } from "@/lib/observability/logger"

export const dynamic = "force-dynamic"

async function checkSupabase(): Promise<"healthy" | "unreachable" | "unconfigured"> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return "unconfigured"

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    })
    return response.ok ? "healthy" : "unreachable"
  } catch {
    return "unreachable"
  }
}

export async function GET() {
  const capabilities = getRuntimeCapabilities()
  const database = await checkSupabase()
  const healthy = database === "healthy" && capabilities.ai.configured && capabilities.storage.configured

  logServerEvent(healthy ? "info" : "warn", "health_check", { healthy, database })

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checkedAt: new Date().toISOString(),
      services: {
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
