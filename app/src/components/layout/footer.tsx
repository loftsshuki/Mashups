import Link from "next/link";
import { Music, Github, Twitter } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/create", label: "Create Mashup" },
    { href: "/studio", label: "Studio" },
    { href: "/tools", label: "AI Tools" },
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
    { href: "/sponsors", label: "Sponsors" },
    { href: "/legal/terms", label: "Terms" },
    { href: "/legal/copyright", label: "Copyright" },
  ],
} as const;

const socialLinks = [
  { href: "https://twitter.com/mashups", label: "Twitter", icon: Twitter },
  { href: "https://github.com/mashups", label: "GitHub", icon: Github },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container-padding max-w-7xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-lg">mashups</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The creator-first music platform for remix production, attribution
              loops, and rights-safe monetization.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-accent transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
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
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Mashups. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/legal/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/copyright"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="mailto:legal@mashups.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
