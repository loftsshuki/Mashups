"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startCheckout } from "@/lib/data/billing"
import { useRouter } from "next/navigation"

const tiers = [
  {
    name: "Free",
    price: "$0",
    features: ["Basic publishing", "Public profile", "Community feed access"],
  },
  {
    name: "Pro Creator",
    price: "$12/mo",
    features: ["Advanced mixer tools", "Creator analytics", "Priority discovery slots"],
  },
  {
    name: "Pro Studio",
    price: "$29/mo",
    features: ["Live collaboration rooms", "Team seats", "Priority support"],
  },
]

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
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Monetization-ready tiers. Stripe integration can be connected with env keys.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="rounded-lg border border-border/50 bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">{tier.name}</h2>
            <p className="mt-1 text-2xl font-bold text-foreground">{tier.price}</p>
            <ul className="mt-4 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-5 w-full"
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
      </div>
    </div>
  )
}
