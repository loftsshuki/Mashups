"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Search } from "lucide-react";

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
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/search", label: "Search", icon: Search },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <SheetContent side="right" className="w-[280px] sm:w-[320px]">
      <SheetHeader>
        <SheetTitle className="text-left">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-lg">
            Mashups
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
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="w-full" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
}
