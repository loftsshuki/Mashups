export const GENRES = [
  "All",
  "Electronic",
  "Hip-Hop",
  "Lo-fi",
  "Rock",
  "Pop",
  "Synthwave",
  "Trap",
  "Dubstep",
  "Disco",
  "Phonk",
  "Ambient",
  "Chiptune",
  "EDM",
] as const

export type Genre = (typeof GENRES)[number]
