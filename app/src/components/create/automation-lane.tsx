"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import { Plus, Trash2, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AutomationNode,
  AutomationNodeType,
  generatePath,
  addNode,
  removeNode,
  updateNode,
  sortNodes,
  getValueAtTime,
} from "@/lib/audio/automation"

interface AutomationLaneProps {
  nodes: AutomationNode[]
  duration: number
  onNodesChange?: (nodes: AutomationNode[]) => void
  height?: number
  color?: string
  className?: string
}

const NODE_TYPES: { type: AutomationNodeType; label: string }[] = [
  { type: "linear", label: "Linear" },
  { type: "ease-in", label: "Ease In" },
  { type: "ease-out", label: "Ease Out" },
  { type: "ease-in-out", label: "Smooth" },
]

export function AutomationLane({
  nodes,
  duration,
  onNodesChange,
  height = 100,
  color = "#ec4899",
  className,
}: AutomationLaneProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  const width = 800 // Fixed width, scales via viewBox
  const padding = { top: 10, bottom: 10, left: 40, right: 20 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom

  // Sort nodes by time
  const sortedNodes = useMemo(() => sortNodes(nodes), [nodes])

  // Generate path
  const pathD = useMemo(
    () => generatePath(sortedNodes, graphWidth, graphHeight, duration),
    [sortedNodes, graphWidth, graphHeight, duration]
  )

  // Convert time to x position
  const timeToX = useCallback(
    (time: number) => (time / duration) * graphWidth + padding.left,
    [duration, graphWidth]
  )

  // Convert x position to time
  const xToTime = useCallback(
    (x: number) => Math.max(0, Math.min(duration, ((x - padding.left) / graphWidth) * duration)),
    [duration, graphWidth]
  )

  // Convert value to y position (inverted because SVG y=0 is top)
  const valueToY = useCallback(
    (value: number) => graphHeight * (1 - value / 100) + padding.top,
    [graphHeight]
  )

  // Convert y position to value
  const yToValue = useCallback(
    (y: number) => Math.max(0, Math.min(100, (1 - (y - padding.top) / graphHeight) * 100)),
    [graphHeight]
  )

  // Handle SVG click to add node
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || isDragging) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if clicking near existing node
      const clickTime = xToTime(x)
      const existingNode = sortedNodes.find((n) => Math.abs(n.time - clickTime) < duration * 0.02)

      if (existingNode) {
        setSelectedNodeId(existingNode.id)
        return
      }

      // Add new node
      const newNodes = addNode(sortedNodes, clickTime, yToValue(y))
      onNodesChange?.(newNodes)
      setSelectedNodeId(newNodes[newNodes.length - 1].id)
    },
    [sortedNodes, duration, isDragging, xToTime, yToValue, onNodesChange]
  )

  // Handle node drag
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation()
      setSelectedNodeId(nodeId)
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedNodeId || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newTime = xToTime(x)
      const newValue = yToValue(y)

      const updatedNodes = updateNode(sortedNodes, selectedNodeId, {
        time: newTime,
        value: newValue,
      })
      onNodesChange?.(updatedNodes)
    },
    [isDragging, selectedNodeId, sortedNodes, xToTime, yToValue, onNodesChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Delete selected node
  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return
    const newNodes = removeNode(sortedNodes, selectedNodeId)
    onNodesChange?.(newNodes)
    setSelectedNodeId(null)
  }, [selectedNodeId, sortedNodes, onNodesChange])

  // Change node type
  const handleTypeChange = useCallback(
    (type: AutomationNodeType) => {
      if (!selectedNodeId) return
      const newNodes = updateNode(sortedNodes, selectedNodeId, { type })
      onNodesChange?.(newNodes)
    },
    [selectedNodeId, sortedNodes, onNodesChange]
  )

  // Selected node
  const selectedNode = sortedNodes.find((n) => n.id === selectedNodeId)

  // Current value indicator at hover position
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const hoverValue = hoverTime !== null ? getValueAtTime(sortedNodes, hoverTime) : null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Volume Automation</span>
          {sortedNodes.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({sortedNodes.length} nodes)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedNode && (
            <>
              <span className="text-xs text-muted-foreground">
                {selectedNode.value.toFixed(0)}% at {selectedNode.time.toFixed(1)}s
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDelete}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* SVG Editor */}
      <div className="relative rounded-lg border border-border/50 bg-card overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full cursor-crosshair"
          style={{ height }}
          onClick={handleSvgClick}
          onMouseMove={(e) => {
            handleMouseMove(e)
            const rect = svgRef.current?.getBoundingClientRect()
            if (rect) {
              setHoverTime(xToTime(e.clientX - rect.left))
            }
          }}
          onMouseLeave={() => {
            handleMouseUp()
            setHoverTime(null)
          }}
          onMouseUp={handleMouseUp}
        >
          {/* Background grid */}
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1={padding.left}
                y1={valueToY(value)}
                x2={width - padding.right}
                y2={valueToY(value)}
                stroke="currentColor"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Y-axis labels */}
          <g className="text-[10px] fill-muted-foreground">
            <text x={padding.left - 5} y={valueToY(100)} textAnchor="end" dominantBaseline="middle">
              100%
            </text>
            <text x={padding.left - 5} y={valueToY(50)} textAnchor="end" dominantBaseline="middle">
              50%
            </text>
            <text x={padding.left - 5} y={valueToY(0)} textAnchor="end" dominantBaseline="middle">
              0%
            </text>
          </g>

          {/* Automation curve */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            className="transition-all"
          />

          {/* Fill area under curve */}
          <path
            d={`${pathD} L ${timeToX(duration)} ${valueToY(0)} L ${timeToX(0)} ${valueToY(0)} Z`}
            fill={color}
            opacity={0.1}
          />

          {/* Nodes */}
          {sortedNodes.map((node) => (
            <g key={node.id}>
              {/* Node circle */}
              <circle
                cx={timeToX(node.time)}
                cy={valueToY(node.value)}
                r={selectedNodeId === node.id ? 8 : 6}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className={cn(
                  "cursor-grab transition-all",
                  selectedNodeId === node.id && "ring-2 ring-primary"
                )}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              />

              {/* Type indicator */}
              {selectedNodeId === node.id && (
                <text
                  x={timeToX(node.time)}
                  y={valueToY(node.value) - 15}
                  textAnchor="middle"
                  className="text-[8px] fill-muted-foreground"
                >
                  {node.type}
                </text>
              )}
            </g>
          ))}

          {/* Hover indicator */}
          {hoverTime !== null && hoverValue !== null && !isDragging && (
            <g>
              <line
                x1={timeToX(hoverTime)}
                y1={padding.top}
                x2={timeToX(hoverTime)}
                y2={height - padding.bottom}
                stroke="currentColor"
                strokeDasharray="2 2"
                opacity={0.3}
              />
              <circle
                cx={timeToX(hoverTime)}
                cy={valueToY(hoverValue)}
                r={4}
                fill="currentColor"
                opacity={0.5}
              />
            </g>
          )}
        </svg>

        {/* Instructions overlay */}
        {sortedNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">Click to add volume automation points</p>
          </div>
        )}
      </div>

      {/* Node type selector */}
      {selectedNode && (
        <div className="flex items-center gap-1">
          <Type className="h-3 w-3 text-muted-foreground" />
          <div className="flex gap-1">
            {NODE_TYPES.map(({ type, label }) => (
              <Button
                key={type}
                variant={selectedNode.type === type ? "default" : "outline"}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleTypeChange(type)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick presets */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            onNodesChange?.([
              { id: "1", time: 0, value: 0, type: "ease-out" },
              { id: "2", time: duration * 0.1, value: 100, type: "linear" },
              { id: "3", time: duration * 0.9, value: 100, type: "linear" },
              { id: "4", time: duration, value: 0, type: "ease-in" },
            ])
          }
        >
          Fade In/Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            onNodesChange?.([
              { id: "1", time: 0, value: 100, type: "linear" },
              { id: "2", time: duration * 0.5, value: 60, type: "ease-in-out" },
              { id: "3", time: duration, value: 100, type: "ease-in-out" },
            ])
          }
        >
          Dip Middle
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onNodesChange?.([])}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
