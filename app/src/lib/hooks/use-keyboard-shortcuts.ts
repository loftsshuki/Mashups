"use client"

import { useEffect } from "react"
import { useAudio } from "@/lib/audio/audio-context"

export function useKeyboardShortcuts() {
  const { state, toggle, seek, setVolume, toggleMute } = useAudio()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case " ":
          e.preventDefault()
          toggle()
          break
        case "ArrowLeft":
          e.preventDefault()
          seek(Math.max(0, state.currentTime - 5))
          break
        case "ArrowRight":
          e.preventDefault()
          seek(Math.min(state.duration, state.currentTime + 5))
          break
        case "ArrowUp":
          e.preventDefault()
          setVolume(Math.min(1, state.volume + 0.05))
          break
        case "ArrowDown":
          e.preventDefault()
          setVolume(Math.max(0, state.volume - 0.05))
          break
        case "m":
        case "M":
          toggleMute()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [state.currentTime, state.duration, state.volume, toggle, seek, setVolume, toggleMute])
}
