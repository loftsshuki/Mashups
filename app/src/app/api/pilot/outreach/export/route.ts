import { NextResponse } from "next/server"

import { isDemoRequest } from "@/lib/demo/runtime"
import { prospectsToCsv } from "@/lib/pilot/csv"
import { getOutreachWorkspace } from "@/lib/pilot/service"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const demo = isDemoRequest(request)
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!demo && !user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 })
  const csv = prospectsToCsv((await getOutreachWorkspace(user?.id ?? null, demo)).prospects)
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=mashups-outreach-pipeline.csv", "Cache-Control": "no-store" } })
}
