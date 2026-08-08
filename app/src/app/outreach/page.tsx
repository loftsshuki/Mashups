import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { OutreachCrm } from "@/components/pilot/outreach-crm"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getOutreachWorkspace } from "@/lib/pilot/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Pilot Outreach", description: "Qualify and move independent electronic rightsholders through the Mashups founding pilot pipeline." }

export default async function OutreachPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/outreach")
  return <OutreachCrm workspace={await getOutreachWorkspace(user?.id ?? null, demo)} demo={demo} />
}
