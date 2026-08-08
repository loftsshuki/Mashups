import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ClubDrop } from "@/components/growth-os/club-drop"
import { isDemoQuery } from "@/lib/demo/runtime"
import { DEMO_GROWTH_OS } from "@/lib/growth-os/demo"
import { getClubActivation } from "@/lib/growth-os/service"

export function generateStaticParams() { return [{ code: DEMO_GROWTH_OS.club.code.toLowerCase() }] }
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> { const { code } = await params; return { title: `${code.toUpperCase()} Venue Drop`, description: "Save the room’s track, join the city cell, and unlock the official edit.", robots: { index: false, follow: false } } }

export default async function ClubPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ code }, query] = await Promise.all([params, searchParams])
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const activation = await getClubActivation(code, demo)
  if (!activation) notFound()
  return <ClubDrop activation={activation} demo={demo} />
}
