"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { loginSchema, signupSchema } from "@/lib/auth/form-schema"
import { ensureProfile } from "@/lib/auth/ensure-profile"
import { buildAuthCallbackUrl, safeReturnPath } from "@/lib/auth/return-path"

type AuthActionState = { error?: string; success?: boolean; message?: string } | null

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") })
  if (!parsed.success) return { error: "Enter a valid email and password." }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error) return { error: error.message }
    if (!data.user || !await ensureProfile(supabase, data.user)) return { error: "Your profile could not be loaded. Please try signing in again." }
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." }
  }
  redirect(safeReturnPath(formData.get("next")))
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"), password: formData.get("password"), username: formData.get("username"),
    confirmPassword: formData.get("confirm-password"), terms: formData.get("terms"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your signup details." }
  const next = safeReturnPath(formData.get("next"))
  try {
    const supabase = await createClient()
    const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email, password: parsed.data.password,
      options: { data: { username: parsed.data.username }, ...(origin ? { emailRedirectTo: buildAuthCallbackUrl(origin, next) } : {}) },
    })
    if (authError) return { error: authError.message }
    if (!authData.session) return { success: true, message: "Check your email to confirm your account. Open the link in this browser to return to your draft." }
    if (!authData.user || !await ensureProfile(supabase, authData.user)) return { error: "Your account was created, but the profile could not be saved. Please sign in again." }
  } catch {
    return { error: "Account creation is temporarily unavailable. Please try again." }
  }
  redirect(next)
}

export async function signInWithGoogle(_formData?: FormData) {
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackUrl(siteUrl, _formData?.get("next")),
    },
  })

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect("/login?error=no-redirect-url")
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/update-password`,
  })

  if (error) return { error: error.message }
  return { success: true, message: "Check your email for a password reset link" }
}

export async function updatePassword(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  redirect("/login?message=Password updated successfully")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile ? { ...profile, email: user.email } : null
}

export async function updateProfile(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const updates: Record<string, string> = {}
  const displayName = formData.get("display_name") as string
  const bio = formData.get("bio") as string
  const avatarUrl = formData.get("avatar_url") as string

  if (displayName) updates.display_name = displayName
  if (bio !== null) updates.bio = bio
  if (avatarUrl !== null) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
