import { keyName, type SectionAnalysis } from "./blend-analysis"

export type BlendStatus = "Promising" | "Needs adjustment" | "Difficult pairing" | "Uncertain"
export type FitFactor = { id: string; title: string; state: "supportive" | "caution" | "risk" | "unknown"; detail: string; action: string }
export type BlendConfiguration = { targetBpm: number; leadBpm?: number; backingBpm?: number }
export type BlendFit = { status: BlendStatus; summary: string; factors: FitFactor[]; targetBpm: number; tempoChanges: { lead: number | null; backing: number | null } }

function tempoAtTarget(measured: number | null, manual: number | undefined, target: number) {
  const bpm = manual ?? measured
  if (bpm == null) return null
  // Octave alternatives are guidance to confirm, never silently treated as a verified beat grid.
  const choices = (manual ? [1] : [1, 0.5, 2]).map((multiplier) => ({ multiplier, change: (target / (bpm * multiplier) - 1) * 100 }))
  return { ...choices.sort((a, b) => Math.abs(a.change) - Math.abs(b.change))[0], bpm, manual: manual !== undefined }
}

export function assessBlend(lead: SectionAnalysis, backing: SectionAnalysis, config: BlendConfiguration): BlendFit {
  for (const bpm of [config.targetBpm, config.leadBpm, config.backingBpm]) if (bpm !== undefined && (!Number.isFinite(bpm) || bpm < 40 || bpm > 240)) throw new Error("Tempo must be between 40 and 240 BPM.")
  const a = tempoAtTarget(lead.tempo.bpm, config.leadBpm, config.targetBpm)
  const b = tempoAtTarget(backing.tempo.bpm, config.backingBpm, config.targetBpm)
  const changes = { lead: a?.change ?? null, backing: b?.change ?? null }
  const percent = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
  const maxChange = Math.max(Math.abs(a?.change ?? 0), Math.abs(b?.change ?? 0))
  const tempoState = maxChange > 15 ? "risk" : !a || !b ? "unknown" : maxChange > 6 || a.multiplier !== 1 || b.multiplier !== 1 ? "caution" : "supportive"
  const sourceTempo = (name: string, value: ReturnType<typeof tempoAtTarget>) => value ? `${name}: ${value.bpm.toFixed(1)} BPM (${value.manual ? "entered by you" : "measured pulse"}${value.multiplier !== 1 ? `, ${value.multiplier === 2 ? "double" : "half"} tempo needs confirmation` : ""}), ${percent(value.change)} speed change.` : `${name}: tempo uncertain.`
  const factors: FitFactor[] = [{
    id: "tempo", title: "Tempo & stretching", state: tempoState,
    detail: `${sourceTempo("Lead", a)} ${sourceTempo("Backing", b)} Target: ${config.targetBpm} BPM.`,
    action: tempoState === "risk" ? "Try a closer-tempo backing or another section. Large stretches need an audio audition." : tempoState === "unknown" ? "Check the original track’s tempo, then enter it under Producer details." : "Use pitch-preserving stretch, then listen for smeared consonants and softened drums. These changes are proposed, not applied.",
  }]
  const ak = lead.tonal.key, bk = backing.tonal.key
  const same = ak && bk && ak.tonic === bk.tonic && ak.mode === bk.mode
  const relative = ak && bk && ak.mode !== bk.mode && (ak.mode === "minor" ? (ak.tonic + 3) % 12 === bk.tonic : (bk.tonic + 3) % 12 === ak.tonic)
  factors.push({ id: "harmony", title: "Harmony", state: !ak || !bk ? "unknown" : same || relative ? "supportive" : "caution",
    detail: !ak || !bk ? `Lead: ${keyName(ak)}. Backing: ${keyName(bk)}. The audio does not support a reliable key comparison.` : `${keyName(ak)} lead over ${keyName(bk)} backing. ${same || relative ? "These key estimates share a useful tonal starting point." : "The estimated keys differ; overlapping notes may need adjustment."}`,
    action: !ak || !bk ? "Try a clearer melodic section. Rap or sparse vocals can work even when key detection is inconclusive; no pitch shift is recommended." : "Listen through chord changes and held notes. A shared key does not prove that the melody fits every chord.",
  })
  factors.push({ id: "alignment", title: "Beat & bar alignment", state: "unknown", detail: "A repeating pulse does not establish the first beat of the bar. The section starts have not been aligned.", action: "Audition the vocal entrance against a strong downbeat. Adjust the section start if it lands between phrases." })
  factors.push({ id: "phrasing", title: "Phrasing & space", state: "unknown", detail: "Line endings, chorus placement and competing vocals still need a listening check.", action: "Use an instrumental backing. Hear a full verse or chorus and check that the vocal has room to breathe." })
  const silent = lead.signal.silent || backing.signal.silent
  const fullScale = Math.max(lead.signal.nearFullScaleFraction, backing.signal.nearFullScaleFraction) > 0.001
  factors.push({ id: "audio", title: "Source audio", state: silent ? "risk" : fullScale ? "caution" : "unknown", detail: silent ? "One selected section has almost no audible signal." : fullScale ? "Samples close to full scale were found. Check for distortion in the source." : "Audible signal found in both sections. Separation bleed, warping artifacts and mix balance have not been assessed.", action: silent ? "Choose a section where the part is audible." : "Solo each ingredient. Listen for backing bleed in the vocal and watery or metallic sounds; check the rendered mix separately." })
  const status: BlendStatus = factors.some((f) => f.state === "risk") ? "Difficult pairing" : !a || !b || !ak || !bk ? "Uncertain" : factors.some((f) => f.state === "caution") ? "Needs adjustment" : "Promising"
  const summary = {
    Promising: "The measured tempo and key checks suggest a useful starting point. Timing, phrasing and the finished sound still need your ears.",
    "Needs adjustment": "There is a workable idea to explore, with adjustments to audition before committing.",
    "Difficult pairing": "At least one measured issue could make this combination harder to use. Try the suggested fix or keep experimenting.",
    Uncertain: "There is not enough reliable tempo or tonal evidence to judge this combination. Uncertainty is not a rejection.",
  }[status]
  return { status, summary, factors, targetBpm: config.targetBpm, tempoChanges: changes }
}
