// MIDI Controller Support - Web MIDI API integration

export interface MIDIDevice {
  id: string
  name: string
  manufacturer: string
  type: "input" | "output"
  connected: boolean
}

export interface MIDIMapping {
  id: string
  name: string
  control: number // CC number
  target: "volume" | "pan" | "mute" | "solo" | "play" | "pause" | "stop" | "record" | "seek" | "tempo"
  trackId?: string
  minValue: number
  maxValue: number
  inverted: boolean
}

export interface MIDIState {
  isSupported: boolean
  inputs: MIDIDevice[]
  outputs: MIDIDevice[]
  selectedInput: string | null
  mappings: MIDIMapping[]
  isLearning: boolean
  learningTarget: MIDIMapping["target"] | null
}

// Check if Web MIDI API is supported
export function isMIDISupported(): boolean {
  return typeof navigator !== "undefined" && "requestMIDIAccess" in navigator
}

// Request MIDI access
export async function requestMIDIAccess(): Promise<MIDIAccess | null> {
  if (!isMIDISupported()) return null
  
  try {
    const access = await navigator.requestMIDIAccess({ sysex: false })
    return access
  } catch (err) {
    console.error("Failed to get MIDI access:", err)
    return null
  }
}

// Get all MIDI devices
export function getMIDIDevices(access: MIDIAccess): { inputs: MIDIDevice[]; outputs: MIDIDevice[] } {
  const inputs: MIDIDevice[] = []
  const outputs: MIDIDevice[] = []
  
  access.inputs.forEach(input => {
    inputs.push({
      id: input.id,
      name: input.name || "Unknown Input",
      manufacturer: input.manufacturer || "Unknown",
      type: "input",
      connected: input.state === "connected",
    })
  })
  
  access.outputs.forEach(output => {
    outputs.push({
      id: output.id,
      name: output.name || "Unknown Output",
      manufacturer: output.manufacturer || "Unknown",
      type: "output",
      connected: output.state === "connected",
    })
  })
  
  return { inputs, outputs }
}

// Parse MIDI message
export interface MIDIMessage {
  command: number
  channel: number
  note?: number
  velocity?: number
  control?: number
  value?: number
  timestamp: number
}

export function parseMIDIMessage(data: Uint8Array, timestamp: number): MIDIMessage | null {
  if (data.length < 2) return null
  
  const status = data[0]
  const command = status >> 4
  const channel = status & 0x0f
  
  const message: MIDIMessage = {
    command,
    channel,
    timestamp,
  }
  
  switch (command) {
    case 8: // Note Off
    case 9: // Note On
      if (data.length >= 3) {
        message.note = data[1]
        message.velocity = data[2]
      }
      break
    case 11: // Control Change
      if (data.length >= 3) {
        message.control = data[1]
        message.value = data[2]
      }
      break
    case 12: // Program Change
      message.note = data[1]
      break
    case 13: // Channel Pressure
      message.value = data[1]
      break
    case 14: // Pitch Bend
      if (data.length >= 3) {
        message.value = (data[2] << 7) | data[1]
      }
      break
  }
  
  return message
}

// Default MIDI mappings
export const defaultMIDIMappings: MIDIMapping[] = [
  { id: "mapping_1", name: "Master Volume", control: 7, target: "volume", minValue: 0, maxValue: 127, inverted: false },
  { id: "mapping_2", name: "Pan", control: 10, target: "pan", minValue: 0, maxValue: 127, inverted: false },
  { id: "mapping_3", name: "Play", control: 117, target: "play", minValue: 127, maxValue: 127, inverted: false },
  { id: "mapping_4", name: "Stop", control: 118, target: "stop", minValue: 127, maxValue: 127, inverted: false },
  { id: "mapping_5", name: "Record", control: 119, target: "record", minValue: 127, maxValue: 127, inverted: false },
]

// MIDI Controller Manager class
export class MIDIControllerManager {
  private access: MIDIAccess | null = null
  private selectedInput: MIDIInput | null = null
  private mappings: MIDIMapping[] = [...defaultMIDIMappings]
  private listeners: Map<string, ((value: number) => void)[]> = new Map()
  private onMessageCallback: ((message: MIDIMessage) => void) | null = null

  constructor() {}

  async init(): Promise<boolean> {
    this.access = await requestMIDIAccess()
    return !!this.access
  }

  getDevices(): { inputs: MIDIDevice[]; outputs: MIDIDevice[] } {
    if (!this.access) return { inputs: [], outputs: [] }
    return getMIDIDevices(this.access)
  }

  selectInput(inputId: string): boolean {
    if (!this.access) return false
    
    const input = this.access.inputs.get(inputId)
    if (!input) return false
    
    // Remove listener from previous input
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null
    }
    
    this.selectedInput = input
    input.onmidimessage = (event: MIDIMessageEvent) => {
      this.handleMessage(event)
    }
    
    return true
  }

  private handleMessage(event: MIDIMessageEvent) {
    if (!event.data) return
    
    const message = parseMIDIMessage(event.data, event.timeStamp)
    if (!message) return
    
    // Process control change messages
    if (message.command === 11 && message.control !== undefined && message.value !== undefined) {
      const mapping = this.mappings.find(m => m.control === message.control)
      if (mapping) {
        const normalizedValue = this.normalizeValue(message.value, mapping)
        this.triggerCallback(mapping.target, normalizedValue)
      }
    }
    
    if (this.onMessageCallback) {
      this.onMessageCallback(message)
    }
  }

  private normalizeValue(rawValue: number, mapping: MIDIMapping): number {
    let normalized = (rawValue - mapping.minValue) / (mapping.maxValue - mapping.minValue)
    normalized = Math.max(0, Math.min(1, normalized))
    return mapping.inverted ? 1 - normalized : normalized
  }

  private triggerCallback(target: string, value: number) {
    const callbacks = this.listeners.get(target)
    if (callbacks) {
      callbacks.forEach(cb => cb(value))
    }
  }

  onControlChange(target: MIDIMapping["target"], callback: (value: number) => void): () => void {
    if (!this.listeners.has(target)) {
      this.listeners.set(target, [])
    }
    this.listeners.get(target)!.push(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(target)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  setOnMessageCallback(callback: (message: MIDIMessage) => void) {
    this.onMessageCallback = callback
  }

  addMapping(mapping: Omit<MIDIMapping, "id">): MIDIMapping {
    const newMapping: MIDIMapping = {
      ...mapping,
      id: `mapping_${Date.now()}`,
    }
    this.mappings.push(newMapping)
    return newMapping
  }

  removeMapping(id: string): boolean {
    const index = this.mappings.findIndex(m => m.id === id)
    if (index > -1) {
      this.mappings.splice(index, 1)
      return true
    }
    return false
  }

  getMappings(): MIDIMapping[] {
    return [...this.mappings]
  }

  learnMode(target: MIDIMapping["target"]): Promise<number> {
    return new Promise((resolve) => {
      const originalCallback = this.onMessageCallback
      
      this.setOnMessageCallback((message) => {
        if (message.command === 11 && message.control !== undefined) {
          this.setOnMessageCallback(originalCallback)
          resolve(message.control)
        }
      })
      
      // Timeout after 10 seconds
      setTimeout(() => {
        this.setOnMessageCallback(originalCallback)
        resolve(-1)
      }, 10000)
    })
  }

  disconnect() {
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null
      this.selectedInput = null
    }
    this.access = null
    this.listeners.clear()
  }
}

// Create singleton instance
export const midiManager = new MIDIControllerManager()

// Hook helper for React
export function useMIDIController() {
  return {
    isSupported: isMIDISupported(),
    manager: midiManager,
  }
}
