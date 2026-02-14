"use client"

export interface TimelineClip {
  id: string
  trackId: string
  name: string
  audioUrl: string
  startTime: number
  duration: number
  offset: number
  color: string
  fadeIn?: number
  fadeOut?: number
  volume: number
  muted: boolean
}

export interface TimelineTrack {
  id: string
  name: string
  type: "audio" | "stem"
  stemType?: "vocals" | "drums" | "bass" | "other"
  clips: TimelineClip[]
  height: number
  color: string
}
