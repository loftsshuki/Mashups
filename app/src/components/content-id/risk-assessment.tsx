"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  analyzeContentID,
  getRiskColor,
  getRiskLabel,
  getPassFailColor,
  getPassFailBg,
  type RiskAssessment,
  type ContentIDMatch,
  type RiskLevel,
} from "@/lib/data/content-id"

interface RiskAssessmentPanelProps {
  mashupId: string
  audioFingerprint?: string
  duration: number
  className?: string
}

export function RiskAssessmentPanel({
  mashupId,
  audioFingerprint,
  duration,
  className,
}: RiskAssessmentPanelProps) {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Use provided fingerprint or generate mock
      const fingerprint = audioFingerprint || `fp_${mashupId}_${Date.now()}`
      const result = await analyzeContentID(fingerprint, duration)
      setAssessment(result)
    } catch (err) {
      setError("Failed to analyze content. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!assessment && !isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Content ID Pre-Check</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your mashup for copyright risks before publishing
              </p>
            </div>
            <Button onClick={runAnalysis} size="lg">
              Run Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Analyzing Content...</h3>
              <p className="text-sm text-muted-foreground">
                Checking against Content ID database
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <XCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className="text-red-500">{error}</p>
            <Button onClick={runAnalysis} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!assessment) return null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content ID Analysis
          </span>
          <Badge
            className={cn(
              getPassFailBg(assessment.passFail),
              getPassFailColor(assessment.passFail)
            )}
          >
            {assessment.passFail.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className={cn(
          "p-4 rounded-xl border-2",
          getRiskColor(assessment.overallRisk)
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Risk Score</span>
            <span className="text-2xl font-bold">{assessment.riskScore}/100</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all"
              style={{ width: `${assessment.riskScore}%` }}
            />
          </div>
          <p className="mt-2 text-sm">
            {getRiskLabel(assessment.overallRisk)}
          </p>
        </div>

        {/* Risk Heatmap */}
        {assessment.heatmapData.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Heatmap
            </h4>
            <RiskHeatmap heatmap={assessment.heatmapData} duration={duration} />
          </div>
        )}

        {/* Matches List */}
        {assessment.matches.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Detected Matches ({assessment.matches.length})</h4>
            <div className="space-y-3">
              {assessment.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {assessment.suggestions.map((suggestion, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted"
              >
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={runAnalysis} variant="outline" className="flex-1">
            Re-Check
          </Button>
          {assessment.passFail !== "fail" && (
            <Button className="flex-1">
              Proceed to Publish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RiskHeatmap({
  heatmap,
  duration,
}: {
  heatmap: Array<{ time: number; risk: RiskLevel; intensity: number }>
  duration: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {heatmap.map((segment, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 transition-opacity hover:opacity-80",
              segment.risk === "low" && "bg-green-500",
              segment.risk === "medium" && "bg-yellow-500",
              segment.risk === "high" && "bg-orange-500",
              segment.risk === "critical" && "bg-red-500"
            )}
            style={{ opacity: 0.2 + segment.intensity * 0.8 }}
            title={`${segment.time.toFixed(1)}s: ${getRiskLabel(segment.risk)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0:00</span>
        <span>{formatDuration(duration / 2)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: ContentIDMatch }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      getRiskColor(match.riskLevel)
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{match.trackTitle}</p>
          <p className="text-sm text-muted-foreground">{match.artist}</p>
        </div>
        <Badge variant="secondary">
          {match.matchPercentage}% match
        </Badge>
      </div>
      
      <div className="mt-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          Policy: <span className="font-medium capitalize">{match.policy}</span>
        </span>
        <span className="flex items-center gap-1">
          Segment: {formatDuration(match.matchedSegments[0]?.startTime || 0)} -{" "}
          {formatDuration(match.matchedSegments[0]?.endTime || 0)}
        </span>
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Compact version for status indicators
export function RiskBadge({ risk, score }: { risk: RiskLevel; score?: number }) {
  return (
    <Badge
      className={cn(
        "gap-1",
        getRiskColor(risk)
      )}
    >
      <Shield className="h-3 w-3" />
      {getRiskLabel(risk)}
      {score !== undefined && ` (${score})`}
    </Badge>
  )
}
