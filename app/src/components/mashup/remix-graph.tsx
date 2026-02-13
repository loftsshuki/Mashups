import Link from "next/link"
import type { MockMashup } from "@/lib/mock-data"
import { GitBranch, ArrowRight } from "lucide-react"

interface RemixGraphProps {
  lineage: MockMashup[]
  forks: MockMashup[]
}

export function RemixGraph({ lineage, forks }: RemixGraphProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Remix Graph</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {lineage.map((node, i) => (
          <span key={node.id} className="inline-flex items-center gap-2">
            <Link
              href={`/mashup/${node.id}`}
              className="rounded-md bg-muted px-2 py-1 text-foreground hover:bg-primary/10"
            >
              {node.title}
            </Link>
            {i < lineage.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </span>
        ))}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Forks from this mashup</p>
        {forks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {forks.map((child) => (
              <Link
                key={child.id}
                href={`/mashup/${child.id}`}
                className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
              >
                {child.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">No forks yet.</p>
        )}
      </div>
    </div>
  )
}
