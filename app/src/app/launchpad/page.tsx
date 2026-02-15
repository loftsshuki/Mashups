import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"

const modules = [
  {
    href: "/studio",
    title: "Collab Studio",
    status: "Live",
    desc: "Realtime presence + shared transport state.",
  },
  {
    href: "/studio",
    title: "Studio Versioning",
    status: "Live",
    desc: "Timeline markers, notes, and restore snapshots.",
  },
  {
    href: "/campaigns",
    title: "Campaign Builder",
    status: "Live",
    desc: "Weekly short-form plan with hooks/captions.",
  },
  {
    href: "/packs",
    title: "Weekly Viral Pack",
    status: "Live",
    desc: "20 rights-safe hook-ready clips dropped every Monday.",
  },
  {
    href: "/mashup/mash-001",
    title: "15s Hook Generator",
    status: "Live",
    desc: "One-click hook cuts with caption and signed export links.",
  },
  {
    href: "/campaigns#cohort-invites",
    title: "Creator Cohort Invites",
    status: "Live",
    desc: "Referral links and cohort-tier invite mechanics.",
  },
  {
    href: "/explore?rights=safe",
    title: "Rights-Safe Discovery",
    status: "Live",
    desc: "Filter feed to allow-routed tracks only.",
  },
  {
    href: "/dashboard/analytics",
    title: "Creator Analytics",
    status: "Live",
    desc: "Retention and engagement snapshot.",
  },
  {
    href: "/dashboard/monetization",
    title: "Monetization",
    status: "Live",
    desc: "Ledger, payouts, and checkout flow.",
  },
  {
    href: "/dashboard/rights",
    title: "Rights Ops",
    status: "Live",
    desc: "Declarations and claim workflow.",
  },
  {
    href: "/mashup/mash-001",
    title: "Rights Automation",
    status: "Live",
    desc: "Fingerprint confidence with auto route recommendations.",
  },
  {
    href: "/scoreboard",
    title: "Creator Scoreboard",
    status: "Live",
    desc: "Public leaderboard ranked by weekly growth.",
  },
  {
    href: "/challenges",
    title: "Challenge Engine",
    status: "Live",
    desc: "High-frequency themed challenges with sponsor and cash prizes.",
  },
  {
    href: "/momentum",
    title: "Momentum Feed",
    status: "Live",
    desc: "Rising tracks first with quality-gated sponsor slots.",
  },
  {
    href: "/admin/moderation",
    title: "Moderation Console",
    status: "Beta",
    desc: "Admin claim actions and strikes.",
  },
  {
    href: "/pricing",
    title: "Subscription Plans",
    status: "Live",
    desc: "Creator and studio monetization plans.",
  },
  {
    href: "/partner",
    title: "Partner Portal",
    status: "Beta",
    desc: "Catalog and policy controls for rightsholders.",
  },
  {
    href: "/enterprise",
    title: "Enterprise Lane",
    status: "Beta",
    desc: "White-label offering for agencies/networks.",
  },
  {
    href: "/sponsors",
    title: "Sponsor Programs",
    status: "Live",
    desc: "Challenge sponsorship package surfaces.",
  },
  {
    href: "/legal",
    title: "Legal Center",
    status: "Live",
    desc: "Terms, copyright, and repeat infringer policies.",
  },
] as const

export default function LaunchpadPage() {
  return (
    <NeonPage>
      <NeonHero
        eyebrow="Control Plane"
        title="Launchpad"
        description="Command center for creator OS, rights, growth, and monetization modules."
        actions={
          <Button className="rounded-full" asChild>
            <Link href="/create">
              Start a New Mashup
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
        aside={
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Live Modules
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {modules.filter((m) => m.status === "Live").length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Active feature blocks across growth, rights, and publishing.
            </p>
          </>
        }
      />

      <NeonSectionHeader
        title="Modules"
        description="Each section mirrors the product architecture used on the new homepage."
      />
      <NeonGrid className="md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={`${module.href}-${module.title}`}
            href={module.href}
            className="rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-primary/45"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground">{module.title}</h2>
              <Badge variant={module.status === "Live" ? "default" : "secondary"}>
                {module.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{module.desc}</p>
            <p className="mt-4 inline-flex items-center text-xs font-medium text-primary">
              Open module
            </p>
          </Link>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}
