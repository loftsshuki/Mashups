import { Library, ShieldCheck, Workflow } from "lucide-react"

import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"

const policies = ["Allow", "Block", "Monetize", "Track"] as const

const partnerBlocks = [
  {
    icon: Library,
    title: "Catalog Ingestion",
    detail: "Upload reference tracks/stems and map ownership metadata.",
  },
  {
    icon: ShieldCheck,
    title: "Policy Controls",
    detail: "Apply rights policy at asset, creator tier, and territory level.",
  },
  {
    icon: Workflow,
    title: "Claims Pipeline",
    detail: "Review matches, auto-apply actions, and audit enforcement history.",
  },
] as const

export default function PartnerPortalPage() {
  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Partner Portal"
        title="Rightsholder controls with creator-native distribution."
        description="Section parity with the Neon-style site while preserving Mashups partner workflows for policy and enforcement."
        aside={
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Policy Modes
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {policies.map((policy) => (
                <span
                  key={policy}
                  className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {policy}
                </span>
              ))}
            </div>
          </>
        }
      />

      <NeonSectionHeader
        title="Rights Operations"
        description="Mapped to the same feature-block cadence used on the homepage."
      />
      <NeonGrid className="md:grid-cols-3">
        {partnerBlocks.map((block) => (
          <div key={block.title} className="neon-panel rounded-2xl p-5">
            <block.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-base font-semibold text-foreground">{block.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{block.detail}</p>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}

