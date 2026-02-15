"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2, Mail } from "lucide-react"

import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/lib/auth/auth-actions"

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null)

  return (
    <NeonPage className="max-w-5xl">
      <NeonHero
        eyebrow="Account"
        title="Reset your password"
        description="Enter your email and we'll send you a reset link."
      />
      <div className="mx-auto flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>We&apos;ll email you a link to reset your password.</CardDescription>
          </CardHeader>

          <CardContent>
            {state?.success ? (
              <div className="rounded-md bg-green-500/10 px-3 py-4 text-center text-sm text-green-600">
                {state.message}
              </div>
            ) : (
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

                <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
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
