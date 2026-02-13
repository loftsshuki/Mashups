"use client"

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react"
import type { Track, PlayerState, PlayerAction } from "./types"
import { useAudioPlayer } from "./use-audio-player"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: -1,
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY": {
      if (action.track) {
        const idx = state.queue.findIndex((t) => t.id === action.track!.id)
        return {
          ...state,
          currentTrack: action.track,
          isPlaying: true,
          currentTime: 0,
          queueIndex: idx !== -1 ? idx : -1,
        }
      }
      // Resume current track
      return state.currentTrack ? { ...state, isPlaying: true } : state
    }

    case "PAUSE":
      return { ...state, isPlaying: false }

    case "TOGGLE":
      if (!state.currentTrack) return state
      return { ...state, isPlaying: !state.isPlaying }

    case "SET_TRACK":
      return {
        ...state,
        currentTrack: action.track,
        currentTime: 0,
        duration: 0,
      }

    case "SET_TIME":
      return { ...state, currentTime: action.time }

    case "SET_DURATION":
      return { ...state, duration: action.duration }

    case "SET_VOLUME":
      return { ...state, volume: Math.max(0, Math.min(1, action.volume)) }

    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted }

    case "NEXT": {
      if (state.queue.length === 0) return { ...state, isPlaying: false }
      const nextIndex =
        state.queueIndex + 1 >= state.queue.length
          ? 0 // wrap around
          : state.queueIndex + 1
      return {
        ...state,
        currentTrack: state.queue[nextIndex],
        queueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      }
    }

    case "PREVIOUS": {
      if (state.queue.length === 0) return { ...state, isPlaying: false }
      const prevIndex =
        state.queueIndex - 1 < 0
          ? state.queue.length - 1 // wrap around
          : state.queueIndex - 1
      return {
        ...state,
        currentTrack: state.queue[prevIndex],
        queueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      }
    }

    case "SET_QUEUE": {
      const startIdx = action.startIndex ?? 0
      return {
        ...state,
        queue: action.queue,
        queueIndex: startIdx,
        currentTrack: action.queue[startIdx] ?? null,
        isPlaying: action.queue.length > 0,
        currentTime: 0,
        duration: 0,
      }
    }

    case "ADD_TO_QUEUE":
      return { ...state, queue: [...state.queue, action.track] }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AudioContextValue {
  state: PlayerState
  dispatch: React.Dispatch<PlayerAction>
  play: (track?: Track) => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  next: () => void
  previous: () => void
  playTrack: (track: Track, queue?: Track[]) => void
  addToQueue: (track: Track) => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

// ---------------------------------------------------------------------------
// AudioEngine — internal component that wires up the Howler hook
// ---------------------------------------------------------------------------

function AudioEngine() {
  useAudioPlayer()
  useKeyboardShortcuts()
  return null
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)

  const play = useCallback(
    (track?: Track) => {
      dispatch({ type: "PLAY", track })
    },
    [dispatch],
  )

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" })
  }, [dispatch])

  const toggle = useCallback(() => {
    dispatch({ type: "TOGGLE" })
  }, [dispatch])

  const seek = useCallback(
    (time: number) => {
      dispatch({ type: "SET_TIME", time })
    },
    [dispatch],
  )

  const setVolume = useCallback(
    (volume: number) => {
      dispatch({ type: "SET_VOLUME", volume })
    },
    [dispatch],
  )

  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" })
  }, [dispatch])

  const next = useCallback(() => {
    dispatch({ type: "NEXT" })
  }, [dispatch])

  const previous = useCallback(() => {
    dispatch({ type: "PREVIOUS" })
  }, [dispatch])

  const playTrack = useCallback(
    (track: Track, queue?: Track[]) => {
      if (queue) {
        const startIndex = queue.findIndex((t) => t.id === track.id)
        dispatch({
          type: "SET_QUEUE",
          queue,
          startIndex: startIndex !== -1 ? startIndex : 0,
        })
      } else {
        dispatch({ type: "PLAY", track })
      }
    },
    [dispatch],
  )

  const addToQueue = useCallback(
    (track: Track) => {
      dispatch({ type: "ADD_TO_QUEUE", track })
    },
    [dispatch],
  )

  const value: AudioContextValue = {
    state,
    dispatch,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    next,
    previous,
    playTrack,
    addToQueue,
  }

  return (
    <AudioContext.Provider value={value}>
      <AudioEngine />
      {children}
    </AudioContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) {
    throw new Error("useAudio must be used within an <AudioProvider>")
  }
  return ctx
}
