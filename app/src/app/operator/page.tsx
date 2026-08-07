import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { OperatorConsole } from "@/components/pilot/operator-console"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getPilotWorkspace } from "@/lib/pilot/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Pilot Operator", description: "Configure guarantees, rights, measurement, economics, and protection for a Mashups pilot." }

export default async function OperatorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/operator")
  return <OperatorConsole workspace={await getPilotWorkspace(user?.id ?? null, demo)} demo={demo} />
}
