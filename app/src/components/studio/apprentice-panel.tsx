"use client"

import { useState } from "react"
import { GraduationCap, Eye, MessageSquare, Hand, X, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ApprenticePanelProps {
  mode: "mentor" | "apprentice"
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ApprenticePanel({ mode, isOpen, onClose, className }: ApprenticePanelProps) {
  const [openToApprentice, setOpenToApprentice] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "system", text: "Apprentice mode is active. Chat messages appear here." },
  ])
  const [chatInput, setChatInput] = useState("")
  const [controlRequested, setControlRequested] = useState(false)

  if (!isOpen) return null

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    setChatMessages((prev) => [...prev, { sender: mode, text: chatInput }])
    setChatInput("")
  }

  return (
    <div className={cn(
      "fixed right-4 top-20 bottom-24 w-72 z-40 flex flex-col rounded-xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {mode === "mentor" ? "Mentor Mode" : "Apprentice View"}
          </h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Mentor controls */}
      {mode === "mentor" && (
        <div className="px-4 py-3 border-b border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Open to Apprentice</span>
            <button
              onClick={() => setOpenToApprentice(!openToApprentice)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                openToApprentice ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                  openToApprentice ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {openToApprentice && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Radio className="h-3 w-3 text-green-500 animate-pulse" />
              Session is live. Waiting for apprentice...
            </div>
          )}

          {controlRequested && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
              <p className="text-xs text-amber-400 mb-2">Apprentice requested control</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-6 text-[10px]" onClick={() => setControlRequested(false)}>
                  Grant
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setControlRequested(false)}>
                  Deny
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apprentice controls */}
      {mode === "apprentice" && (
        <div className="px-4 py-3 border-b border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            Read-only view — watching mentor create
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => setControlRequested(true)}
          >
            <Hand className="mr-2 h-3 w-3" />
            Request Control
          </Button>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              msg.sender === "system"
                ? "bg-muted/30 text-muted-foreground text-center"
                : msg.sender === mode
                  ? "bg-primary/10 text-foreground ml-4"
                  : "bg-muted/50 text-foreground mr-4"
            )}
          >
            {msg.sender !== "system" && (
              <p className="font-medium text-[10px] text-muted-foreground mb-0.5 capitalize">
                {msg.sender}
              </p>
            )}
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="icon" className="h-7 w-7 shrink-0" onClick={handleSendMessage}>
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
