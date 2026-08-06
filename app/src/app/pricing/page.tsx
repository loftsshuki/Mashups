"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PRODUCT_EVENTS, trackProductEvent } from "@/lib/analytics/events"
import { startCheckout } from "@/lib/data/billing"

type PricingTier = { id: string; name: string; price: string; cadence: string; blurb: string; features: readonly string[]; cta: string; featured: boolean }

const tiers: readonly PricingTier[] = [
  { id: "free", name: "Free", price: "$0", cadence: "forever", blurb: "Prove the workflow before you scale it.", features: ["3 campaign drafts each month", "Public profile and discovery", "Draft rights declarations"], cta: "Start free", featured: false },
  { id: "Pro Creator", name: "Pro Creator", price: "$12", cadence: "per month", blurb: "For creators shipping a campaign every week.", features: ["Unlimited hook candidates", "Signed campaign attribution", "Weekly performance brief", "Creator-safe export presets"], cta: "Choose Creator", featured: true },
  { id: "Pro Studio", name: "Pro Studio", price: "$29", cadence: "per month", blurb: "For editors, managers, and creator teams.", features: ["Everything in Pro Creator", "Team campaign workspace", "Rights and dispute operations", "Priority collaboration rooms"], cta: "Choose Studio", featured: false },
]

export default function PricingPage() {
  const router = useRouter()
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => trackProductEvent(PRODUCT_EVENTS.pricingViewed), [])

  async function handleCheckout(plan: string) {
    if (plan === "free") { router.push("/signup"); return }
    setError(null)
    setPendingPlan(plan)
    try {
      const result = await startCheckout("subscription", plan)
      if (result.checkoutUrl) router.push(result.checkoutUrl)
      else setError("Billing is not connected yet. Your campaign drafts remain available on Free.")
    } finally { setPendingPlan(null) }
  }

  return <div className="pt-28"><section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8"><div className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="signal-label">Pricing</p><h1 className="display-type mt-6 text-6xl leading-[0.84] sm:text-8xl">Pay for velocity.<br /><span className="text-primary">Not empty limits.</span></h1></div><div className="lg:col-span-4"><p className="text-lg leading-relaxed text-muted-foreground">Upgrade when attributed campaigns and rights operations save more time than they cost.</p><div className="mt-6 flex items-center gap-2 font-mono text-xs"><ShieldCheck className="size-4 text-primary" />Cancel or change tier at any time</div></div></div>{error ? <div role="alert" className="mt-6 border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}<div className="grid gap-5 pt-7 lg:grid-cols-3">{tiers.map((tier, index) => <article key={tier.name} className={`relative flex min-h-[32rem] flex-col border border-foreground p-6 ${tier.featured ? "bg-foreground text-background shadow-[7px_7px_0_var(--primary)]" : "bg-card shadow-[5px_5px_0_var(--foreground)]"}`}><div className="flex items-center justify-between"><span className="font-mono text-xs">0{index + 1} / {tier.name}</span>{tier.featured ? <span className="bg-secondary px-2 py-1 font-mono text-[10px] font-semibold uppercase text-secondary-foreground">Most useful</span> : null}</div><p className={`mt-9 text-5xl font-semibold ${tier.featured ? "text-secondary" : "text-primary"}`}>{tier.price}</p><p className="mt-1 font-mono text-xs uppercase opacity-60">{tier.cadence}</p><h2 className="display-type mt-7 text-3xl leading-none">{tier.blurb}</h2><ul className="mt-8 space-y-4">{tier.features.map((feature) => <li key={feature} className="flex gap-3 text-sm"><Check className={`mt-0.5 size-4 shrink-0 ${tier.featured ? "text-secondary" : "text-primary"}`} />{feature}</li>)}</ul><Button className="mt-auto" variant={tier.featured ? "secondary" : "default"} onClick={() => void handleCheckout(tier.id)} disabled={pendingPlan === tier.id}>{pendingPlan === tier.id ? <><Loader2 className="animate-spin" />Opening checkout</> : <>{tier.cta}<ArrowRight /></>}</Button></article>)}</div><p className="mt-9 text-center text-sm text-muted-foreground">Need API access, indemnity, or agency workspaces? <Link href="/enterprise" className="font-semibold text-foreground underline underline-offset-4">Talk to enterprise.</Link></p></section></div>
}
