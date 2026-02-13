import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/copyright", label: "Copyright" },
  { href: "/legal/repeat-infringer", label: "Repeat Policy" },
  { href: "mailto:legal@mashups.example", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="w-full">
      <Separator />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Mashups</span>{" "}
          &copy; {new Date().getFullYear()}
        </p>
        <nav className="flex items-center gap-4">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
