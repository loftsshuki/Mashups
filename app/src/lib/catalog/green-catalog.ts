import { GREEN_CATALOG_MANIFEST } from "./catalog-manifest"

export type GreenCatalogTrack = {
  id: string
  title: string
  artist: string
  artistHandle: string
  genre: string
  bpm: number
  key: string
  camelot: string
  energy: number
  phraseConfidence: number
  color: string
  ink: string
  waveform: readonly number[]
  synth: {
    rootMidi: number
    progression: readonly number[]
    bassPattern: readonly number[]
    leadPattern: readonly (number | null)[]
    leadWave: OscillatorType
    swing: number
  }
  rights: {
    status: "green"
    passportId: string
    authority: string
    sourceType: "mashups-original"
    samples: "none"
    allowed: readonly ["create", "share"]
    shortVideoExport: true
    standaloneAudioExport: false
    paidMedia: false
    territory: "worldwide"
    term: "prototype-catalog"
  }
}

export type GreenPairAssessment = {
  compatible: boolean
  score: number
  tempoDelta: number
  warpPercent: number
  phraseConfidence: number
  vocalCollisionRisk: "low" | "medium" | "high"
  harmonicFit: "same-key" | "relative" | "compatible" | "review"
  summary: string
  reasons: string[]
  fixes: string[]
}

export const GREEN_CATALOG: readonly GreenCatalogTrack[] = [
  {
    id: "signal-bloom",
    title: "Signal Bloom",
    artist: "Mashups House Band",
    artistHandle: "mashups.originals",
    genre: "Afro House",
    bpm: 124,
    key: "A minor",
    camelot: "8A",
    energy: 78,
    phraseConfidence: 0.96,
    color: "#ff4f1f",
    ink: "#fffaf0",
    waveform: [22, 42, 66, 38, 78, 51, 92, 62, 74, 45, 88, 57, 96, 64, 82, 48],
    synth: {
      rootMidi: 45,
      progression: [0, 3, 5, 3],
      bassPattern: [0, 0, 7, 0, 3, 3, 5, 7],
      leadPattern: [12, null, 15, 17, null, 15, 12, 10, 12, null, 17, 19, 17, 15, null, 12],
      leadWave: "triangle",
      swing: 0.035,
    },
    rights: {
      status: "green",
      passportId: "MASH-GREEN-0001",
      authority: "Mashups original synthesis",
      sourceType: "mashups-original",
      samples: "none",
      allowed: ["create", "share"],
      shortVideoExport: true,
      standaloneAudioExport: false,
      paidMedia: false,
      territory: "worldwide",
      term: "prototype-catalog",
    },
  },
  {
    id: "heat-map",
    title: "Heat Map",
    artist: "Mashups House Band",
    artistHandle: "mashups.originals",
    genre: "Tech House",
    bpm: 126,
    key: "C major",
    camelot: "8B",
    energy: 91,
    phraseConfidence: 0.97,
    color: "#d7ff3f",
    ink: "#13130f",
    waveform: [34, 70, 48, 91, 62, 84, 55, 98, 68, 89, 44, 81, 59, 94, 72, 86],
    synth: {
      rootMidi: 48,
      progression: [0, -2, 3, 0],
      bassPattern: [0, 0, 7, 0, 0, 10, 7, 3],
      leadPattern: [12, 12, null, 19, 17, null, 15, 12, null, 12, 15, 17, null, 19, 17, 15],
      leadWave: "square",
      swing: 0.018,
    },
    rights: {
      status: "green",
      passportId: "MASH-GREEN-0002",
      authority: "Mashups original synthesis",
      sourceType: "mashups-original",
      samples: "none",
      allowed: ["create", "share"],
      shortVideoExport: true,
      standaloneAudioExport: false,
      paidMedia: false,
      territory: "worldwide",
      term: "prototype-catalog",
    },
  },
  {
    id: "low-tide",
    title: "Low Tide",
    artist: "Mashups House Band",
    artistHandle: "mashups.originals",
    genre: "Melodic House",
    bpm: 122,
    key: "D minor",
    camelot: "7A",
    energy: 67,
    phraseConfidence: 0.93,
    color: "#2458ff",
    ink: "#fffaf0",
    waveform: [18, 32, 57, 45, 70, 52, 82, 61, 76, 55, 88, 63, 79, 58, 91, 69],
    synth: {
      rootMidi: 38,
      progression: [0, 5, 3, 7],
      bassPattern: [0, 0, 7, 12, 5, 5, 3, 7],
      leadPattern: [12, null, 15, null, 17, 15, 12, null, 10, 12, null, 15, 17, null, 19, 17],
      leadWave: "sine",
      swing: 0.045,
    },
    rights: {
      status: "green",
      passportId: "MASH-GREEN-0003",
      authority: "Mashups original synthesis",
      sourceType: "mashups-original",
      samples: "none",
      allowed: ["create", "share"],
      shortVideoExport: true,
      standaloneAudioExport: false,
      paidMedia: false,
      territory: "worldwide",
      term: "prototype-catalog",
    },
  },
  {
    id: "static-sun",
    title: "Static Sun",
    artist: "Mashups House Band",
    artistHandle: "mashups.originals",
    genre: "Bass House",
    bpm: 123,
    key: "F major",
    camelot: "7B",
    energy: 84,
    phraseConfidence: 0.95,
    color: "#13130f",
    ink: "#d7ff3f",
    waveform: [28, 61, 43, 84, 58, 95, 66, 77, 49, 90, 63, 86, 54, 99, 72, 88],
    synth: {
      rootMidi: 41,
      progression: [0, 5, -2, 3],
      bassPattern: [0, 0, 12, 7, 5, 5, 10, 7],
      leadPattern: [12, 19, null, 17, 15, null, 12, 10, 12, null, 15, 17, 19, 17, null, 12],
      leadWave: "sawtooth",
      swing: 0.025,
    },
    rights: {
      status: "green",
      passportId: "MASH-GREEN-0004",
      authority: "Mashups original synthesis",
      sourceType: "mashups-original",
      samples: "none",
      allowed: ["create", "share"],
      shortVideoExport: true,
      standaloneAudioExport: false,
      paidMedia: false,
      territory: "worldwide",
      term: "prototype-catalog",
    },
  },
] as const

export function getGreenTrack(id: string | null | undefined): GreenCatalogTrack | undefined {
  return GREEN_CATALOG.find((track) => track.id === id)
}

export function assessGreenPair(left: GreenCatalogTrack, right: GreenCatalogTrack): GreenPairAssessment {
  const tempoDelta = Math.abs(left.bpm - right.bpm)
  const targetBpm = Math.max(left.bpm, right.bpm)
  const warpPercent = Math.round((tempoDelta / targetBpm) * 1000) / 10
  const leftWheel = Number.parseInt(left.camelot, 10)
  const rightWheel = Number.parseInt(right.camelot, 10)
  const sameNumber = leftWheel === rightWheel
  const sameMode = left.camelot.endsWith(right.camelot.slice(-1))
  const wheelDistance = Math.min(Math.abs(leftWheel - rightWheel), 12 - Math.abs(leftWheel - rightWheel))
  const harmonicFit = left.key === right.key
    ? "same-key"
    : sameNumber
      ? "relative"
      : wheelDistance <= 1 && sameMode
        ? "compatible"
        : "review"
  const harmonicScore = harmonicFit === "same-key" ? 100 : harmonicFit === "relative" ? 96 : harmonicFit === "compatible" ? 84 : 48
  const tempoScore = Math.max(0, 100 - warpPercent * 8)
  const phraseConfidence = Math.min(left.phraseConfidence, right.phraseConfidence)
  const phraseScore = phraseConfidence * 100
  const leadDensityDelta = Math.abs(activeLeadRatio(left) - activeLeadRatio(right))
  const combinedEnergy = (left.energy + right.energy) / 2
  const collisionValue = combinedEnergy > 88 && leadDensityDelta < 0.12 ? 0.78 : combinedEnergy > 80 && leadDensityDelta < 0.2 ? 0.52 : 0.24
  const vocalCollisionRisk = collisionValue >= 0.7 ? "high" : collisionValue >= 0.45 ? "medium" : "low"
  const collisionScore = 100 - collisionValue * 45
  const manifestLeft = GREEN_CATALOG_MANIFEST.tracks.find((track) => track.id === left.id)
  const manifestRight = GREEN_CATALOG_MANIFEST.tracks.find((track) => track.id === right.id)
  const pairingPermitted = Boolean(manifestLeft?.pairingAllowlist.includes(right.id) && manifestRight?.pairingAllowlist.includes(left.id))
  const reasons: string[] = []
  const fixes: string[] = []
  if (!pairingPermitted) reasons.push("The rightsholder pairing matrix does not permit this combination.")
  if (warpPercent > 6.5) { reasons.push(`Tempo alignment requires ${warpPercent}% warping.`); fixes.push("Choose a source within 6.5% tempo distance.") }
  if (harmonicFit === "review") { reasons.push("The Camelot relationship requires a destructive key shift."); fixes.push("Choose the same, relative, or adjacent Camelot key.") }
  if (phraseConfidence < 0.85) { reasons.push("One source has an unreliable phrase grid."); fixes.push("Send the source through manual phrase-grid review.") }
  if (vocalCollisionRisk === "high") { reasons.push("Both sources have dense competing toplines."); fixes.push("Use the drop-swap arrangement or choose a lower-density instrumental.") }
  const score = Math.round(tempoScore * 0.3 + harmonicScore * 0.28 + phraseScore * 0.24 + collisionScore * 0.18)
  const compatible = pairingPermitted && warpPercent <= 6.5 && harmonicFit !== "review" && phraseConfidence >= 0.85 && vocalCollisionRisk !== "high"

  return {
    compatible,
    score,
    tempoDelta,
    warpPercent,
    phraseConfidence,
    vocalCollisionRisk,
    harmonicFit,
    summary: compatible
      ? `${warpPercent}% tempo warp, ${harmonicFit.replace("-", " ")} harmony, and ${vocalCollisionRisk} collision risk.`
      : reasons[0] ?? "This pairing does not clear the quality preflight.",
    reasons,
    fixes,
  }
}

export function getGreenPairAlternatives(left: GreenCatalogTrack, rejected: GreenCatalogTrack, limit = 2) {
  return GREEN_CATALOG
    .filter((candidate) => candidate.id !== left.id && candidate.id !== rejected.id)
    .map((candidate) => ({ track: candidate, assessment: assessGreenPair(left, candidate) }))
    .filter((candidate) => candidate.assessment.compatible)
    .sort((a, b) => b.assessment.score - a.assessment.score)
    .slice(0, limit)
}

export function validateGreenCatalogBinding() {
  const reasons: string[] = []
  const manifestById = new Map(GREEN_CATALOG_MANIFEST.tracks.map((track) => [track.id, track]))
  for (const track of GREEN_CATALOG) {
    const manifest = manifestById.get(track.id)
    if (!manifest) { reasons.push(`${track.id} is absent from the signed manifest.`); continue }
    if (manifest.title !== track.title || manifest.artist !== track.artist || manifest.bpm !== track.bpm || manifest.camelot !== track.camelot) reasons.push(`${track.id} metadata differs from the signed manifest.`)
    if (manifest.passportId !== track.rights.passportId || manifest.standaloneAudioExport !== track.rights.standaloneAudioExport) reasons.push(`${track.id} rights differ from the signed manifest.`)
  }
  if (manifestById.size !== GREEN_CATALOG.length) reasons.push("Signed manifest and playable catalog have different track counts.")
  return { valid: reasons.length === 0, reasons }
}

function activeLeadRatio(track: GreenCatalogTrack) {
  const active = track.synth.leadPattern.filter((note) => note != null).length
  return active / Math.max(1, track.synth.leadPattern.length)
}

export function getRecommendedGreenPairs(limit = 3) {
  const pairs: Array<{ left: GreenCatalogTrack; right: GreenCatalogTrack; assessment: GreenPairAssessment }> = []

  for (let leftIndex = 0; leftIndex < GREEN_CATALOG.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < GREEN_CATALOG.length; rightIndex += 1) {
      const left = GREEN_CATALOG[leftIndex]
      const right = GREEN_CATALOG[rightIndex]
      const assessment = assessGreenPair(left, right)
      if (assessment.compatible) pairs.push({ left, right, assessment })
    }
  }

  return pairs.sort((a, b) => b.assessment.score - a.assessment.score).slice(0, limit)
}
