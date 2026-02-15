"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

interface StatsCounterProps {
  stats: StatItem[];
  className?: string;
  duration?: number;
}

function useCountUp(
  end: number,
  duration: number,
  startCounting: boolean
): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!startCounting) return;

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, startCounting]);

  return count;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function StatCard({
  stat,
  duration,
  startCounting,
  delay,
}: {
  stat: StatItem;
  duration: number;
  startCounting: boolean;
  delay: number;
}) {
  const [shouldStart, setShouldStart] = useState(false);
  const count = useCountUp(stat.value, duration, shouldStart);

  useEffect(() => {
    if (startCounting) {
      const timer = setTimeout(() => setShouldStart(true), delay);
      return () => clearTimeout(timer);
    }
  }, [startCounting, delay]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-3xl md:text-4xl font-bold tracking-tight">
        <span className="gradient-text">
          {stat.prefix}
          {formatNumber(count)}
          {stat.suffix}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
    </div>
  );
}

export function StatsCounter({
  stats,
  className,
  duration = 2000,
}: StatsCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          stat={stat}
          duration={duration}
          startCounting={isVisible}
          delay={index * 150}
        />
      ))}
    </div>
  );
}

// Predefined stat sets
export function PlatformStats({ className }: { className?: string }) {
  const stats: StatItem[] = [
    { value: 18400, suffix: "+", label: "Active Creators" },
    { value: 48000, suffix: "+", label: "Mashups Created" },
    { value: 2100000, suffix: "+", label: "Plays Served" },
    { value: 98, suffix: "%", label: "Rights Clearance" },
  ];

  return <StatsCounter stats={stats} className={className} />;
}

export function CampaignStats({ className }: { className?: string }) {
  const stats: StatItem[] = [
    { value: 3200, suffix: "", label: "Creator Partners" },
    { value: 85000, suffix: "+", label: "Clips Generated" },
    { value: 420, suffix: "%", label: "Avg. Engagement Lift" },
    { value: 12, suffix: "M+", label: "Attribution Clicks" },
  ];

  return <StatsCounter stats={stats} className={className} />;
}
