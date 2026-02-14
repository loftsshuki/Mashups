"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { GitBranch, Play, Share2, ZoomIn, ZoomOut, Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface RemixNode {
  id: string
  title: string
  creator: {
    name: string
    avatar: string
  }
  audioUrl: string
  coverUrl: string
  duration: number
  playCount: number
  createdAt: string
  parentId?: string
  childrenIds: string[]
}

interface RemixFamilyTreeProps {
  rootNode: RemixNode
  allNodes: RemixNode[]
  onPlayNode?: (node: RemixNode) => void
  onViewNode?: (node: RemixNode) => void
  className?: string
}

interface TreeNode extends RemixNode {
  x: number
  y: number
  level: number
}

export function RemixFamilyTree({
  rootNode,
  allNodes,
  onPlayNode,
  onViewNode,
  className,
}: RemixFamilyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Build tree layout
  const treeData = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>()
    const processed = new Set<string>()

    // Calculate levels (distance from root)
    const getLevel = (nodeId: string, level = 0): number => {
      const node = allNodes.find((n) => n.id === nodeId)
      if (!node || !node.parentId) return level
      return getLevel(node.parentId, level + 1)
    }

    // Build tree structure
    const buildTree = (nodeId: string, xOffset = 0): TreeNode[] => {
      if (processed.has(nodeId)) return []
      processed.add(nodeId)

      const node = allNodes.find((n) => n.id === nodeId)
      if (!node) return []

      const level = getLevel(nodeId)
      const y = level * 150
      
      // Calculate x position based on siblings
      const siblings = allNodes.filter((n) => n.parentId === node.parentId)
      const siblingIndex = siblings.findIndex((s) => s.id === nodeId)
      const totalSiblings = siblings.length || 1
      const x = xOffset + (siblingIndex - (totalSiblings - 1) / 2) * 200

      const treeNode: TreeNode = { ...node, x, y, level }
      nodeMap.set(nodeId, treeNode)

      // Process children
      const children: TreeNode[] = []
      node.childrenIds.forEach((childId) => {
        children.push(...buildTree(childId, x))
      })

      return [treeNode, ...children]
    }

    return buildTree(rootNode.id)
  }, [rootNode, allNodes])

  // Calculate connections
  const connections = useMemo(() => {
    const lines: { from: TreeNode; to: TreeNode }[] = []
    
    treeData.forEach((node) => {
      if (node.parentId) {
        const parent = treeData.find((n) => n.id === node.parentId)
        if (parent) {
          lines.push({ from: parent, to: node })
        }
      }
    })

    return lines
  }, [treeData])

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z * 1.2, 3))
  const zoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.3))
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Time-lapse animation
  const [showAnimation, setShowAnimation] = useState(false)
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!showAnimation) {
      setVisibleNodes(new Set(treeData.map((n) => n.id)))
      return
    }

    // Sort by creation date
    const sorted = [...treeData].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    setVisibleNodes(new Set())
    sorted.forEach((node, index) => {
      setTimeout(() => {
        setVisibleNodes((prev) => new Set([...prev, node.id]))
      }, index * 500)
    })
  }, [showAnimation, treeData])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Remix Family Tree
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowAnimation(!showAnimation)}
            >
              <Play className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetView}>
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-b text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Root</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Remix</span>
          </div>
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3" />
            <span>Drag to pan</span>
          </div>
          <span className="ml-auto">{treeData.length} versions</span>
        </div>

        {/* Tree Canvas */}
        <div
          ref={containerRef}
          className="relative h-[400px] overflow-hidden cursor-grab active:cursor-grabbing bg-muted/20"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Connection lines */}
            {connections.map((conn, i) => (
              <g key={i}>
                <line
                  x1={conn.from.x}
                  y1={conn.from.y}
                  x2={conn.to.x}
                  y2={conn.to.y}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-border"
                />
                <circle
                  cx={(conn.from.x + conn.to.x) / 2}
                  cy={(conn.from.y + conn.to.y) / 2}
                  r={3}
                  className="fill-primary"
                />
              </g>
            ))}

            {/* Nodes */}
            {treeData.map((node) => {
              const isVisible = visibleNodes.has(node.id)
              const isSelected = selectedNodeId === node.id
              const isHovered = hoveredNodeId === node.id
              const isRoot = node.id === rootNode.id

              if (!isVisible && showAnimation) return null

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={cn(
                    "transition-opacity duration-300",
                    showAnimation && isVisible ? "opacity-100" : showAnimation ? "opacity-0" : "opacity-100"
                  )}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNodeId(node.id)
                    onViewNode?.(node)
                  }}
                >
                  {/* Node circle */}
                  <circle
                    r={isSelected ? 35 : 30}
                    className={cn(
                      "transition-all cursor-pointer",
                      isRoot ? "fill-primary" : "fill-muted",
                      isSelected && "stroke-primary stroke-2",
                      isHovered && "opacity-80"
                    )}
                  />

                  {/* Avatar */}
                  <image
                    href={node.coverUrl}
                    x={-20}
                    y={-20}
                    width={40}
                    height={40}
                    clipPath="circle(20px at 20px 20px)"
                    className="cursor-pointer"
                  />

                  {/* Play button on hover */}
                  {(isHovered || isSelected) && (
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayNode?.(node)
                      }}
                    >
                      <circle r={15} className="fill-black/70" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-xs"
                      >
                        ▶
                      </text>
                    </g>
                  )}

                  {/* Label */}
                  <text
                    y={45}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-medium"
                  >
                    {node.title.slice(0, 15)}...
                  </text>
                  <text
                    y={58}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {node.creator.name} • {formatDate(node.createdAt)}
                  </text>
                  <text
                    y={70}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {formatNumber(node.playCount)} plays
                  </text>

                  {/* Generation badge */}
                  <g transform="translate(25, -25)">
                    <circle r={10} className={isRoot ? "fill-primary" : "fill-muted"} />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "text-[8px] font-bold",
                        isRoot ? "fill-primary-foreground" : "fill-foreground"
                      )}
                    >
                      {node.level}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Node Info */}
        {selectedNodeId && (
          <div className="p-4 border-t">
            {(() => {
              const node = treeData.find((n) => n.id === selectedNodeId)
              if (!node) return null
              return (
                <div className="flex items-center gap-3">
                  <img
                    src={node.coverUrl}
                    alt={node.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{node.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {node.creator.name} • {formatNumber(node.playCount)} plays
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onPlayNode?.(node)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onViewNode?.(node)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
