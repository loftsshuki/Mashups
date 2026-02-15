"use client"

import { useActionState } from "react"
import { Loader2, Lock } from "lucide-react"

import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { updatePassword } from "@/lib/auth/auth-actions"

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, null)

  return (
    <NeonPage className="max-w-5xl">
      <NeonHero
        eyebrow="Account"
        title="Set new password"
        description="Choose a new password for your account."
      />
      <div className="mx-auto flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">New Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  disabled={pending}
                />
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </NeonPage>
  )
}
