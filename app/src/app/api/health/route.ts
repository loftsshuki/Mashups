import { NextResponse } from "next/server"

import { getRuntimeCapabilities } from "@/lib/config/runtime"
import { checkSupabaseHealth } from "@/lib/config/service-health"
import { logServerEvent } from "@/lib/observability/logger"

export const dynamic = "force-dynamic"

export async function GET() {
  const capabilities = getRuntimeCapabilities()
  const { auth, database } = await checkSupabaseHealth(process.env)
  const missingRequired = Object.entries(capabilities)
    .filter(([, capability]) => capability.required && !capability.configured)
    .map(([key]) => key)
  const healthy = auth === "healthy" && database === "healthy" && missingRequired.length === 0

  logServerEvent(healthy ? "info" : "warn", "health_check", {
    healthy,
    auth,
    database,
    missingRequired,
  })

  const capabilityState = (key: string) =>
    capabilities[key]?.configured ? "configured" : "unconfigured"

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checkedAt: new Date().toISOString(),
      services: {
        auth,
        database,
        ai: capabilityState("ai"),
        storage: capabilityState("storage"),
        greenStorage: capabilityState("greenStorage"),
        greenProcessing: capabilityState("greenProcessing"),
        billing: capabilityState("billing"),
        separation: capabilityState("separation"),
        analytics: capabilityState("analytics"),
        cron: capabilityState("cron"),
      },
      missingRequired,
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  )
}
