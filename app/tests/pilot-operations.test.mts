import assert from "node:assert/strict"
import { test } from "node:test"

import { buildPilotCampaignPacket, pilotCampaignPacketToMarkdown } from "../src/lib/pilot/artifacts.ts"
import { parseProspectsCsv, prospectsToCsv } from "../src/lib/pilot/csv.ts"
import { parseLocalPilotWorkspace } from "../src/lib/pilot/local-workspace.ts"
import type { OutreachProspect, PilotIntake, PilotOperatorConfig } from "../src/lib/pilot/types.ts"

test("outreach export quotes commas and neutralizes embedded quotes", () => {
  const prospect: OutreachProspect = { id: "one", entityName: "House, Inc.", entityType: "label", contactName: 'A "Lead"', contactEmail: "lead@example.com", city: "Miami", countryCode: "US", genres: ["House", "Dance"], catalogSignal: "Active", priority: 5, stage: "qualified", nextAction: "Email", dueAt: null, sourceUrl: null, notes: null }
  const csv = prospectsToCsv([prospect])
  assert.match(csv, /"House, Inc\."/)
  assert.match(csv, /"A ""Lead"""/)
  assert.match(csv, /House \| Dance/)
})

test("outreach export neutralizes spreadsheet formulas", () => {
  const prospect: OutreachProspect = { id: "formula", entityName: "=HYPERLINK(\"bad\")", entityType: "label", contactName: null, contactEmail: null, city: null, countryCode: null, genres: ["House"], catalogSignal: null, priority: 3, stage: "research", nextAction: null, dueAt: null, sourceUrl: null, notes: null }
  assert.match(prospectsToCsv([prospect]), /"'=HYPERLINK/)
})

test("outreach CSV import accepts quoted fields and rejects blank entities", () => {
  const csv = "entity_name,entity_type,contact_name,genres,priority,stage\r\n\"House, Inc.\",label,Ana,House | Techno,5,qualified\r\n,venue,,House,2,research"
  const result = parseProspectsCsv(csv, "2026-08-07T12:00:00.000Z")
  assert.equal(result.prospects.length, 1)
  assert.equal(result.rejectedRows, 1)
  assert.equal(result.prospects[0].entityName, "House, Inc.")
  assert.deepEqual(result.prospects[0].genres, ["House", "Techno"])
})

test("local pilot workspace ignores corrupt payloads", () => {
  assert.equal(parseLocalPilotWorkspace("not-json"), null)
  assert.equal(parseLocalPilotWorkspace('{"version":2,"updatedAt":"now"}'), null)
})

test("campaign packet preserves guarantees and explicit exclusions", () => {
  const intake = { id: "pilot", campaignName: "Pilot", artistName: "Artist", trackTitle: "Track", contactName: "Owner", contactEmail: "owner@example.com", genre: "Electronic", subgenre: "House", releaseStage: "unreleased", releaseDate: null, objectives: ["Prove lift"], targetMarkets: ["MIA-HOUSE"], targetNiches: ["Nightlife"], targetCreatorCount: 50, creatorBudgetCents: 250000, paidMediaBudgetCents: 500000, masterUrl: null, rightsReadiness: "verified", status: "qualified", notes: null } satisfies PilotIntake
  const config = { intakeId: "pilot", status: "ready", guaranteedLaunch: { creatorFloor: 50, qualifiedPostFloor: 50, genomeFloor: 3, reportDueDays: 14 }, growthLicense: { territories: ["Worldwide"], termDays: 90, paidMediaCapCents: 2500000, takedownSlaHours: 24 }, exclusivity: { type: "campaign", days: 90, slots: 3 }, artistParticipation: { reactionCount: 5, repostCount: 3, liveSessionCount: 1 }, partnerRails: ["linkfire"], measurementPlan: { metric: "save_rate", controlMethod: "matched_holdout", minimumCohort: 100 }, commercialOffer: { tier: "pilot", creatorRewardCents: 5000, platformFeeCents: 250000 }, protectionTerms: { enabled: true, serviceCreditCapCents: 250000, excludes: ["streams", "virality"] } } satisfies PilotOperatorConfig
  const packet = buildPilotCampaignPacket(intake, config, "2026-08-07T12:00:00.000Z")
  const markdown = pilotCampaignPacketToMarkdown(packet)
  assert.match(markdown, /50 creator opportunities/)
  assert.match(markdown, /No guarantee of virality/)
  assert.match(markdown, /not a signed license/)
})
