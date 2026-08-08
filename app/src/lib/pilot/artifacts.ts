import type { PilotIntake, PilotOperatorConfig } from "@/lib/pilot/types"

export interface PilotCampaignPacket {
  schema: "mashups-pilot-packet-v1"
  generatedAt: string
  campaign: PilotIntake
  operatingTerms: PilotOperatorConfig
  guarantees: string[]
  exclusions: string[]
  nextActions: string[]
}

export function buildPilotCampaignPacket(intake: PilotIntake, operatorConfig: PilotOperatorConfig, generatedAt = new Date().toISOString()): PilotCampaignPacket {
  return {
    schema: "mashups-pilot-packet-v1",
    generatedAt,
    campaign: intake,
    operatingTerms: operatorConfig,
    guarantees: [
      `${operatorConfig.guaranteedLaunch.creatorFloor} creator opportunities`,
      `${operatorConfig.guaranteedLaunch.qualifiedPostFloor} qualified-post floor`,
      `${operatorConfig.guaranteedLaunch.genomeFloor} hook-genome tests`,
      `Evidence report within ${operatorConfig.guaranteedLaunch.reportDueDays} days`,
    ],
    exclusions: operatorConfig.protectionTerms.excludes,
    nextActions: ["Verify master authority", "Countersign Growth License", "Confirm creator cohort liquidity", "Lock matched-control design", "Approve campaign assets"],
  }
}

export function pilotCampaignPacketToMarkdown(packet: PilotCampaignPacket): string {
  const { campaign, operatingTerms } = packet
  return [
    `# ${campaign.campaignName}`,
    "",
    `**Artist / track:** ${campaign.artistName} / ${campaign.trackTitle}`,
    `**Program:** Founding House 001`,
    `**Markets:** ${campaign.targetMarkets.join(", ")}`,
    `**Creator cultures:** ${campaign.targetNiches.join(", ")}`,
    `**Rights state:** ${campaign.rightsReadiness}`,
    "",
    "## Guaranteed operating work",
    ...packet.guarantees.map((item) => `- ${item}`),
    "",
    "## Growth License",
    `- Territories: ${operatingTerms.growthLicense.territories.join(", ")}`,
    `- Term: ${operatingTerms.growthLicense.termDays} days`,
    `- Paid-media cap: ${money(operatingTerms.growthLicense.paidMediaCapCents)}`,
    `- Takedown SLA: ${operatingTerms.growthLicense.takedownSlaHours} hours`,
    "",
    "## Measurement",
    `- Primary metric: ${operatingTerms.measurementPlan.metric.replaceAll("_", " ")}`,
    `- Control method: ${operatingTerms.measurementPlan.controlMethod.replaceAll("_", " ")}`,
    `- Minimum cohort: ${operatingTerms.measurementPlan.minimumCohort}`,
    "",
    "## Explicit exclusions",
    ...packet.exclusions.map((item) => `- No guarantee of ${item}`),
    "",
    "## Next actions",
    ...packet.nextActions.map((item) => `- [ ] ${item}`),
    "",
    `Generated ${packet.generatedAt} by Mashups Pilot Operator. This planning packet is not a signed license.`,
  ].join("\n")
}

export function pilotPacketFilename(intake: PilotIntake, extension: "json" | "md"): string {
  const slug = `${intake.artistName}-${intake.trackTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pilot"
  return `${slug}-mashups-pilot.${extension}`
}

function money(cents: number): string { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100) }
