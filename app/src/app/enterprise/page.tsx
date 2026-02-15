import Link from "next/link"
import { ArrowRight, BarChart3, Building2, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"

const enterpriseBlocks = [
  {
    icon: Building2,
    title: "White-Label Studio",
    detail: "Custom branding, custom domains, and team access controls.",
  },
  {
    icon: BarChart3,
    title: "Attribution Analytics",
    detail: "End-to-end off-platform tracking from clip to conversion.",
  },
  {
    icon: Shield,
    title: "Compliance Logs",
    detail: "Policy events, claims, and moderation actions exportable for audit.",
  },
] as const

export default function EnterprisePage() {
  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Enterprise"
        title="Rights-safe soundtrack workflows for agencies and networks."
        description="A Neon-style enterprise narrative re-mapped to Mashups: controlled distribution, attribution telemetry, and compliance certainty."
        actions={
          <Button className="rounded-full" asChild>
            <Link href="/partner">
              Request Demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
        aside={
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Pilot Timeline
            </p>
            <p className="mt-2 text-3xl font-semibold">2 weeks</p>
            <p className="mt-1 text-sm text-muted-foreground">
              From kickoff to first creator cohort launch.
            </p>
          </>
        }
      />

      <NeonSectionHeader
        title="Enterprise Capabilities"
        description="Feature blocks align with the same section grammar as homepage and pricing."
      />
      <NeonGrid className="md:grid-cols-3">
        {enterpriseBlocks.map((block) => (
          <div key={block.title} className="rounded-2xl p-5">
            <block.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-base font-semibold text-foreground">{block.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{block.detail}</p>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}

