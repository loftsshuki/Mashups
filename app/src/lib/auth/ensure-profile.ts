import "server-only"

import type { SupabaseClient, User } from "@supabase/supabase-js"

export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<boolean> {
  const existing = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
  if (existing.error) return false
  if (existing.data) return true
  const requested = user.user_metadata?.username
  const fallback = `creator_${user.id.replaceAll("-", "").slice(0, 20)}`
  const username = typeof requested === "string" && /^[A-Za-z0-9._-]{3,30}$/.test(requested) ? requested : fallback
  const metadataName = user.user_metadata?.full_name
  const displayName = typeof metadataName === "string" ? metadataName.slice(0, 100) : username
  // A confirmation-only signup has no session; call this only after authentication.
  let result = await supabase.from("profiles").upsert({ id: user.id, username, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true })
  if (result.error?.code === "23505" && username !== fallback) {
    result = await supabase.from("profiles").upsert({ id: user.id, username: fallback, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true })
  }
  return !result.error
}
