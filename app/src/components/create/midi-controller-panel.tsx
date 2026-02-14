"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Music, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  MicOff,
  Trash2,
  Plus,
  AlertCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { midiManager, useMIDIController, type MIDIDevice, type MIDIMapping } from "@/lib/data/midi-controller"

interface MIDIControllerPanelProps {
  onVolumeChange?: (trackId: string, volume: number) => void
  onMuteToggle?: (trackId: string, muted: boolean) => void
  onPlay?: () => void
  onPause?: () => void
  onStop?: () => void
  onSeek?: (position: number) => void
  tracks?: { id: string; name: string; volume: number; muted: boolean }[]
  className?: string
}

export function MIDIControllerPanel({
  onVolumeChange,
  onMuteToggle,
  onPlay,
  onPause,
  onStop,
  onSeek,
  tracks = [],
  className,
}: MIDIControllerPanelProps) {
  const { isSupported } = useMIDIController()
  const [isInitialized, setIsInitialized] = useState(false)
  const [devices, setDevices] = useState<{ inputs: MIDIDevice[]; outputs: MIDIDevice[] }>({ inputs: [], outputs: [] })
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [mappings, setMappings] = useState<MIDIMapping[]>([])
  const [isLearning, setIsLearning] = useState(false)
  const [learningTarget, setLearningTarget] = useState<MIDIMapping["target"] | null>(null)
  const [lastMessage, setLastMessage] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Initialize MIDI
  useEffect(() => {
    if (!isSupported) return

    async function init() {
      const success = await midiManager.init()
      if (success) {
        setIsInitialized(true)
        refreshDevices()
        setMappings(midiManager.getMappings())

        // Subscribe to all control changes
        const targets: MIDIMapping["target"][] = ["volume", "pan", "mute", "play", "pause", "stop", "seek"]
        targets.forEach(target => {
          const unsubscribe = midiManager.onControlChange(target, (value) => {
            handleControlChange(target, value)
          })
          // Store the last unsubscribe function (simplified for demo)
          if (target === "volume") {
            unsubscribeRef.current = unsubscribe
          }
        })

        // Listen for all messages
        midiManager.setOnMessageCallback((message) => {
          setLastMessage(`Ch${message.channel + 1} CC${message.control}=${message.value}`)
        })
      }
    }

    init()

    return () => {
      unsubscribeRef.current?.()
      midiManager.disconnect()
    }
  }, [isSupported])

  const refreshDevices = () => {
    const devs = midiManager.getDevices()
    setDevices(devs)
    if (devs.inputs.length > 0 && !selectedDevice) {
      setSelectedDevice(devs.inputs[0].id)
      midiManager.selectInput(devs.inputs[0].id)
    }
  }

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
    midiManager.selectInput(deviceId)
  }

  const handleControlChange = (target: MIDIMapping["target"], value: number) => {
    switch (target) {
      case "volume":
        // Apply to first track or master
        if (tracks[0]) {
          onVolumeChange?.(tracks[0].id, value * 100)
        }
        break
      case "mute":
        if (tracks[0]) {
          onMuteToggle?.(tracks[0].id, value > 0.5)
        }
        break
      case "play":
        if (value > 0.5) onPlay?.()
        break
      case "pause":
        if (value > 0.5) onPause?.()
        break
      case "stop":
        if (value > 0.5) onStop?.()
        break
      case "seek":
        onSeek?.(value * 100) // Percentage
        break
    }
  }

  const startLearning = async (target: MIDIMapping["target"]) => {
    setIsLearning(true)
    setLearningTarget(target)
    
    const controlNumber = await midiManager.learnMode(target)
    
    if (controlNumber >= 0) {
      const newMapping = midiManager.addMapping({
        name: `${target} Control`,
        control: controlNumber,
        target,
        minValue: 0,
        maxValue: 127,
        inverted: false,
      })
      setMappings([...mappings, newMapping])
    }
    
    setIsLearning(false)
    setLearningTarget(null)
  }

  const removeMapping = (id: string) => {
    midiManager.removeMapping(id)
    setMappings(mappings.filter(m => m.id !== id))
  }

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-xl border border-destructive/50 bg-destructive/10", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">MIDI Not Supported</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your browser doesn&apos;t support Web MIDI API. Try Chrome or Edge.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-medium">MIDI Controller</span>
          {isInitialized ? (
            <Badge variant="default" className="text-[10px]">Connected</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">Disconnected</Badge>
          )}
        </div>
        
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>MIDI Controller Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Device Selection */}
              <div className="space-y-2">
                <Label>Input Device</Label>
                <div className="flex gap-2">
                  <Select value={selectedDevice} onValueChange={handleDeviceSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select MIDI device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.inputs.map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.manufacturer})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={refreshDevices}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                {devices.inputs.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No MIDI devices found. Connect a controller and refresh.
                  </p>
                )}
              </div>

              {/* Last Message */}
              {lastMessage && (
                <div className="p-2 rounded bg-muted text-xs font-mono">
                  Last message: {lastMessage}
                </div>
              )}

              {/* Mappings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Control Mappings</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("volume")}
                    disabled={isLearning}
                  >
                    {isLearning ? (
                      <>
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Move a control...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1 h-3 w-3" />
                        Learn Mapping
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-auto">
                  {mappings.map(mapping => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-mono">
                          CC{mapping.control}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{mapping.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {mapping.target} {mapping.trackId && `• Track ${mapping.trackId}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeMapping(mapping.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {mappings.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No mappings configured. Click "Learn Mapping" and move a control on your device.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Mapping Buttons */}
              <div className="space-y-2">
                <Label>Quick Map</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("play")}
                    disabled={isLearning}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("pause")}
                    disabled={isLearning}
                  >
                    <Pause className="mr-1 h-3 w-3" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("stop")}
                    disabled={isLearning}
                  >
                    <Square className="mr-1 h-3 w-3" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("volume")}
                    disabled={isLearning}
                  >
                    <Volume2 className="mr-1 h-3 w-3" />
                    Volume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLearning("mute")}
                    disabled={isLearning}
                  >
                    <VolumeX className="mr-1 h-3 w-3" />
                    Mute
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device Status */}
      {selectedDevice ? (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">
            {devices.inputs.find(d => d.id === selectedDevice)?.name}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          No device selected
        </div>
      )}

      {/* Active Mappings Summary */}
      {mappings.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mappings.slice(0, 4).map(mapping => (
            <Badge key={mapping.id} variant="secondary" className="text-[10px]">
              {mapping.target}
            </Badge>
          ))}
          {mappings.length > 4 && (
            <Badge variant="secondary" className="text-[10px]">
              +{mappings.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Test Controls */}
      <div className="space-y-2 pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground">Test Controls</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={onPlay}>
            <Play className="mr-1 h-3 w-3" />
            Play
          </Button>
          <Button variant="outline" size="sm" onClick={onPause}>
            <Pause className="mr-1 h-3 w-3" />
            Pause
          </Button>
          <Button variant="outline" size="sm" onClick={onStop}>
            <Square className="mr-1 h-3 w-3" />
            Stop
          </Button>
        </div>
      </div>
    </div>
  )
}

// Compact MIDI indicator for toolbar
interface MIDIIndicatorProps {
  isConnected?: boolean
  deviceName?: string
  onClick?: () => void
}

export function MIDIIndicator({ isConnected, deviceName, onClick }: MIDIIndicatorProps) {
  return (
    <Button
      variant={isConnected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Music className="h-4 w-4" />
      {isConnected ? (
        <span className="max-w-[100px] truncate">{deviceName || "MIDI"}</span>
      ) : (
        <span>MIDI</span>
      )}
    </Button>
  )
}
