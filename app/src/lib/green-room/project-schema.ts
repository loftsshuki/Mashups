import { z } from "zod"
import { GREEN_ARRANGEMENT_IDS } from "@mashups/contracts"

const sourcesSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("prototype"), leftId: z.string().min(1).max(80), rightId: z.string().min(1).max(80), catalogVersion: z.string().min(1).max(80) }),
  z.object({ kind: z.literal("catalog"), leftId: z.uuid(), rightId: z.uuid() }),
]).refine((sources) => sources.leftId !== sources.rightId, "Choose two different sources.")

export const greenProjectInputSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(120),
  sources: sourcesSchema,
  intensity: z.number().int().min(55).max(100),
  selectedArrangement: z.enum(GREEN_ARRANGEMENT_IDS).nullable(),
  expectedRevision: z.number().int().min(0).max(2_147_483_646),
})

export const greenSavedProjectSchema = greenProjectInputSchema.omit({ expectedRevision: true }).extend({
  revision: z.number().int().positive(),
  status: z.enum(["draft", "rendering", "ready", "published", "archived"]),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})
