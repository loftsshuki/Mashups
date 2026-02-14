"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  Subtitles, 
  Wand2, 
  RefreshCw, 
  Check, 
  Copy,
  Download,
  Languages,
  Hash,
  Sparkles,
  Type
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Phase 2: Auto-Caption Generator with platform-native formatting

interface CaptionStyle {
  id: string
  name: string
  font: string
  size: string
  color: string
  background: string
  animation: "none" | "pop" | "slide" | "bounce"
}

interface GeneratedCaption {
  id: string
  text: string
  startTime: number
  endTime: number
  speaker?: string
  emotion?: "neutral" | "excited" | "dramatic"
}

interface PlatformFormat {
  platform: "tiktok" | "instagram" | "youtube" | "twitter"
  maxChars: number
  hashtagCount: number
  mentionSupport: boolean
  emojiSupport: boolean
}

const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: "tiktok",
    name: "TikTok Style",
    font: "sans-serif",
    size: "24px",
    color: "#fff",
    background: "rgba(0,0,0,0.7)",
    animation: "pop",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    font: "sans-serif",
    size: "22px",
    color: "#fff",
    background: "rgba(0,0,0,0.6)",
    animation: "slide",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    font: "Roboto, sans-serif",
    size: "20px",
    color: "#fff",
    background: "rgba(0,0,0,0.75)",
    animation: "none",
  },
  {
    id: "karaoke",
    name: "Karaoke",
    font: "sans-serif",
    size: "28px",
    color: "#ffeb3b",
    background: "rgba(0,0,0,0.5)",
    animation: "bounce",
  },
]

const PLATFORM_FORMATS: Record<string, PlatformFormat> = {
  tiktok: { platform: "tiktok", maxChars: 2200, hashtagCount: 10, mentionSupport: true, emojiSupport: true },
  instagram: { platform: "instagram", maxChars: 2200, hashtagCount: 30, mentionSupport: true, emojiSupport: true },
  youtube: { platform: "youtube", maxChars: 5000, hashtagCount: 15, mentionSupport: true, emojiSupport: true },
  twitter: { platform: "twitter", maxChars: 280, hashtagCount: 5, mentionSupport: true, emojiSupport: true },
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
]

interface AutoCaptionGeneratorProps {
  audioUrl?: string
  lyrics?: string
  platform?: "tiktok" | "instagram" | "youtube" | "twitter"
  onCaptionsGenerated?: (captions: GeneratedCaption[], style: CaptionStyle) => void
  className?: string
}

export function AutoCaptionGenerator({
  audioUrl,
  lyrics,
  platform = "tiktok",
  onCaptionsGenerated,
  className,
}: AutoCaptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [captions, setCaptions] = useState<GeneratedCaption[]>([])
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>(CAPTION_STYLES[0])
  const [language, setLanguage] = useState("en")
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [wordByWord, setWordByWord] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])

  // Generate captions from audio/lyrics
  const generateCaptions = useCallback(async () => {
    setIsGenerating(true)
    
    // Simulate AI transcription
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Mock generated captions based on input
    const mockCaptions: GeneratedCaption[] = lyrics
      ? generateCaptionsFromLyrics(lyrics)
      : generateMockCaptions()
    
    setCaptions(mockCaptions)
    
    // Generate platform-optimized description
    const description = generatePlatformDescription(platform, mockCaptions)
    setGeneratedDescription(description)
    
    // Generate hashtag suggestions
    const hashtags = generateHashtagSuggestions(mockCaptions, platform)
    setSuggestedHashtags(hashtags)
    
    onCaptionsGenerated?.(mockCaptions, selectedStyle)
    setIsGenerating(false)
  }, [lyrics, platform, selectedStyle, onCaptionsGenerated])

  // Parse lyrics into timed captions
  const generateCaptionsFromLyrics = (lyricsText: string): GeneratedCaption[] => {
    const lines = lyricsText.split("\n").filter((line) => line.trim())
    const captions: GeneratedCaption[] = []
    let currentTime = 0
    
    lines.forEach((line, index) => {
      const duration = estimateLineDuration(line)
      captions.push({
        id: `cap_${index}`,
        text: line.trim(),
        startTime: currentTime,
        endTime: currentTime + duration,
        emotion: detectEmotion(line),
      })
      currentTime += duration
    })
    
    return captions
  }

  // Estimate how long a line should be displayed
  const estimateLineDuration = (line: string): number => {
    const words = line.split(" ").length
    return Math.max(2, words * 0.5) // Minimum 2 seconds
  }

  // Detect emotion from text
  const detectEmotion = (text: string): GeneratedCaption["emotion"] => {
    const excitedWords = ["wow", "amazing", "incredible", "yeah", "let's go"]
    const dramaticWords = ["never", "always", "forever", "pain", "love"]
    
    const lower = text.toLowerCase()
    if (excitedWords.some((w) => lower.includes(w))) return "excited"
    if (dramaticWords.some((w) => lower.includes(w))) return "dramatic"
    return "neutral"
  }

  // Generate mock captions when no lyrics provided
  const generateMockCaptions = (): GeneratedCaption[] => {
    return [
      { id: "cap_1", text: "🎵 Drop the beat", startTime: 0, endTime: 3, emotion: "excited" },
      { id: "cap_2", text: "Feel the rhythm", startTime: 3, endTime: 6, emotion: "neutral" },
      { id: "cap_3", text: "Let it take control 🔥", startTime: 6, endTime: 9, emotion: "excited" },
      { id: "cap_4", text: "This is the moment", startTime: 9, endTime: 12, emotion: "dramatic" },
    ]
  }

  // Generate platform-optimized description
  const generatePlatformDescription = (platform: string, captions: GeneratedCaption[]): string => {
    const fullText = captions.map((c) => c.text).join(" ")
    const format = PLATFORM_FORMATS[platform]
    
    let description = fullText.slice(0, 100)
    if (description.length < fullText.length) description += "..."
    
    description += "\n\n"
    description += "Made with Mashups.com 🎵\n"
    
    if (includeHashtags) {
      const hashtags = generateHashtagSuggestions(captions, platform)
      description += "\n" + hashtags.slice(0, format.hashtagCount).join(" ")
    }
    
    return description.slice(0, format.maxChars)
  }

  // Generate hashtag suggestions
  const generateHashtagSuggestions = (captions: GeneratedCaption[], platform: string): string[] => {
    const text = captions.map((c) => c.text).join(" ").toLowerCase()
    const baseHashtags = ["#mashup", "#remix", "#music", "#viral", "#trending"]
    
    // Extract potential hashtags from content
    const contentWords = text
      .replace(/[.,!?]/g, "")
      .split(" ")
      .filter((w) => w.length > 4)
      .slice(0, 5)
    
    const contentHashtags = contentWords.map((w) => `#${w}`)
    
    const platformSpecific: Record<string, string[]> = {
      tiktok: ["#tiktokmashup", "#viralaudio", "#soundon"],
      instagram: ["#reels", "#instamusic", "#remixreels"],
      youtube: ["#shorts", "#youtubemusic", "#mashupshorts"],
      twitter: ["#music", "#nowplaying", "#newmusic"],
    }
    
    return [...baseHashtags, ...contentHashtags, ...platformSpecific[platform]]
  }

  // Export captions in different formats
  const exportCaptions = (format: "srt" | "vtt" | "txt") => {
    let content = ""
    
    if (format === "srt") {
      captions.forEach((cap, i) => {
        content += `${i + 1}\n`
        content += `${formatTime(cap.startTime)} --> ${formatTime(cap.endTime)}\n`
        content += `${cap.text}\n\n`
      })
    } else if (format === "vtt") {
      content = "WEBVTT\n\n"
      captions.forEach((cap) => {
        content += `${formatTime(cap.startTime)} --> ${formatTime(cap.endTime)}\n`
        content += `${cap.text}\n\n`
      })
    } else {
      content = captions.map((c) => c.text).join("\n")
    }
    
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `captions.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Format time for SRT/VTT
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const format = PLATFORM_FORMATS[platform]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Subtitles className="h-4 w-4 text-primary" />
          Auto-Caption Generator
          <Badge variant="outline" className="text-[10px] ml-auto capitalize">
            {platform}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Generate Button */}
        {captions.length === 0 ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              AI will transcribe your audio and generate platform-optimized captions.
            </p>
            <Button onClick={generateCaptions} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Captions
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Caption Preview */}
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="preview" className="text-[10px]">Preview</TabsTrigger>
                <TabsTrigger value="style" className="text-[10px]">Style</TabsTrigger>
                <TabsTrigger value="export" className="text-[10px]">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-3 mt-2">
                {/* Live Preview */}
                <div 
                  className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{ fontFamily: selectedStyle.font }}
                >
                  {/* Mock video background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
                  
                  {/* Sample captions */}
                  <div className="relative z-10 text-center px-4 space-y-2">
                    {captions.slice(0, 2).map((cap) => (
                      <div
                        key={cap.id}
                        className={cn(
                          "px-3 py-1.5 rounded",
                          selectedStyle.animation === "pop" && "animate-in zoom-in",
                          selectedStyle.animation === "slide" && "animate-in slide-in-from-bottom",
                          selectedStyle.animation === "bounce" && "animate-in bounce"
                        )}
                        style={{
                          backgroundColor: selectedStyle.background,
                          fontSize: `${fontSize}px`,
                          color: selectedStyle.color,
                        }}
                      >
                        {cap.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caption List */}
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {captions.map((cap, i) => (
                      <div 
                        key={cap.id}
                        className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs"
                      >
                        <span className="text-muted-foreground w-6">{i + 1}</span>
                        <span className="text-muted-foreground w-16">
                          {cap.startTime.toFixed(1)}s
                        </span>
                        <span className="flex-1 truncate">{cap.text}</span>
                        {cap.emotion !== "neutral" && (
                          <Badge variant="outline" className="text-[9px] h-4">
                            {cap.emotion}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="style" className="space-y-3 mt-2">
                {/* Style Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Caption Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAPTION_STYLES.map((style) => (
                      <Button
                        key={style.id}
                        variant={selectedStyle.id === style.id ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-8"
                        onClick={() => setSelectedStyle(style)}
                      >
                        {style.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code} className="text-xs">
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Font Size</span>
                    <span>{fontSize}px</span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    min={16}
                    max={40}
                    step={2}
                    onValueChange={(v) => setFontSize(v[0])}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Word-by-word reveal</span>
                    <Switch
                      checked={wordByWord}
                      onCheckedChange={setWordByWord}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Include emojis</span>
                    <Switch
                      checked={includeEmojis}
                      onCheckedChange={setIncludeEmojis}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-3 mt-2">
                {/* Export Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => exportCaptions("srt")}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    SRT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => exportCaptions("vtt")}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    VTT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => exportCaptions("txt")}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Text
                  </Button>
                </div>

                {/* Generated Description */}
                {generatedDescription && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <Type className="h-3 w-3" />
                        Platform Description
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(generatedDescription)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={generatedDescription}
                      readOnly
                      className="text-xs min-h-[80px] resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {generatedDescription.length}/{format.maxChars} chars
                    </p>
                  </div>
                )}

                {/* Suggested Hashtags */}
                {suggestedHashtags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Suggested Hashtags
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {suggestedHashtags.slice(0, format.hashtagCount).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] cursor-pointer hover:bg-primary/20"
                          onClick={() => copyToClipboard(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setCaptions([])
                setGeneratedDescription("")
                setSuggestedHashtags([])
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Import ScrollArea
import { ScrollArea } from "@/components/ui/scroll-area"
