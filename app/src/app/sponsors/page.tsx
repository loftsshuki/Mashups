import { Megaphone, Trophy, Coins } from "lucide-react"

const packages = [
  { name: "Starter Challenge", price: "$2,500", includes: "1 sponsored challenge + homepage placement" },
  { name: "Growth Sprint", price: "$8,000", includes: "4-week creator campaign + attribution reporting" },
  { name: "Network Takeover", price: "$20,000", includes: "Featured category + creator cohort activation" },
]

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Sponsor Programs</h1>
      <p className="mt-2 text-muted-foreground">
        Challenge sponsorship and branded creator activations.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {packages.map((pkg, i) => (
          <div key={pkg.name} className="rounded-lg border border-border/50 bg-card p-4">
            {i === 0 && <Megaphone className="h-5 w-5 text-primary" />}
            {i === 1 && <Trophy className="h-5 w-5 text-primary" />}
            {i === 2 && <Coins className="h-5 w-5 text-primary" />}
            <p className="mt-2 font-semibold text-foreground">{pkg.name}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{pkg.price}</p>
            <p className="mt-2 text-xs text-muted-foreground">{pkg.includes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
