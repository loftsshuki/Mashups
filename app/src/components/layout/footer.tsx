import Link from "next/link"

const productLinks = [
  { href: "/launchpad", label: "Product" },
  { href: "/packs", label: "Weekly Viral Pack" },
  { href: "/scoreboard", label: "Creator Scoreboard" },
  { href: "/momentum", label: "Momentum Feed" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
] as const

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/copyright", label: "Copyright" },
  { href: "/legal/repeat-infringer", label: "Repeat Policy" },
] as const

export function Footer() {
  return (
    <footer className="w-full border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="neon-panel rounded-3xl p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-xl font-semibold text-transparent">
                mashups.com
              </p>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Creator-first music platform for remix production, attribution
                loops, and rights-safe monetization.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Product
              </p>
              <div className="mt-3 space-y-2">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Legal
              </p>
              <div className="mt-3 space-y-2">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="mailto:legal@mashups.example"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            Mashups &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  )
}
