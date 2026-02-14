import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function writeAuditEvent(input: {
  actorId?: string | null
  action: string
  resourceType: string
  resourceId?: string | null
  status: "success" | "error"
  metadata?: Record<string, unknown>
}) {
  if (!isSupabaseConfigured()) return

  try {
    const admin = createAdminClient()
    if (admin) {
      await admin.from("audit_events").insert({
        actor_id: input.actorId ?? null,
        action: input.action,
        resource_type: input.resourceType,
        resource_id: input.resourceId ?? null,
        status: input.status,
        metadata: input.metadata ?? {},
      })
      return
    }

    const supabase = await createClient()
    await supabase.from("audit_events").insert({
      actor_id: input.actorId ?? null,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      status: input.status,
      metadata: input.metadata ?? {},
    })
  } catch {
    // Audit logging should never block user flows.
  }
}
