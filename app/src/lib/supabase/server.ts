import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

type NoopResult = { data: null; error: null }

type NoopQueryChain = {
  select: (..._args: unknown[]) => NoopQueryChain
  eq: (..._args: unknown[]) => NoopQueryChain
  order: (..._args: unknown[]) => NoopQueryChain
  single: () => Promise<NoopResult>
  limit: (..._args: unknown[]) => NoopQueryChain
  insert: (..._args: unknown[]) => NoopQueryChain
  delete: (..._args: unknown[]) => NoopQueryChain
  then: (resolve: (value: NoopResult) => unknown) => unknown
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a minimal no-op client when Supabase is not configured
    const noopResult: NoopResult = { data: null, error: null }
    const chain = {} as NoopQueryChain
    chain.select = () => chain
    chain.eq = () => chain
    chain.order = () => chain
    chain.single = async () => noopResult
    chain.limit = () => chain
    chain.insert = () => chain
    chain.delete = () => chain
    chain.then = (resolve) => resolve(noopResult)

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => chain,
    } as unknown as ReturnType<typeof createServerClient>
  }

  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
