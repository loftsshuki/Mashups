import "server-only"

import { z } from "zod"
import {
  GREEN_ARRANGEMENT_IDS,
  type GreenPublication,
} from "@mashups/contracts"

import { createAdminClient } from "@/lib/supabase/admin"

const sourceSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1).max(160),
  artistName: z.string().min(1).max(120),
  trackTitle: z.string().min(1).max(160),
})

const rawPublicationSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(120),
  creatorId: z.uuid(),
  parentProjectId: z.uuid().nullable(),
  publishedAt: z.iso.datetime({ offset: true }),
  arrangement: z.enum(GREEN_ARRANGEMENT_IDS),
  audioAssetId: z.uuid(),
  durationSeconds: z.coerce.number().positive().max(30.5),
  leftSource: sourceSchema,
  rightSource: sourceSchema,
})

async function loadPublicationRecord(projectId: string) {
  const admin = createAdminClient()
  if (!admin) return null

  const { data, error } = await admin.rpc("get_green_publication", {
    p_project_id: projectId,
  })
  if (error || !data) return null

  const parsed = rawPublicationSchema.safeParse(data)
  return parsed.success ? { admin, record: parsed.data } : null
}

export async function getGreenPublication(
  projectId: string,
): Promise<GreenPublication | null> {
  const loaded = await loadPublicationRecord(projectId)
  if (!loaded) return null

  const { admin, record } = loaded
  const { data: profile, error } = await admin
    .from("profiles")
    .select("username,display_name,avatar_url")
    .eq("id", record.creatorId)
    .maybeSingle()
  if (error || !profile?.username) return null

  return {
    id: record.id,
    title: record.title,
    parentProjectId: record.parentProjectId,
    publishedAt: record.publishedAt,
    arrangement: record.arrangement,
    durationSeconds: record.durationSeconds,
    creator: {
      username: String(profile.username),
      displayName:
        typeof profile.display_name === "string" ? profile.display_name : null,
      avatarUrl:
        typeof profile.avatar_url === "string" ? profile.avatar_url : null,
    },
    leftSource: record.leftSource,
    rightSource: record.rightSource,
  }
}

export async function getGreenPublicationAudioAsset(projectId: string) {
  const loaded = await loadPublicationRecord(projectId)
  if (!loaded) return null

  const { data: asset, error } = await loaded.admin
    .from("green_track_assets")
    .select("blob_url,content_type,quarantined_at,asset_kind")
    .eq("id", loaded.record.audioAssetId)
    .maybeSingle()
  if (
    error ||
    !asset ||
    asset.asset_kind !== "preview" ||
    asset.quarantined_at ||
    typeof asset.blob_url !== "string" ||
    typeof asset.content_type !== "string"
  ) {
    return null
  }

  return {
    blobUrl: asset.blob_url,
    contentType: asset.content_type,
  }
}
