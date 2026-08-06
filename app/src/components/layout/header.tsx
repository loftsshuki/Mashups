"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowUpRight,
  ChevronDown,
  FlaskConical,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react"

import { MobileNav } from "@/components/layout/mobile-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { logout } from "@/lib/auth/auth-actions"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const primaryLinks = [
  { href: "/explore", label: "Discover" },
  { href: "/create", label: "Create" },
  { href: "/challenges", label: "Challenges" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/earnings", label: "Earnings" },
] as const

const labLinks = [
  { href: "/studio", label: "Live studio", note: "Co-create in real time" },
  { href: "/packs", label: "Weekly packs", note: "Hook-ready drops" },
  { href: "/momentum", label: "Momentum feed", note: "What is moving now" },
  { href: "/scoreboard", label: "Scoreboard", note: "Growth over followers" },
  { href: "/battles", label: "Beat battles", note: "Head-to-head voting" },
  { href: "/tools", label: "Creator tools", note: "Specialized utilities" },
] as const

interface UserProfile {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!active) return
        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", authUser.id)
            .single()
          if (!active) return
          setUser(profile ?? {
            username: authUser.email?.split("@")[0] ?? "creator",
            display_name: null,
            avatar_url: null,
          })
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadUser()
    return () => { active = false }
  }, [pathname])

  const initials =
    user?.display_name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ??
    user?.username.slice(0, 2).toUpperCase() ??
    "CR"

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function handleLogout() {
    await logout()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-foreground bg-background/95 transition-shadow",
        isScrolled && "shadow-[0_4px_0_rgb(19_19_15/0.12)]",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center container-padding">
        <Link href="/" className="group mr-6 flex min-h-11 shrink-0 items-center gap-2" aria-label="Mashups home">
          <span className="grid size-9 place-items-center border border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground transition-transform group-hover:-rotate-6">
            M/
          </span>
          <span className="display-type hidden text-[1.05rem] leading-none sm:block">Mashups</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                isActive(link.href)
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-secondary">
              Labs <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 rounded-none border-foreground bg-popover p-2 shadow-[5px_5px_0_var(--foreground)]">
              <DropdownMenuLabel className="mono-label px-2 py-3 text-muted-foreground">
                Experimental surfaces
              </DropdownMenuLabel>
              {labLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-none p-0 focus:bg-secondary">
                  <Link href={link.href} className="flex items-center justify-between gap-4 px-2 py-2.5">
                    <span>
                      <span className="block text-sm font-semibold">{link.label}</span>
                      <span className="block text-xs text-muted-foreground">{link.note}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0" />
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link href="/search"><Search className="size-4" /></Link>
          </Button>

          {isLoading ? (
            <div className="size-9 animate-pulse border border-foreground/30 bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-none p-1 pr-2">
                  <Avatar className="size-7 rounded-none">
                    {user.avatar_url ? <AvatarImage src={user.avatar_url} alt="" /> : null}
                    <AvatarFallback className="rounded-none bg-secondary font-mono text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate font-mono text-xs">@{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-none border-foreground shadow-[4px_4px_0_var(--foreground)]">
                <DropdownMenuItem asChild><Link href={`/profile/${user.username}`}><User />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard"><FlaskConical />Workspace</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings"><Settings />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleLogout()}><LogOut />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
              <Button asChild><Link href="/signup">Start free <ArrowUpRight /></Link></Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto size-11 rounded-none md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <MobileNav />
        </Sheet>
      </div>
    </header>
  )
}
