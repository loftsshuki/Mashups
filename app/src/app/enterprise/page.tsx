import { Building2, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Enterprise</h1>
      <p className="mt-2 text-muted-foreground">
        White-label rights-safe soundtrack workflow for agencies and creator networks.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <Building2 className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">White-Label Studio</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Custom branding, custom domains, and team access controls.
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Attribution Analytics</p>
          <p className="mt-1 text-xs text-muted-foreground">
            End-to-end off-platform tracking from clip to conversion.
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <Shield className="h-5 w-5 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Compliance Logs</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Policy events, claims, and moderation actions exportable for audit.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button>Request Demo</Button>
      </div>
    </div>
  )
}
