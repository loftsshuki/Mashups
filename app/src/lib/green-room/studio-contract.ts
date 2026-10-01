/** Shared, dependency-free client contract. SQL remains authoritative. */
export type StudioCandidate = {
  id: string
  arrangement: string
  durationSeconds: number
  qualityStatus: string
  keepReviews: number
  audioPath: string
  integratedLufs?: number | null
  truePeakDb?: number | null
  technicalPass?: boolean | null
  renderer?: string | null
}
export type StudioJob = {
  id: string
  status: string
  errorCode: string | null
  errorMessage?: string | null
  attemptCount?: number
  maxAttempts?: number
  leaseExpiresAt?: string | null
}
export type StudioSnapshot = {
  id: string
  title: string
  revision: number
  status: string
  selectedCandidateId: string | null
  parentProjectId: string | null
  candidates: StudioCandidate[]
  job: StudioJob | null
  publicationPath: string | null
}
export function studioPath(id?: string) {
  return `/create?mode=catalog${id ? `&project=${encodeURIComponent(id)}` : ""}`
}
export function candidateAudioPath(projectId: string, candidateId: string) {
  return `/api/green/studio/audio?${new URLSearchParams({ projectId, candidateId })}`
}
export function parseByteRange(value: string | null, size: number): { start: number; end: number } | null {
  if (!value || !Number.isSafeInteger(size) || size < 1) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(value)
  if (!match || (!match[1] && !match[2])) return null
  let start: number, end: number
  if (!match[1]) {
    const length = Number(match[2])
    if (!Number.isSafeInteger(length) || length < 1) return null
    start = Math.max(0, size - length); end = size - 1
  } else {
    start = Number(match[1]); end = match[2] ? Number(match[2]) : size - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null
    end = Math.min(end, size - 1)
  }
  return { start, end }
}
export function publicationBlocker(project: StudioSnapshot): string | null {
  if (project.status === "published") return null
  if (project.status !== "ready") return "Finish rendering before publishing."
  const selected = project.candidates.find(candidate => candidate.id === project.selectedCandidateId)
  if (!selected) return "Keep one of the rendered candidates."
  if (selected.qualityStatus !== "passed") return "The selected candidate still needs audio quality review."
  if (selected.keepReviews < 2) return "Two independent keep reviews are required."
  return null
}
