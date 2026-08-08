"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { FlaskConical, X } from "lucide-react"

import { isDemoExperience } from "@/lib/demo/runtime"

export function DemoBanner() {
  const searchParams = useSearchParams()
  if (!isDemoExperience(searchParams.get("demo"))) return null

  return (
    <div className="fixed inset-x-0 top-[68px] z-40 border-b border-foreground bg-secondary text-secondary-foreground">
      <div className="mx-auto flex min-h-10 max-w-[1440px] items-center justify-between gap-4 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] sm:px-6 lg:px-8">
        <span className="flex items-center gap-2"><FlaskConical className="size-4" /> Demo data is labeled and never written to production.</span>
        <Link href="/" aria-label="Exit demo mode" className="grid size-8 place-items-center border border-foreground hover:bg-foreground hover:text-background"><X className="size-4" /></Link>
      </div>
    </div>
  )
}
