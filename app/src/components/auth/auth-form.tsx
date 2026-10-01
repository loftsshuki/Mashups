"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, Chrome, Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, signup } from "@/lib/auth/auth-actions"
import { buildAuthCallbackUrl, buildAuthPath } from "@/lib/auth/return-path"
import { createClient } from "@/lib/supabase/client"

export function AuthForm({ mode, next, callbackFailed = false }: { mode: "login" | "signup"; next: string; callbackFailed?: boolean }) {
  const isSignup = mode === "signup"
  const [state, formAction, pending] = useActionState(isSignup ? signup : login, null)
  const [oauthPending, setOauthPending] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const error = state?.error ?? oauthError ?? (!state?.success && callbackFailed ? "We couldn't finish sign-in. Please try again." : null)
  const busy = pending || oauthPending

  async function handleGoogleSignIn() {
    setOauthError(null)
    setOauthPending(true)
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: buildAuthCallbackUrl(window.location.origin, next) } })
      if (error) setOauthError(error.message)
    } catch {
      setOauthError("Google sign-in is temporarily unavailable. Please try again.")
    } finally {
      setOauthPending(false)
    }
  }

  return (
    <AuthShell eyebrow={isSignup ? "Account / Start free" : "Account / Log in"} title={isSignup ? "Make it yours." : "Pick up the mix."} description="Keep your mashups together and return to the version you were making.">
      <Button type="button" variant="outline" className="h-12 w-full" disabled={busy} onClick={() => void handleGoogleSignIn()}>{oauthPending ? <Loader2 className="animate-spin" /> : <Chrome />}Continue with Google</Button>
      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-foreground/25" /><span className="mono-label text-muted-foreground">Or email</span><span className="h-px flex-1 bg-foreground/25" /></div>
      {error ? <div role="alert" className="mb-5 border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {state?.success ? <div role="status" className="mb-5 border border-foreground bg-secondary p-4 text-sm">{state.message}</div> : null}
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        {isSignup ? <label className="block space-y-2" htmlFor="username"><span className="mono-label text-muted-foreground">Your handle</span><Input id="username" name="username" autoComplete="username" required disabled={busy} pattern={"[A-Za-z0-9._\\-]{3,30}"} maxLength={30} className="h-12 rounded-none border-foreground bg-background" /></label> : null}
        <label className="block space-y-2" htmlFor="email"><span className="mono-label text-muted-foreground">Email</span><Input id="email" name="email" type="email" autoComplete="email" required disabled={busy} maxLength={320} className="h-12 rounded-none border-foreground bg-background" /></label>
        <label className="block space-y-2" htmlFor="password"><span className="mono-label text-muted-foreground">Password</span><Input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 8 : 1} maxLength={1024} required disabled={busy} className="h-12 rounded-none border-foreground bg-background" /></label>
        {isSignup ? <>
          <label className="block space-y-2" htmlFor="confirm-password"><span className="mono-label text-muted-foreground">Confirm password</span><Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required disabled={busy} className="h-12 rounded-none border-foreground bg-background" /></label>
          <label className="flex items-start gap-3"><input name="terms" type="checkbox" required disabled={busy} className="mt-0.5 size-5 accent-[var(--primary)]" /><span className="text-sm leading-relaxed text-muted-foreground">I agree to the <Link href="/legal/terms" className="text-foreground underline">terms</Link> and <Link href="/legal/copyright" className="text-foreground underline">copyright policy</Link>.</span></label>
        </> : <Link href="/reset-password" className="block text-sm text-muted-foreground underline underline-offset-4">Forgot password?</Link>}
        <Button type="submit" disabled={busy} className="min-h-12 w-full" data-testid="auth-submit">{pending ? <><Loader2 className="animate-spin" />{isSignup ? "Creating account" : "Signing in"}</> : <>{isSignup ? "Create account" : "Log in"}<ArrowRight /></>}</Button>
      </form>
      <p className="mt-7 border-t border-foreground pt-5 text-sm text-muted-foreground">{isSignup ? "Already have an account?" : "New to Mashups?"} <Link href={buildAuthPath(isSignup ? "login" : "signup", next)} className="font-semibold text-foreground underline underline-offset-4">{isSignup ? "Log in." : "Start free."}</Link></p>
      <Link href={next} className="mt-4 inline-block text-sm underline underline-offset-4">Back to Mashups</Link>
    </AuthShell>
  )
}
