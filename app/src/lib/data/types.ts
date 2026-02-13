export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  email?: string
}

export interface Mashup {
  id: string
  title: string
  description: string | null
  creator_id: string
  audio_url: string
  cover_image_url: string | null
  genre: string | null
  bpm: number | null
  duration: number | null
  play_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Joined fields
  creator?: Profile
  source_tracks?: SourceTrack[]
  like_count?: number
  comment_count?: number
}

export interface SourceTrack {
  id: string
  mashup_id: string
  title: string
  artist: string
  position: number | null
}

export interface Comment {
  id: string
  mashup_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
}

export interface Like {
  user_id: string
  mashup_id: string
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}
