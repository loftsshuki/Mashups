import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { arrangementLabel, buildGreenBenchmarkCases, summarizeGreenBenchmark } from "../src/lib/audio/green-benchmark"

const cases = buildGreenBenchmarkCases()
const summary = summarizeGreenBenchmark(cases, "2026-08-16T00:00:00.000Z")
if (summary.caseCount !== 72) throw new Error(`Expected 72 benchmark cases, received ${summary.caseCount}.`)

const rows = cases.map((entry) => `<tr><td>${escape(entry.left.title)} x ${escape(entry.right.title)}</td><td>${escape(arrangementLabel(entry.arrangement))}</td><td>${entry.intensity}</td><td>${entry.timingScore}</td><td>${entry.harmonicScore}</td><td>${entry.phraseScore}</td><td>${entry.collisionScore}</td><td><strong>${entry.shareWorthiness}</strong></td><td>${entry.renderEligible ? entry.passed ? "PASS" : "FAIL" : "REJECT"}</td></tr>`).join("\n")
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mashups Audio Benchmark</title><style>:root{--paper:#f2efe5;--ink:#13130f;--acid:#d7ff3f;--signal:#ff4f1f}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Trebuchet MS",sans-serif}header{padding:7vw 5vw 4vw;border-bottom:2px solid var(--ink)}h1{font-family:Impact,"Franklin Gothic Condensed",sans-serif;font-size:clamp(3rem,9vw,8rem);line-height:.82;margin:0;max-width:1100px;text-transform:uppercase}p{line-height:1.6}.metrics{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:2px solid var(--ink)}.metric{padding:2rem;border-right:2px solid var(--ink)}.metric:last-child{border:0}.metric b{display:block;font-size:3rem}.wrap{padding:4vw;overflow:auto}table{border-collapse:collapse;width:100%;min-width:1000px;background:#fffaf0}th,td{border:1px solid var(--ink);padding:.75rem;text-align:left}th{background:var(--ink);color:var(--paper);position:sticky;top:0}tr:nth-child(6n+1) td{border-top:4px solid var(--signal)}footer{padding:3rem 5vw;background:var(--ink);color:var(--paper)}@media(max-width:700px){.metrics{grid-template-columns:1fr 1fr}.metric:nth-child(2){border-right:0}.metric b{font-size:2rem}}</style></head><body><header><p>MASHUPS / GREEN ROOM / GENERATED ${summary.generatedAt}</p><h1>Audio quality is a release gate.</h1><p>72 deterministic cases: every ordered source pair, three structural arrangements, two energy profiles. Eligible scores below 78 fail; hostile pairs must be rejected before rendering.</p></header><section class="metrics"><div class="metric"><span>Cases</span><b>${summary.caseCount}</b></div><div class="metric"><span>Correct gate rate</span><b>${summary.passRate}%</b></div><div class="metric"><span>Eligible renders</span><b>${summary.renderEligible}</b></div><div class="metric"><span>Safe rejects</span><b>${summary.preflightRejected}</b></div></section><main class="wrap"><table><thead><tr><th>Pair</th><th>Arrangement</th><th>Energy</th><th>Timing</th><th>Harmony</th><th>Phrase</th><th>Collision</th><th>Share</th><th>Gate</th></tr></thead><tbody>${rows}</tbody></table></main><footer>Known-bad fixtures are preserved separately and must remain rejected. No benchmark score overrides rights permission.</footer></body></html>`

const output = resolve(import.meta.dirname, "../public/reports/audio-quality-benchmark.html")
mkdirSync(resolve(output, ".."), { recursive: true })
writeFileSync(output, html)
process.stdout.write(`Generated ${output} with ${summary.caseCount} cases and ${summary.passRate}% passing.\n`)

function escape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}
