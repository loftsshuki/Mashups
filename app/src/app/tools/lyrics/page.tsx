"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, Music, Search, Download, Globe, Play, Pause, Type, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { NeonPage, NeonHero, NeonSectionHeader, NeonGrid } from "@/components/marketing/neon-page"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { getLyricsForMashup, searchByLyrics, SUPPORTED_LANGUAGES } from "@/lib/data/lyrics"
import type { LyricsRecord } from "@/lib/data/types"

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
}

function LyricsContent() {
  const [lyrics, setLyrics] = useState<LyricsRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [language, setLanguage] = useState("en")
  const [karaokeMode, setKaraokeMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ mashup_id: string; matched_text: string; confidence: number }>>([])
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load mock lyrics on mount
  useEffect(() => {
    async function load() {
      const record = await getLyricsForMashup("mashup-demo-001")
      setLyrics(record)
      setLoading(false)
    }
    load()
  }, [])

  // Karaoke playback timer
  useEffect(() => {
    if (isPlaying && lyrics) {
      const startOffset = currentTime
      const startedAt = Date.now()
      const lastEnd = lyrics.synced_lyrics[lyrics.synced_lyrics.length - 1]?.endTime ?? 0

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000
        const newTime = startOffset + elapsed
        if (newTime >= lastEnd) {
          setIsPlaying(false)
          setCurrentTime(0)
          if (timerRef.current) clearInterval(timerRef.current)
        } else {
          setCurrentTime(newTime)
        }
      }, 50)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, lyrics, currentTime])

  const handleTranscribe = useCallback(async () => {
    setTranscribing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const record = await getLyricsForMashup("mashup-demo-001")
    setLyrics(record)
    setTranscribing(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (!isPlaying && lyrics) {
      // Start from the beginning of the first line
      const firstStart = lyrics.synced_lyrics[0]?.startTime ?? 0
      if (currentTime === 0 || currentTime >= (lyrics.synced_lyrics[lyrics.synced_lyrics.length - 1]?.endTime ?? 0)) {
        setCurrentTime(firstStart)
      }
    }
    setIsPlaying(prev => !prev)
  }, [isPlaying, lyrics, currentTime])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await searchByLyrics(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }, [searchQuery])

  const handleExport = useCallback((format: "srt" | "vtt" | "json" | "txt") => {
    if (!lyrics) return

    let content = ""
    const lines = lyrics.synced_lyrics

    switch (format) {
      case "srt":
        content = lines.map((line, i) => {
          const start = formatTimestamp(line.startTime).replace(".", ",")
          const end = formatTimestamp(line.endTime).replace(".", ",")
          return `${i + 1}\n00:${start} --> 00:${end}\n${line.text}\n`
        }).join("\n")
        break
      case "vtt":
        content = "WEBVTT\n\n" + lines.map(line => {
          const start = formatTimestamp(line.startTime)
          const end = formatTimestamp(line.endTime)
          return `00:${start} --> 00:${end}\n${line.text}\n`
        }).join("\n")
        break
      case "json":
        content = JSON.stringify(lyrics.synced_lyrics, null, 2)
        break
      case "txt":
        content = lines.map(l => l.text).join("\n")
        break
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lyrics.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }, [lyrics])

  // Determine active line/word for karaoke highlighting
  const activeLine = lyrics?.synced_lyrics.findIndex(
    line => currentTime >= line.startTime && currentTime <= line.endTime
  ) ?? -1

  const activeWordIndex = activeLine >= 0 && lyrics?.synced_lyrics[activeLine]?.words
    ? lyrics.synced_lyrics[activeLine].words!.findIndex(
        w => currentTime >= w.startTime && currentTime <= w.endTime
      )
    : -1

  if (loading) {
    return (
      <NeonPage>
        <Skeleton className="h-64 rounded-xl" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </NeonPage>
    )
  }

  return (
    <NeonPage>
      <NeonHero
        eyebrow="Tools"
        title="Lyrics & Transcription"
        description="Auto-transcribe, sync, and search lyrics across all your mashups"
      />

      {/* Controls Row */}
      <NeonGrid className="sm:grid-cols-4">
        <div className="neon-panel rounded-2xl p-4 text-center">
          <FileText className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {lyrics?.synced_lyrics.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Total Lines</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Globe className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {SUPPORTED_LANGUAGES.find(l => l.code === (lyrics?.language ?? language))?.name ?? "English"}
          </p>
          <p className="text-xs text-muted-foreground">Language</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Mic className="mx-auto h-5 w-5 text-green-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {lyrics?.confidence ?? 0}%
          </p>
          <p className="text-xs text-muted-foreground">Confidence</p>
        </div>
        <div className="neon-panel rounded-2xl p-4 text-center">
          <Music className="mx-auto h-5 w-5 text-purple-500" />
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {lyrics?.source ?? "none"}
          </p>
          <p className="text-xs text-muted-foreground">Source</p>
        </div>
      </NeonGrid>

      {/* Transcribe + Language Controls */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleTranscribe} disabled={transcribing}>
          {transcribing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Transcribing...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Transcribe
            </>
          )}
        </Button>

        <Button
          variant={karaokeMode ? "default" : "outline"}
          onClick={() => setKaraokeMode(prev => !prev)}
        >
          <Type className="mr-2 h-4 w-4" />
          Karaoke Mode
        </Button>

        <Button variant="outline" onClick={togglePlayback} disabled={!lyrics}>
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Synced Lyrics Display */}
      {lyrics && (
        <div className="mt-8">
          <NeonSectionHeader
            title="Synced Lyrics"
            description="Timestamped lyrics with word-level timing"
          />

          <Card className="mt-4">
            <CardContent className="p-6 space-y-2">
              {lyrics.synced_lyrics.map((line, lineIdx) => {
                const isActive = lineIdx === activeLine
                return (
                  <div
                    key={lineIdx}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-2 transition-colors",
                      isActive && karaokeMode && "bg-primary/10",
                      isActive && !karaokeMode && "bg-muted"
                    )}
                  >
                    <Badge variant="secondary" className="mt-0.5 shrink-0 font-mono text-xs">
                      {formatTimestamp(line.startTime)}
                    </Badge>
                    <p className="text-sm leading-relaxed">
                      {karaokeMode && line.words ? (
                        line.words.map((w, wIdx) => {
                          const isWordActive = isActive && wIdx === activeWordIndex
                          const isPast = isActive && activeWordIndex > wIdx
                          return (
                            <span
                              key={wIdx}
                              className={cn(
                                "transition-colors duration-150",
                                isWordActive && "text-primary font-bold",
                                isPast && isActive && "text-primary/70",
                                !isActive && "text-foreground"
                              )}
                            >
                              {w.word}{wIdx < line.words!.length - 1 ? " " : ""}
                            </span>
                          )
                        })
                      ) : (
                        <span className={cn(isActive && "font-medium text-foreground")}>
                          {line.text}
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8">
        <NeonSectionHeader
          title="Export"
          description="Download lyrics in various formats"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => handleExport("srt")} disabled={!lyrics}>
            <Download className="mr-2 h-4 w-4" />
            SRT
          </Button>
          <Button variant="outline" onClick={() => handleExport("vtt")} disabled={!lyrics}>
            <Download className="mr-2 h-4 w-4" />
            VTT
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")} disabled={!lyrics}>
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport("txt")} disabled={!lyrics}>
            <Download className="mr-2 h-4 w-4" />
            Plain Text
          </Button>
        </div>
      </div>

      {/* Search by Lyrics */}
      <div className="mt-8">
        <NeonSectionHeader
          title="Search by Lyrics"
          description="Find mashups by searching their lyrics content"
        />

        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Search lyrics across all mashups..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {searchResults.map((result, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-mono text-sm font-medium">{result.mashup_id}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {result.matched_text}
                      </p>
                    </div>
                    <Badge variant={result.confidence >= 90 ? "default" : "secondary"}>
                      {result.confidence}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </NeonPage>
  )
}

export default function LyricsPage() {
  return (
    <AuthGuard>
      <LyricsContent />
    </AuthGuard>
  )
}
