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
    allowed: readonly ["create", "share", "personal-export"]
    paidMedia: false
    territory: "worldwide"
    term: "prototype-catalog"
  }
}

export type GreenPairAssessment = {
  compatible: boolean
  score: number
  tempoDelta: number
  harmonicFit: "same-key" | "relative" | "compatible" | "review"
  summary: string
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
      allowed: ["create", "share", "personal-export"],
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
      allowed: ["create", "share", "personal-export"],
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
      allowed: ["create", "share", "personal-export"],
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
      allowed: ["create", "share", "personal-export"],
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
  const tempoScore = Math.max(0, 100 - tempoDelta * 5)
  const score = Math.round(tempoScore * 0.58 + harmonicScore * 0.42)
  const compatible = tempoDelta <= 8 && harmonicFit !== "review"

  return {
    compatible,
    score,
    tempoDelta,
    harmonicFit,
    summary: compatible
      ? `${tempoDelta} BPM apart with a ${harmonicFit.replace("-", " ")} harmonic relationship.`
      : "This pairing would need destructive warping or a harmonic rewrite.",
  }
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
