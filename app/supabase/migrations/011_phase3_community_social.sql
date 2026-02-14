-- Phase 3: Community & Social Features
-- Daily Flips, Collaborative Playlists, Comment System 2.0, Feed Preferences

-- ============================================================
-- 1. Daily Flip (daily challenges)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_flips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flip_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  stems JSONB NOT NULL DEFAULT '[]',  -- array of {name, type, color, bpm, key, audio_url}
  rules TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_flip_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flip_id UUID NOT NULL REFERENCES daily_flips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mashup_id UUID REFERENCES mashups(id) ON DELETE SET NULL,
  audio_url TEXT,
  score INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  rank INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(flip_id, user_id)
);

CREATE TABLE IF NOT EXISTS daily_flip_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES daily_flip_entries(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, voter_id)
);

-- ============================================================
-- 2. Collaborative Playlists
-- ============================================================

CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_collaborative BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  track_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  mashup_id UUID NOT NULL REFERENCES mashups(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, mashup_id)
);

CREATE TABLE IF NOT EXISTS playlist_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'contributor',
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, user_id)
);

-- ============================================================
-- 3. Comment System 2.0 (extend existing comments table)
-- ============================================================

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS timestamp_sec NUMERIC;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id, emoji)
);

-- ============================================================
-- 4. Feed Preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_bpm_min INTEGER,
  preferred_bpm_max INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_daily_flips_ends_at ON daily_flips(ends_at);
CREATE INDEX IF NOT EXISTS idx_flip_entries_flip ON daily_flip_entries(flip_id);
CREATE INDEX IF NOT EXISTS idx_flip_entries_user ON daily_flip_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_flip_votes_entry ON daily_flip_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_playlists_creator ON playlists(creator_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_mashup ON playlist_tracks(mashup_id);
CREATE INDEX IF NOT EXISTS idx_playlist_collabs_playlist ON playlist_collaborators(playlist_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp_sec) WHERE timestamp_sec IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE daily_flips ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_flip_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_flip_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_preferences ENABLE ROW LEVEL SECURITY;

-- Daily Flips: all authenticated users can view
CREATE POLICY daily_flips_select ON daily_flips
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Daily Flip Entries: all auth'd can view, only own user can insert
CREATE POLICY flip_entries_select ON daily_flip_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY flip_entries_insert ON daily_flip_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Flip Votes: all auth'd can view, only own voter can insert
CREATE POLICY flip_votes_select ON daily_flip_votes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY flip_votes_insert ON daily_flip_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Playlists: public playlists visible to all, private only to creator
CREATE POLICY playlists_select ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY playlists_insert ON playlists
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Playlist Tracks: visible if user can see the playlist, insertable by creator or collaborator
CREATE POLICY playlist_tracks_select ON playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND (playlists.is_public = true OR playlists.creator_id = auth.uid())
    )
  );

CREATE POLICY playlist_tracks_insert ON playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.creator_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM playlist_collaborators
      WHERE playlist_collaborators.playlist_id = playlist_tracks.playlist_id
        AND playlist_collaborators.user_id = auth.uid()
    )
  );

-- Playlist Collaborators: visible and manageable by playlist owner
CREATE POLICY playlist_collabs_select ON playlist_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_collaborators.playlist_id
        AND playlists.creator_id = auth.uid()
    )
  );

CREATE POLICY playlist_collabs_insert ON playlist_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_collaborators.playlist_id
        AND playlists.creator_id = auth.uid()
    )
  );

-- Comment Reactions: all auth'd can view, own user can insert, own user can delete
CREATE POLICY comment_reactions_select ON comment_reactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY comment_reactions_insert ON comment_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY comment_reactions_delete ON comment_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Feed Preferences: users can only see/manage their own preferences
CREATE POLICY feed_preferences_select ON feed_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY feed_preferences_insert ON feed_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY feed_preferences_update ON feed_preferences
  FOR UPDATE USING (auth.uid() = user_id);
