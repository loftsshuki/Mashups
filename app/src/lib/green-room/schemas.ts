import { z } from "zod"

import { GREEN_FUNNEL_EVENTS } from "./types"

export const greenIntakeSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  artistName: z.string().trim().min(2).max(100),
  trackTitle: z.string().trim().min(2).max(120),
  genre: z.string().trim().min(2).max(60),
  isrc: z.string().trim().max(20).optional(),
  masterAssetUrl: z.url(),
  masterAssetPathname: z.string().startsWith("green-room/").max(500),
  masterAssetContentType: z.string().startsWith("audio/").max(100),
  masterAssetByteSize: z.number().int().positive().max(250 * 1024 * 1024),
  masterController: z.string().trim().min(2).max(160),
  compositionController: z.string().trim().min(2).max(160),
  masterControlConfirmed: z.literal(true),
  compositionControlConfirmed: z.literal(true),
  sampleStatus: z.enum(["sample_free", "cleared_samples"]),
  stemExtractionAllowed: z.literal(true),
  crossTrackDerivativesAllowed: z.literal(true),
  inAppPlaybackAllowed: z.literal(true),
  shortVideoExportAllowed: z.boolean(),
  paidMediaAllowed: z.boolean(),
  territories: z.array(z.string().trim().min(2).max(60)).min(1).max(50),
  endsAt: z.iso.datetime().nullable().optional(),
  rightsAttested: z.literal(true),
})

export const greenEventSchema = z.object({
  eventName: z.enum(GREEN_FUNNEL_EVENTS),
  sessionId: z.string().trim().min(8).max(120),
  projectId: z.uuid().nullable().optional(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
})
