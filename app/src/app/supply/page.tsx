import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SupplyPortal } from "@/components/growth-os/supply-portal"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getSupplyTracks } from "@/lib/growth-os/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Rightsholder Supply", description: "Submit campaign-ready music with rights, territories, permitted uses, and release windows attached.", alternates: { canonical: "/supply" } }

export default async function SupplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/supply")
  const tracks = await getSupplyTracks(user?.id ?? null, demo)
  return <SupplyPortal tracks={tracks} demo={demo} />
}
