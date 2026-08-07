import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DominationCommand } from "@/components/domination/domination-command"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getDominationSnapshot } from "@/lib/domination/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Domination OS", description: "Commercial guarantees, causal campaign proof, rights inventory, trust, A&R intelligence, and launch protection.", alternates: { canonical: "/domination" } }

export default async function DominationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/domination")
  return <DominationCommand snapshot={await getDominationSnapshot(user?.id ?? null, demo)} demo={demo} />
}
