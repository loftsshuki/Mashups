"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CommandItem {
  label: string
  href: string
  keywords: string
}

const commands: CommandItem[] = [
  { label: "Create Mashup", href: "/create", keywords: "create upload mix publish" },
  { label: "Explore", href: "/explore", keywords: "discover feed momentum trending" },
  { label: "Challenges", href: "/challenges", keywords: "contest challenge viral" },
  { label: "Studio", href: "/studio", keywords: "collab realtime session" },
  { label: "Campaign Builder", href: "/campaigns", keywords: "shorts plan schedule caption" },
  { label: "Pricing", href: "/pricing", keywords: "billing subscription plan" },
  { label: "Launchpad", href: "/launchpad", keywords: "features roadmap all tools" },
  { label: "Partner Portal", href: "/partner", keywords: "rights holder catalog policy" },
  { label: "Enterprise", href: "/enterprise", keywords: "white label agency" },
  { label: "Sponsors", href: "/sponsors", keywords: "sponsor brand challenge" },
  { label: "Dashboard", href: "/dashboard", keywords: "creator os analytics monetization" },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (!isMetaK) return
      event.preventDefault()
      setOpen((prev) => !prev)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((item) => {
      return (
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
      )
    })
  }, [query])

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:bg-muted md:inline-flex"
      >
        Cmd/Ctrl + K
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Command Palette</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions..."
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-border/50">
              {filtered.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.href}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">No matches.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
