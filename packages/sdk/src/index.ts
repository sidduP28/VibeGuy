import { isSearchBot } from './bot';
import { applyPreHide, removePreHide } from './prehide';
import { observeAndApplySlots, applySlotContent } from './slots';
import { createRumTracker } from './rum';
import {
  getOrCreateVisitorId,
  saveAttribution,
  getAttribution,
  sendBeaconEvents,
  type TrackingEvent,
} from './beacon';
import { setupDebugOverlay } from './debug';

export interface VibeConfig {
  siteId: string;
  publicKey: string;
  ingestUrl: string;
  killSwitch?: boolean;
  selectorMap?: Record<string, string>;
  campaigns: Array<{
    id: string;
    creatorId: string;
    vibeCode: string;
    utmRules?: { source?: string; campaign?: string };
    referrerRules?: string[];
    holdoutPct: number;
    promoCode?: string;
    productUrl?: string;
    themeTokens?: Record<string, string>;
    slots: Record<string, string>;
  }>;
}

declare global {
  interface Window {
    __VIBE_CONFIG__?: VibeConfig;
    vibe?: any;
    vibeConsent?: boolean;
  }
}

// 32-bit FNV-1a hash
function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
}

export function initVibeSdk(): void {
  try {
    if (typeof window === 'undefined') return;

    // G4: Bot bypass
    if (isSearchBot()) return;

    const htmlEl = document.documentElement;
    const isEdgeSsr = htmlEl.getAttribute('data-vibe-ssr') === '1';

    const config = window.__VIBE_CONFIG__;
    if (!config || config.killSwitch) {
      removePreHide();
      return;
    }

    const rum = createRumTracker();
    rum.markTrigger();

    // Parse triggers from URL and document.referrer
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    const vibeParam = searchParams.get('vibe')?.trim().toLowerCase();
    const utmSource = searchParams.get('utm_source')?.trim().toLowerCase();
    const utmCampaign = searchParams.get('utm_campaign')?.trim().toLowerCase();
    const referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';

    // Match campaign
    let matchedCampaign: (typeof config.campaigns)[0] | null = null;
    let triggerType = 'none';
    let triggerValue = '';

    for (const cmp of config.campaigns) {
      if (vibeParam && cmp.vibeCode.toLowerCase() === vibeParam) {
        matchedCampaign = cmp;
        triggerType = 'vibe_code';
        triggerValue = vibeParam;
        break;
      }
      if (
        utmSource &&
        cmp.utmRules?.source &&
        cmp.utmRules.source.toLowerCase() === utmSource &&
        (!cmp.utmRules.campaign || cmp.utmRules.campaign.toLowerCase() === utmCampaign)
      ) {
        matchedCampaign = cmp;
        triggerType = 'utm';
        triggerValue = `${utmSource}:${utmCampaign || ''}`;
        break;
      }
      if (
        referrerHost &&
        cmp.referrerRules &&
        cmp.referrerRules.some((rule) => referrerHost.includes(rule.toLowerCase()))
      ) {
        matchedCampaign = cmp;
        triggerType = 'referrer';
        triggerValue = referrerHost;
        break;
      }
    }

    // No campaign matched -> zero cost, exit clean
    if (!matchedCampaign) {
      removePreHide();
      return;
    }

    const visitorId = getOrCreateVisitorId();
    let completed = false;

    // Guardrail G3: 300ms fail-safe fallback timeout
    const fallbackTimer = setTimeout(() => {
      if (!completed) {
        completed = true;
        removePreHide();
        sendBeaconEvents(config.ingestUrl, config.publicKey, [
          {
            visitorId,
            siteId: config.siteId,
            campaignId: matchedCampaign?.id || 'unknown',
            creatorId: matchedCampaign?.creatorId,
            variant: 'fallback',
            type: 'view',
            reason: 'timeout_300ms',
          },
        ]);
      }
    }, 300);

    // If edge already ran, skip DOM mutation
    if (isEdgeSsr) {
      clearTimeout(fallbackTimer);
      completed = true;
      saveAttribution(matchedCampaign.creatorId, matchedCampaign.id);
      sendBeaconEvents(config.ingestUrl, config.publicKey, [
        {
          visitorId,
          siteId: config.siteId,
          campaignId: matchedCampaign.id,
          creatorId: matchedCampaign.creatorId,
          variant: 'personalized',
          type: 'slot_applied',
          metrics: rum.getMetrics(),
        },
      ]);
      return;
    }

    // Guardrail G2: Apply pre-hide on slots only when valid trigger detected
    applyPreHide(config.selectorMap ? Object.keys(config.selectorMap) : []);

    // Deterministic holdout check
    const bucket = fnv1a(`${visitorId}:${matchedCampaign.id}`);
    if (bucket < (matchedCampaign.holdoutPct || 0)) {
      // Control variant: leave original page untouched
      clearTimeout(fallbackTimer);
      completed = true;
      removePreHide();
      sendBeaconEvents(config.ingestUrl, config.publicKey, [
        {
          visitorId,
          siteId: config.siteId,
          campaignId: matchedCampaign.id,
          creatorId: matchedCampaign.creatorId,
          variant: 'control',
          type: 'view',
        },
      ]);
      return;
    }

    // Apply Theme Tokens as CSS variables on document element
    if (matchedCampaign.themeTokens) {
      for (const [key, value] of Object.entries(matchedCampaign.themeTokens)) {
        htmlEl.style.setProperty(`--vibe-${key}`, value);
      }
    }

    // Build Deep-linking CTA (e.g. Shopify discount /discount/CODE?redirect=url)
    let ctaUrl = matchedCampaign.productUrl;
    if (matchedCampaign.promoCode && matchedCampaign.productUrl) {
      try {
        const prod = new URL(matchedCampaign.productUrl, window.location.origin);
        ctaUrl = `/discount/${matchedCampaign.promoCode}?redirect=${encodeURIComponent(prod.pathname + prod.search)}`;
      } catch {
        ctaUrl = matchedCampaign.productUrl;
      }
    }

    // Apply slots via MutationObserver
    observeAndApplySlots(
      matchedCampaign.slots,
      ctaUrl,
      config.selectorMap,
      () => {
        rum.markApplied();
      }
    );

    // Save attribution
    saveAttribution(matchedCampaign.creatorId, matchedCampaign.id);

    // Clean up prehide once DOM is loaded or all slots parsed
    const finalizePersonalization = () => {
      if (completed) return;
      completed = true;
      clearTimeout(fallbackTimer);
      removePreHide();
      rum.markApplied();

      const metrics = rum.getMetrics();
      sendBeaconEvents(config.ingestUrl, config.publicKey, [
        {
          visitorId,
          siteId: config.siteId,
          campaignId: matchedCampaign!.id,
          creatorId: matchedCampaign!.creatorId,
          variant: 'personalized',
          type: 'slot_applied',
          metrics,
        },
      ]);

      setupDebugOverlay(
        { type: triggerType, value: triggerValue },
        { campaignId: matchedCampaign!.id, creatorId: matchedCampaign!.creatorId },
        metrics
      );
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', finalizePersonalization, { once: true });
    } else {
      finalizePersonalization();
    }

    // Expose public developer API
    window.vibe = window.vibe || {};
    window.vibe.track = (type: any, data?: any) => {
      sendBeaconEvents(config.ingestUrl, config.publicKey, [
        {
          visitorId,
          siteId: config.siteId,
          campaignId: matchedCampaign!.id,
          creatorId: matchedCampaign!.creatorId,
          variant: 'personalized',
          type: type || 'view',
          ...data,
        },
      ]);
    };

    window.vibe.purchase = (purchaseData: { orderId: string; value: number }) => {
      const attr = getAttribution();
      sendBeaconEvents(config.ingestUrl, config.publicKey, [
        {
          visitorId,
          siteId: config.siteId,
          campaignId: attr?.campaignId || matchedCampaign!.id,
          creatorId: attr?.creatorId || matchedCampaign!.creatorId,
          variant: 'personalized',
          type: 'purchase',
          orderId: purchaseData.orderId,
          value: purchaseData.value,
        },
      ]);
    };
  } catch (err: any) {
    // Guardrail G3: Never throw into host page
    try {
      removePreHide();
    } catch {}
  }
}



// Auto-run if running directly in browser head
if (typeof window !== 'undefined') {
  initVibeSdk();
}
