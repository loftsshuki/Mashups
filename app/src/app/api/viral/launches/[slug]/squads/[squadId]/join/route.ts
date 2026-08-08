import { NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoRequest } from "@/lib/demo/runtime"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ slug: string; squadId: string }> }) {
  const { slug, squadId } = await params
  const demo = isDemoRequest(request)
  if (demo) return NextResponse.json({ ok: true, squadId, demo: true }, { status: 201 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isSupabaseConfigured() || !user) return NextResponse.json({ error: "Sign in to join this squad.", next: `/launches/${slug}` }, { status: 401 })
  const rate = await consumeRateLimit({ key: resolveRateLimitKey(request, "viral.squad.join", user?.id), limit: 8, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Squad storage is not configured." }, { status: 503 })
  const { data: squad } = await admin.from("viral_squads").select("id,launch_id,max_members,viral_launches!inner(slug,is_public)").eq("id", squadId).eq("viral_launches.slug", slug).eq("viral_launches.is_public", true).maybeSingle()
  if (!squad) return NextResponse.json({ error: "Squad not found." }, { status: 404 })
  const { data: joinStatus, error } = await admin.rpc("join_viral_squad", { p_squad_id: squadId, p_creator_id: user!.id })
  if (error) return NextResponse.json({ error: "Unable to join squad." }, { status: 500 })
  if (joinStatus === "full") return NextResponse.json({ error: "This squad is full." }, { status: 409 })
  if (joinStatus === "joined") await admin.rpc("record_viral_event", { p_launch_id: squad.launch_id, p_event_type: "squad_join", p_creator_id: user!.id, p_metadata: { squadId } })
  return NextResponse.json({ ok: true, squadId }, { status: 201 })
}
