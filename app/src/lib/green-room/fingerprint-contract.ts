import { z } from "zod"

export const greenFingerprintEvidenceSchema = z.object({
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  sampleScanStatus: z.enum(["clear", "flagged", "unavailable"]),
  providerReference: z.string().trim().min(1).max(240),
  matchCount: z.number().int().min(0).max(1_000_000),
}).superRefine((value, ctx) => {
  if (value.sampleScanStatus === "clear" && value.matchCount !== 0) {
    ctx.addIssue({ code: "custom", message: "Clear fingerprint evidence cannot include matches." })
  }
})

export type GreenFingerprintEvidence = z.infer<typeof greenFingerprintEvidenceSchema>

export type GreenFingerprintProviderResult = {
  reference: string
  matches: number
  unavailable?: boolean
}

export function normalizeGreenFingerprintEvidence(
  sourceSha256: string,
  provider: GreenFingerprintProviderResult,
): GreenFingerprintEvidence {
  const input = {
    sourceSha256: sourceSha256.toLowerCase(),
    sampleScanStatus: provider.unavailable
      ? "unavailable" as const
      : provider.matches > 0
        ? "flagged" as const
        : "clear" as const,
    providerReference: provider.reference,
    matchCount: provider.matches,
  }
  return greenFingerprintEvidenceSchema.parse(input)
}

export function assertFingerprintSource(
  evidence: GreenFingerprintEvidence,
  expectedSourceSha256: string,
) {
  const parsed = greenFingerprintEvidenceSchema.parse(evidence)
  if (parsed.sourceSha256.toLowerCase() !== expectedSourceSha256.toLowerCase()) {
    throw new Error("Fingerprint evidence does not match the authorized source hash.")
  }
  return parsed
}
