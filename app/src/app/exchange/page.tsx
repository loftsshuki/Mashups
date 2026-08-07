import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PreReleaseExchange } from "@/components/growth-os/pre-release-exchange"
import { isSupabaseConfigured } from "@/lib/config/runtime"
import { isDemoQuery } from "@/lib/demo/runtime"
import { getExchangeRooms } from "@/lib/growth-os/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Pre-Release Exchange", description: "Invitation-only listening, creator fit, and reputation-weighted breakout calls before release.", alternates: { canonical: "/exchange" } }

export default async function ExchangePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!demo && isSupabaseConfigured() && !user) redirect("/login?next=/exchange")
  return <PreReleaseExchange rooms={await getExchangeRooms(user?.id ?? null, demo)} demo={demo} />
}
