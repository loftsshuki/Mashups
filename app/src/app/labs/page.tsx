import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, FlaskConical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { productPillars } from "@/lib/navigation/product-map"

export const metadata: Metadata = { title: "Product Laboratory", description: "The product map for Mashups core workflows and experimental creator tools.", alternates: { canonical: "/labs" } }

export default function LabsPage() {
  const core = productPillars.filter((item) => item.status === "Core")
  const labs = productPillars.filter((item) => item.status === "Lab")
  return <div className="pt-28"><section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8"><div className="grid gap-8 border-b border-foreground pb-9 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">Product laboratory</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">Core loop first.<br /><span className="text-primary">Experiments labeled.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">A clear map of what creators can rely on and what remains under active experimentation.</p><Button className="mt-6" asChild><Link href="/campaigns/new?demo=1">Run the core demo<ArrowUpRight /></Link></Button></div></div><ProductSection title="Core product" description="Surfaces tied directly to track, hook, rights, attribution, and performance." items={core} /><ProductSection title="Labs" description="Promising workflows with narrower use cases or evolving operations." items={labs} /></section></div>
}

function ProductSection({ title, description, items }: { title: string; description: string; items: typeof productPillars[number][] }) {
  return <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-4"><div><p className="mono-label text-muted-foreground">{description}</p><h2 className="display-type mt-3 text-4xl">{title}</h2></div><FlaskConical className="size-6 text-primary" /></div><div className="grid gap-px border-x border-b border-foreground bg-foreground md:grid-cols-2">{items.map((item, index) => <Link key={item.href} href={item.href} className="group flex min-h-32 items-center justify-between gap-5 bg-card p-5 hover:bg-secondary"><span><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><span className="mt-3 block text-xl font-semibold">{item.label}</span></span><span className="flex items-center gap-3"><Badge variant="outline" className="rounded-none">{item.status}</Badge><ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span></Link>)}</div></section>
}
