import { NextRequest, NextResponse } from "next/server"

interface VaultItem {
  id: string
  title: string
  description: string
  stemCount: number
  requirement: string
  requirementType: "mashups" | "plays" | "collabs" | "streaks" | "badges"
  threshold: number
  isUnlocked: boolean
  progress: number
}

const mockVaultItems: VaultItem[] = [
  {
    id: "vault-1",
    title: "Producer Essentials Pack",
    description: "30 premium stems across drums, bass, and synth — curated by top producers.",
    stemCount: 30,
    requirement: "Create 10 mashups",
    requirementType: "mashups",
    threshold: 10,
    isUnlocked: true,
    progress: 14,
  },
  {
    id: "vault-2",
    title: "Vocal Gold Collection",
    description: "15 studio-quality vocal stems and chops — from acapellas to harmonies.",
    stemCount: 15,
    requirement: "Reach 5,000 total plays",
    requirementType: "plays",
    threshold: 5000,
    isUnlocked: true,
    progress: 8420,
  },
  {
    id: "vault-3",
    title: "Collab Masters Pack",
    description: "20 exclusive stems — unlocked by collaborating with other creators.",
    stemCount: 20,
    requirement: "Complete 5 collaborations",
    requirementType: "collabs",
    threshold: 5,
    isUnlocked: false,
    progress: 3,
  },
  {
    id: "vault-4",
    title: "Streak Champion Toolkit",
    description: "25 rare sounds — rewarded for consistency in creation.",
    stemCount: 25,
    requirement: "Maintain a 30-day streak",
    requirementType: "streaks",
    threshold: 30,
    isUnlocked: false,
    progress: 12,
  },
  {
    id: "vault-5",
    title: "Legendary Sample Library",
    description: "50 legendary stems used by the platform's top creators.",
    stemCount: 50,
    requirement: "Earn 10 badges",
    requirementType: "badges",
    threshold: 10,
    isUnlocked: false,
    progress: 4,
  },
]

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? "mock-user"
  // In production, check user achievements against requirements
  void userId
  return NextResponse.json({ items: mockVaultItems })
}
