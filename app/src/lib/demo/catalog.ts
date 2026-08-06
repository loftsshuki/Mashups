export const DEMO_CREATOR = {
  id: "demo-creator",
  username: "nova.wav",
  displayName: "Nova Reyes",
  bio: "Producer and short-form director building high-energy club edits.",
  weeklyGrowth: 18.4,
  followers: 12840,
} as const

export const DEMO_TRACKS = [
  {
    id: "demo-neon-run",
    title: "Neon Run",
    creator: DEMO_CREATOR,
    genre: "Club / Jersey",
    bpm: 138,
    duration: 143,
    rightsMode: "Creator-safe",
    momentum: 92,
    weeklyUses: 384,
    accent: "orange",
  },
  {
    id: "demo-after-image",
    title: "After Image",
    creator: { ...DEMO_CREATOR, username: "lowlight", displayName: "Lowlight" },
    genre: "Alt R&B",
    bpm: 104,
    duration: 176,
    rightsMode: "Open remix",
    momentum: 87,
    weeklyUses: 241,
    accent: "blue",
  },
  {
    id: "demo-hard-reset",
    title: "Hard Reset",
    creator: { ...DEMO_CREATOR, username: "softcrash", displayName: "Soft Crash" },
    genre: "Hyperpop",
    bpm: 154,
    duration: 129,
    rightsMode: "Creator-safe",
    momentum: 81,
    weeklyUses: 196,
    accent: "acid",
  },
] as const

export const DEMO_CHALLENGES = [
  { id: "demo-cut-on-impact", title: "Cut on Impact", brief: "Build a 15-second reveal around one unmistakable drop.", prize: "$1,000", sponsor: "Mashups", endsIn: "2d 14h", entries: 128 },
  { id: "demo-night-shift", title: "Night Shift", brief: "Score an after-dark transition without using dialogue.", prize: "$500", sponsor: "Afterhours", endsIn: "5d 08h", entries: 74 },
] as const

export const DEMO_ANALYTICS = {
  period: "Last 7 days",
  views: 184200,
  attributedClicks: 12840,
  saves: 9680,
  followerLift: 1240,
  topHook: "Drop-first / 00:42",
  nextMove: "Lead with the vocal cut, publish between 7:30 and 9:00 PM, and keep the caption under 80 characters.",
  series: [42, 54, 48, 71, 68, 88, 100],
} as const

export const DEMO_EARNINGS = {
  availableCents: 184250,
  pendingCents: 48600,
  monthCents: 312400,
  sources: [
    { label: "Licenses", cents: 178400, share: 57 },
    { label: "Referrals", cents: 84300, share: 27 },
    { label: "Challenges", cents: 49700, share: 16 },
  ],
} as const

export const DEMO_CAMPAIGN = {
  id: "demo-campaign-neon-run",
  title: "Neon Run launch",
  track: DEMO_TRACKS[0],
  hooks: [
    { id: "hook-drop", label: "Drop first", start: 42, duration: 15, score: 96 },
    { id: "hook-vocal", label: "Vocal turn", start: 18, duration: 15, score: 89 },
    { id: "hook-build", label: "Tension cut", start: 31, duration: 15, score: 84 },
  ],
  captions: [
    "This drop changes the whole cut. Use the sound and show us your switch.",
    "Wait for the turn at 00:07. Built with rights-safe audio on Mashups.",
    "One track, three hooks. Which opening wins?",
  ],
} as const
