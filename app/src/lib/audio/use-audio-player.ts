import { useRef, useEffect, useCallback } from "react"
import { useAudio } from "./audio-context"
import type { Howl as HowlType } from "howler"

/**
 * useAudioPlayer
 *
 * Integrates Howler.js with the AudioContext state. This hook should be called
 * exactly once at the app level (inside <AudioEngine> rendered by AudioProvider).
 *
 * It manages the lifecycle of Howl instances — creating, playing, pausing,
 * seeking, volume, mute, and cleanup — all driven by the PlayerState from context.
 *
 * Howler is imported dynamically inside useEffect to avoid SSR breakage.
 */
export function useAudioPlayer() {
  const { state, dispatch, next } = useAudio()

  const howlRef = useRef<HowlType | null>(null)
  const rafRef = useRef<number | null>(null)
  // Keep a ref to `next` so the Howl `onend` callback always has the latest version
  const nextRef = useRef(next)
  nextRef.current = next

  // Track the audioUrl that the current Howl was created for so we avoid
  // recreating it when unrelated state fields change.
  const currentUrlRef = useRef<string | null>(null)

  // -----------------------------------------------------------------------
  // requestAnimationFrame loop to update currentTime while playing
  // -----------------------------------------------------------------------

  const startTimeLoop = useCallback(() => {
    const tick = () => {
      if (howlRef.current && howlRef.current.playing()) {
        const seek = howlRef.current.seek() as number
        dispatch({ type: "SET_TIME", time: seek })
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    // Cancel any existing loop before starting a new one
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [dispatch])

  const stopTimeLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // -----------------------------------------------------------------------
  // Create / destroy Howl when the current track changes
  // -----------------------------------------------------------------------

  useEffect(() => {
    const url = state.currentTrack?.audioUrl ?? ""

    // If the URL hasn't changed, don't recreate the Howl
    if (url === currentUrlRef.current) return
    currentUrlRef.current = url

    // Cleanup the previous instance
    stopTimeLoop()
    if (howlRef.current) {
      howlRef.current.stop()
      howlRef.current.unload()
      howlRef.current = null
    }

    // Nothing to play
    if (!url) return

    let cancelled = false

    const initHowl = async () => {
      const { Howl } = await import("howler")

      if (cancelled) return

      const howl = new Howl({
        src: [url],
        html5: true, // streaming — avoids loading entire file into memory
        volume: state.volume,
        mute: state.isMuted,
        onplay: () => {
          if (!cancelled) {
            dispatch({ type: "SET_DURATION", duration: howl.duration() })
            startTimeLoop()
          }
        },
        onpause: () => {
          stopTimeLoop()
        },
        onend: () => {
          stopTimeLoop()
          if (!cancelled) {
            nextRef.current()
          }
        },
        onloaderror: (_id, error) => {
          console.error("[useAudioPlayer] Howl load error:", error)
          stopTimeLoop()
          if (!cancelled) {
            dispatch({ type: "PAUSE" })
          }
        },
        onplayerror: (_id, error) => {
          console.error("[useAudioPlayer] Howl play error:", error)
          stopTimeLoop()
          if (!cancelled) {
            dispatch({ type: "PAUSE" })
          }
        },
      })

      if (cancelled) {
        howl.unload()
        return
      }

      howlRef.current = howl

      // If the context says we should already be playing, start immediately
      if (state.isPlaying) {
        howl.play()
      }
    }

    initHowl()

    return () => {
      cancelled = true
      stopTimeLoop()
      if (howlRef.current) {
        howlRef.current.stop()
        howlRef.current.unload()
        howlRef.current = null
      }
    }
    // Only recreate the Howl when the track itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentTrack?.audioUrl])

  // -----------------------------------------------------------------------
  // Sync play / pause state
  // -----------------------------------------------------------------------

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) return

    if (state.isPlaying) {
      if (!howl.playing()) {
        howl.play()
      }
      startTimeLoop()
    } else {
      if (howl.playing()) {
        howl.pause()
      }
      stopTimeLoop()
    }
  }, [state.isPlaying, startTimeLoop, stopTimeLoop])

  // -----------------------------------------------------------------------
  // Sync volume
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(state.volume)
    }
  }, [state.volume])

  // -----------------------------------------------------------------------
  // Sync mute
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.mute(state.isMuted)
    }
  }, [state.isMuted])

  // -----------------------------------------------------------------------
  // Seek when currentTime is set externally (via the seek convenience method)
  //
  // We distinguish "user-initiated seek" from the RAF loop updates by
  // comparing the Howl's internal position to the state. If the difference
  // is significant (> 0.5 s) we treat it as a user seek.
  // -----------------------------------------------------------------------

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) return

    const howlTime = howl.seek() as number
    if (Math.abs(howlTime - state.currentTime) > 0.5) {
      howl.seek(state.currentTime)
    }
  }, [state.currentTime])

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------

  useEffect(() => {
    return () => {
      stopTimeLoop()
      if (howlRef.current) {
        howlRef.current.stop()
        howlRef.current.unload()
        howlRef.current = null
      }
    }
  }, [stopTimeLoop])
}
