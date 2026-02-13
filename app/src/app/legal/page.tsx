import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const legalDocs = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    description: "Rules and conditions for using Mashups.",
  },
  {
    href: "/legal/copyright",
    title: "Copyright Policy",
    description: "DMCA notice and counter-notice process.",
  },
  {
    href: "/legal/repeat-infringer",
    title: "Repeat Infringer Policy",
    description: "How repeated infringement is enforced.",
  },
] as const

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Legal</h1>
        <p className="mt-2 text-muted-foreground">
          Policies and terms that govern use of Mashups.
        </p>
      </header>

      <div className="grid gap-4">
        {legalDocs.map((doc) => (
          <Link key={doc.href} href={doc.href} className="group">
            <Card className="border-border/60 transition-colors group-hover:border-primary/50">
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-primary">Read policy</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
