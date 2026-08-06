"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, Chrome, Loader2 } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/auth/auth-actions"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null)
  const [oauthError, setOauthError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setOauthError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) setOauthError(error.message)
  }

  return <AuthShell eyebrow="Account / Start free" title="Ship the first campaign." description="A focused workspace for creators who want hooks, rights proof, attribution, and learning in one loop."><Button type="button" variant="outline" className="h-12 w-full" onClick={() => void handleGoogleSignIn()}><Chrome />Continue with Google</Button><div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-foreground/25" /><span className="mono-label text-muted-foreground">Or email</span><span className="h-px flex-1 bg-foreground/25" /></div>{state?.error || oauthError ? <div role="alert" className="mb-5 border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{state?.error ?? oauthError}</div> : null}<form action={formAction} className="grid gap-5 sm:grid-cols-2"><label className="block space-y-2 sm:col-span-2" htmlFor="username"><span className="mono-label text-muted-foreground">Creator handle</span><Input id="username" name="username" autoComplete="username" required disabled={pending} pattern="[A-Za-z0-9._-]{3,30}" className="h-12 rounded-none border-foreground bg-background" /></label><label className="block space-y-2 sm:col-span-2" htmlFor="email"><span className="mono-label text-muted-foreground">Email</span><Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} className="h-12 rounded-none border-foreground bg-background" /></label><label className="block space-y-2" htmlFor="password"><span className="mono-label text-muted-foreground">Password</span><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={pending} className="h-12 rounded-none border-foreground bg-background" /></label><label className="block space-y-2" htmlFor="confirm-password"><span className="mono-label text-muted-foreground">Confirm password</span><Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required disabled={pending} className="h-12 rounded-none border-foreground bg-background" /></label><label className="flex items-start gap-3 sm:col-span-2"><input name="terms" type="checkbox" required disabled={pending} className="mt-0.5 size-5 accent-[var(--primary)]" /><span className="text-sm leading-relaxed text-muted-foreground">I agree to the <Link href="/legal/terms" className="text-foreground underline">terms</Link> and <Link href="/legal/copyright" className="text-foreground underline">copyright policy</Link>.</span></label><div className="flex items-center justify-between gap-4 border-t border-foreground pt-5 sm:col-span-2"><span className="text-xs text-muted-foreground">No card required</span><Button type="submit" disabled={pending}>{pending ? <><Loader2 className="animate-spin" />Creating</> : <>Create workspace<ArrowRight /></>}</Button></div></form><p className="mt-7 text-sm text-muted-foreground">Already have a workspace? <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">Log in.</Link></p></AuthShell>
}
