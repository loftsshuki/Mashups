import assert from "node:assert/strict"
import { test } from "node:test"

import { prospectsToCsv } from "../src/lib/pilot/csv.ts"
import type { OutreachProspect } from "../src/lib/pilot/types.ts"

test("outreach export quotes commas and neutralizes embedded quotes", () => {
  const prospect: OutreachProspect = { id: "one", entityName: "House, Inc.", entityType: "label", contactName: 'A "Lead"', contactEmail: "lead@example.com", city: "Miami", countryCode: "US", genres: ["House", "Dance"], catalogSignal: "Active", priority: 5, stage: "qualified", nextAction: "Email", dueAt: null, sourceUrl: null, notes: null }
  const csv = prospectsToCsv([prospect])
  assert.match(csv, /"House, Inc\."/)
  assert.match(csv, /"A ""Lead"""/)
  assert.match(csv, /House \| Dance/)
})
