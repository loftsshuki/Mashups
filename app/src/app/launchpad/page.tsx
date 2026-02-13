import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const modules = [
  { href: "/studio", title: "Collab Studio", status: "Live", desc: "Realtime presence + shared transport state." },
  { href: "/campaigns", title: "Campaign Builder", status: "Live", desc: "Weekly short-form plan with hooks/captions." },
  { href: "/dashboard/analytics", title: "Creator Analytics", status: "Live", desc: "Retention and engagement snapshot." },
  { href: "/dashboard/monetization", title: "Monetization", status: "Live", desc: "Ledger, payouts, and checkout flow." },
  { href: "/dashboard/rights", title: "Rights Ops", status: "Live", desc: "Declarations and claim workflow." },
  { href: "/admin/moderation", title: "Moderation Console", status: "Beta", desc: "Admin claim actions and strikes." },
  { href: "/pricing", title: "Subscription Plans", status: "Live", desc: "Creator and Studio monetization plans." },
  { href: "/partner", title: "Partner Portal", status: "Beta", desc: "Catalog and policy controls for rightsholders." },
  { href: "/enterprise", title: "Enterprise Lane", status: "Beta", desc: "White-label offering for agencies/networks." },
  { href: "/sponsors", title: "Sponsor Programs", status: "Live", desc: "Challenge sponsorship package surfaces." },
  { href: "/legal", title: "Legal Center", status: "Live", desc: "Terms, copyright, and repeat infringer policies." },
] as const

export default function LaunchpadPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Launchpad</h1>
      <p className="mt-2 text-muted-foreground">
        Command center for all creator OS, rights, growth, and monetization modules.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="neon-surface rounded-lg p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{module.title}</h2>
              <Badge variant={module.status === "Live" ? "default" : "secondary"}>
                {module.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{module.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
