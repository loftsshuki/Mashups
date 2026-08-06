"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Coins,
  Compass,
  FlaskConical,
  Plus,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const main = [
  { href: "/explore", label: "Discover", icon: Compass },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/earnings", label: "Earnings", icon: Coins },
] as const

const labs = [
  ["/studio", "Live studio"],
  ["/packs", "Weekly packs"],
  ["/momentum", "Momentum feed"],
  ["/scoreboard", "Scoreboard"],
  ["/battles", "Beat battles"],
  ["/tools", "Creator tools"],
] as const

export function MobileNav() {
  const pathname = usePathname()
  return (
    <SheetContent side="right" className="w-[min(92vw,360px)] rounded-none border-l border-foreground bg-background p-0">
      <SheetHeader className="border-b border-foreground p-5">
        <SheetTitle className="flex items-center gap-3 text-left">
          <span className="grid size-9 place-items-center border border-foreground bg-primary font-mono text-sm text-primary-foreground">M/</span>
          <span className="display-type">Mashups</span>
        </SheetTitle>
      </SheetHeader>

      <nav className="p-4" aria-label="Mobile navigation">
        <p className="mono-label mb-3 text-muted-foreground">Make and grow</p>
        <div className="space-y-1">
          {main.map(({ href, label, icon: Icon }) => (
            <SheetClose key={href} asChild>
              <Link
                href={href}
                className={cn(
                  "flex items-center justify-between border border-transparent px-3 py-3 font-semibold",
                  (pathname === href || pathname.startsWith(`${href}/`))
                    ? "border-foreground bg-secondary"
                    : "hover:border-foreground",
                )}
              >
                <span>{label}</span><Icon className="size-4" />
              </Link>
            </SheetClose>
          ))}
        </div>

        <Separator className="my-5 bg-foreground" />
        <p className="mono-label mb-3 flex items-center gap-2 text-muted-foreground"><FlaskConical className="size-3" /> Labs</p>
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-foreground bg-foreground">
          {labs.map(([href, label]) => (
            <SheetClose key={href} asChild>
              <Link href={href} className="bg-background p-3 text-sm font-medium hover:bg-accent">{label}</Link>
            </SheetClose>
          ))}
        </div>
      </nav>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-foreground p-4">
        <SheetClose asChild><Button variant="outline" asChild><Link href="/login">Log in</Link></Button></SheetClose>
        <SheetClose asChild><Button asChild><Link href="/signup">Start free</Link></Button></SheetClose>
      </div>
    </SheetContent>
  )
}
