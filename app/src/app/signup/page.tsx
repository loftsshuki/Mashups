"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2, Music } from "lucide-react"

import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/auth/auth-actions"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null)

  function getGoogleOAuthUrl() {
    if (!SUPABASE_URL) return "#"
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "https://mashups.agency/auth/callback"
    return `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
  }

  return (
    <NeonPage className="max-w-5xl">
      <NeonHero
        eyebrow="Account"
        title="Create your account"
        description="Join the Mashups creator network and launch your first campaign."
      />
      <div className="mx-auto flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>Create your Mashups workspace.</CardDescription>
          </CardHeader>

          <CardContent>
            <Button type="button" variant="outline" className="w-full" asChild>
            <a href={getGoogleOAuthUrl()}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              {state?.error ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="your-username"
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  disabled={pending}
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  disabled={pending}
                  className="mt-1 h-4 w-4 rounded border-input accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    href="/legal/terms"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/copyright"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Copyright Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/repeat-infringer"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Repeat Infringer Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </NeonPage>
  )
}

