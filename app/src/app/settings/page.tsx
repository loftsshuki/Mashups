"use client"

import { useEffect, useState, useActionState } from "react"
import { Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "@/lib/auth/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface ProfileData {
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
}

function SettingsContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(updateProfile, null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        setProfile({
          display_name: profileData?.display_name ?? null,
          bio: profileData?.bio ?? null,
          avatar_url: profileData?.avatar_url ?? null,
          email: user.email ?? null,
        })
      } catch (err) {
        console.error("Failed to fetch profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        Settings
      </h1>

      <div className="mx-auto max-w-2xl space-y-8">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage how you appear to other users on Mashups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
                  Profile updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="display-name"
                  className="text-sm font-medium text-foreground"
                >
                  Display Name
                </label>
                <Input
                  id="display-name"
                  name="display_name"
                  type="text"
                  placeholder="Your display name"
                  defaultValue={profile?.display_name ?? ""}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-foreground"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell the world about yourself and your music..."
                  defaultValue={profile?.bio ?? ""}
                  rows={3}
                  disabled={pending}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="avatar-url"
                  className="text-sm font-medium text-foreground"
                >
                  Avatar URL
                </label>
                <Input
                  id="avatar-url"
                  name="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  defaultValue={profile?.avatar_url ?? ""}
                  disabled={pending}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account card */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account credentials and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  defaultValue={profile?.email ?? ""}
                />
              </div>

              <div className="pt-2">
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  )
}
