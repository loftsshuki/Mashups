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

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null)

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

