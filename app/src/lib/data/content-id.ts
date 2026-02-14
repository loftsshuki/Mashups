// Content ID Pre-Check System
// Simulates YouTube Content ID risk assessment

export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface ContentIDMatch {
  id: string
  trackId: string
  trackTitle: string
  artist: string
  matchPercentage: number // 0-100
  matchedSegments: Array<{
    startTime: number // seconds
    endTime: number
    confidence: number
  }>
  policy: "monetize" | "track" | "block" | "mute"
  riskLevel: RiskLevel
}

export interface RiskAssessment {
  overallRisk: RiskLevel
  riskScore: number // 0-100
  matches: ContentIDMatch[]
  passFail: "pass" | "review" | "fail"
  suggestions: string[]
  heatmapData: Array<{
    time: number
    risk: RiskLevel
    intensity: number // 0-1
  }>
}

export interface PreCheckResult {
  mashupId: string
  assessment: RiskAssessment
  checkedAt: string
  expiresAt: string
}

// Risk thresholds
const RISK_THRESHOLDS = {
  low: { max: 25, label: "Low Risk" },
  medium: { max: 50, label: "Medium Risk" },
  high: { max: 75, label: "High Risk" },
  critical: { max: 100, label: "Critical Risk" },
}

// Mock Content ID database
const MOCK_CONTENT_ID_DB: Array<{
  title: string
  artist: string
  fingerprints: string[]
  policy: ContentIDMatch["policy"]
}> = [
  { title: "Blinding Lights", artist: "The Weeknd", fingerprints: ["fingerprint_001"], policy: "monetize" },
  { title: "Levitating", artist: "Dua Lipa", fingerprints: ["fingerprint_002"], policy: "track" },
  { title: "Good 4 U", artist: "Olivia Rodrigo", fingerprints: ["fingerprint_003"], policy: "block" },
  { title: "Stay", artist: "Kid LAROI & Justin Bieber", fingerprints: ["fingerprint_004"], policy: "monetize" },
  { title: "Heat Waves", artist: "Glass Animals", fingerprints: ["fingerprint_005"], policy: "track" },
]

// Simulate Content ID analysis
export async function analyzeContentID(
  audioFingerprint: string,
  trackDuration: number
): Promise<RiskAssessment> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Generate mock matches based on fingerprint hash
  const matches: ContentIDMatch[] = []
  const hash = audioFingerprint.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  
  // Simulate finding 0-3 matches
  const numMatches = hash % 4
  for (let i = 0; i < numMatches; i++) {
    const dbEntry = MOCK_CONTENT_ID_DB[(hash + i) % MOCK_CONTENT_ID_DB.length]
    const matchPercent = 60 + ((hash + i * 10) % 40)
    
    matches.push({
      id: `match_${i}`,
      trackId: `track_${i}`,
      trackTitle: dbEntry.title,
      artist: dbEntry.artist,
      matchPercentage: matchPercent,
      matchedSegments: [
        {
          startTime: hash % Math.floor(trackDuration / 2),
          endTime: (hash % Math.floor(trackDuration / 2)) + 30,
          confidence: matchPercent / 100,
        },
      ],
      policy: dbEntry.policy,
      riskLevel: getRiskLevelFromPolicy(dbEntry.policy, matchPercent),
    })
  }
  
  // Calculate overall risk
  const riskScore = calculateRiskScore(matches)
  const overallRisk = getRiskLevelFromScore(riskScore)
  
  // Generate suggestions
  const suggestions = generateSuggestions(matches, overallRisk)
  
  // Generate heatmap data
  const heatmapData = generateHeatmap(matches, trackDuration)
  
  return {
    overallRisk,
    riskScore,
    matches,
    passFail: getPassFailStatus(riskScore, matches),
    suggestions,
    heatmapData,
  }
}

function getRiskLevelFromPolicy(
  policy: ContentIDMatch["policy"],
  matchPercent: number
): RiskLevel {
  switch (policy) {
    case "block":
      return "critical"
    case "mute":
      return "high"
    case "track":
      return matchPercent > 80 ? "high" : "medium"
    case "monetize":
      return matchPercent > 90 ? "medium" : "low"
    default:
      return "low"
  }
}

function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.low.max) return "low"
  if (score <= RISK_THRESHOLDS.medium.max) return "medium"
  if (score <= RISK_THRESHOLDS.high.max) return "high"
  return "critical"
}

function calculateRiskScore(matches: ContentIDMatch[]): number {
  if (matches.length === 0) return 0
  
  const totalRisk = matches.reduce((sum, match) => {
    const policyMultiplier =
      match.policy === "block" ? 4 :
      match.policy === "mute" ? 3 :
      match.policy === "track" ? 2 : 1
    
    return sum + (match.matchPercentage * policyMultiplier)
  }, 0)
  
  return Math.min(100, Math.round(totalRisk / matches.length))
}

function getPassFailStatus(
  riskScore: number,
  matches: ContentIDMatch[]
): "pass" | "review" | "fail" {
  const hasBlock = matches.some(m => m.policy === "block")
  const hasMute = matches.some(m => m.policy === "mute")
  
  if (hasBlock || riskScore > 75) return "fail"
  if (hasMute || riskScore > 50) return "review"
  return "pass"
}

function generateSuggestions(
  matches: ContentIDMatch[],
  overallRisk: RiskLevel
): string[] {
  const suggestions: string[] = []
  
  if (matches.length === 0) {
    suggestions.push("✅ No Content ID matches found - safe to publish")
    return suggestions
  }
  
  // Add policy-specific suggestions
  matches.forEach(match => {
    if (match.policy === "block") {
      suggestions.push(`🚫 Remove or replace "${match.trackTitle}" - will be blocked`)
    } else if (match.policy === "mute") {
      suggestions.push(`🔇 Consider removing "${match.trackTitle}" segment - will be muted`)
    } else if (match.policy === "track") {
      suggestions.push(`⚠️ "${match.trackTitle}" will be claimed but not blocked`)
    } else if (match.policy === "monetize") {
      suggestions.push(`💰 "${match.trackTitle}" may share revenue`)
    }
  })
  
  // Add general suggestions based on risk
  if (overallRisk === "high" || overallRisk === "critical") {
    suggestions.push("🎚️ Reduce volume of matched segments")
    suggestions.push("✂️ Shorten or remove high-risk segments")
    suggestions.push("🎛️ Apply more transformative effects (pitch, tempo)")
  } else if (overallRisk === "medium") {
    suggestions.push("📊 Review matched segments on timeline")
    suggestions.push("🎚️ Consider reducing match intensity")
  }
  
  return suggestions
}

function generateHeatmap(
  matches: ContentIDMatch[],
  duration: number
): Array<{ time: number; risk: RiskLevel; intensity: number }> {
  const heatmap: Array<{ time: number; risk: RiskLevel; intensity: number }> = []
  const segments = 50 // 50 segments across duration
  const segmentDuration = duration / segments
  
  for (let i = 0; i < segments; i++) {
    const time = i * segmentDuration
    let maxRisk: RiskLevel = "low"
    let maxIntensity = 0
    
    // Check if this segment overlaps with any match
    matches.forEach(match => {
      match.matchedSegments.forEach(seg => {
        if (time >= seg.startTime && time <= seg.endTime) {
          const riskValue =
            match.riskLevel === "critical" ? 4 :
            match.riskLevel === "high" ? 3 :
            match.riskLevel === "medium" ? 2 : 1
          
          const currentRiskValue =
            maxRisk === "critical" ? 4 :
            maxRisk === "high" ? 3 :
            maxRisk === "medium" ? 2 : 1
          
          if (riskValue > currentRiskValue) {
            maxRisk = match.riskLevel
            maxIntensity = seg.confidence
          }
        }
      })
    })
    
    heatmap.push({ time, risk: maxRisk, intensity: maxIntensity })
  }
  
  return heatmap
}

// Helper functions for UI
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "low": return "text-green-500 bg-green-500/10 border-green-500/20"
    case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20"
    case "critical": return "text-red-500 bg-red-500/10 border-red-500/20"
    default: return "text-gray-500 bg-gray-500/10"
  }
}

export function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case "low": return "Low Risk"
    case "medium": return "Medium Risk"
    case "high": return "High Risk"
    case "critical": return "Critical Risk"
    default: return "Unknown"
  }
}

export function getPassFailColor(status: "pass" | "review" | "fail"): string {
  switch (status) {
    case "pass": return "text-green-500"
    case "review": return "text-yellow-500"
    case "fail": return "text-red-500"
    default: return "text-gray-500"
  }
}

export function getPassFailBg(status: "pass" | "review" | "fail"): string {
  switch (status) {
    case "pass": return "bg-green-500/10"
    case "review": return "bg-yellow-500/10"
    case "fail": return "bg-red-500/10"
    default: return "bg-gray-500/10"
  }
}

// Export for batch checking
export async function batchContentCheck(
  mashupIds: string[]
): Promise<Map<string, RiskAssessment>> {
  const results = new Map<string, RiskAssessment>()
  
  for (const id of mashupIds) {
    // Mock fingerprint generation
    const fingerprint = `fp_${id}_${Date.now()}`
    const assessment = await analyzeContentID(fingerprint, 180)
    results.set(id, assessment)
  }
  
  return results
}
