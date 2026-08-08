import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to upload a master." }, { status: 401 })
  return NextResponse.json({ prefix: `green-room/${user.id}/masters/` })
}
