import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const product = [
  ["/create", "Create"],
  ["/explore", "Discover"],
  ["/challenges", "Challenges"],
  ["/dashboard/analytics", "Analytics"],
  ["/earnings", "Earnings"],
] as const

const company = [
  ["/pricing", "Pricing"],
  ["/enterprise", "Enterprise"],
  ["/sponsors", "Sponsor a challenge"],
  ["/legal/terms", "Terms"],
  ["/legal/copyright", "Copyright"],
] as const

export function Footer() {
  return (
    <footer className="border-t border-foreground bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] container-padding">
        <div className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid size-11 place-items-center border border-background bg-primary font-mono font-bold text-primary-foreground">M/</span>
              <span className="display-type text-2xl">Mashups</span>
            </Link>
            <p className="mt-7 max-w-lg text-xl leading-snug text-background/72 sm:text-2xl">
              Turn one track into the clip, proof, link, and feedback loop that grows your next one.
            </p>
            <Link href="/create" className="mt-8 inline-flex items-center gap-2 border-b border-primary pb-1 font-mono text-xs font-semibold uppercase tracking-widest hover:text-primary">
              Make the next sound <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-5 md:col-start-8">
            <FooterColumn title="Product" links={product} />
            <FooterColumn title="Company" links={company} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-background/30 py-6 font-mono text-[10px] uppercase tracking-[0.12em] text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Mashups Agency</span>
          <span>Built for creators who ship</span>
          <a href="mailto:hello@mashups.agency" className="hover:text-primary">hello@mashups.agency</a>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <div>
      <h2 className="mono-label mb-5 text-background/50">{title}</h2>
      <ul className="space-y-3">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-background/80 hover:text-primary">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
