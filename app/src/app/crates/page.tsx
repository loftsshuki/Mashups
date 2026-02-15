import { Box } from "lucide-react"
import { getCrates } from "@/lib/data/crates"
import { CrateCard } from "@/components/crates/crate-card"

export default async function CratesPage() {
  const crates = await getCrates()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Box className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Stem Crates
        </h1>
        <p className="mt-2 text-muted-foreground">
          Curated stem collections by the community. Follow, contribute, create.
        </p>
      </div>

      {/* Crates grid */}
      {crates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crates.map((crate) => (
            <CrateCard key={crate.id} crate={crate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Box className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No crates yet. Be the first to create one!</p>
        </div>
      )}
    </div>
  )
}
