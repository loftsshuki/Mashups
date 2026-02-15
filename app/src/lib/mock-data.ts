export interface MockMashup {
  id: string
  title: string
  description: string
  creator: {
    username: string
    displayName: string
    avatarUrl: string
  }
  coverUrl: string
  audioUrl: string
  genre: string
  bpm: number
  duration: number // seconds
  playCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  parentId?: string
  sourceTracks: { title: string; artist: string }[]
}

export interface MockCreator {
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  followerCount: number
  mashupCount: number
  totalPlays: number
}

export const mockMashups: MockMashup[] = [
  {
    id: "mash-001",
    title: "Midnight Groove x Electric Dreams",
    description:
      "A late-night fusion blending silky R&B vocals with pulsing synthwave instrumentals. Best enjoyed with headphones after dark.",
    creator: {
      username: "beatalchemy",
      displayName: "Beat Alchemy",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=BA",
    },
    coverUrl: "https://placehold.co/400x400/7c3aed/white?text=M1",
    audioUrl: "/audio/beat1.mp3",
    genre: "Synthwave",
    bpm: 118,
    duration: 247,
    playCount: 124500,
    likeCount: 8920,
    commentCount: 342,
    createdAt: "2025-12-15T20:30:00Z",
    sourceTracks: [
      { title: "Midnight Groove", artist: "Velvet Haze" },
      { title: "Electric Dreams", artist: "Neon Circuit" },
    ],
  },
  {
    id: "mash-002",
    title: "Neon Beats Remix",
    description:
      "High-energy dance floor banger that layers aggressive trap drums over a classic house anthem. Pure euphoria.",
    creator: {
      username: "djfusion",
      displayName: "DJ Fusion",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=DF",
    },
    coverUrl: "https://placehold.co/400x400/6d28d9/white?text=M2",
    audioUrl: "/audio/beat2.mp3",
    genre: "Trap / House",
    bpm: 140,
    duration: 213,
    playCount: 489200,
    likeCount: 31400,
    commentCount: 1205,
    createdAt: "2026-01-03T14:00:00Z",
    parentId: "mash-001",
    sourceTracks: [
      { title: "Neon Nights", artist: "Strobe" },
      { title: "Beat Drop", artist: "Kaskade" },
    ],
  },
  {
    id: "mash-003",
    title: "Golden Hour Chill",
    description:
      "Lo-fi hip-hop meets bossa nova guitar in this sunset-colored mashup. Perfect study companion or afternoon wind-down.",
    creator: {
      username: "loopqueen",
      displayName: "Loop Queen",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=LQ",
    },
    coverUrl: "https://placehold.co/400x400/a855f7/white?text=M3",
    audioUrl: "/audio/beat3.mp3",
    genre: "Lo-fi / Bossa Nova",
    bpm: 85,
    duration: 294,
    playCount: 67800,
    likeCount: 5100,
    commentCount: 187,
    createdAt: "2025-11-22T09:15:00Z",
    parentId: "mash-001",
    sourceTracks: [
      { title: "Golden Hour", artist: "Mellow Drift" },
      { title: "Café Samba", artist: "Rio Sound" },
    ],
  },
  {
    id: "mash-004",
    title: "Bass Cathedral",
    description:
      "Dubstep meets orchestral in this cinematic collision. Wobble bass lines intertwined with sweeping string arrangements.",
    creator: {
      username: "waveform_kid",
      displayName: "Waveform Kid",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=WK",
    },
    coverUrl: "https://placehold.co/400x400/8b5cf6/white?text=M4",
    audioUrl: "/audio/beat4.mp3",
    genre: "Dubstep / Orchestral",
    bpm: 150,
    duration: 268,
    playCount: 203400,
    likeCount: 14200,
    commentCount: 623,
    createdAt: "2026-01-18T17:45:00Z",
    parentId: "mash-002",
    sourceTracks: [
      { title: "Cathedral", artist: "Symphonic Rage" },
      { title: "Sub Zero", artist: "Bass Architect" },
    ],
  },
  {
    id: "mash-005",
    title: "Funk Supernova",
    description:
      "70s disco grooves collide with modern electronic production. Slap bass, talk box, and laser synths in perfect harmony.",
    creator: {
      username: "beatalchemy",
      displayName: "Beat Alchemy",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=BA",
    },
    coverUrl: "https://placehold.co/400x400/c084fc/white?text=M5",
    audioUrl: "",
    genre: "Disco / Electronic",
    bpm: 122,
    duration: 232,
    playCount: 156700,
    likeCount: 11800,
    commentCount: 445,
    createdAt: "2025-10-30T12:00:00Z",
    sourceTracks: [
      { title: "Supernova Funk", artist: "Groove Theory" },
      { title: "Laser Love", artist: "Chrome Waves" },
    ],
  },
  {
    id: "mash-006",
    title: "Tokyo Drift Phonk",
    description:
      "Aggressive phonk cowbells layered over Japanese city pop melodies. The underground sound of neon-lit streets.",
    creator: {
      username: "samplesurgeon",
      displayName: "Sample Surgeon",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=SS",
    },
    coverUrl: "https://placehold.co/400x400/5b21b6/white?text=M6",
    audioUrl: "",
    genre: "Phonk / City Pop",
    bpm: 130,
    duration: 198,
    playCount: 312900,
    likeCount: 22600,
    commentCount: 891,
    createdAt: "2026-02-01T22:00:00Z",
    sourceTracks: [
      { title: "Drifter", artist: "Phantom Grip" },
      { title: "Plastic Love (Remix)", artist: "Neon Tokyo" },
    ],
  },
  {
    id: "mash-007",
    title: "Rainy Day Vocals",
    description:
      "Intimate acoustic guitar paired with ambient rain textures and ethereal vocal chops. Pure introspection.",
    creator: {
      username: "loopqueen",
      displayName: "Loop Queen",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=LQ",
    },
    coverUrl: "https://placehold.co/400x400/9333ea/white?text=M7",
    audioUrl: "",
    genre: "Ambient / Acoustic",
    bpm: 72,
    duration: 305,
    playCount: 42100,
    likeCount: 3800,
    commentCount: 156,
    createdAt: "2025-12-28T06:30:00Z",
    sourceTracks: [
      { title: "Rainy Afternoon", artist: "Cloud Atlas" },
      { title: "Whisper", artist: "Ether" },
    ],
  },
  {
    id: "mash-008",
    title: "Pixel Party Anthem",
    description:
      "Chiptune meets modern EDM in this retro-futuristic mashup. 8-bit arpeggios power a festival-ready drop.",
    creator: {
      username: "glitchmob",
      displayName: "Glitch Mob",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=GM",
    },
    coverUrl: "https://placehold.co/400x400/7e22ce/white?text=M8",
    audioUrl: "",
    genre: "Chiptune / EDM",
    bpm: 128,
    duration: 241,
    playCount: 95600,
    likeCount: 7200,
    commentCount: 298,
    createdAt: "2026-01-25T15:20:00Z",
    sourceTracks: [
      { title: "8-Bit Hero", artist: "Pixel Sound" },
      { title: "Festival Anthem", artist: "Drop Zone" },
    ],
  },
  {
    id: "mash-009",
    title: "NO BATIDÃO Phonk Remix",
    description:
      "Brazilian phonk meets trap funk. Heavy 808s, cowbell rhythms, and that signature phonk atmosphere. Perfect for late-night drives and workout sessions.",
    creator: {
      username: "funkphonk",
      displayName: "Funk Phonk",
      avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=FP",
    },
    coverUrl: "https://placehold.co/400x400/ea580c/white?text=NB",
    audioUrl: "/audio/no-batidao.mp3",
    genre: "Phonk / Funk",
    bpm: 140,
    duration: 120,
    playCount: 892000,
    likeCount: 45600,
    commentCount: 2103,
    createdAt: "2026-02-10T22:00:00Z",
    sourceTracks: [
      { title: "NO BATIDÃO", artist: "ZXKAI & slxughter" },
      { title: "Funk Brasileiro", artist: "Baile Sound" },
    ],
  },
]

export const mockCreators: MockCreator[] = [
  {
    username: "beatalchemy",
    displayName: "Beat Alchemy",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=BA",
    bio: "Turning raw sounds into gold since 2019. Synthwave addict and funk enthusiast. Every track is an experiment.",
    followerCount: 12400,
    mashupCount: 47,
    totalPlays: 1820000,
  },
  {
    username: "djfusion",
    displayName: "DJ Fusion",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=DF",
    bio: "Genre boundaries are just suggestions. Trap, house, bass music -- if it slaps, it goes in the mix.",
    followerCount: 28900,
    mashupCount: 83,
    totalPlays: 4250000,
  },
  {
    username: "loopqueen",
    displayName: "Loop Queen",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=LQ",
    bio: "Lo-fi dreamer. Ambient explorer. I make music for rainy days, quiet mornings, and long drives.",
    followerCount: 8700,
    mashupCount: 32,
    totalPlays: 890000,
  },
  {
    username: "waveform_kid",
    displayName: "Waveform Kid",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=WK",
    bio: "Dubstep meets classical. Sound designer by day, bass architect by night. Headphones mandatory.",
    followerCount: 15600,
    mashupCount: 29,
    totalPlays: 2100000,
  },
  {
    username: "funkphonk",
    displayName: "Funk Phonk",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=FP",
    bio: "Bringing Brazilian funk to the phonk scene. 808s, cowbells, and heavy bass. Let's make the floor shake.",
    followerCount: 34200,
    mashupCount: 28,
    totalPlays: 4100000,
  },
  {
    username: "samplesurgeon",
    displayName: "Sample Surgeon",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=SS",
    bio: "Chopping samples since the MPC days. Phonk, boom bap, and everything grimy in between.",
    followerCount: 21300,
    mashupCount: 61,
    totalPlays: 3400000,
  },
  {
    username: "glitchmob",
    displayName: "Glitch Mob",
    avatarUrl: "https://placehold.co/100x100/7c3aed/white?text=GM",
    bio: "Retro gamer turned producer. Chiptune roots, EDM wings. Making pixels dance since 2021.",
    followerCount: 9500,
    mashupCount: 24,
    totalPlays: 720000,
  },
]

export function getMockMashup(id: string): MockMashup | undefined {
  return mockMashups.find((m) => m.id === id)
}

export function getMashupChildren(parentId: string): MockMashup[] {
  return mockMashups.filter((m) => m.parentId === parentId)
}

export function getMashupLineage(id: string): MockMashup[] {
  const chain: MockMashup[] = []
  let current = getMockMashup(id)

  while (current) {
    chain.unshift(current)
    current = current.parentId ? getMockMashup(current.parentId) : undefined
  }

  return chain
}

export function getMockCreator(username: string): MockCreator | undefined {
  return mockCreators.find((c) => c.username === username)
}
