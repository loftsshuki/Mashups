"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { analyzeWaveform, analyzeWaveformSegment, type WaveformData } from "@/lib/audio/waveform-analyzer"

interface UseWaveformOptions {
  barCount?: number
  startTime?: number
  duration?: number
  enabled?: boolean
}

interface UseWaveformResult {
  data: WaveformData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * React hook for loading waveform data
 */
export function useWaveform(
  audioUrl: string | null,
  options: UseWaveformOptions = {}
): UseWaveformResult {
  const {
    barCount = 100,
    startTime,
    duration,
    enabled = true,
  } = options

  const [data, setData] = useState<WaveformData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchWaveform = useCallback(async () => {
    if (!audioUrl || !enabled) {
      setData(null)
      return
    }

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      let result: WaveformData

      if (startTime !== undefined && duration !== undefined) {
        // Analyze segment
        result = await analyzeWaveformSegment(audioUrl, startTime, duration, barCount)
      } else {
        // Analyze full audio
        result = await analyzeWaveform(audioUrl, barCount)
      }

      // Check if aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      setData(result)
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return
      }
      setError(err instanceof Error ? err : new Error("Failed to analyze waveform"))
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [audioUrl, barCount, startTime, duration, enabled])

  useEffect(() => {
    void fetchWaveform()

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchWaveform])

  return {
    data,
    isLoading,
    error,
    refetch: fetchWaveform,
  }
}

/**
 * Hook for preloading multiple waveforms
 */
export function usePreloadWaveforms(
  urls: string[],
  options: { barCount?: number; onProgress?: (completed: number, total: number) => void } = {}
) {
  const { barCount = 100, onProgress } = options
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const preload = useCallback(async () => {
    if (urls.length === 0) return

    setIsLoading(true)
    setProgress(0)

    const { preAnalyzeWaveforms } = await import("@/lib/audio/waveform-analyzer")
    
    await preAnalyzeWaveforms(urls, barCount, (completed, total) => {
      const percent = Math.round((completed / total) * 100)
      setProgress(percent)
      onProgress?.(completed, total)
    })

    setIsLoading(false)
  }, [urls, barCount, onProgress])

  useEffect(() => {
    void preload()
  }, [preload])

  return { isLoading, progress, preload }
}

/**
 * Hook for caching waveform data
 */
export function useWaveformCache() {
  const clearCache = useCallback(() => {
    const { clearWaveformCache } = require("@/lib/audio/waveform-analyzer")
    clearWaveformCache()
  }, [])

  const getCacheSize = useCallback(() => {
    const { getWaveformCacheSize } = require("@/lib/audio/waveform-analyzer")
    return getWaveformCacheSize()
  }, [])

  return { clearCache, getCacheSize }
}
