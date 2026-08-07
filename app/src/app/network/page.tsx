import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { GrowthOsCommand } from "@/components/growth-os/growth-os-command"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getGrowthOsSnapshot } from "@/lib/growth-os/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Growth OS",
  description: "Autonomous creator allocation, rights supply, payouts, city cells, and measurable music growth.",
  alternates: { canonical: "/network" },
}

export default async function GrowthOsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/network")
  return <GrowthOsCommand snapshot={await getGrowthOsSnapshot(user?.id ?? null, demo)} demo={demo} />
}
