"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, Chrome, Loader2 } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/auth/auth-actions"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)
  const [oauthError, setOauthError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setOauthError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) setOauthError(error.message)
  }

  return <AuthShell eyebrow="Account / Log in" title="Return to the signal." description="Open your campaign drafts, rights proofs, and weekly performance brief."><Button type="button" variant="outline" className="h-12 w-full" onClick={() => void handleGoogleSignIn()}><Chrome />Continue with Google</Button><div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-foreground/25" /><span className="mono-label text-muted-foreground">Or email</span><span className="h-px flex-1 bg-foreground/25" /></div>{state?.error || oauthError ? <div role="alert" className="mb-5 border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{state?.error ?? oauthError}</div> : null}<form action={formAction} className="space-y-5"><label className="block space-y-2" htmlFor="email"><span className="mono-label text-muted-foreground">Email</span><Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} className="h-12 rounded-none border-foreground bg-background" /></label><label className="block space-y-2" htmlFor="password"><span className="mono-label text-muted-foreground">Password</span><Input id="password" name="password" type="password" autoComplete="current-password" required disabled={pending} className="h-12 rounded-none border-foreground bg-background" /></label><div className="flex items-center justify-between gap-4"><Link href="/reset-password" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Forgot password?</Link><Button type="submit" disabled={pending}>{pending ? <><Loader2 className="animate-spin" />Signing in</> : <>Log in<ArrowRight /></>}</Button></div></form><p className="mt-7 border-t border-foreground pt-5 text-sm text-muted-foreground">New to Mashups? <Link href="/signup" className="font-semibold text-foreground underline underline-offset-4">Create a workspace.</Link></p></AuthShell>
}
