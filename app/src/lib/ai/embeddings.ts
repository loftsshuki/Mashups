// OpenAI embeddings for mashup similarity search (pgvector)

const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Generate an embedding vector from text using OpenAI's embeddings API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured")

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Embeddings API error ${response.status}: ${errorBody}`)
  }

  const result = await response.json()
  return result.data[0].embedding as number[]
}

/**
 * Generate and store an embedding for a mashup.
 * Combines title, genre, and tags into a single text for embedding.
 */
export async function embedMashup(
  mashupId: string,
  title: string,
  genre: string,
  tags: string[],
): Promise<boolean> {
  if (!isSupabaseConfigured() || !process.env.OPENAI_API_KEY) return false

  try {
    const text = [title, genre, ...tags].filter(Boolean).join(" ")
    const embedding = await generateEmbedding(text)

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { error } = await supabase
      .from("mashups")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", mashupId)

    return !error
  } catch {
    return false
  }
}

/**
 * Find similar mashups using cosine similarity via pgvector.
 * Returns mashup IDs ordered by similarity.
 */
export async function findSimilarMashups(
  mashupId: string,
  limit: number = 10,
): Promise<Array<{ id: string; title: string; similarity: number }>> {
  if (!isSupabaseConfigured()) return []

  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    // Get the source mashup's embedding
    const { data: source } = await supabase
      .from("mashups")
      .select("embedding")
      .eq("id", mashupId)
      .single()

    if (!source?.embedding) return []

    // Use RPC for vector similarity search
    const { data, error } = await supabase.rpc("match_mashups", {
      query_embedding: source.embedding,
      match_threshold: 0.5,
      match_count: limit + 1, // +1 to exclude self
    })

    if (error || !data) return []

    return (data as Array<{ id: string; title: string; similarity: number }>)
      .filter((m) => m.id !== mashupId)
      .slice(0, limit)
  } catch {
    return []
  }
}
