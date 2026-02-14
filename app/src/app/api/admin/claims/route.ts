import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminUser } from "@/lib/auth/admin"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser({ email: user?.email, id: user?.id })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client unavailable. Configure SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 },
    )
  }

  const { data, error } = await adminClient
    .from("claims")
    .select("*, mashup:mashups!mashup_id(id,title,creator_id)")
    .order("submitted_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ claims: data ?? [] })
}
