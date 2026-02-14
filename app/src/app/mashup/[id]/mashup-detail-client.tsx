"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Pause, Music, ShieldCheck, Sparkles, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Waveform } from "@/components/player/waveform"
import { ProgressBar } from "@/components/player/progress-bar"
import { LikeButton } from "@/components/mashup/like-button"
import { ShareButton } from "@/components/mashup/share-button"
import { CommentSectionV2 } from "@/components/mashup/comment-section-v2"
import { RemixFamilyTree } from "@/components/mashup/remix-family-tree"
import { RiskAssessmentPanel } from "@/components/content-id/risk-assessment"
import { SplitManager } from "@/components/revenue/split-manager"
import { useAudio } from "@/lib/audio/audio-context"
import { exportHookClipAsWav } from "@/lib/audio/hook-export"
import type { Track } from "@/lib/audio/types"
import {
  getForkContestsForMashup,
  type ForkContest,
} from "@/lib/data/fork-contests"
import type { MockMashup } from "@/lib/mock-data"
import type { RightsSafetyAssessment } from "@/lib/data/rights-safety"
import { trackRecommendationEvent } from "@/lib/data/recommendation-events"
import { withMashupsSignature } from "@/lib/growth/signature"
import { useEffect, useState } from "react"

interface HookGeneratorResult {
  mashupId: string
  title: string
  cutPoints: Array<{
    index: 1 | 2 | 3
    startSec: number
    durationSec: 15
    reason: string
  }>
  captionVariants: string[]
  recommendedPostWindows: Array<{
    platform: "TikTok" | "Instagram" | "YouTube"
    bestTimeLocal: string
  }>
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toString()
}

function deriveFingerprintConfidence(fingerprint: string | null): number {
  if (!fingerprint || fingerprint.length < 2) return 0.65
  const seed = Number.parseInt(fingerprint.slice(0, 2), 16)
  if (Number.isNaN(seed)) return 0.65
  const normalized = 0.55 + (seed / 255) * 0.42
  return Number(normalized.toFixed(2))
}

function riskBadgeVariant(route: RightsSafetyAssessment["route"]) {
  if (route === "allow") return "default"
  if (route === "review") return "secondary"
  return "destructive"
}

export function MashupDetailClient({
  mashup,
  lineage,
  forkedMashups,
}: {
  mashup: MockMashup
  lineage: MockMashup[]
  forkedMashups: MockMashup[]
}) {
  const { state, playTrack, toggle } = useAudio()
  const isThisTrack = state.currentTrack?.id === mashup.id
  const isPlaying = isThisTrack && state.isPlaying
  const canPlay = Boolean(mashup.audioUrl)
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null)
  const [licenseCertificateUrl, setLicenseCertificateUrl] = useState<string | null>(null)
  const [issuingLicense, setIssuingLicense] = useState(false)
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [rightsAssessment, setRightsAssessment] = useState<RightsSafetyAssessment | null>(
    null,
  )
  const [rightsLoading, setRightsLoading] = useState(true)
  const [rightsRefreshNonce, setRightsRefreshNonce] = useState(0)
  const [hookData, setHookData] = useState<HookGeneratorResult | null>(null)
  const [hookLoading, setHookLoading] = useState(false)
  const [hookSignedLink, setHookSignedLink] = useState<string | null>(null)
  const [copiedHookId, setCopiedHookId] = useState<number | null>(null)
  const [exportingHookId, setExportingHookId] = useState<number | null>(null)
  const [copiedContestId, setCopiedContestId] = useState<string | null>(null)
  const [forkContests, setForkContests] = useState<ForkContest[]>(() =>
    getForkContestsForMashup(mashup.id),
  )

  const creatorInitials = mashup.creator.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  useEffect(() => {
    void trackRecommendationEvent({
      mashupId: mashup.id,
      eventType: "open",
      context: "mashup_detail",
    })
  }, [mashup.id])

  useEffect(() => {
    let cancelled = false

    async function loadRightsAutomation() {
      setRightsLoading(true)
      try {
        const fingerprintResponse = await fetch("/api/fingerprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: mashup.id,
            audioUrl: mashup.audioUrl || undefined,
          }),
        })

        let confidence = 0.65
        if (fingerprintResponse.ok) {
          const fingerprintData = (await fingerprintResponse.json()) as {
            fingerprint?: string
          }
          if (!cancelled) {
            setFingerprint(fingerprintData.fingerprint ?? null)
          }
          confidence = deriveFingerprintConfidence(fingerprintData.fingerprint ?? null)
        } else if (!cancelled) {
          setFingerprint(null)
        }

        const riskResponse = await fetch("/api/rights/risk-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mashupId: mashup.id,
            fingerprintConfidence: confidence,
          }),
        })

        if (riskResponse.ok) {
          const riskData = (await riskResponse.json()) as {
            assessment?: RightsSafetyAssessment
          }
          if (!cancelled && riskData.assessment) {
            setRightsAssessment(riskData.assessment)
          }
        }
      } finally {
        if (!cancelled) setRightsLoading(false)
      }
    }

    void loadRightsAutomation()

    return () => {
      cancelled = true
    }
  }, [mashup.audioUrl, mashup.id, rightsRefreshNonce])

  useEffect(() => {
    let cancelled = false

    async function loadForkContests() {
      try {
        const response = await fetch(`/api/fork-contests/${mashup.id}`)
        if (!response.ok) return
        const data = (await response.json()) as { contests?: ForkContest[] }
        if (!cancelled && Array.isArray(data.contests)) {
          setForkContests(data.contests)
        }
      } catch {
        // Keep fallback contests.
      }
    }

    void loadForkContests()
    return () => {
      cancelled = true
    }
  }, [mashup.id])

  function handlePlay() {
    if (!canPlay) return
    if (isThisTrack) {
      toggle()
      return
    }
    const track: Track = {
      id: mashup.id,
      title: mashup.title,
      artist: mashup.creator.displayName,
      audioUrl: mashup.audioUrl,
      coverUrl: mashup.coverUrl,
      duration: mashup.duration,
    }
    playTrack(track)
  }

  async function handleIssueLicense() {
    setIssuingLicense(true)
    try {
      const response = await fetch("/api/licenses/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mashupId: mashup.id,
          licenseType: "organic_shorts",
          territory: "US",
          termDays: 365,
        }),
      })
      if (response.ok) {
        const data = (await response.json()) as {
          verificationUrl?: string
          certificateUrl?: string
        }
        if (data.verificationUrl) setLicenseUrl(data.verificationUrl)
        if (data.certificateUrl) setLicenseCertificateUrl(data.certificateUrl)
      }
    } finally {
      setIssuingLicense(false)
    }
  }

  async function ensureSignedShareLink(scope: string) {
    if (hookSignedLink) return hookSignedLink

    const response = await fetch("/api/attribution/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: `${scope}-${mashup.id}`,
        creatorId: mashup.creator.username,
        destination: `${window.location.origin}/mashup/${mashup.id}`,
        source: "hook_generator",
      }),
    })
    if (response.ok) {
      const data = (await response.json()) as { url?: string }
      if (data.url) {
        setHookSignedLink(data.url)
        return data.url
      }
    }
    return `${window.location.origin}/mashup/${mashup.id}`
  }

  async function generateHooks() {
    setHookLoading(true)
    try {
      const response = await fetch("/api/hooks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mashupId: mashup.id,
          bpm: mashup.bpm,
          durationSec: mashup.duration,
        }),
      })
      if (response.ok) {
        const data = (await response.json()) as { result?: HookGeneratorResult }
        if (data.result) setHookData(data.result)
      }
    } finally {
      setHookLoading(false)
    }
  }

  async function copyHookPackage(hookIndex: number) {
    if (!hookData) return
    const link = await ensureSignedShareLink("hook")
    const cut = hookData.cutPoints.find((entry) => entry.index === hookIndex)
    if (!cut) return
    const caption = hookData.captionVariants[hookIndex - 1] ?? hookData.captionVariants[0] ?? ""
    const payload = withMashupsSignature(
      `${mashup.title} | 15s hook #${hookIndex} from ${cut.startSec.toFixed(1)}s.\n${caption}\n${link}`,
    )
    await navigator.clipboard.writeText(payload)
    setCopiedHookId(hookIndex)
    setTimeout(() => setCopiedHookId((prev) => (prev === hookIndex ? null : prev)), 1800)
  }

  async function exportHookClip(hookIndex: number) {
    if (!hookData || !mashup.audioUrl) return
    const cut = hookData.cutPoints.find((entry) => entry.index === hookIndex)
    if (!cut) return

    setExportingHookId(hookIndex)
    try {
      const { blob, fileName } = await exportHookClipAsWav({
        audioUrl: mashup.audioUrl,
        startSec: cut.startSec,
        durationSec: cut.durationSec,
        fileNameBase: `${mashup.title}-hook-${hookIndex}`,
      })
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(objectUrl)
    } finally {
      setExportingHookId(null)
    }
  }

  async function copyForkContestTemplate(contestId: string, template: string) {
    const link = await ensureSignedShareLink(`fork-${contestId}`)
    const payload = withMashupsSignature(`${template}\n${link}`)
    await navigator.clipboard.writeText(payload)
    setCopiedContestId(contestId)
    setTimeout(() => setCopiedContestId((prev) => (prev === contestId ? null : prev)), 1800)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:py-12 lg:px-8">
      {/* Main layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left: Cover + creator info */}
        <div className="flex flex-col items-center gap-6 lg:items-start">
          {/* Cover image */}
          <div className="relative h-[300px] w-[300px] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={mashup.coverUrl}
              alt={mashup.title}
              fill
              unoptimized
              className="object-cover"
            />
            {/* Play overlay */}
            <button
              onClick={handlePlay}
              disabled={!canPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
              aria-label={canPlay ? (isPlaying ? "Pause" : "Play") : "Audio unavailable"}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                {isPlaying ? (
                  <Pause className="h-7 w-7 text-primary-foreground" fill="currentColor" />
                ) : (
                  <Play className="ml-1 h-7 w-7 text-primary-foreground" fill="currentColor" />
                )}
              </div>
            </button>
          </div>

          {/* Creator info */}
          <Link
            href={`/profile/${mashup.creator.username}`}
            className="group flex items-center gap-3 transition-colors"
          >
            <Avatar>
              <AvatarImage
                src={mashup.creator.avatarUrl}
                alt={mashup.creator.displayName}
              />
              <AvatarFallback>{creatorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {mashup.creator.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                @{mashup.creator.username}
              </p>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <LikeButton
              mashupId={mashup.id}
              initialCount={mashup.likeCount}
              initialLiked={false}
            />
            <ShareButton
              mashupId={mashup.id}
              title={mashup.title}
            />
            <Link
              href={`/create?fork=${mashup.id}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Fork This Mashup
            </Link>
            <button
              onClick={handleIssueLicense}
              disabled={issuingLicense}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {issuingLicense ? "Issuing..." : "Issue Shorts License"}
            </button>
          </div>
          {licenseUrl && (
            <p className="max-w-[300px] text-xs text-muted-foreground">
              License issued:{" "}
              <a href={licenseUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                verification link
              </a>
              {licenseCertificateUrl ? (
                <>
                  {" "}|
                  {" "}
                  <a
                    href={licenseCertificateUrl}
                    className="text-primary underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    certificate
                  </a>
                </>
              ) : null}
            </p>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-8">
          {/* Title and description */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mashup.title}
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {mashup.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {mashup.genre}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{mashup.bpm}</span> BPM
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatDuration(mashup.duration)}
              </span>{" "}
              duration
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatCount(mashup.playCount)}
              </span>{" "}
              plays
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Rights Automation</h2>
              </div>
              <div className="flex items-center gap-2">
                {rightsAssessment ? (
                  <Badge variant={riskBadgeVariant(rightsAssessment.route)}>
                    {rightsAssessment.route.toUpperCase()} | score {rightsAssessment.score}
                  </Badge>
                ) : (
                  <Badge variant="secondary">No score</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setRightsRefreshNonce((prev) => prev + 1)}
                  disabled={rightsLoading}
                >
                  {rightsLoading ? "Checking..." : "Re-check"}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Fingerprint:{" "}
              {fingerprint ? `${fingerprint.slice(0, 18)}...` : "Unavailable"}
            </p>
            {rightsAssessment ? (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {rightsAssessment.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {rightsLoading ? "Running automated rights checks..." : "No rights assessment available."}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border/70 bg-card/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  15-Second Hook Generator
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={generateHooks}
                disabled={hookLoading}
              >
                {hookLoading ? "Generating..." : "Generate Hooks"}
              </Button>
            </div>
            {hookData ? (
              <div className="mt-3 space-y-2">
                {hookData.cutPoints.map((cut) => (
                  <div
                    key={cut.index}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Hook #{cut.index} | {cut.durationSec}s from {cut.startSec.toFixed(1)}s
                      </p>
                      <p className="text-xs text-muted-foreground">{cut.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => copyHookPackage(cut.index)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedHookId === cut.index ? "Copied" : "Copy Export"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => exportHookClip(cut.index)}
                      disabled={!mashup.audioUrl || exportingHookId === cut.index}
                    >
                      {exportingHookId === cut.index ? "Exporting..." : "Export WAV"}
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Best post windows:{" "}
                  {hookData.recommendedPostWindows
                    .map((window) => `${window.platform} ${window.bestTimeLocal}`)
                    .join(" | ")}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Generate one-click 15s hooks, captions, and signed share links.
              </p>
            )}
          </div>

          {/* Waveform player */}
          <div className="overflow-hidden rounded-lg bg-muted/30 p-6">
            <Waveform height={96} barCount={80} />
            {isThisTrack && (
              <div className="mt-3">
                <ProgressBar showTime={true} />
              </div>
            )}
            {!isThisTrack && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Click play to load waveform
              </p>
            )}
          </div>

          <RiskAssessmentPanel
            mashupId={mashup.id}
            duration={mashup.duration}
            className="mt-6"
          />

          <RemixFamilyTree lineage={lineage} forks={forkedMashups} currentId={mashup.id} />

          <SplitManager
            mashupId={mashup.id}
            mashupTitle={mashup.title}
            className="mt-6"
          />

          {forkContests.length > 0 ? (
            <div className="rounded-lg border border-border/70 bg-card/70 p-4">
              <h2 className="text-sm font-semibold text-foreground">Remix Fork Contests</h2>
              <div className="mt-3 space-y-3">
                {forkContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="rounded-md border border-border/60 bg-background/50 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{contest.title}</p>
                      <Badge variant={contest.status === "active" ? "default" : "secondary"}>
                        {contest.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{contest.prompt}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Prize: {contest.prize} | Deadline{" "}
                      {new Date(contest.deadline).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/create?fork=${mashup.id}`}
                        className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Enter Contest
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                        onClick={() =>
                          copyForkContestTemplate(contest.id, contest.socialTemplates[0] ?? "")
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedContestId === contest.id ? "Copied" : "Copy Social Template"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Source tracks */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Source Tracks
            </h2>
            <div className="space-y-3">
              {mashup.sourceTracks.map((track, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Comments
            </h2>
            <CommentSectionV2 mashupId={mashup.id} duration={mashup.duration} />
          </div>
        </div>
      </div>
    </div>
  )
}
