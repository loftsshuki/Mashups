import { ShieldCheck, Library, Workflow } from "lucide-react"

const policies = [
  "Allow",
  "Block",
  "Monetize",
  "Track",
]

export default function PartnerPortalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Partner Portal</h1>
      <p className="mt-2 text-muted-foreground">
        Rightsholder workspace for catalog upload and policy controls.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <Library className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Catalog Ingestion</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload reference tracks/stems and map ownership metadata.
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Policy Controls</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Apply rights policy at asset, creator tier, and territory level.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {policies.map((policy) => (
              <span key={policy} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {policy}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <Workflow className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Claims Pipeline</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Review matches, auto-apply actions, and audit enforcement history.
          </p>
        </div>
      </div>
    </div>
  )
}
