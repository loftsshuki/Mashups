import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a dummy client that no-ops when Supabase is not configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured" },
        }),
        signInWithOAuth: async () => ({
          data: { provider: "google", url: null },
          error: { message: "Supabase not configured" },
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured" },
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({
            limit: () => ({ data: [], error: null }),
            data: [],
            error: null,
          }),
          limit: () => ({ data: [], error: null }),
          data: [],
          error: null,
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: null }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
        upsert: async () => ({ error: null }),
      }),
    } as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}
