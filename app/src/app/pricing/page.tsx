"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { startCheckout } from "@/lib/data/billing"
import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"

const tiers = [
  {
    name: "Free",
    price: "$0",
    blurb: "For early creators validating concepts.",
    features: ["Basic publishing", "Public profile", "Community feed access"],
  },
  {
    name: "Pro Creator",
    price: "$12/mo",
    blurb: "For creators pushing weekly campaigns.",
    features: [
      "Advanced mixer tools",
      "Creator analytics",
      "Priority discovery slots",
    ],
  },
  {
    name: "Pro Studio",
    price: "$29/mo",
    blurb: "For teams with collaboration and rights workflows.",
    features: ["Live collaboration rooms", "Team seats", "Priority support"],
  },
] as const

export default function PricingPage() {
  const router = useRouter()
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)

  async function handleCheckout(plan: string) {
    setPendingPlan(plan)
    const result = await startCheckout("subscription", plan)
    setPendingPlan(null)
    if (result.checkoutUrl) {
      router.push(result.checkoutUrl)
    }
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Pricing"
        title="Plans for creators, studios, and networks."
        description="Neon-style pricing structure adapted for mashup growth, rights safety, and monetization."
        actions={
          <>
            <Button className="rounded-full" asChild>
              <Link href="/signup">
                Start Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary/30 bg-transparent"
              asChild
            >
              <Link href="/enterprise">Talk Enterprise</Link>
            </Button>
          </>
        }
        aside={
          <>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Conversion Goal
            </p>
            <p className="mt-2 text-3xl font-semibold">Free → Pro in 14 days</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Onboard creators fast, then unlock monetization and analytics.
            </p>
          </>
        }
      />

      <NeonSectionHeader
        title="Plan Matrix"
        description="Tier cards keep the same section rhythm as home."
      />
      <NeonGrid className="md:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="neon-panel rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {tier.name}
            </p>
            <p className="mt-2 text-3xl font-semibold">{tier.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>
            <ul className="mt-5 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full rounded-full"
              variant={tier.name === "Free" ? "outline" : "default"}
              disabled={tier.name === "Free" || pendingPlan === tier.name}
              onClick={() => handleCheckout(tier.name)}
            >
              {tier.name === "Free"
                ? "Current Plan"
                : pendingPlan === tier.name
                  ? "Redirecting..."
                  : "Choose Plan"}
            </Button>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}

