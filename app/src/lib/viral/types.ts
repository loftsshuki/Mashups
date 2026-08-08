export type ViralPlatform = "tiktok" | "instagram" | "youtube"
export type LaunchPhase = "draft" | "testing" | "mobilizing" | "live" | "completed"
export type ViralEventType =
  | "page_view"
  | "save_click"
  | "share_intent"
  | "template_start"
  | "squad_join"
  | "vote"
  | "follow_click"
  | "qualified_post"

export interface TemplateGenome {
  id: string
  name: string
  parentId: string | null
  platform: ViralPlatform
  niche: string
  hookStartSec: number
  hookDurationSec: number
  openingFrame: string
  pattern: string
  textBeats: string[]
  shotCount: number
  forkCount: number
  qualifiedActivations: number
  completionRate: number
  shareRate: number
  saveRate: number
  viralScore: number
}

export interface CreatorSquad {
  id: string
  name: string
  identity: string
  captain: string
  memberCount: number
  qualifiedPosts: number
  score: number
  rank: number
}

export interface CampaignRaid {
  id: string
  name: string
  phase: "test" | "scale" | "blast"
  startsAt: string
  targetCreators: number
  activatedCreators: number
  status: "queued" | "active" | "complete"
}

export interface CommunityUnlock {
  id: string
  title: string
  action: "posts" | "saves" | "forks" | "shares"
  target: number
  current: number
  reward: string
  unlocked: boolean
}

export interface ArtistCommitment {
  id: string
  label: string
  target: number
  completed: number
}

export interface SaveDestination {
  platform: "spotify" | "apple" | "youtube"
  url: string
}

export interface ViralLaunch {
  id: string
  slug: string
  title: string
  artistName: string
  trackTitle: string
  trackAudioUrl: string | null
  objective: string
  phase: LaunchPhase
  startsAt: string
  endsAt: string
  releaseAt: string | null
  isPreRelease: boolean
  bountyCents: number
  creatorsActivated: number
  qualifiedPosts: number
  totalForks: number
  totalSaves: number
  totalShares: number
  creatorKFactor: number
  saveDestinations: SaveDestination[]
  genomes: TemplateGenome[]
  squads: CreatorSquad[]
  raids: CampaignRaid[]
  unlocks: CommunityUnlock[]
  artistCommitments: ArtistCommitment[]
}

export interface CreateViralLaunchInput {
  title: string
  artistName: string
  trackTitle: string
  objective: string
  startsAt: string
  releaseAt?: string | null
  bountyCents: number
  testCreators: number
  scaleCreators: number
  niches: string[]
  artistReactionCount: number
  saveDestinations: SaveDestination[]
}

export function calculateGenomeScore(input: {
  completionRate: number
  shareRate: number
  saveRate: number
  forkRate: number
}): number {
  const bounded = (value: number) => Math.max(0, Math.min(1, value))
  const score =
    bounded(input.completionRate) * 25 +
    bounded(input.shareRate) * 30 +
    bounded(input.saveRate) * 25 +
    bounded(input.forkRate) * 20
  return Math.round(score * 100) / 100
}

export function calculateCreatorKFactor(publishingCreators: number, recruitedCreators: number): number {
  if (publishingCreators <= 0) return 0
  return Math.round((recruitedCreators / publishingCreators) * 100) / 100
}

export function calculateUnlockProgress(unlock: CommunityUnlock): number {
  if (unlock.target <= 0) return 100
  return Math.min(100, Math.round((unlock.current / unlock.target) * 100))
}

export function isQualifiedActivation(input: {
  rightsValid: boolean
  attributed: boolean
  fraudScore: number
  engagedViews: number
  meaningfulActions: number
}): boolean {
  return (
    input.rightsValid &&
    input.attributed &&
    input.fraudScore < 0.65 &&
    input.engagedViews >= 100 &&
    input.meaningfulActions >= 3
  )
}

export function launchShareCaption(launch: ViralLaunch, genome: TemplateGenome): string {
  return `I forked \"${genome.name}\" for ${launch.artistName}'s ${launch.trackTitle}. Make your version and keep the chain alive.`
}
