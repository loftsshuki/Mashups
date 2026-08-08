import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LaunchCommandCenter } from "@/components/viral/launch-command-center"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { createClient } from "@/lib/supabase/server"
import { getViralLaunches } from "@/lib/viral/service"

export const metadata: Metadata = { title: "Viral Command", description: "Test creative structures, coordinate creator waves, and turn winning formats into measurable music growth.", alternates: { canonical: "/launches" } }

export default async function LaunchesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/launches")
  const launches = await getViralLaunches({ userId: user?.id, demo })
  return <LaunchCommandCenter launches={launches} demo={demo} />
}
