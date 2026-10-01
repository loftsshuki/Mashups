"use server"

export async function uploadAudio(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  // Validate file type
  const validTypes = ["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4", "audio/ogg", "audio/x-m4a"]
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Supported: MP3, WAV, FLAC, M4A, OGG" }
  }

  // Validate size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 50MB" }
  }

  try {
    const { put } = await import("@vercel/blob")
    const blob = await put(`audio/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return { url: blob.url }
  } catch {
    // Never fabricate a placeholder URL — it would "succeed" with audio that 404s forever.
    return { error: "Upload failed. Storage is not available right now." }
  }
}

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Supported: JPEG, PNG, WebP, GIF" }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 10MB" }
  }

  try {
    const { put } = await import("@vercel/blob")
    const blob = await put(`images/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return { url: blob.url }
  } catch {
    return { error: "Image upload failed. Please try again." }
  }
}
