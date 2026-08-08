import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, Music2, Save, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isDemoQuery } from "@/lib/demo/runtime"
import { DEMO_VIRAL_LAUNCH } from "@/lib/viral/demo"
import { getViralLaunchBySlug } from "@/lib/viral/service"

export const metadata: Metadata = { title: "Launch Embed", robots: { index: false, follow: true } }
export function generateStaticParams() { return [{ slug: DEMO_VIRAL_LAUNCH.slug }] }

export default async function LaunchEmbedPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const demo = isDemoQuery(typeof query.demo === "string" ? query.demo : null)
  const launch = await getViralLaunchBySlug(slug, demo)
  if (!launch) notFound()
  const genome = launch.genomes[0]
  return <div className="min-h-screen bg-secondary p-3 text-foreground"><article className="relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-foreground bg-card p-5 shadow-[5px_5px_0_var(--foreground)]"><Music2 className="absolute -right-8 -top-8 size-40 text-primary opacity-15" /><div className="relative"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em]">Mashups / live launch</span><Sparkles className="size-4 text-primary" /></div><h1 className="display-type mt-8 text-4xl leading-[0.85]">{launch.trackTitle}</h1><p className="mt-2 font-mono text-xs text-muted-foreground">{launch.artistName} / {genome?.name}</p></div><div className="relative mt-8"><div className="mb-4 flex items-center justify-between border-y border-foreground py-3 font-mono text-[10px] uppercase tracking-wider"><span>{launch.qualifiedPosts} creator posts</span><span>{launch.totalSaves.toLocaleString()} saves</span></div><div className="grid grid-cols-2 gap-2"><Button asChild><Link href={`/launches/${launch.slug}${demo ? "?demo=1" : ""}`} target="_blank">Fork it<ArrowUpRight /></Link></Button><Button variant="outline" asChild><Link href={`/launches/${launch.slug}${demo ? "?demo=1" : ""}`} target="_blank"><Save />Save</Link></Button></div></div></article></div>
}
