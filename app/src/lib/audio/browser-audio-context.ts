type WebkitAudioWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext
}

export function createBrowserAudioContext(): AudioContext {
  const AudioContextConstructor =
    window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext

  if (!AudioContextConstructor) {
    throw new Error("Web Audio is not supported in this browser")
  }

  return new AudioContextConstructor()
}
