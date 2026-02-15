import { Zap } from "lucide-react"
import { getPlatformChallenges } from "@/lib/data/platform-challenges"
import { CollisionCard } from "@/components/collisions/collision-card"

export default async function CollisionsPage() {
  const allChallenges = await getPlatformChallenges()
  const collisions = allChallenges.filter((c) => c.type === "collision")
  const active = collisions.filter((c) => c.status === "active")
  const past = collisions.filter((c) => c.status !== "active")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10">
          <Zap className="h-8 w-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Genre Collisions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Monthly events: mash two incompatible genres together. Chaos breeds creativity.
        </p>
      </div>

      {/* Active collisions */}
      {active.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            This Month
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((c) => (
              <CollisionCard key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      )}

      {/* Past collisions */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Past Collisions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((c) => (
              <CollisionCard key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {collisions.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No collisions yet. The first one is coming soon!</p>
        </div>
      )}
    </div>
  )
}
