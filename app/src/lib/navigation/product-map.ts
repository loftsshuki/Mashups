export const primaryNavigation = [
  { href: "/discover", label: "Discover" },
  { href: "/campaigns/new", label: "Create" },
  { href: "/challenges", label: "Challenges" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/earnings", label: "Earnings" },
] as const

export const labNavigation = [
  { href: "/studio", label: "Live studio", note: "Co-create in real time" },
  { href: "/packs", label: "Weekly packs", note: "Hook-ready drops" },
  { href: "/momentum", label: "Momentum feed", note: "What is moving now" },
  { href: "/scoreboard", label: "Scoreboard", note: "Growth over followers" },
  { href: "/battles", label: "Beat battles", note: "Head-to-head voting" },
  { href: "/labs", label: "All experiments", note: "The complete laboratory" },
] as const

export const productPillars = [
  { href: "/campaigns/new", label: "Campaign studio", status: "Core" },
  { href: "/discover", label: "Momentum discovery", status: "Core" },
  { href: "/challenges", label: "Challenge engine", status: "Core" },
  { href: "/dashboard/rights", label: "Rights operations", status: "Core" },
  { href: "/dashboard/analytics", label: "Performance brief", status: "Core" },
  { href: "/studio", label: "Live collaboration", status: "Lab" },
  { href: "/battles", label: "Beat battles", status: "Lab" },
  { href: "/tools", label: "Specialized tools", status: "Lab" },
] as const
