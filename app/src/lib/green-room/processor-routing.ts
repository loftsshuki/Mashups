export type GreenProcessingJobType =
  | "fingerprint"
  | "analyze"
  | "separate"
  | "render_candidates"
  | "render_video"

export interface GreenProcessorJob {
  jobType: GreenProcessingJobType
  provider: string
}

export interface GreenProcessorRoute {
  url: string
  secret: string
}

type GreenProcessorEnv = Record<string, string | undefined>

function envToken(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
}

export function resolveGreenProcessorRoute(
  job: GreenProcessorJob,
  env: GreenProcessorEnv = process.env,
): GreenProcessorRoute | null {
  const secret = env.GREEN_ROOM_PROCESSOR_SECRET
  if (!secret) return null

  const providerUrl = env[`GREEN_ROOM_${envToken(job.provider)}_PROCESSOR_URL`]
  const jobUrl = env[`GREEN_ROOM_${envToken(job.jobType)}_PROCESSOR_URL`]
  const legacyAnalyzeUrl =
    job.jobType === "analyze" ? env.GREEN_ROOM_PROCESSOR_URL : undefined
  const url = providerUrl ?? jobUrl ?? legacyAnalyzeUrl

  return url ? { url, secret } : null
}

export function buildInitialGreenProcessingPlan(
  env: GreenProcessorEnv = process.env,
) {
  const requested: GreenProcessorJob[] = [
    { jobType: "fingerprint", provider: "pex" },
    { jobType: "analyze", provider: "modal" },
    { jobType: "separate", provider: "separation" },
  ]

  const jobs = requested.filter((job) => resolveGreenProcessorRoute(job, env))
  const missing = requested.filter((job) => !resolveGreenProcessorRoute(job, env))

  return {
    jobs,
    missing,
    ready: jobs.some((job) => job.jobType === "analyze"),
  }
}
