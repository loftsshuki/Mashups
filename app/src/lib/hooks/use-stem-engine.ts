"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { StemEngine, type EngineState, type StemTrack } from "@/lib/audio/stem-engine"

export function useStemEngine() {
  const engineRef = useRef<StemEngine | null>(null)
  const [engineState, setEngineState] = useState<EngineState>("idle")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [tracks, setTracks] = useState<StemTrack[]>([])

  // Create engine on mount
  useEffect(() => {
    const engine = new StemEngine({
      onStateChange: (state) => {
        setEngineState(state)
        setTracks(engine.getTracks())
        setDuration(engine.duration)
      },
      onTimeUpdate: (time) => setCurrentTime(time),
    })
    engineRef.current = engine

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const addTrack = useCallback(async (id: string, name: string, url: string) => {
    const engine = engineRef.current
    if (!engine) return
    await engine.init() // safe to call multiple times
    await engine.addTrack(id, name, url)
    setTracks(engine.getTracks())
    setDuration(engine.duration)
  }, [])

  const removeTrack = useCallback((id: string) => {
    engineRef.current?.removeTrack(id)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const play = useCallback(() => engineRef.current?.play(), [])
  const pause = useCallback(() => engineRef.current?.pause(), [])
  const stop = useCallback(() => engineRef.current?.stop(), [])
  const seek = useCallback((t: number) => engineRef.current?.seek(t), [])

  const setVolume = useCallback((id: string, vol: number) => {
    engineRef.current?.setTrackVolume(id, vol)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setPan = useCallback((id: string, pan: number) => {
    engineRef.current?.setTrackPan(id, pan)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setMuted = useCallback((id: string, muted: boolean) => {
    engineRef.current?.setTrackMuted(id, muted)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setSolo = useCallback((id: string, solo: boolean) => {
    engineRef.current?.setTrackSolo(id, solo)
    setTracks(engineRef.current?.getTracks() ?? [])
  }, [])

  const setMasterVolume = useCallback((vol: number) => {
    engineRef.current?.setMasterVolume(vol)
  }, [])

  const exportWav = useCallback(async (): Promise<Blob | null> => {
    if (!engineRef.current) return null
    return engineRef.current.exportToWav()
  }, [])

  return {
    engineState, currentTime, duration, tracks,
    addTrack, removeTrack,
    play, pause, stop, seek,
    setVolume, setPan, setMuted, setSolo,
    setMasterVolume, exportWav,
  }
}
