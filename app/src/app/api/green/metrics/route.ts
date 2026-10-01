import { NextResponse } from "next/server"

import { isAdminUser } from "@/lib/auth/admin"
import { getGreenPilotMetrics } from "@/lib/green-room/service"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser({ email: user?.email, id: user?.id })) return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  const metrics = await getGreenPilotMetrics()
  return NextResponse.json(metrics, { status: metrics.available ? 200 : 503 })
}
