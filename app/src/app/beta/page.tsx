"use client"

import { type FormEvent, useState } from "react"
import { ArrowRight, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BetaAccessPage() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(null); const form = new FormData(event.currentTarget); const response = await fetch("/api/green/beta/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: form.get("code") }) }); const result = await response.json() as { next?: string; error?: string }; if (response.ok) window.location.assign(result.next ?? "/create"); else { setError(result.error ?? "Invite failed."); setBusy(false) } }
  return <div className="min-h-[80vh] pt-28"><section className="mx-auto max-w-3xl px-4 py-16 sm:px-6"><div className="border border-foreground bg-secondary p-6 shadow-[8px_8px_0_var(--foreground)] sm:p-10"><p className="signal-label">Founding Green Room</p><h1 className="display-type mt-5 text-6xl leading-[0.82] sm:text-8xl">Get past<br /><span className="text-primary">the rope.</span></h1><p className="mt-6 max-w-xl text-lg text-muted-foreground">Enter the code from your artist or Mashups invite. Beta access is measured so we can prove whether making versions becomes a habit.</p><form onSubmit={submit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="code">Invite code</Label><Input id="code" name="code" autoCapitalize="characters" autoComplete="one-time-code" placeholder="MX-..." required /></div><Button size="lg" disabled={busy}>{busy ? <KeyRound className="animate-pulse" /> : <ArrowRight />}{busy ? "Checking" : "Enter Green Room"}</Button></form>{error ? <p role="alert" className="mt-4 border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}</div></section></div>
}
