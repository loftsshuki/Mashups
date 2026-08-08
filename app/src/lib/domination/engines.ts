import type { ArIntelligence, CampaignQuote, LaunchProtection, LiftMetric, TrustAssessment } from "@/lib/domination/types"

export function calculateIncrementalLift(input: {
  metric: LiftMetric["metric"]
  treatmentVisitors: number
  treatmentConversions: number
  controlVisitors: number
  controlConversions: number
}): LiftMetric {
  const treatmentVisitors = positiveInteger(input.treatmentVisitors)
  const controlVisitors = positiveInteger(input.controlVisitors)
  const treatmentConversions = boundedInteger(input.treatmentConversions, treatmentVisitors)
  const controlConversions = boundedInteger(input.controlConversions, controlVisitors)
  const treatmentRate = treatmentConversions / treatmentVisitors
  const controlRate = controlConversions / controlVisitors
  const absoluteLift = treatmentRate - controlRate
  const relativeLift = controlRate > 0 ? absoluteLift / controlRate : treatmentRate > 0 ? 1 : 0
  const pooledRate = (treatmentConversions + controlConversions) / (treatmentVisitors + controlVisitors)
  const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / treatmentVisitors + 1 / controlVisitors))
  const zScore = standardError > 0 ? absoluteLift / standardError : 0
  const confidence = clamp(normalCdf(Math.abs(zScore)) * 2 - 1, 0, 0.999)
  return {
    metric: input.metric,
    treatmentVisitors,
    treatmentConversions,
    controlVisitors,
    controlConversions,
    treatmentRate: round(treatmentRate),
    controlRate: round(controlRate),
    absoluteLift: round(absoluteLift),
    relativeLift: round(relativeLift),
    confidence: round(confidence),
    credible: confidence >= 0.95 && treatmentVisitors >= 100 && controlVisitors >= 100,
  }
}

export function assessTrust(input: {
  rightsVerified: boolean
  audienceOverlap: number
  engagementAnomaly: number
  duplicateContentRate: number
  suspiciousSaveRate: number
  payoutDisputes: number
}): TrustAssessment {
  const signals = [
    { label: "Rights chain", impact: input.rightsVerified ? 0 : -35, status: input.rightsVerified ? "clear" : "blocked" },
    { label: "Audience overlap", impact: -Math.round(clamp(input.audienceOverlap, 0, 1) * 18), status: input.audienceOverlap > 0.55 ? "warning" : "clear" },
    { label: "Engagement velocity", impact: -Math.round(clamp(input.engagementAnomaly, 0, 1) * 22), status: input.engagementAnomaly > 0.6 ? "warning" : "clear" },
    { label: "Duplicate content", impact: -Math.round(clamp(input.duplicateContentRate, 0, 1) * 12), status: input.duplicateContentRate > 0.5 ? "warning" : "clear" },
    { label: "Save integrity", impact: -Math.round(clamp(input.suspiciousSaveRate, 0, 1) * 25), status: input.suspiciousSaveRate > 0.35 ? "blocked" : "clear" },
    { label: "Payout history", impact: -Math.min(20, Math.max(0, input.payoutDisputes) * 5), status: input.payoutDisputes > 2 ? "warning" : "clear" },
  ] as TrustAssessment["signals"]
  const score = Math.max(0, Math.min(100, 100 + signals.reduce((sum, signal) => sum + signal.impact, 0)))
  return { score, level: score >= 80 ? "verified" : score >= 55 ? "review" : "restricted", signals, assessedAt: new Date().toISOString() }
}

export function priceCampaign(input: {
  tier: CampaignQuote["tier"]
  targetCreators: number
  mediaBudgetCents: number
  creatorRewardCents: number
}): CampaignQuote {
  const creators = Math.max(10, Math.min(10_000, Math.round(input.targetCreators)))
  const platformFeeCents = input.tier === "pilot" ? 250_000 : input.tier === "growth" ? 750_000 : 200_000
  const creatorBudgetCents = creators * Math.max(1_500, input.creatorRewardCents)
  const mediaBudgetCents = Math.max(0, Math.round(input.mediaBudgetCents))
  const operationsFeeCents = Math.round((creatorBudgetCents + mediaBudgetCents) * (input.tier === "label_os" ? 0.1 : 0.15))
  return {
    tier: input.tier,
    platformFeeCents,
    creatorBudgetCents,
    mediaBudgetCents,
    operationsFeeCents,
    totalCents: platformFeeCents + creatorBudgetCents + mediaBudgetCents + operationsFeeCents,
    deliverables: [
      `${creators} creator opportunities`,
      "Three hook-genome tests",
      "Rights and trust verification",
      "Incremental-lift report",
      input.tier === "pilot" ? "14-day operating window" : "Paid-winner handoff",
    ],
  }
}

export function qualifyLaunchProtection(input: {
  platformFeeCents: number
  rightsVerified: boolean
  trustScore: number
  treatmentSample: number
  controlSample: number
  artistContractAccepted: boolean
  measurementConnected: boolean
}): LaunchProtection {
  const conditions = [
    { label: "Rights verified", passed: input.rightsVerified, detail: "Master and permitted campaign uses are verified." },
    { label: "Trust threshold", passed: input.trustScore >= 80, detail: `${input.trustScore}/100 trust score; 80 required.` },
    { label: "Treatment sample", passed: input.treatmentSample >= 100, detail: `${input.treatmentSample}/100 minimum observations.` },
    { label: "Control sample", passed: input.controlSample >= 100, detail: `${input.controlSample}/100 minimum observations.` },
    { label: "Artist participation", passed: input.artistContractAccepted, detail: "Artist obligations are contractually accepted." },
    { label: "Measurement connected", passed: input.measurementConnected, detail: "At least one streaming and one social rail are connected." },
  ]
  const passed = conditions.filter((condition) => condition.passed).length
  return {
    status: passed === conditions.length ? "eligible" : passed >= 4 ? "conditional" : "ineligible",
    serviceCreditCents: passed === conditions.length ? Math.min(Math.max(0, input.platformFeeCents), 500_000) : 0,
    conditions,
    terms: "Operational service-credit protection only. This is not insurance and does not guarantee streams, revenue, chart position, or virality.",
  }
}

export function scoreArIntelligence(input: {
  lift: LiftMetric
  creatorKFactor: number
  trustScore: number
  completionRate: number
  strongestHookSec: number
  niche: string
  city: string
  costPerQualifiedActivationCents: number
}): ArIntelligence {
  const probability = clamp(
    input.lift.confidence * 0.25 +
    clamp(input.lift.relativeLift / 3, 0, 1) * 0.25 +
    clamp(input.creatorKFactor / 1.5, 0, 1) * 0.2 +
    clamp(input.trustScore / 100, 0, 1) * 0.15 +
    clamp(input.completionRate, 0, 1) * 0.15,
    0,
    0.99,
  )
  return {
    breakoutProbability: Math.round(probability * 100),
    strongestHookSec: Math.max(0, Math.round(input.strongestHookSec)),
    recommendedNiche: input.niche,
    recommendedCity: input.city,
    expectedQualifiedActivationCents: Math.max(0, Math.round(input.costPerQualifiedActivationCents)),
    paidReadiness: Math.round(clamp((input.trustScore / 100) * 0.45 + input.lift.confidence * 0.35 + input.completionRate * 0.2, 0, 1) * 100),
    explanation: [
      `${Math.round(input.lift.relativeLift * 100)}% incremental ${input.lift.metric.replaceAll("_", " ")} lift`,
      `${input.creatorKFactor.toFixed(2)} creator reproduction factor`,
      `${input.trustScore}/100 evidence trust`,
    ],
  }
}

export function scoreMashupsIndex(input: {
  lift: LiftMetric
  creatorKFactor: number
  trustScore: number
  qualifiedPosts: number
  verifiedSaves: number
  rightsAccepted: boolean
}): { qualified: boolean; score: number; components: Record<string, number> } {
  const components = {
    incrementalLift: input.lift.credible ? clamp(input.lift.relativeLift / 2, 0, 1) * 30 : 0,
    creatorReproduction: clamp(input.creatorKFactor / 1.5, 0, 1) * 25,
    trustAndRights: input.rightsAccepted ? clamp(input.trustScore / 100, 0, 1) * 25 : 0,
    qualifiedIntent: clamp(input.qualifiedPosts / 50, 0, 1) * 10 + clamp(input.verifiedSaves / 1000, 0, 1) * 10,
  }
  return {
    qualified: input.lift.credible && input.rightsAccepted && input.trustScore >= 55 && input.qualifiedPosts >= 5,
    score: Math.round(Object.values(components).reduce((sum, value) => sum + value, 0) * 100) / 100,
    components,
  }
}

function positiveInteger(value: number): number { return Math.max(1, Math.round(Number.isFinite(value) ? value : 0)) }
function boundedInteger(value: number, max: number): number { return Math.max(0, Math.min(max, Math.round(Number.isFinite(value) ? value : 0))) }
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)) }
function round(value: number): number { return Math.round(value * 10_000) / 10_000 }

function normalCdf(value: number): number {
  const x = value / Math.sqrt(2)
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t
  const erf = 1 - polynomial * Math.exp(-x * x)
  return 0.5 * (1 + (x < 0 ? -erf : erf))
}
