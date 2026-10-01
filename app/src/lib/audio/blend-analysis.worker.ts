import { analyzeSamples } from "./blend-analysis"

self.onmessage = (event: MessageEvent<{ samples: Float32Array; sampleRate: number }>) => {
  try { self.postMessage({ result: analyzeSamples(event.data.samples, event.data.sampleRate) }) }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : "Audio analysis failed." }) }
}
