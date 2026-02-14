"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { GitBranch, Play, ZoomIn, ZoomOut, Move, Maximize2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MockMashup } from "@/lib/mock-data"

interface RemixFamilyTreeProps {
  lineage: MockMashup[]
  forks: MockMashup[]
  currentId: string
  className?: string
}

interface TreeNode {
  id: string
  title: string
  creatorName: string
  coverUrl: string
  x: number
  y: number
  type: "root" | "ancestor" | "current" | "fork"
}

export function RemixFamilyTree({
  lineage,
  forks,
  currentId,
  className,
}: RemixFamilyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Build the tree data structure
  const { nodes, connections } = useMemo(() => {
    const treeNodes: TreeNode[] = []
    const treeConnections: { from: string; to: string }[] = []
    
    const centerX = 400
    const levelHeight = 120
    
    // Add lineage nodes (ancestors going upward)
    lineage.forEach((mashup, index) => {
      const isRoot = index === 0
      const y = (lineage.length - index - 1) * levelHeight + 50 // Start from top
      const x = centerX
      
      treeNodes.push({
        id: mashup.id,
        title: mashup.title,
        creatorName: mashup.creator.displayName,
        coverUrl: mashup.coverUrl,
        x,
        y,
        type: isRoot ? "root" : "ancestor",
      })
      
      // Connect to next in lineage
      if (index < lineage.length - 1) {
        treeConnections.push({ from: mashup.id, to: lineage[index + 1].id })
      }
    })
    
    // Add current node (at the center)
    const currentY = lineage.length * levelHeight + 50
    const currentNode: TreeNode = {
      id: currentId,
      title: "Current",
      creatorName: "",
      coverUrl: "",
      x: centerX,
      y: currentY,
      type: "current",
    }
    treeNodes.push(currentNode)
    
    // Connect last lineage to current
    if (lineage.length > 0) {
      treeConnections.push({ from: lineage[lineage.length - 1].id, to: currentId })
    }
    
    // Add fork nodes (going downward, spread horizontally)
    const forkWidth = Math.min(forks.length * 150, 600)
    forks.forEach((fork, index) => {
      const offsetX = forks.length === 1 
        ? 0 
        : (index - (forks.length - 1) / 2) * 150
      const x = centerX + offsetX
      const y = currentY + levelHeight
      
      treeNodes.push({
        id: fork.id,
        title: fork.title,
        creatorName: fork.creator.displayName,
        coverUrl: fork.coverUrl,
        x,
        y,
        type: "fork",
      })
      
      treeConnections.push({ from: currentId, to: fork.id })
    })
    
    return { nodes: treeNodes, connections: treeConnections }
  }, [lineage, forks, currentId])

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z * 1.2, 3))
  const zoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.5))
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

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  // Find node by ID helper
  const getNodeById = (id: string) => nodes.find((n) => n.id === id)

  const totalVersions = lineage.length + 1 + forks.length

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Remix Family Tree
          </span>
          <div className="flex items-center gap-1">
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
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Root</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Forks</span>
          </div>
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3" />
            <span>Drag to pan</span>
          </div>
          <span className="ml-auto">{totalVersions} versions</span>
        </div>

        {/* Tree Canvas */}
        <div
          ref={containerRef}
          className="relative h-[400px] overflow-hidden cursor-grab active:cursor-grabbing bg-gradient-to-b from-muted/10 via-background to-muted/10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Connection lines */}
            {connections.map((conn, i) => {
              const fromNode = getNodeById(conn.from)
              const toNode = getNodeById(conn.to)
              if (!fromNode || !toNode) return null
              
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y + 25}
                    x2={toNode.x}
                    y2={toNode.y - 25}
                    stroke="currentColor"
                    strokeWidth={2}
                    className="text-border"
                  />
                  <circle
                    cx={(fromNode.x + toNode.x) / 2}
                    cy={(fromNode.y + toNode.y) / 2}
                    r={3}
                    className="fill-primary"
                  />
                </g>
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isHovered = hoveredNodeId === node.id
              const isCurrent = node.type === "current"
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="transition-opacity duration-300"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Node circle background */}
                  <circle
                    r={isCurrent ? 35 : 28}
                    className={cn(
                      "transition-all",
                      node.type === "root" && "fill-orange-500",
                      node.type === "ancestor" && "fill-muted stroke-border",
                      node.type === "current" && "fill-blue-500",
                      node.type === "fork" && "fill-green-500",
                      isHovered && "opacity-90"
                    )}
                  />
                  
                  {/* Ring for current */}
                  {isCurrent && (
                    <circle
                      r={40}
                      className="fill-none stroke-blue-500 stroke-2 opacity-50"
                    />
                  )}

                  {/* Avatar/image placeholder - show initials for current */}
                  {isCurrent ? (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-lg font-bold"
                    >
                      ★
                    </text>
                  ) : (
                    <>
                      <defs>
                        <clipPath id={`clip-${node.id}`}>
                          <circle r={22} />
                        </clipPath>
                      </defs>
                      <image
                        href={node.coverUrl}
                        x={-22}
                        y={-22}
                        width={44}
                        height={44}
                        clipPath={`url(#clip-${node.id})`}
                        className={cn("cursor-pointer", !isHovered && "opacity-90")}
                      />
                    </>
                  )}

                  {/* Play button on hover (not for current) */}
                  {isHovered && !isCurrent && (
                    <Link href={`/mashup/${node.id}`}>
                      <g className="cursor-pointer">
                        <circle r={12} className="fill-black/70" />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white text-[10px]"
                        >
                          ▶
                        </text>
                      </g>
                    </Link>
                  )}

                  {/* Label - current shows "YOU ARE HERE" */}
                  <text
                    y={isCurrent ? 50 : 42}
                    textAnchor="middle"
                    className={cn(
                      "fill-foreground text-[10px] font-medium",
                      isCurrent && "fill-blue-500 font-bold"
                    )}
                  >
                    {isCurrent ? "YOU ARE HERE" : node.title.slice(0, 12) + "..."}
                  </text>
                  {!isCurrent && (
                    <text
                      y={54}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[8px]"
                    >
                      by {node.creatorName}
                    </text>
                  )}

                  {/* Generation badge */}
                  <g transform="translate(20, -20)">
                    <circle 
                      r={9} 
                      className={cn(
                        node.type === "root" && "fill-orange-600",
                        node.type === "ancestor" && "fill-muted-foreground",
                        node.type === "current" && "fill-blue-600",
                        node.type === "fork" && "fill-green-600"
                      )} 
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-[7px] font-bold"
                    >
                      {node.type === "root" ? "R" : node.type === "current" ? "★" : node.type === "fork" ? "F" : "A"}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Fork list */}
        {forks.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-green-500" />
              Forks from this mashup
            </h4>
            <div className="flex flex-wrap gap-2">
              {forks.map((fork) => (
                <Link
                  key={fork.id}
                  href={`/mashup/${fork.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <img
                    src={fork.coverUrl}
                    alt={fork.title}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="text-left">
                    <p className="text-xs font-medium line-clamp-1">{fork.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      by {fork.creator.displayName} • {formatCount(fork.playCount)} plays
                    </p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
