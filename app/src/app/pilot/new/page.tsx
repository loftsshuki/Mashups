import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PilotIntake } from "@/components/pilot/pilot-intake"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getPilotWorkspace } from "@/lib/pilot/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Founding Pilot Intake",
  description: "Qualify an independent electronic release for a rights-bound Mashups creator pilot.",
  alternates: { canonical: "/pilot/new" },
}

export default async function PilotIntakePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/pilot/new")
  return <PilotIntake workspace={await getPilotWorkspace(user?.id ?? null, demo)} demo={demo} />
}
