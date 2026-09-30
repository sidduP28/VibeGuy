export interface TrackingEvent {
  visitorId: string;
  siteId: string;
  campaignId: string;
  creatorId?: string;
  variant: 'personalized' | 'control' | 'fallback';
  type: 'view' | 'slot_applied' | 'add_to_cart' | 'checkout' | 'purchase';
  orderId?: string;
  value?: number;
  metrics?: {
    execMs?: number;
    hideMs?: number;
    cls?: number;
    lcp?: number;
  };
  reason?: string;
  timestamp?: number;
}

const COOKIE_NAME = '_vibe_vid';
const ATTRIBUTION_COOKIE = '_vibe_attr';

export function getOrCreateVisitorId(): string {
  if (typeof document === 'undefined') return 'v_server';

  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${COOKIE_NAME})=([^;]*)`));
  if (match && match[3]) {
    return match[3];
  }

  const newId = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  // Set 30-day first-party cookie
  document.cookie = `${COOKIE_NAME}=${newId}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
  return newId;
}

export function saveAttribution(creatorId: string, campaignId: string): void {
  if (typeof document === 'undefined') return;
  const payload = JSON.stringify({ creatorId, campaignId, ts: Date.now() });
  document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(payload)}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
}

export function getAttribution(): { creatorId?: string; campaignId?: string } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${ATTRIBUTION_COOKIE})=([^;]*)`));
  if (match && match[3]) {
    try {
      return JSON.parse(decodeURIComponent(match[3]));
    } catch {
      return null;
    }
  }
  return null;
}

export function sendBeaconEvents(
  endpoint: string,
  publicKey: string,
  events: TrackingEvent[]
): void {
  // Check DNT and window.vibeConsent
  if (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as any).msDoNotTrack === '1')) {
    return;
  }
  if (typeof window !== 'undefined' && (window as any).vibeConsent === false) {
    return;
  }
  if (!events.length) return;

  const payload = JSON.stringify({
    publicKey,
    events,
  });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) return;
  }

  // Fallback to fetch with keepalive
  if (typeof fetch !== 'undefined') {
    fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Ingest error swallowed gracefully in SDK
    });
  }
}
