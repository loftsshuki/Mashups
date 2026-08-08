import { normalizePostHogKey } from "@/lib/analytics/config"

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes("your_supabase") && key !== "placeholder")
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

export type RuntimeCapability = {
  configured: boolean
  required: boolean
  label: string
}

export function getRuntimeCapabilities(): Record<string, RuntimeCapability> {
  return {
    database: { label: "Supabase", configured: isSupabaseConfigured(), required: true },
    ai: { label: "OpenAI", configured: Boolean(process.env.OPENAI_API_KEY), required: true },
    storage: { label: "Vercel Blob", configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN), required: true },
    billing: { label: "Stripe", configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET), required: false },
    separation: { label: "Replicate", configured: Boolean(process.env.REPLICATE_API_TOKEN), required: false },
    analytics: { label: "PostHog", configured: Boolean(normalizePostHogKey(process.env.NEXT_PUBLIC_POSTHOG_KEY)), required: false },
    cron: { label: "Cron signing", configured: Boolean(process.env.CRON_SECRET), required: true },
  }
}

export function getMissingRuntimeCapabilities() {
  return Object.entries(getRuntimeCapabilities())
    .filter(([, capability]) => capability.required && !capability.configured)
    .map(([key]) => key)
}
