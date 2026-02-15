import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/create", label: "Create Mashup" },
    { href: "/studio", label: "Studio" },
    { href: "/tools", label: "AI Tools" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/pricing", label: "Pricing" },
  ],
  Discover: [
    { href: "/feed", label: "For You" },
    { href: "/explore", label: "Explore" },
    { href: "/trending", label: "Trending" },
    { href: "/battles", label: "Battles" },
    { href: "/challenges", label: "Challenges" },
  ],
  Creators: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/royalties", label: "Royalties" },
    { href: "/subscriptions", label: "Subscriptions" },
  ],
  Company: [
    { href: "/enterprise", label: "Enterprise" },
    { href: "/partner", label: "Partner Program" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/legal/terms", label: "Terms" },
    { href: "/legal/copyright", label: "Copyright" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container-padding max-w-[1400px] mx-auto py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="font-[family-name:var(--font-editorial)] italic text-xl tracking-tight text-foreground hover:text-primary transition-colors"
            >
              mashups
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The creator-first music platform for remix production, attribution
              loops, and rights-safe monetization.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://twitter.com/mashups"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors link-animated"
              >
                Twitter
              </a>
              <a
                href="https://github.com/mashups"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors link-animated"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="section-label mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="editorial-rule mt-12" />
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Mashups. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-editorial)] italic text-sm text-muted-foreground">
            Made for creators
          </p>
        </div>
      </div>
    </footer>
  );
}
