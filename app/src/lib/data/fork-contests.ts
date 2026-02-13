export interface ForkContest {
  id: string
  mashupId: string
  title: string
  prompt: string
  prize: string
  deadline: string
  status: "active" | "upcoming" | "closed"
  socialTemplates: string[]
}

export const forkContests: ForkContest[] = [
  {
    id: "fork-001",
    mashupId: "mash-001",
    title: "Midnight Flip Challenge",
    prompt: "Fork this track and build a darker drop for late-night reels.",
    prize: "$750 + featured growth pack slot",
    deadline: "2026-03-06T23:59:59Z",
    status: "active",
    socialTemplates: [
      "Forked Midnight Groove. Vote this remix in the challenge bracket.",
      "New branch from Midnight Groove. Stitch this drop and tag your version.",
      "Fork contest entry: late-night synth flip, rights-safe and ready.",
    ],
  },
  {
    id: "fork-002",
    mashupId: "mash-002",
    title: "Neon Energy Battle",
    prompt: "Flip this drop into a 15s hook and a 30s paid-ad safe cut.",
    prize: "Brand placement + Pro Studio annual plan",
    deadline: "2026-03-13T23:59:59Z",
    status: "upcoming",
    socialTemplates: [
      "Neon Energy Battle entry. Which cut wins the hook test?",
      "Forking Neon Beats for a short-form challenge run.",
      "Built this branch from Neon Beats. Rate the drop timing.",
    ],
  },
]

export function getForkContestsForMashup(mashupId: string): ForkContest[] {
  return forkContests
    .filter((contest) => contest.mashupId === mashupId)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
}

