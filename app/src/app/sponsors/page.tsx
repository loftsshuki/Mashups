import { Coins, Megaphone, Trophy } from "lucide-react"

import {
  NeonGrid,
  NeonHero,
  NeonPage,
  NeonSectionHeader,
} from "@/components/marketing/neon-page"

const packages = [
  {
    name: "Starter Challenge",
    price: "$2,500",
    includes: "1 sponsored challenge + homepage placement",
    icon: Megaphone,
  },
  {
    name: "Growth Sprint",
    price: "$8,000",
    includes: "4-week creator campaign + attribution reporting",
    icon: Trophy,
  },
  {
    name: "Network Takeover",
    price: "$20,000",
    includes: "Featured category + creator cohort activation",
    icon: Coins,
  },
] as const

export default function SponsorsPage() {
  return (
    <NeonPage className="max-w-6xl">
      <NeonHero
        eyebrow="Sponsorships"
        title="Challenge sponsorship and branded creator activations."
        description="Neon-style commercial section mapped to mashup-native promotion packages."
      />

      <NeonSectionHeader
        title="Program Packages"
        description="Structured like a Neon pricing/features row for easy comparison."
      />
      <NeonGrid className="md:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.name} className="rounded-2xl p-5">
            <pkg.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-base font-semibold text-foreground">{pkg.name}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{pkg.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pkg.includes}</p>
          </div>
        ))}
      </NeonGrid>
    </NeonPage>
  )
}

