export interface Track {
  id: string
  title: string
  artist: string // creator display name
  audioUrl: string
  coverUrl: string
  duration: number // seconds
}

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number // seconds
  duration: number // seconds
  volume: number // 0-1
  isMuted: boolean
  queue: Track[]
  queueIndex: number
}

export type PlayerAction =
  | { type: "PLAY"; track?: Track }
  | { type: "PAUSE" }
  | { type: "TOGGLE" }
  | { type: "SET_TRACK"; track: Track }
  | { type: "SET_TIME"; time: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SET_QUEUE"; queue: Track[]; startIndex?: number }
  | { type: "ADD_TO_QUEUE"; track: Track }
