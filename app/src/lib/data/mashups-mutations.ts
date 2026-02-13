"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createMashup(prevState: unknown, formData: FormData) {
  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const genre = formData.get("genre") as string
  const bpm = parseInt(formData.get("bpm") as string) || null
  const audioUrl = formData.get("audio_url") as string
  const coverImageUrl = formData.get("cover_image_url") as string
  const sourceTracksJson = formData.get("source_tracks") as string
  const forkParentId = formData.get("fork_parent_id") as string | null
  const challengeId = formData.get("challenge_id") as string | null

  if (!title || !audioUrl) {
    return { error: "Title and audio are required" }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a mashup" }
    }

    const { data: mashup, error } = await supabase
      .from("mashups")
      .insert({
        title,
        description,
        genre,
        bpm,
        audio_url: audioUrl,
        cover_image_url: coverImageUrl || null,
        creator_id: user.id,
        is_published: true,
        duration: parseInt(formData.get("duration") as string) || 0,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    // Insert source tracks
    if (sourceTracksJson) {
      try {
        const sourceTracks = JSON.parse(sourceTracksJson) as { title: string; artist: string }[]
        if (sourceTracks.length > 0) {
          await supabase.from("source_tracks").insert(
            sourceTracks.map((t, i) => ({
              mashup_id: mashup.id,
              title: t.title,
              artist: t.artist,
              position: i,
            }))
          )
        }
      } catch { /* ignore parse errors */ }
    }

    // Optional remix lineage link for forked mashups
    if (forkParentId) {
      await supabase.from("remix_relations").insert({
        parent_mashup_id: forkParentId,
        child_mashup_id: mashup.id,
      })
    }

    // Optional challenge submission link
    if (challengeId) {
      await supabase.from("challenge_entries").insert({
        challenge_id: challengeId,
        mashup_id: mashup.id,
        creator_id: user.id,
      })
    }

    redirect(`/mashup/${mashup.id}`)
  } catch (e: unknown) {
    // redirect() throws an error internally — rethrow it
    if (e && typeof e === "object" && "digest" in e) {
      const err = e as { digest: string }
      if (err.digest?.startsWith("NEXT_REDIRECT")) throw e
    }
    return { error: "Failed to create mashup. Supabase may not be configured." }
  }
}

export async function deleteMashup(mashupId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("mashups").delete().eq("id", mashupId)
    if (error) return { error: error.message }
    return { success: true }
  } catch {
    return { error: "Failed to delete mashup" }
  }
}
