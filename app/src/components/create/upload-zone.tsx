"use client"

import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void
  className?: string
  disabled?: boolean
}

export function UploadZone({ onFilesAdded, className, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("audio/")
      )

      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles)
      }
    },
    [disabled, onFilesAdded]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      if (selectedFiles.length > 0) {
        onFilesAdded(selectedFiles)
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [onFilesAdded]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-16 transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
          isDragOver ? "bg-primary/20" : "bg-primary/10"
        )}
      >
        <Upload
          className={cn(
            "h-8 w-8 transition-colors",
            isDragOver ? "text-primary" : "text-primary"
          )}
        />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          {isDragOver ? "Drop your tracks" : "Drop your tracks here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          MP3, WAV, FLAC, or M4A up to 50MB each
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-2"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
      >
        Browse Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  )
}
