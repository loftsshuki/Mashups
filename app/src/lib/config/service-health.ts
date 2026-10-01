export type ServiceHealth = "healthy" | "unconfigured" | "unauthorized" | "schema_missing" | "unreachable"

// Probe both services: a working Auth endpoint does not prove the app schema exists.
export async function checkSupabaseHealth(
  environment: Record<string, string | undefined>,
  fetcher: typeof fetch = fetch,
): Promise<{ auth: ServiceHealth; database: ServiceHealth }> {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const key = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || key === "placeholder" || /your_supabase|placeholder/.test(url)) {
    return { auth: "unconfigured", database: "unconfigured" }
  }

  async function probe(path: string, database = false): Promise<ServiceHealth> {
    try {
      const response = await fetcher(`${url}${path}`, {
        headers: { apikey: key! },
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      })
      if (response.ok) return "healthy"
      if (response.status === 401 || response.status === 403) return "unauthorized"
      if (database && response.status === 404) return "schema_missing"
      return "unreachable"
    } catch {
      return "unreachable"
    }
  }

  const [auth, database] = await Promise.all([
    probe("/auth/v1/health"),
    probe("/rest/v1/profiles?select=id&limit=0", true),
  ])
  return { auth, database }
}
