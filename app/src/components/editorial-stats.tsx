"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

function useCountUp(end: number, duration: number, start: boolean): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, start]);

  return count;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

function StatItem({
  stat,
  startCounting,
  delay,
}: {
  stat: Stat;
  startCounting: boolean;
  delay: number;
}) {
  const [shouldStart, setShouldStart] = useState(false);
  const count = useCountUp(stat.value, 2000, shouldStart);

  useEffect(() => {
    if (startCounting) {
      const timer = setTimeout(() => setShouldStart(true), delay);
      return () => clearTimeout(timer);
    }
  }, [startCounting, delay]);

  return (
    <div className="text-center">
      <div className="editorial-number text-4xl md:text-5xl lg:text-6xl">
        {formatNumber(count)}
        {stat.suffix}
      </div>
      <div className="section-label mt-2">{stat.label}</div>
    </div>
  );
}

export function EditorialStats({ className }: { className?: string }) {
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
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const stats: Stat[] = [
    { value: 18400, suffix: "+", label: "Active Creators" },
    { value: 48000, suffix: "+", label: "Mashups Created" },
    { value: 2100000, suffix: "+", label: "Plays Served" },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid grid-cols-3 gap-8 md:gap-16",
        className
      )}
    >
      {stats.map((stat, i) => (
        <StatItem
          key={stat.label}
          stat={stat}
          startCounting={isVisible}
          delay={i * 200}
        />
      ))}
    </div>
  );
}
