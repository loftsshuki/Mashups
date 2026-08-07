import { NextResponse } from "next/server"

import { isDemoRequest } from "@/lib/demo/runtime"
import { getReadinessSnapshot } from "@/lib/pilot/service"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const demo = isDemoRequest(request)
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json(await getReadinessSnapshot(user?.id ?? null, demo), { headers: { "Cache-Control": "no-store" } })
}
