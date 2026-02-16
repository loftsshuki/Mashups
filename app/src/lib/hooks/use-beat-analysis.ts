"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { analyzeTrack, checkCompatibility, type TrackAnalysis, type CompatibilityResult } from "@/lib/audio/beat-detector"

interface UseBeatAnalysisOptions {
  enabled?: boolean
}

interface UseBeatAnalysisResult {
  analysis: TrackAnalysis | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * React hook for beat/BPM/key analysis
 */
export function useBeatAnalysis(
  audioUrl: string | null,
  options: UseBeatAnalysisOptions = {}
): UseBeatAnalysisResult {
  const { enabled = true } = options
  
  const [analysis, setAnalysis] = useState<TrackAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAnalysis = useCallback(async () => {
    if (!audioUrl || !enabled) {
      setAnalysis(null)
      return
    }

    // Skip placeholder/dev URLs that will 404
    if (audioUrl.startsWith("/audio/dev-upload-")) {
      setAnalysis(null)
      return
    }

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const result = await analyzeTrack(audioUrl)

      if (abortControllerRef.current.signal.aborted) {
        return
      }

      setAnalysis(result)
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return
      }
      console.warn("[BeatAnalysis] Analysis failed for URL:", audioUrl, err)
      setError(err instanceof Error ? err : new Error("Failed to analyze track"))
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }, [audioUrl, enabled])

  useEffect(() => {
    void fetchAnalysis()

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchAnalysis])

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchAnalysis,
  }
}

/**
 * Hook for comparing two tracks
 */
export function useTrackCompatibility(
  track1Url: string | null,
  track2Url: string | null
): {
  compatibility: CompatibilityResult | null
  track1Analysis: TrackAnalysis | null
  track2Analysis: TrackAnalysis | null
  isLoading: boolean
} {
  const { analysis: analysis1, isLoading: loading1 } = useBeatAnalysis(track1Url)
  const { analysis: analysis2, isLoading: loading2 } = useBeatAnalysis(track2Url)

  const compatibility = useCallback(() => {
    if (!analysis1 || !analysis2) return null
    return checkCompatibility(analysis1, analysis2)
  }, [analysis1, analysis2])()

  return {
    compatibility,
    track1Analysis: analysis1,
    track2Analysis: analysis2,
    isLoading: loading1 || loading2,
  }
}

/**
 * Hook for analyzing multiple tracks
 */
export function useMultiTrackAnalysis(
  audioUrls: string[]
): {
  analyses: Map<string, TrackAnalysis>
  isLoading: boolean
  progress: number
} {
  const [analyses, setAnalyses] = useState<Map<string, TrackAnalysis>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (audioUrls.length === 0) {
      setAnalyses(new Map())
      setProgress(0)
      return
    }

    let cancelled = false

    async function analyzeAll() {
      setIsLoading(true)
      setProgress(0)

      const results = new Map<string, TrackAnalysis>()

      for (let i = 0; i < audioUrls.length; i++) {
        if (cancelled) break

        try {
          const analysis = await analyzeTrack(audioUrls[i])
          results.set(audioUrls[i], analysis)
        } catch (error) {
          console.error(`Failed to analyze ${audioUrls[i]}:`, error)
        }

        setProgress(Math.round(((i + 1) / audioUrls.length) * 100))
      }

      if (!cancelled) {
        setAnalyses(results)
        setIsLoading(false)
      }
    }

    void analyzeAll()

    return () => {
      cancelled = true
    }
  }, [audioUrls])

  return { analyses, isLoading, progress }
}

/**
 * Hook for manual BPM tapping
 */
export function useBPMTap(): {
  bpm: number | null
  tap: () => void
  reset: () => void
  taps: number
} {
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [bpm, setBPM] = useState<number | null>(null)

  const tap = useCallback(() => {
    const now = Date.now()
    
    setTapTimes((prev) => {
      // Remove taps older than 2 seconds
      const recentTaps = prev.filter((t) => now - t < 2000)
      const newTaps = [...recentTaps, now]
      
      // Calculate BPM from intervals
      if (newTaps.length >= 2) {
        const intervals: number[] = []
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1])
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const calculatedBPM = Math.round(60000 / avgInterval)
        
        // Clamp to reasonable range
        if (calculatedBPM >= 40 && calculatedBPM <= 300) {
          setBPM(calculatedBPM)
        }
      }
      
      return newTaps
    })
  }, [])

  const reset = useCallback(() => {
    setTapTimes([])
    setBPM(null)
  }, [])

  return {
    bpm,
    tap,
    reset,
    taps: tapTimes.length,
  }
}
