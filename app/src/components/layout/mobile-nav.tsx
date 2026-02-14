"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Search,
  BadgeDollarSign,
  Radio,
  ShieldCheck,
  PlusCircle,
  Compass,
  Trophy,
  PackageOpen,
  Flame,
  Wand2,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/feed", label: "For You", icon: Flame },
  { href: "/launchpad", label: "Product", icon: LayoutGrid },
  { href: "/packs", label: "Viral Pack", icon: PackageOpen },
  { href: "/battles", label: "Battles", icon: Trophy },
  { href: "/thunderdome", label: "Thunderdome", icon: Trophy },
  { href: "/tools", label: "AI Tools", icon: Wand2 },
  { href: "/scoreboard", label: "Scoreboard", icon: Trophy },
  { href: "/momentum", label: "Momentum", icon: Flame },
  { href: "/studio", label: "Studio", icon: Radio },
  { href: "/features", label: "New Features", icon: Sparkles },
  { href: "/pricing", label: "Pricing", icon: BadgeDollarSign },
  { href: "/enterprise", label: "Enterprise", icon: ShieldCheck },
  { href: "/legal", label: "Docs", icon: Search },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: PlusCircle },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <SheetContent
      side="right"
      className="w-[290px] border-l border-primary/20 bg-background/90 backdrop-blur-2xl sm:w-[330px]"
    >
      <SheetHeader>
        <SheetTitle className="text-left">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-lg font-bold text-transparent">
            mashups.com
          </span>
        </SheetTitle>
      </SheetHeader>

      <nav className="flex flex-col gap-1 px-4">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <SheetClose key={href} asChild>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <Separator className="mx-4 w-auto" />

      <div className="flex flex-col gap-2 px-4">
        <SheetClose asChild>
          <Button
            variant="outline"
            className="w-full rounded-full border-primary/30 bg-transparent"
            asChild
          >
            <Link href="/login">Log In</Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="neon-outline w-full rounded-full" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
}
