import type { OutreachWorkspace, PilotWorkspace } from "@/lib/pilot/types"

export const DEMO_PILOT_WORKSPACE: PilotWorkspace = {
  mode: "demo",
  programs: [{ id: "program-demo", code: "FOUNDING-HOUSE-001", name: "Founding House 001", genre: "Electronic", marketCodes: ["MIA-HOUSE", "LDN-HOUSE", "BER-HOUSE", "NYC-HOUSE", "LAX-HOUSE"], creatorTarget: 50, qualifiedPostTarget: 50, budgetFloorCents: 500000, budgetCeilingCents: 2500000, rightsRequirements: ["Master authority verified", "Organic short-form", "Hook edits", "Creator whitelisting", "Paid social cap", "Explicit territories"] }],
  markets: [
    { code: "MIA-HOUSE", city: "Miami", countryCode: "US", primaryMotion: "nightlife-to-festival", creatorTarget: 75, venueTarget: 5, targetNiches: ["Nightlife", "Fitness", "Fashion"], partnerThesis: "Turn repeated room exposure into attributed saves." },
    { code: "LDN-HOUSE", city: "London", countryCode: "GB", primaryMotion: "fashion-to-club", creatorTarget: 75, venueTarget: 5, targetNiches: ["Fashion", "Dance", "Nightlife"], partnerThesis: "Pair tastemaker labels with fashion and dance creators." },
    { code: "BER-HOUSE", city: "Berlin", countryCode: "DE", primaryMotion: "club-to-community", creatorTarget: 75, venueTarget: 7, targetNiches: ["Dance", "Production", "Nightlife"], partnerThesis: "Lead with trusted captains and proof-rich venue activation." },
    { code: "NYC-HOUSE", city: "New York", countryCode: "US", primaryMotion: "culture-to-nightlife", creatorTarget: 75, venueTarget: 5, targetNiches: ["Fashion", "Culture", "Nightlife"], partnerThesis: "Connect dance catalogs to culture pages and city cells." },
    { code: "LAX-HOUSE", city: "Los Angeles", countryCode: "US", primaryMotion: "creator-to-paid", creatorTarget: 75, venueTarget: 4, targetNiches: ["Fitness", "Lifestyle", "Dance"], partnerThesis: "License only creator-native organic winners for paid use." },
  ],
  intake: { id: "intake-demo", campaignName: "Midnight Velocity / Founding Pilot", artistName: "Nia Vale", trackTitle: "Midnight Velocity", contactName: "Mara Chen", contactEmail: "mara@niavale.example", genre: "Electronic", subgenre: "Melodic house", releaseStage: "unreleased", releaseDate: "2026-09-04", objectives: ["Prove creator-market fit", "Generate attributed saves", "Find paid-ready posts"], targetMarkets: ["MIA-HOUSE", "LDN-HOUSE", "BER-HOUSE"], targetNiches: ["Nightlife", "Fashion", "Dance"], targetCreatorCount: 50, creatorBudgetCents: 250000, paidMediaBudgetCents: 500000, masterUrl: "https://assets.mashups.agency/demo/midnight-velocity.wav", rightsReadiness: "verified", status: "qualified", notes: "Artist is available for winner reactions and one live squad session." },
  operatorConfig: { intakeId: "intake-demo", status: "ready", guaranteedLaunch: { creatorFloor: 50, qualifiedPostFloor: 50, genomeFloor: 3, reportDueDays: 14 }, growthLicense: { territories: ["Worldwide"], termDays: 90, paidMediaCapCents: 2500000, takedownSlaHours: 24 }, exclusivity: { type: "campaign", days: 90, slots: 3 }, artistParticipation: { reactionCount: 5, repostCount: 3, liveSessionCount: 1 }, partnerRails: ["linkfire", "featurefm", "ad_platform"], measurementPlan: { metric: "save_rate", controlMethod: "matched_holdout", minimumCohort: 100 }, commercialOffer: { tier: "pilot", creatorRewardCents: 5000, platformFeeCents: 250000 }, protectionTerms: { enabled: true, serviceCreditCapCents: 250000, excludes: ["streams", "revenue", "chart position", "virality"] } },
  checklist: [
    { key: "master-authority", category: "rights", label: "Master authority verified", required: true, status: "ready", detail: "Rightsholder and permitted campaign uses are documented." },
    { key: "growth-license", category: "rights", label: "Growth License terms configured", required: true, status: "ready", detail: "90 days, worldwide, paid cap attached." },
    { key: "hook-genomes", category: "creative", label: "Three hook genomes selected", required: true, status: "ready", detail: "Drop, confession, and fit-check structures." },
    { key: "creator-liquidity", category: "creator", label: "Creator floor is fillable", required: true, status: "ready", detail: "Three target city cells exceed the 50-creator floor." },
    { key: "measurement", category: "measurement", label: "Matched holdout designed", required: true, status: "ready", detail: "100-observation minimum per cohort." },
    { key: "artist-contract", category: "commercial", label: "Artist participation accepted", required: true, status: "ready", detail: "Reactions, reposts, and live session bound." },
    { key: "partner-rails", category: "partner", label: "Attribution rails connected", required: true, status: "ready", detail: "Smart link, pre-save, and paid handoff configured." },
    { key: "production-backend", category: "deployment", label: "Production Supabase connected", required: true, status: "blocked", detail: "Replacement Supabase creation is blocked by account billing." },
  ],
}

export const DEMO_OUTREACH_WORKSPACE: OutreachWorkspace = {
  mode: "demo",
  prospects: [
    { id: "prospect-1", entityName: "Night Current Records", entityType: "label", contactName: "Elena Ruiz", contactEmail: "elena@nightcurrent.example", city: "Miami", countryCode: "US", genres: ["Melodic house", "Afro house"], catalogSignal: "Three active releases; artist-controlled masters", priority: 5, stage: "meeting", nextAction: "Review two-track pilot shortlist", dueAt: "2026-08-10T15:00:00.000Z", sourceUrl: null, notes: "Founder-led and responsive." },
    { id: "prospect-2", entityName: "Static Bloom", entityType: "label", contactName: "Tom Becker", contactEmail: "tom@staticbloom.example", city: "Berlin", countryCode: "DE", genres: ["Progressive house", "Techno"], catalogSignal: "Strong club network and upcoming EP", priority: 5, stage: "replied", nextAction: "Send MGL one-page terms", dueAt: "2026-08-09T12:00:00.000Z", sourceUrl: null, notes: null },
    { id: "prospect-3", entityName: "Southbank Dance Distribution", entityType: "distributor", contactName: "Imani Cole", contactEmail: "imani@southbank.example", city: "London", countryCode: "GB", genres: ["House", "Garage"], catalogSignal: "42 independent labels in dance roster", priority: 4, stage: "contacted", nextAction: "Follow up with partner data flow", dueAt: "2026-08-12T12:00:00.000Z", sourceUrl: null, notes: null },
    { id: "prospect-4", entityName: "Room 11", entityType: "venue", contactName: "Kai Morgan", contactEmail: "kai@room11.example", city: "New York", countryCode: "US", genres: ["House"], catalogSignal: "Weekly Thursday residency", priority: 3, stage: "qualified", nextAction: "Pitch QR save activation", dueAt: "2026-08-14T12:00:00.000Z", sourceUrl: null, notes: null },
    { id: "prospect-5", entityName: "Sundown Artist Office", entityType: "artist_manager", contactName: null, contactEmail: null, city: "Los Angeles", countryCode: "US", genres: ["Dance pop", "House"], catalogSignal: "Two releases inside 90 days", priority: 4, stage: "research", nextAction: "Find digital lead", dueAt: null, sourceUrl: null, notes: null },
    { id: "prospect-6", entityName: "Motion Dept", entityType: "creator_agency", contactName: "Alex Kim", contactEmail: "alex@motiondept.example", city: "Los Angeles", countryCode: "US", genres: ["Fitness", "Dance"], catalogSignal: "Performance-priced niche roster", priority: 3, stage: "pilot", nextAction: "Confirm 12 creator slots", dueAt: "2026-08-11T18:00:00.000Z", sourceUrl: null, notes: null },
  ],
  templates: [
    { code: "FOUNDING-LABEL-EMAIL", stage: "qualified", channel: "email", subject: "A controlled creator test for {{track_title}}", body: "We run a 14-day, rights-bound creator test for independent electronic releases. Mashups delivers hook testing, creator opportunities, attribution, and a matched-control lift report." },
    { code: "MANAGER-DM", stage: "qualified", channel: "dm", subject: null, body: "We are selecting a small founding cohort of independent electronic artists for controlled short-form tests. Rights stay explicit and creators are paid." },
  ],
}
