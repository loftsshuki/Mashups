import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LaunchRoom } from "@/components/viral/launch-room"
import { isDemoQuery } from "@/lib/demo/runtime"
import { DEMO_VIRAL_LAUNCHES } from "@/lib/viral/demo"
import { getViralLaunchBySlug } from "@/lib/viral/service"

export function generateStaticParams() { return DEMO_VIRAL_LAUNCHES.map((launch) => ({ slug: launch.slug })) }

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const launch = await getViralLaunchBySlug(slug, demo)
  if (!launch) return { title: "Launch not found" }
  return { title: `${launch.trackTitle} Open Launch`, description: launch.objective, alternates: { canonical: `/launches/${slug}` } }
}

export default async function ViralLaunchPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const launch = await getViralLaunchBySlug(slug, demo)
  if (!launch) notFound()
  return <LaunchRoom launch={launch} demo={demo} />
}
