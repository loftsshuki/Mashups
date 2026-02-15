"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TerminalLine {
  text: string;
  type: "prompt" | "output" | "success" | "info";
}

interface AnimatedTerminalProps {
  lines: TerminalLine[];
  className?: string;
  typingSpeed?: number;
  lineDelay?: number;
}

export function AnimatedTerminal({
  lines,
  className,
  typingSpeed = 30,
  lineDelay = 600,
}: AnimatedTerminalProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentLineText, setCurrentLineText] = useState<string>("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (visibleLines >= lines.length) {
      setIsTyping(false);
      return;
    }

    const currentLine = lines[visibleLines];
    const targetText = currentLine.text;

    if (currentLineText.length < targetText.length) {
      // Still typing current line
      const timeout = setTimeout(() => {
        setCurrentLineText(targetText.slice(0, currentLineText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      // Finished typing current line, move to next
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
        setCurrentLineText("");
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, currentLineText, lines, typingSpeed, lineDelay]);

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "prompt":
        return "text-primary";
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        "surface-terminal p-4 md:p-6 font-mono text-sm overflow-hidden",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          mashups-cli — zsh
        </span>
      </div>

      {/* Terminal Content */}
      <div className="space-y-1">
        {lines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className={cn("flex", getLineColor(line.type))}>
            {line.type === "prompt" && (
              <span className="text-primary mr-2 shrink-0">$</span>
            )}
            {line.type === "success" && (
              <span className="text-green-400 mr-2 shrink-0">✓</span>
            )}
            {line.type === "info" && (
              <span className="text-blue-400 mr-2 shrink-0">→</span>
            )}
            <span>{line.text}</span>
          </div>
        ))}

        {/* Currently typing line */}
        {visibleLines < lines.length && (
          <div
            className={cn(
              "flex",
              getLineColor(lines[visibleLines].type)
            )}
          >
            {lines[visibleLines].type === "prompt" && (
              <span className="text-primary mr-2 shrink-0">$</span>
            )}
            {lines[visibleLines].type === "success" && (
              <span className="text-green-400 mr-2 shrink-0">✓</span>
            )}
            {lines[visibleLines].type === "info" && (
              <span className="text-blue-400 mr-2 shrink-0">→</span>
            )}
            <span>
              {currentLineText}
              <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
            </span>
          </div>
        )}
      </div>

      {/* Blinking cursor when done */}
      {!isTyping && (
        <div className="flex items-center mt-2">
          <span className="text-primary mr-2">$</span>
          <span className="w-2 h-4 bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Predefined terminal sessions for common use cases
export function CreateMashupTerminal({ className }: { className?: string }) {
  const lines: TerminalLine[] = [
    { text: "mashups create --template friday-fire", type: "prompt" },
    { text: "Initializing project...", type: "output" },
    { text: "Analyzing stems: vocals.mp3, beat.mp3", type: "info" },
    { text: "Key detected: F minor, BPM: 128", type: "info" },
    { text: "Applying AI mix...", type: "output" },
    { text: "Mix complete: 3:42 duration", type: "success" },
    { text: "Generating cover art...", type: "output" },
    { text: "Ready to publish! 🎵", type: "success" },
  ];

  return (
    <AnimatedTerminal lines={lines} className={className} typingSpeed={40} />
  );
}

export function CampaignTerminal({ className }: { className?: string }) {
  const lines: TerminalLine[] = [
    { text: "mashups campaign launch --name summer-drop", type: "prompt" },
    { text: "Creating campaign workspace...", type: "output" },
    { text: "Found 24 creator partners", type: "info" },
    { text: "Generating hooks and CTAs...", type: "output" },
    { text: "Attribution links signed ✓", type: "success" },
    { text: "Schedule: 48 posts across 7 days", type: "info" },
    { text: "Campaign live! Tracking engagement...", type: "success" },
  ];

  return (
    <AnimatedTerminal lines={lines} className={className} typingSpeed={35} />
  );
}
