export const DEMO_QUERY_KEY = "demo"

export function isDemoQuery(value: string | null | undefined): boolean {
  return value === "1" || value === "true"
}

export function isDemoExperience(value?: string | null): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || isDemoQuery(value)
}

export function isDemoRequest(request: Request): boolean {
  const demoValue = new URL(request.url).searchParams.get(DEMO_QUERY_KEY)
  return process.env.DEMO_MODE === "true" || isDemoExperience(demoValue)
}

export function buildDemoAttributionUrl(campaignId: string): string {
  const slug = campaignId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `https://www.mashups.agency/a/demo-${slug || "campaign"}`
}

export const DEMO_DRAFT_KEY = "mashups:demo-campaign-draft:v1"
