"use client"

import { useState, useCallback } from "react"
import { Loader2, Plus, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadImage } from "@/lib/storage/upload"

const GENRES = [
  "Electronic",
  "Hip-Hop",
  "Lo-fi",
  "Rock",
  "Pop",
  "Synthwave",
  "Trap",
  "House",
  "Dubstep",
  "Ambient",
  "Funk",
  "Phonk",
  "Chiptune",
  "Other",
]

interface SourceTrackInput {
  title: string
  artist: string
}

interface PublishFormProps {
  audioUrl: string
  duration: number
  onPublish: (data: FormData) => void
  isPending: boolean
}

export function PublishForm({
  audioUrl,
  duration,
  onPublish,
  isPending,
}: PublishFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [bpm, setBpm] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [coverPreview, setCoverPreview] = useState("")
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [sourceTracks, setSourceTracks] = useState<SourceTrackInput[]>([
    { title: "", artist: "" },
  ])

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploadingCover(true)

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file)
      setCoverPreview(objectUrl)

      const formData = new FormData()
      formData.set("file", file)
      const result = await uploadImage(formData)

      if ("url" in result) {
        setCoverImageUrl(result.url)
      }

      setIsUploadingCover(false)
    },
    []
  )

  const addSourceTrack = useCallback(() => {
    setSourceTracks((prev) => [...prev, { title: "", artist: "" }])
  }, [])

  const removeSourceTrack = useCallback((index: number) => {
    setSourceTracks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateSourceTrack = useCallback(
    (index: number, field: "title" | "artist", value: string) => {
      setSourceTracks((prev) =>
        prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
      )
    },
    []
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const formData = new FormData()
      formData.set("title", title)
      formData.set("description", description)
      formData.set("genre", genre)
      formData.set("bpm", bpm)
      formData.set("audio_url", audioUrl)
      formData.set("cover_image_url", coverImageUrl)
      formData.set("duration", String(duration))

      // Filter out empty source tracks
      const validTracks = sourceTracks.filter(
        (t) => t.title.trim() || t.artist.trim()
      )
      if (validTracks.length > 0) {
        formData.set("source_tracks", JSON.stringify(validTracks))
      }

      onPublish(formData)
    },
    [
      title,
      description,
      genre,
      bpm,
      audioUrl,
      coverImageUrl,
      duration,
      sourceTracks,
      onPublish,
    ]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Give your mashup a name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Tell people about your mashup..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Genre & BPM row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bpm">BPM</Label>
          <Input
            id="bpm"
            type="number"
            placeholder="e.g. 128"
            min={1}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingCover}
                asChild
              >
                <span>
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choose Image"
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF. Max 10MB.
            </p>
          </div>
        </div>
      </div>

      {/* Source Tracks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Source Tracks</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSourceTrack}
          >
            <Plus className="h-4 w-4" />
            Add Track
          </Button>
        </div>
        <div className="space-y-2">
          {sourceTracks.map((track, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Track title"
                value={track.title}
                onChange={(e) =>
                  updateSourceTrack(index, "title", e.target.value)
                }
                className="flex-1"
              />
              <Input
                placeholder="Artist"
                value={track.artist}
                onChange={(e) =>
                  updateSourceTrack(index, "artist", e.target.value)
                }
                className="flex-1"
              />
              {sourceTracks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSourceTrack(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending || !title.trim()}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          "Publish Mashup"
        )}
      </Button>
    </form>
  )
}
