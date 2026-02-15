import Link from "next/link"
import { ArrowLeft, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RemixGraph } from "@/components/discovery/remix-graph"

interface GraphPageProps {
  params: Promise<{ id: string }>
}

export default async function GraphPage({ params }: GraphPageProps) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/mashup/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mashup
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Remix Graph
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore how stems connect mashups across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Graph */}
      <RemixGraph mashupId={id} />

      {/* Info */}
      <div className="mt-6 rounded-xl border border-border/50 bg-card/50 p-4 text-xs text-muted-foreground space-y-1">
        <p>Drag nodes to rearrange. Scroll to zoom. Click mashup nodes to navigate.</p>
        <p>Larger circles are mashups. Smaller circles are stems, colored by instrument type.</p>
      </div>
    </div>
  )
}
