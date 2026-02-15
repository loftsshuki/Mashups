-- Enable pgvector extension (must be toggled ON in Supabase dashboard first)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to mashups for similarity search
ALTER TABLE public.mashups ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Index for fast cosine similarity queries
CREATE INDEX IF NOT EXISTS mashups_embedding_idx
  ON public.mashups USING ivfflat (embedding vector_cosine_ops);

-- RPC function for vector similarity search
CREATE OR REPLACE FUNCTION public.match_mashups(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (id uuid, title text, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT
    m.id,
    m.title,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.mashups m
  WHERE m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
$$;
