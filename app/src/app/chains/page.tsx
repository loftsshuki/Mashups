"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Link2, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Chain {
  id: string
  title: string
  description: string
  maxLinks: number
  links: { id: string; creatorName: string; creatorAvatar: string }[]
  status: "active" | "completed"
  createdAt: string
}

export default function ChainsPage() {
  const [chains, setChains] = useState<Chain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch("/api/chains")
        if (!response.ok) return
        const data = (await response.json()) as { chains: Chain[] }
        if (!cancelled) setChains(data.chains)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Link2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Flip Chains
        </h1>
        <p className="mt-2 text-muted-foreground">
          Creative telephone. Each link changes one element. See where it ends up.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-2/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Chain cards */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {chains.map((chain) => (
            <Link
              key={chain.id}
              href={`/chains/${chain.id}`}
              className="group rounded-xl border border-border/70 bg-card/70 p-5 space-y-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {chain.title}
                </h2>
                <Badge variant={chain.status === "active" ? "default" : "outline"}>
                  {chain.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {chain.description}
              </p>

              {/* Contributors */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {chain.links.slice(0, 4).map((link) => (
                      <img
                        key={link.id}
                        src={link.creatorAvatar}
                        alt={link.creatorName}
                        className="h-6 w-6 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {chain.links.length}/{chain.maxLinks} links
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && chains.length === 0 && (
        <div className="text-center py-12">
          <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No active chains yet.</p>
        </div>
      )}
    </div>
  )
}
