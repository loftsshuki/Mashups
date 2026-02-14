/**
 * Volume Automation System
 * Node-based volume changes over time
 */

export type AutomationNodeType = "linear" | "ease-in" | "ease-out" | "ease-in-out"

export interface AutomationNode {
  id: string
  time: number // Time in seconds
  value: number // Volume 0-100
  type: AutomationNodeType
}

export interface AutomationLane {
  id: string
  trackId: string
  parameter: "volume" | "pan" | "filter"
  nodes: AutomationNode[]
  minValue: number
  maxValue: number
  defaultValue: number
}

/**
 * Create a new automation node
 */
export function createNode(
  time: number,
  value: number,
  type: AutomationNodeType = "linear"
): AutomationNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time,
    value: Math.max(0, Math.min(100, value)),
    type,
  }
}

/**
 * Sort nodes by time
 */
export function sortNodes(nodes: AutomationNode[]): AutomationNode[] {
  return [...nodes].sort((a, b) => a.time - b.time)
}

/**
 * Get value at a specific time using interpolation
 */
export function getValueAtTime(nodes: AutomationNode[], time: number): number {
  const sorted = sortNodes(nodes)
  
  if (sorted.length === 0) return 100 // Default volume
  if (time <= sorted[0].time) return sorted[0].value
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value
  
  // Find surrounding nodes
  let prev = sorted[0]
  let next = sorted[sorted.length - 1]
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      prev = sorted[i]
      next = sorted[i + 1]
      break
    }
  }
  
  // Interpolate
  const range = next.time - prev.time
  if (range === 0) return prev.value
  
  const progress = (time - prev.time) / range
  const easedProgress = applyEasing(progress, next.type)
  
  return prev.value + (next.value - prev.value) * easedProgress
}

/**
 * Apply easing function
 */
function applyEasing(t: number, type: AutomationNodeType): number {
  switch (type) {
    case "linear":
      return t
    case "ease-in":
      return t * t
    case "ease-out":
      return 1 - (1 - t) * (1 - t)
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    default:
      return t
  }
}

/**
 * Generate SVG path from nodes
 */
export function generatePath(
  nodes: AutomationNode[],
  width: number,
  height: number,
  duration: number
): string {
  const sorted = sortNodes(nodes)
  
  if (sorted.length === 0) {
    // Return flat line at default volume
    const y = height * (1 - 100 / 100) * 0.8 + height * 0.1
    return `M 0 ${y} L ${width} ${y}`
  }
  
  const points: { x: number; y: number }[] = []
  
  // Add start point
  points.push({
    x: 0,
    y: height * (1 - sorted[0].value / 100) * 0.8 + height * 0.1,
  })
  
  // Add node points
  sorted.forEach((node) => {
    points.push({
      x: (node.time / duration) * width,
      y: height * (1 - node.value / 100) * 0.8 + height * 0.1,
    })
  })
  
  // Add end point
  points.push({
    x: width,
    y: height * (1 - sorted[sorted.length - 1].value / 100) * 0.8 + height * 0.1,
  })
  
  // Generate path with bezier curves
  let path = `M ${points[0].x} ${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const prev = points[i - 1] || current
    
    // Calculate control points for smooth curve
    const cp1x = current.x + (next.x - prev.x) * 0.2
    const cp1y = current.y
    const cp2x = next.x - (next.x - current.x) * 0.2
    const cp2y = next.y
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }
  
  return path
}

/**
 * Add node at time, merging if close to existing
 */
export function addNode(
  nodes: AutomationNode[],
  time: number,
  value: number,
  mergeThreshold: number = 0.5
): AutomationNode[] {
  // Check if near existing node
  const existingIndex = nodes.findIndex(
    (n) => Math.abs(n.time - time) < mergeThreshold
  )
  
  if (existingIndex >= 0) {
    // Update existing node
    return nodes.map((n, i) =>
      i === existingIndex ? { ...n, value: Math.max(0, Math.min(100, value)) } : n
    )
  }
  
  // Add new node
  return [...nodes, createNode(time, value)]
}

/**
 * Remove node by ID
 */
export function removeNode(nodes: AutomationNode[], nodeId: string): AutomationNode[] {
  return nodes.filter((n) => n.id !== nodeId)
}

/**
 * Update node position
 */
export function updateNode(
  nodes: AutomationNode[],
  nodeId: string,
  updates: Partial<Pick<AutomationNode, "time" | "value" | "type">>
): AutomationNode[] {
  return nodes.map((n) =>
    n.id === nodeId
      ? {
          ...n,
          ...updates,
          value: updates.value !== undefined ? Math.max(0, Math.min(100, updates.value)) : n.value,
        }
      : n
  )
}

/**
 * Create default volume automation (fade in/out)
 */
export function createDefaultAutomation(duration: number): AutomationNode[] {
  return [
    createNode(0, 0, "ease-out"), // Start silent
    createNode(Math.min(2, duration * 0.1), 100, "linear"), // Fade in
    createNode(Math.max(duration - 2, duration * 0.9), 100, "linear"), // Hold
    createNode(duration, 0, "ease-in"), // Fade out
  ]
}

/**
 * Export automation data for audio processing
 */
export function exportAutomationData(
  nodes: AutomationNode[],
  duration: number,
  sampleRate: number = 44100
): Float32Array {
  const totalSamples = Math.floor(duration * sampleRate)
  const data = new Float32Array(totalSamples)
  
  for (let i = 0; i < totalSamples; i++) {
    const time = i / sampleRate
    data[i] = getValueAtTime(nodes, time) / 100 // Normalize to 0-1
  }
  
  return data
}
