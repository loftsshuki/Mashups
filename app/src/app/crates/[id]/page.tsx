import Link from "next/link"
import { ArrowLeft, Box, Play, Plus, Heart, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCrates, getCrateById, getCrateStemsByCrateId } from "@/lib/data/crates"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const crates = await getCrates()
  return crates.map((c) => ({ id: c.id }))
}

interface CrateDetailProps {
  params: Promise<{ id: string }>
}

const instrumentColors: Record<string, string> = {
  vocal: "bg-pink-500/20 text-pink-400",
  vocals: "bg-pink-500/20 text-pink-400",
  drums: "bg-amber-500/20 text-amber-400",
  bass: "bg-emerald-500/20 text-emerald-400",
  synth: "bg-violet-500/20 text-violet-400",
  guitar: "bg-red-500/20 text-red-400",
  texture: "bg-cyan-500/20 text-cyan-400",
  other: "bg-slate-500/20 text-slate-400",
}

export default async function CrateDetailPage({ params }: CrateDetailProps) {
  const { id } = await params
  const crate = await getCrateById(id)

  if (!crate) {
    notFound()
  }

  const crateStems = await getCrateStemsByCrateId(id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/crates">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Crates
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {crate.title}
            </h1>
            {crate.description && (
              <p className="text-muted-foreground">{crate.description}</p>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Follow
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{crateStems.length} stems</span>
          <span>{crate.follower_count} followers</span>
          {crate.creator && (
            <span>
              by{" "}
              <Link href={`/profile/${crate.creator.username}`} className="text-primary hover:underline">
                @{crate.creator.username}
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Stems list */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Stems in this Crate</h2>
        {crateStems.length > 0 ? (
          crateStems.map((cs) => {
            const stem = cs.stem
            if (!stem) return null
            const colorClass = instrumentColors[stem.instrument ?? "other"] ?? instrumentColors.other

            return (
              <div
                key={cs.stem_id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3"
              >
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors shrink-0">
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{stem.title}</p>
                  {stem.bpm && stem.key && (
                    <p className="text-xs text-muted-foreground">
                      {stem.bpm} BPM · {stem.key}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${colorClass}`}>
                  {stem.instrument ?? "other"}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Music className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No stems in this crate yet.</p>
          </div>
        )}
      </div>

      {/* Contribute */}
      {crate.is_public && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">This crate accepts contributions</p>
          <p className="text-xs text-muted-foreground">Share your stems with the community.</p>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Contribute a Stem
          </Button>
        </div>
      )}
    </div>
  )
}
