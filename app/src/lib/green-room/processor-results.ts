export type GreenSampleScanStatus = "clear" | "flagged" | "unavailable"

export interface GreenFingerprintResult {
  sampleScanStatus: GreenSampleScanStatus
  providerReference?: string
  matchCount?: number
}

const SAMPLE_SCAN_STATUSES = new Set<GreenSampleScanStatus>([
  "clear",
  "flagged",
  "unavailable",
])

export function parseGreenSampleScanStatus(value: unknown): GreenSampleScanStatus | null {
  return typeof value === "string" &&
    SAMPLE_SCAN_STATUSES.has(value as GreenSampleScanStatus)
    ? (value as GreenSampleScanStatus)
    : null
}

export function sampleScanStatusFromJobOutput(
  output: unknown,
): GreenSampleScanStatus | null {
  if (!output || typeof output !== "object") return null
  const record = output as Record<string, unknown>
  return parseGreenSampleScanStatus(record.sampleScanStatus)
}

export function preferSpecialistSampleScan(
  analysisStatus: GreenSampleScanStatus,
  fingerprintOutput: unknown,
): GreenSampleScanStatus {
  return sampleScanStatusFromJobOutput(fingerprintOutput) ?? analysisStatus
}
