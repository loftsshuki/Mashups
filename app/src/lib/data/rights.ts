import { createClient } from "@/lib/supabase/client"
import type { RightsClaim, RightsDeclaration } from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockDeclarations: RightsDeclaration[] = [
  {
    id: "rd-001",
    mashup_id: "mash-001",
    mode: "owned",
    attested_at: "2026-02-10T10:00:00Z",
    attestation_version: "v1",
    status: "verified",
  },
  {
    id: "rd-002",
    mashup_id: "mash-002",
    mode: "precleared",
    attested_at: "2026-02-09T15:30:00Z",
    attestation_version: "v1",
    status: "verified",
  },
  {
    id: "rd-003",
    mashup_id: "mash-003",
    mode: "licensed",
    attested_at: "2026-02-08T12:05:00Z",
    attestation_version: "v1",
    status: "pending",
  },
]

const mockClaims: RightsClaim[] = [
  {
    id: "rc-001",
    mashup_id: "mash-003",
    claimant_contact: "rights@example.com",
    claim_type: "composition",
    submitted_at: "2026-02-12T13:20:00Z",
    status: "under_review",
    resolution: null,
    resolved_at: null,
  },
]

export async function getRightsDeclarationsForUser(
  userId: string,
): Promise<RightsDeclaration[]> {
  if (!isSupabaseConfigured()) return mockDeclarations

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rights_declarations")
      .select("*, mashup:mashups!mashup_id(creator_id)")

    if (error || !data) return []

    return data
      .filter(
        (row: { mashup?: { creator_id?: string | null } | null }) =>
          row.mashup?.creator_id === userId,
      )
      .map((row: Record<string, unknown>) => ({
        id: String(row.id),
        mashup_id: String(row.mashup_id),
        mode: row.mode as RightsDeclaration["mode"],
        attested_at: String(row.attested_at),
        attestation_version: String(row.attestation_version),
        status: row.status as RightsDeclaration["status"],
      }))
  } catch {
    return []
  }
}

export async function getClaimsForUser(userId: string): Promise<RightsClaim[]> {
  if (!isSupabaseConfigured()) return mockClaims

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("claims")
      .select("*, mashup:mashups!mashup_id(creator_id)")

    if (error || !data) return []

    return data
      .filter(
        (row: { mashup?: { creator_id?: string | null } | null }) =>
          row.mashup?.creator_id === userId,
      )
      .map((row: Record<string, unknown>) => ({
        id: String(row.id),
        mashup_id: String(row.mashup_id),
        claimant_contact: String(row.claimant_contact),
        claim_type: String(row.claim_type),
        submitted_at: String(row.submitted_at),
        status: row.status as RightsClaim["status"],
        resolution: row.resolution ? String(row.resolution) : null,
        resolved_at: row.resolved_at ? String(row.resolved_at) : null,
      }))
  } catch {
    return []
  }
}
