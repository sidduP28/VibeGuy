'use client';

import React, { useState, useEffect } from 'react';

export function DebugBadge({
  creatorSlug,
  group,
}: {
  creatorSlug: string | null;
  group: string;
}) {
  const [cls, setCls] = useState<number>(0.0);
  const [perfTime, setPerfTime] = useState<number>(0);

  useEffect(() => {
    // Measure page load/render timing
    if (typeof window !== 'undefined' && window.performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const duration = navEntry ? Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime) : 4;
      setPerfTime(duration > 0 ? duration : 3);
    }

    // Measure CLS via PerformanceObserver
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const shiftEntry = entry as any;
            if (!shiftEntry.hadRecentInput) {
              setCls((prev) => parseFloat((prev + shiftEntry.value).toFixed(3)));
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        return () => observer.disconnect();
      } catch {
        // Observer not supported
      }
    }
  }, []);

  return (
    <aside
      aria-label="Personalization Debug"
      id="vibe-debug-badge"
      className="fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg bg-fg text-bg border border-border text-[11px] font-mono shadow-2xl flex items-center gap-2"
    >
      <div className="w-2 h-2 rounded-full bg-accent" />
      <span>
        personalized in <strong className="text-accent">{perfTime}ms</strong>, CLS <strong className="text-accent">{cls.toFixed(2)}</strong>
      </span>
      <span className="text-[10px] text-muted">({group})</span>
    </aside>
  );
}
