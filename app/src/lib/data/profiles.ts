import { getMockCreator, type MockCreator } from "@/lib/mock-data"
import type { Profile } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** Convert a MockCreator into the canonical Profile shape */
function mockToProfile(c: MockCreator): Profile {
  return {
    id: c.username,
    username: c.username,
    display_name: c.displayName,
    avatar_url: c.avatarUrl,
    bio: c.bio,
    created_at: new Date().toISOString(),
  }
}

/**
 * Fetch a profile by user ID.
 * Falls back to mock data when Supabase is not configured or the query fails.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    // In mock mode, try matching by username since mock data uses username as id
    const mock = getMockCreator(userId)
    return mock ? mockToProfile(mock) : null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !data) {
      console.error("Supabase getProfile error, falling back to mock:", error)
      const mock = getMockCreator(userId)
      return mock ? mockToProfile(mock) : null
    }

    return data as Profile
  } catch {
    const mock = getMockCreator(userId)
    return mock ? mockToProfile(mock) : null
  }
}

/**
 * Fetch a profile by username.
 * Falls back to mock data when Supabase is not configured or the query fails.
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    const mock = getMockCreator(username)
    return mock ? mockToProfile(mock) : null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (error || !data) {
      console.error(
        "Supabase getProfileByUsername error, falling back to mock:",
        error
      )
      const mock = getMockCreator(username)
      return mock ? mockToProfile(mock) : null
    }

    return data as Profile
  } catch {
    const mock = getMockCreator(username)
    return mock ? mockToProfile(mock) : null
  }
}
