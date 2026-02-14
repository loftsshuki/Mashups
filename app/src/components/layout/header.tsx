"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, Music, User, LogOut, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/lib/auth/auth-actions";

const navLinks = [
  { href: "/feed", label: "For You" },
  { href: "/launchpad", label: "Product" },
  { href: "/packs", label: "Viral Pack" },
  { href: "/battles", label: "Battles" },
  { href: "/tools", label: "AI Tools" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/legal", label: "Docs" },
] as const;

interface UserProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", authUser.id)
            .single();

          setUser(
            profile ?? {
              username: authUser.email?.split("@")[0] ?? "user",
              display_name: null,
              avatar_url: null,
            }
          );
        }
      } catch {
        // Supabase not configured — no auth
      }
      setIsLoading(false);
    }

    getUser();
  }, [pathname]);

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? user?.username?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="border-b border-border/60 bg-background/75">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>
            New: attribution signatures now power creator growth loops.
          </span>
          <Link href="/dashboard/analytics" className="ml-2 text-primary">
            View analytics
          </Link>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="neon-rail rounded-xl p-1.5">
            <Music className="size-4 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-xl font-semibold text-transparent">
            mashups
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/search" aria-label="Search">
              <Search className="size-4" />
            </Link>
          </Button>

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar size="sm">
                    {user.avatar_url && (
                      <AvatarImage
                        src={user.avatar_url}
                        alt={user.display_name ?? user.username}
                      />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.display_name ?? user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.username}`}>
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    setUser(null);
                    router.push("/");
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary/30 bg-transparent"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" className="rounded-full neon-outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <MobileNav />
        </Sheet>
      </div>
    </header>
  );
}
