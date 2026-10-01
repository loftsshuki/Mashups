import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { parseArgs } from "node:util"

import { createDemo } from "./audio-bench/fixtures.ts"
import { buildListeningBench } from "./audio-bench/runner.ts"

const { values } = parseArgs({ options: {
  manifest: { type: "string" }, out: { type: "string" }, demo: { type: "boolean" }, help: { type: "boolean" },
} })
if (values.help || (!values.demo && !values.manifest)) {
  process.stdout.write(`Audio listening bench (local FFmpeg + ffprobe required)

  npm run benchmark:listening -- --manifest ./path/comparison.json
  npm run benchmark:listening -- --manifest ./path/comparison.json --out .audio-bench/my-run
  npm run benchmark:listening -- --demo

Inputs are read only. Each output directory must be new. Runs are private by
default; only the bundle subdirectory is for listeners. Keep operator.json,
working audio, and source files private. Nothing is uploaded by this command.
Demo mode needs an FFmpeg build with the rubberband filter.
See docs/AUDIO_LISTENING_BENCH.md for the manifest format and evidence limits.
`)
  if (!values.help) process.exitCode = 1
} else {
  try {
    if (values.demo && (values.manifest || values.out)) throw new Error("Demo creates its own sources and output; do not combine it with --manifest or --out.")
    const runRoot = resolve(import.meta.dirname, "../.audio-bench")
    await mkdir(runRoot, { recursive: true })
    const stamp = new Date().toISOString().replace(/[:.]/g, "-")
    const result = values.demo
      ? await createDemo(resolve(runRoot, `demo-${stamp}`))
      : await buildListeningBench(resolve(values.manifest!), resolve(values.out ?? `${runRoot}/run-${stamp}`))
    process.stdout.write(`Prepared ${result.pack.cases.length} blind comparison(s).\nPrivate run: ${result.output}\nListener files: bundle/index.html and bundle/audio/\nNo listening preference or musical-quality pass has been recorded.\n`)
  } catch (error) {
    process.stderr.write(`Audio bench failed: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
