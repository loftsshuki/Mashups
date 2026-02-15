"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Link2, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChainTimeline } from "@/components/chains/chain-timeline"

interface ChainLink {
  id: string
  position: number
  creatorName: string
  creatorAvatar: string
  mashupId: string
  audioUrl: string
  changedElement: string
  createdAt: string
}

interface Chain {
  id: string
  title: string
  description: string
  maxLinks: number
  links: ChainLink[]
  status: "active" | "completed"
  createdAt: string
}

export default function ChainDetailPage() {
  const params = useParams()
  const chainId = params.id as string
  const [chain, setChain] = useState<Chain | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/chains?id=${encodeURIComponent(chainId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { chain: Chain | null }
        if (!cancelled) setChain(data.chain)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [chainId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading chain...</p>
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <Link2 className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Chain Not Found</h1>
      </div>
    )
  }

  const isActive = chain.status === "active"
  const hasRoom = chain.links.length < chain.maxLinks
  const lastLink = chain.links[chain.links.length - 1]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/chains">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Chains
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {chain.title}
          </h1>
          <Badge variant={isActive ? "default" : "outline"}>
            {chain.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">{chain.description}</p>
        <p className="text-xs text-muted-foreground">
          {chain.links.length}/{chain.maxLinks} links · Started {new Date(chain.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4">Chain Progress</h2>
        <ChainTimeline links={chain.links} maxLinks={chain.maxLinks} />
      </div>

      {/* Add Link CTA */}
      {isActive && hasRoom && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Add Your Link</h2>
          <p className="text-sm text-muted-foreground">
            {lastLink
              ? `@${lastLink.creatorName} ${lastLink.changedElement}. What will you change next?`
              : "Be the first to start this chain!"}
          </p>
          <Link href={`/create?chain=${chain.id}${lastLink ? `&fork=${lastLink.mashupId}` : ""}`}>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Link #{chain.links.length + 1}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Completed message */}
      {chain.status === "completed" && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center">
          <p className="text-lg font-semibold text-foreground">Chain Complete!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {chain.links.length} creators transformed this piece through creative telephone.
          </p>
        </div>
      )}
    </div>
  )
}
