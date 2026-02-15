"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface GraphNode {
  id: string
  type: "mashup" | "stem"
  label: string
  creator?: string
  coverUrl?: string
  instrument?: string
  playCount?: number
  // computed
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphEdge {
  source: string
  target: string
  type: "uses" | "remix_of" | "shared_stem"
}

interface RemixGraphProps {
  mashupId: string
  className?: string
}

const INSTRUMENT_COLORS: Record<string, string> = {
  vocal: "#ec4899",
  vocals: "#ec4899",
  drums: "#f59e0b",
  bass: "#10b981",
  synth: "#8b5cf6",
  guitar: "#ef4444",
  texture: "#06b6d4",
  other: "#6b7280",
}

function getNodeColor(node: GraphNode): string {
  if (node.type === "stem") {
    return INSTRUMENT_COLORS[node.instrument ?? "other"] ?? INSTRUMENT_COLORS.other
  }
  return "#6366f1" // indigo for mashups
}

function getNodeRadius(node: GraphNode): number {
  if (node.type === "mashup") return 28
  return 16
}

export function RemixGraph({ mashupId, className }: RemixGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [dragNode, setDragNode] = useState<GraphNode | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const animFrameRef = useRef<number>(0)

  // Load graph data
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/graph/${encodeURIComponent(mashupId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { nodes: GraphNode[]; edges: GraphEdge[] }
        if (cancelled) return

        // Initialize positions in a circle
        const cx = 300
        const cy = 250
        const radius = 150
        data.nodes.forEach((node, i) => {
          const angle = (2 * Math.PI * i) / data.nodes.length
          node.x = cx + radius * Math.cos(angle)
          node.y = cy + radius * Math.sin(angle)
          node.vx = 0
          node.vy = 0
        })

        setNodes(data.nodes)
        setEdges(data.edges)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [mashupId])

  // Simple force-directed simulation
  const simulate = useCallback(() => {
    if (nodes.length === 0) return

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    // Apply forces
    for (let iter = 0; iter < 3; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = (b.x ?? 0) - (a.x ?? 0)
          const dy = (b.y ?? 0) - (a.y ?? 0)
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = 800 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx = (a.vx ?? 0) - fx
          a.vy = (a.vy ?? 0) - fy
          b.vx = (b.vx ?? 0) + fx
          b.vy = (b.vy ?? 0) + fy
        }
      }

      // Attraction along edges
      edges.forEach((edge) => {
        const a = nodeMap.get(edge.source)
        const b = nodeMap.get(edge.target)
        if (!a || !b) return
        const dx = (b.x ?? 0) - (a.x ?? 0)
        const dy = (b.y ?? 0) - (a.y ?? 0)
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const force = (dist - 120) * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx = (a.vx ?? 0) + fx
        a.vy = (a.vy ?? 0) + fy
        b.vx = (b.vx ?? 0) - fx
        b.vy = (b.vy ?? 0) - fy
      })

      // Apply velocities with damping
      nodes.forEach((node) => {
        if (node === dragNode) return
        node.x = (node.x ?? 0) + (node.vx ?? 0) * 0.3
        node.y = (node.y ?? 0) + (node.vy ?? 0) * 0.3
        node.vx = (node.vx ?? 0) * 0.6
        node.vy = (node.vy ?? 0) * 0.6
      })
    }

    setNodes([...nodes])
  }, [nodes, edges, dragNode])

  // Animation loop
  useEffect(() => {
    let running = true

    function tick() {
      if (!running) return
      simulate()
      animFrameRef.current = requestAnimationFrame(tick)
    }

    // Run simulation for a bit then slow down
    let ticks = 0
    function tickLimited() {
      if (!running || ticks > 200) return
      ticks++
      simulate()
      animFrameRef.current = requestAnimationFrame(tickLimited)
    }

    tickLimited()

    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [simulate])

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(offsetRef.current.x, offsetRef.current.y)
    ctx.scale(scaleRef.current, scaleRef.current)

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    // Draw edges
    edges.forEach((edge) => {
      const a = nodeMap.get(edge.source)
      const b = nodeMap.get(edge.target)
      if (!a || !b) return

      ctx.beginPath()
      ctx.moveTo(a.x ?? 0, a.y ?? 0)
      ctx.lineTo(b.x ?? 0, b.y ?? 0)
      ctx.strokeStyle = edge.type === "remix_of" ? "rgba(99, 102, 241, 0.4)" : "rgba(148, 163, 184, 0.3)"
      ctx.lineWidth = edge.type === "remix_of" ? 2 : 1
      if (edge.type === "uses") {
        ctx.setLineDash([4, 4])
      } else {
        ctx.setLineDash([])
      }
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Draw nodes
    nodes.forEach((node) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const r = getNodeRadius(node)
      const color = getNodeColor(node)
      const isHovered = hoveredNode?.id === node.id

      // Glow for hovered
      if (isHovered) {
        ctx.shadowColor = color
        ctx.shadowBlur = 12
      }

      // Circle
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = isHovered ? "#fff" : "rgba(255,255,255,0.2)"
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.stroke()

      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      // Label
      ctx.fillStyle = "#e2e8f0"
      ctx.font = node.type === "mashup" ? "bold 11px sans-serif" : "10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      const label = node.label.length > 18 ? node.label.slice(0, 16) + "..." : node.label
      ctx.fillText(label, x, y + r + 4)
    })

    ctx.restore()
  }, [nodes, edges, hoveredNode])

  // Mouse interactions
  const findNodeAt = useCallback(
    (clientX: number, clientY: number): GraphNode | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const mx = (clientX - rect.left - offsetRef.current.x) / scaleRef.current
      const my = (clientY - rect.top - offsetRef.current.y) / scaleRef.current

      for (const node of nodes) {
        const dx = mx - (node.x ?? 0)
        const dy = my - (node.y ?? 0)
        const r = getNodeRadius(node)
        if (dx * dx + dy * dy <= r * r) return node
      }
      return null
    },
    [nodes]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragNode) {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        dragNode.x = (e.clientX - rect.left - offsetRef.current.x) / scaleRef.current
        dragNode.y = (e.clientY - rect.top - offsetRef.current.y) / scaleRef.current
        dragNode.vx = 0
        dragNode.vy = 0
        setNodes([...nodes])
        return
      }
      const node = findNodeAt(e.clientX, e.clientY)
      setHoveredNode(node)
    },
    [findNodeAt, dragNode, nodes]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const node = findNodeAt(e.clientX, e.clientY)
      if (node) {
        setDragNode(node)
      }
    },
    [findNodeAt]
  )

  const handleMouseUp = useCallback(() => {
    setDragNode(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const node = findNodeAt(e.clientX, e.clientY)
      if (node && node.type === "mashup" && !node.id.startsWith("source-") && !node.id.startsWith("forks-")) {
        router.push(`/mashup/${node.id}`)
      }
    },
    [findNodeAt, router]
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    scaleRef.current = Math.max(0.3, Math.min(3, scaleRef.current * delta))
  }, [])

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] rounded-xl border border-border/50 bg-card/30", className)}>
        <p className="text-sm text-muted-foreground animate-pulse">Loading graph...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative rounded-xl border border-border/50 bg-card/30 overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="w-full h-[500px] cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          Mashup
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          Vocal
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          Drums
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          Bass
        </div>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute top-3 right-3 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 p-3 text-xs space-y-1 max-w-[200px]">
          <p className="font-semibold text-foreground truncate">{hoveredNode.label}</p>
          {hoveredNode.creator && (
            <p className="text-muted-foreground">by {hoveredNode.creator}</p>
          )}
          {hoveredNode.instrument && (
            <p className="text-muted-foreground capitalize">{hoveredNode.instrument}</p>
          )}
          {hoveredNode.type === "mashup" && !hoveredNode.id.startsWith("source-") && !hoveredNode.id.startsWith("forks-") && (
            <p className="text-primary">Click to view</p>
          )}
        </div>
      )}
    </div>
  )
}
