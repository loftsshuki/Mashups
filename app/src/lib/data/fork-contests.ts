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

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function getForkContestsForMashupFromDb(
  mashupId: string,
): Promise<ForkContest[]> {
  if (!isSupabaseConfigured()) return getForkContestsForMashup(mashupId)

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: contestsData, error } = await supabase
      .from("fork_contests")
      .select("id,external_id,mashup_id,title,prompt,prize_text,deadline,status")
      .eq("mashup_id", mashupId)
      .order("deadline", { ascending: true })

    if (error || !contestsData || contestsData.length === 0) {
      return getForkContestsForMashup(mashupId)
    }

    const contestRows = contestsData as Record<string, unknown>[]

    const contestIds = contestRows
      .map((row) => (typeof row.id === "string" ? row.id : null))
      .filter((value): value is string => Boolean(value))

    let templateMap = new Map<string, string[]>()
    if (contestIds.length > 0) {
      const { data: templateRows } = await supabase
        .from("fork_contest_social_templates")
        .select("contest_id,template_text,position")
        .in("contest_id", contestIds)
        .order("position", { ascending: true })

      templateMap = new Map<string, string[]>()
      for (const row of (templateRows as Record<string, unknown>[] | null) ?? []) {
        const contestId = typeof row.contest_id === "string" ? row.contest_id : null
        const templateText =
          typeof row.template_text === "string" ? row.template_text : null
        if (!contestId || !templateText) continue
        const current = templateMap.get(contestId) ?? []
        templateMap.set(contestId, [...current, templateText])
      }
    }

    return contestRows.map((row, index) => {
      const contestId = typeof row.id === "string" ? row.id : `contest-${index + 1}`
      return {
        id:
          typeof row.external_id === "string" && row.external_id.length > 0
            ? row.external_id
            : contestId,
        mashupId: typeof row.mashup_id === "string" ? row.mashup_id : mashupId,
        title: typeof row.title === "string" ? row.title : "Fork Contest",
        prompt: typeof row.prompt === "string" ? row.prompt : "Fork this track.",
        prize: typeof row.prize_text === "string" ? row.prize_text : "Prize TBA",
        deadline:
          typeof row.deadline === "string" ? row.deadline : new Date().toISOString(),
        status:
          row.status === "active" || row.status === "upcoming" || row.status === "closed"
            ? row.status
            : "upcoming",
        socialTemplates:
          templateMap.get(contestId) ??
          ["Fork this winner track and share your version with attribution."],
      }
    })
  } catch {
    return getForkContestsForMashup(mashupId)
  }
}
