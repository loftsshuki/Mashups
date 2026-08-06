import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, CheckCircle2, RefreshCcw, ServerCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getRuntimeCapabilities } from "@/lib/config/runtime"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Integration Health", robots: { index: false, follow: false } }

async function databaseStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return "unconfigured"
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, { cache: "no-store", signal: AbortSignal.timeout(3500) })
    return response.ok ? "healthy" : "unreachable"
  } catch { return "unreachable" }
}

export default async function OperationsPage() {
  const capabilities = getRuntimeCapabilities()
  const database = await databaseStatus()
  const rows = Object.entries(capabilities).map(([key, value]) => ({ key, ...value, status: key === "database" ? database : value.configured ? "configured" : "unconfigured" }))
  const blocked = rows.filter((row) => row.required && !["healthy", "configured"].includes(row.status))
  return <div className="pt-28"><section className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 lg:px-8"><div className="grid gap-7 border-b border-foreground pb-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="signal-label">Operations / Sanitized status</p><h1 className="display-type mt-5 text-5xl leading-[0.86] sm:text-7xl">Know what can ship.</h1><p className="mt-4 max-w-2xl text-muted-foreground">This page reports configuration state only. It never exposes credentials, tokens, or provider responses.</p></div><Badge variant={blocked.length ? "destructive" : "secondary"} className="rounded-none px-4 py-2">{blocked.length ? `${blocked.length} production blockers` : "All required systems ready"}</Badge></div><div className="mt-7 border border-foreground bg-card">{rows.map((row) => { const ready = ["healthy", "configured"].includes(row.status); return <div key={row.key} className="grid gap-4 border-b border-foreground p-5 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className={`grid size-10 place-items-center border border-foreground ${ready ? "bg-secondary" : row.required ? "bg-destructive text-white" : "bg-muted"}`}>{ready ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}</span><div><h2 className="font-semibold">{row.label}</h2><p className="mt-1 text-sm text-muted-foreground">{row.required ? "Required for the core production loop" : "Optional integration"}</p></div><span className="font-mono text-xs uppercase tracking-wider">{row.status}</span></div> })}</div><div className="mt-7 flex flex-wrap gap-3"><Button asChild><Link href="/admin/ops"><RefreshCcw />Refresh</Link></Button><Button variant="outline" asChild><Link href="/api/health">Raw health response<ArrowUpRight /></Link></Button><Button variant="outline" asChild><Link href="/campaigns/new?demo=1"><ServerCog />Run demo flow</Link></Button></div></section></div>
}
