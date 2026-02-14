import { createClient } from "@/lib/supabase/client"
import type {
  AudioFingerprintRecord,
  WatermarkEmbedding,
  WatermarkCustodyEvent,
} from "./types"

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const mockFingerprints: AudioFingerprintRecord[] = [
  {
    id: "fp-001",
    mashup_id: "mashup-001",
    user_id: "mock-user",
    fingerprint_hash: "sha256:a3b8c1d4e5f6789012345678abcdef01",
    spectral_features: { zeroCrossingRate: 0.12, rmsEnergy: 0.45 },
    duration_seconds: 234,
    created_at: "2026-02-10T12:00:00Z",
  },
  {
    id: "fp-002",
    mashup_id: "mashup-002",
    user_id: "mock-user",
    fingerprint_hash: "sha256:b4c9d2e6f7890123456789abcdef02",
    spectral_features: { zeroCrossingRate: 0.08, rmsEnergy: 0.62 },
    duration_seconds: 198,
    created_at: "2026-02-08T15:30:00Z",
  },
]

const mockEmbeddings: WatermarkEmbedding[] = [
  {
    id: "wm-001",
    mashup_id: "mashup-001",
    fingerprint_id: "fp-001",
    watermark_type: "metadata",
    payload: { creatorId: "mock-user", platform: "mashups.com", version: "1.0" },
    embedded_at: "2026-02-10T12:05:00Z",
  },
  {
    id: "wm-002",
    mashup_id: "mashup-001",
    fingerprint_id: "fp-001",
    watermark_type: "inaudible",
    payload: { frequency: 18500, amplitude: 0.002 },
    embedded_at: "2026-02-10T12:05:00Z",
  },
]

const mockCustodyLog: WatermarkCustodyEvent[] = [
  {
    id: "cl-001",
    fingerprint_id: "fp-001",
    event_type: "created",
    platform: null,
    detected_url: null,
    detected_by: null,
    confidence: 1.0,
    metadata: { source: "upload" },
    occurred_at: "2026-02-10T12:00:00Z",
  },
  {
    id: "cl-002",
    fingerprint_id: "fp-001",
    event_type: "exported",
    platform: "tiktok",
    detected_url: null,
    detected_by: null,
    confidence: 1.0,
    metadata: { format: "mp4", duration: 15 },
    occurred_at: "2026-02-11T09:30:00Z",
  },
  {
    id: "cl-003",
    fingerprint_id: "fp-001",
    event_type: "detected",
    platform: "youtube",
    detected_url: "https://youtube.com/watch?v=example123",
    detected_by: null,
    confidence: 0.94,
    metadata: { matchDuration: 12.5, title: "Cool Remix" },
    occurred_at: "2026-02-12T14:00:00Z",
  },
  {
    id: "cl-004",
    fingerprint_id: "fp-001",
    event_type: "verified",
    platform: "instagram",
    detected_url: "https://instagram.com/p/example456",
    detected_by: "user-003",
    confidence: 0.87,
    metadata: { matchDuration: 8.2 },
    occurred_at: "2026-02-13T10:15:00Z",
  },
  {
    id: "cl-005",
    fingerprint_id: "fp-002",
    event_type: "created",
    platform: null,
    detected_url: null,
    detected_by: null,
    confidence: 1.0,
    metadata: { source: "upload" },
    occurred_at: "2026-02-08T15:30:00Z",
  },
  {
    id: "cl-006",
    fingerprint_id: "fp-002",
    event_type: "exported",
    platform: "soundcloud",
    detected_url: null,
    detected_by: null,
    confidence: 1.0,
    metadata: { format: "wav" },
    occurred_at: "2026-02-09T11:00:00Z",
  },
]

export async function getFingerprintsForUser(
  userId: string,
): Promise<AudioFingerprintRecord[]> {
  if (!isSupabaseConfigured()) return mockFingerprints

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("audio_fingerprints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as AudioFingerprintRecord[]
  } catch {
    return []
  }
}

export async function getCustodyLog(
  fingerprintId: string,
): Promise<WatermarkCustodyEvent[]> {
  if (!isSupabaseConfigured())
    return mockCustodyLog.filter((e) => e.fingerprint_id === fingerprintId)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("watermark_custody_log")
      .select("*")
      .eq("fingerprint_id", fingerprintId)
      .order("occurred_at", { ascending: true })

    if (error || !data) return []
    return data as WatermarkCustodyEvent[]
  } catch {
    return []
  }
}

export async function getEmbeddingsForMashup(
  mashupId: string,
): Promise<WatermarkEmbedding[]> {
  if (!isSupabaseConfigured())
    return mockEmbeddings.filter((e) => e.mashup_id === mashupId)

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("watermark_embeddings")
      .select("*")
      .eq("mashup_id", mashupId)
      .order("embedded_at", { ascending: false })

    if (error || !data) return []
    return data as WatermarkEmbedding[]
  } catch {
    return []
  }
}

export async function getAllCustodyEvents(
  userId: string,
): Promise<WatermarkCustodyEvent[]> {
  if (!isSupabaseConfigured()) return mockCustodyLog

  try {
    const supabase = createClient()
    const { data: fingerprints } = await supabase
      .from("audio_fingerprints")
      .select("id")
      .eq("user_id", userId)

    if (!fingerprints?.length) return []

    const fpIds = fingerprints.map((f: { id: string }) => f.id)
    const { data, error } = await supabase
      .from("watermark_custody_log")
      .select("*")
      .in("fingerprint_id", fpIds)
      .order("occurred_at", { ascending: false })

    if (error || !data) return []
    return data as WatermarkCustodyEvent[]
  } catch {
    return []
  }
}

export const CUSTODY_EVENT_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "#22c55e" },
  exported: { label: "Exported", color: "#3b82f6" },
  detected: { label: "Detected", color: "#f97316" },
  claimed: { label: "Claimed", color: "#ef4444" },
  verified: { label: "Verified", color: "#8b5cf6" },
}
