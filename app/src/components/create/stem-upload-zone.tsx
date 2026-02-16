"use client"

import { useCallback, useState } from "react"
import { Upload, Wand2, Loader2, Music, Mic, Drum, Guitar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export interface SeparatedStems {
  vocals: string
  drums: string
  bass: string
  other: string
}

export interface StemUploadResult {
  file: File
  name: string
  size: number
  uploadedUrl: string
  localBlobUrl?: string // browser blob URL for local playback
  duration?: number
  stems?: SeparatedStems
  isProcessingStems?: boolean
  stemError?: string
  uploadProgress?: number
}

interface StemUploadZoneProps {
  onFilesAdded: (files: StemUploadResult[]) => void
  disabled?: boolean
  maxFiles?: number
  acceptedTypes?: string[]
}

const stemTypeIcons = {
  vocals: Mic,
  drums: Drum,
  bass: Guitar,
  other: Music,
}

const stemTypeLabels = {
  vocals: "Vocals",
  drums: "Drums",
  bass: "Bass",
  other: "Other",
}

const stemTypeColors = {
  vocals: "text-pink-400",
  drums: "text-amber-400",
  bass: "text-emerald-400",
  other: "text-blue-400",
}

export function StemUploadZone({
  onFilesAdded,
  disabled = false,
  maxFiles = 10,
  acceptedTypes = [".mp3", ".wav", ".m4a", ".flac", ".ogg"],
}: StemUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [enableStemSeparation, setEnableStemSeparation] = useState(true)
  const [isCheckingConfig, setIsCheckingConfig] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  // Check if stem separation is configured on mount
  useState(() => {
    fetch("/api/audio/separate")
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(data.modal || data.replicate || false)
        setIsCheckingConfig(false)
      })
      .catch(() => {
        setIsConfigured(false)
        setIsCheckingConfig(false)
      })
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const separateStems = async (uploadedUrl: string, duration: number): Promise<SeparatedStems> => {
    const response = await fetch("/api/audio/separate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl: uploadedUrl, duration }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Stem separation failed")
    }

    const data = await response.json()
    return data.stems
  }

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const audioFiles = Array.from(files).filter((file) =>
      acceptedTypes.some((type) => 
        file.name.toLowerCase().endsWith(type)
      )
    )

    if (audioFiles.length === 0) return

    const limitedFiles = audioFiles.slice(0, maxFiles)
    
    // Create initial results with browser blob URLs for local playback
    const initialResults: StemUploadResult[] = limitedFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      uploadedUrl: "", // Will be filled after upload
      localBlobUrl: URL.createObjectURL(file),
      isProcessingStems: enableStemSeparation && isConfigured,
    }))

    onFilesAdded(initialResults)

    // Upload each file
    for (const result of initialResults) {
      try {
        const formData = new FormData()
        formData.set("file", result.file)

        // Upload to storage
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Upload failed")
        }

        const uploadData = await uploadResponse.json()
        const uploadedUrl = uploadData.url

        // Get audio duration from the local blob URL
        let duration = 180 // default estimate
        try {
          const audio = new Audio(result.localBlobUrl!)
          duration = await new Promise<number>((resolve) => {
            audio.addEventListener("loadedmetadata", () => resolve(audio.duration))
            audio.addEventListener("error", () => resolve(180))
            setTimeout(() => resolve(180), 5000)
          })
        } catch {
          // Use default duration
        }

        let stems: SeparatedStems | undefined
        let stemError: string | undefined

        // Separate stems if enabled
        if (enableStemSeparation && isConfigured) {
          try {
            stems = await separateStems(uploadedUrl, duration)
          } catch (error) {
            stemError = error instanceof Error ? error.message : "Stem separation failed"
          }
        }

        // Update result with stems
        const updatedResult: StemUploadResult = {
          ...result,
          uploadedUrl,
          duration,
          stems,
          isProcessingStems: false,
          stemError,
          uploadProgress: 100,
        }

        onFilesAdded([updatedResult])

      } catch (error) {
        const updatedResult: StemUploadResult = {
          ...result,
          stemError: error instanceof Error ? error.message : "Upload failed",
          isProcessingStems: false,
        }
        onFilesAdded([updatedResult])
      }
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      void processFiles(e.dataTransfer.files)
    },
    [disabled, enableStemSeparation, isConfigured]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      void processFiles(e.target.files)
      e.target.value = "" // Reset input
    },
    [disabled, enableStemSeparation, isConfigured]
  )

  return (
    <div className="space-y-4">
      {/* Stem separation toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label htmlFor="stem-separation" className="cursor-pointer font-medium">
              AI Stem Separation
            </Label>
            <p className="text-xs text-muted-foreground">
              {isCheckingConfig
                ? "Checking configuration..."
                : isConfigured
                ? "Automatically split tracks into vocals, drums, bass & other"
                : "Not configured — set MODAL_STEM_ENDPOINT or REPLICATE_API_TOKEN to enable"}
            </p>
          </div>
        </div>
        <Switch
          id="stem-separation"
          checked={enableStemSeparation}
          onCheckedChange={setEnableStemSeparation}
          disabled={disabled || !isConfigured || isCheckingConfig}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/5",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={disabled}
        />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Upload className="h-7 w-7" />
        </div>

        <p className="mt-4 text-center font-medium">
          {isDragging ? "Drop audio files here" : "Drag & drop audio files"}
        </p>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          or click to browse
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Supports {acceptedTypes.join(", ").replace(/\./g, "").toUpperCase()}
        </p>
        {enableStemSeparation && isConfigured && (
          <p className="mt-2 text-center text-xs text-primary">
            <Wand2 className="mr-1 inline h-3 w-3" />
            Stems will be automatically extracted
          </p>
        )}
      </div>
    </div>
  )
}

interface StemListProps {
  stems?: SeparatedStems
  isProcessing?: boolean
  error?: string
  onPlayStem?: (stemType: keyof SeparatedStems, url: string) => void
  activeStem?: keyof SeparatedStems | null
}

export function StemList({
  stems,
  isProcessing,
  error,
  onPlayStem,
  activeStem,
}: StemListProps) {
  if (isProcessing) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Separating stems with AI...
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          This may take 30-60 seconds depending on track length
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
        <p className="text-sm text-destructive">Stem separation failed: {error}</p>
      </div>
    )
  }

  if (!stems) {
    return null
  }

  const stemTypes = Object.keys(stems) as (keyof SeparatedStems)[]

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Separated Stems
      </p>
      <div className="grid grid-cols-2 gap-2">
        {stemTypes.map((type) => {
          const Icon = stemTypeIcons[type]
          const isActive = activeStem === type
          
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={cn(
                "justify-start gap-2 rounded-lg",
                isActive && "border-primary bg-primary/10"
              )}
              onClick={() => onPlayStem?.(type, stems[type])}
            >
              <Icon className={cn("h-4 w-4", stemTypeColors[type])} />
              <span className="text-xs">{stemTypeLabels[type]}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
