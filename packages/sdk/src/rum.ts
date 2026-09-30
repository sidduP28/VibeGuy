export interface RumMetrics {
  execMs: number;
  hideMs: number;
  cls: number;
  lcp: number;
}

export function createRumTracker(): {
  markTrigger: () => void;
  markApplied: () => void;
  getMetrics: () => RumMetrics;
} {
  let clsValue = 0;
  let lcpValue = 0;
  let startMark = 0;
  let appliedMark = 0;

  if (typeof performance !== 'undefined' && performance.now) {
    startMark = performance.now();
  }

  // Observe CLS (Cumulative Layout Shift)
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Layout-shift entries without recent user input
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value || 0;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Browser doesn't support layout-shift observer
    }

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime || 0;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Browser doesn't support LCP
    }
  }

  return {
    markTrigger: () => {
      if (typeof performance !== 'undefined' && performance.now) {
        startMark = performance.now();
      }
    },
    markApplied: () => {
      if (typeof performance !== 'undefined' && performance.now) {
        appliedMark = performance.now();
      }
    },
    getMetrics: (): RumMetrics => {
      const exec = appliedMark > 0 && startMark > 0 ? Math.round(appliedMark - startMark) : 0;
      return {
        execMs: Math.max(0, exec),
        hideMs: Math.max(0, exec),
        cls: Math.round(clsValue * 1000) / 1000,
        lcp: Math.round(lcpValue),
      };
    },
  };
}
