"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2, Music } from "lucide-react"

import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { login } from "@/lib/auth/auth-actions"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <NeonPage className="max-w-5xl">
      <NeonHero
        eyebrow="Account"
        title="Welcome back"
        description="Continue where you left off in studio, campaigns, and rights operations."
      />
      <div className="mx-auto flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>Access your Mashups workspace.</CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </div>
              ) : null}

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
                  placeholder="Enter your password"
                  required
                  disabled={pending}
                />
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary transition-colors hover:text-primary/80">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </NeonPage>
  )
}

