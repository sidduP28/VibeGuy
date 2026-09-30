import type { CreatorProfile, TriggerResult } from './types';

export function parseTrigger(currentUrl: string, referrer: string = ''): TriggerResult {
  try {
    const url = new URL(currentUrl);
    const searchParams = url.searchParams;

    // 1. Highest priority: vibe parameter
    const vibeCode = searchParams.get('vibe');
    if (vibeCode && vibeCode.trim().length > 0) {
      return {
        type: 'vibe_code',
        value: vibeCode.trim(),
        rawParams: Object.fromEntries(searchParams.entries()),
      };
    }

    // 2. Second priority: UTM source & campaign
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    if (utmSource || utmCampaign) {
      return {
        type: 'utm',
        value: `${utmSource || ''}:${utmCampaign || ''}`,
        rawParams: Object.fromEntries(searchParams.entries()),
      };
    }

    // 3. Third priority: Referrer matching
    if (referrer && referrer.trim().length > 0) {
      try {
        const refUrl = new URL(referrer);
        const refHost = refUrl.hostname.toLowerCase();
        return {
          type: 'referrer',
          value: refHost,
          rawParams: { referrer },
        };
      } catch {
        return {
          type: 'referrer',
          value: referrer.toLowerCase(),
          rawParams: { referrer },
        };
      }
    }

    return { type: 'none' };
  } catch {
    return { type: 'none' };
  }
}

export function matchCreatorByTrigger(
  trigger: TriggerResult,
  creators: CreatorProfile[]
): CreatorProfile | null {
  if (trigger.type === 'none' || !trigger.value) {
    return null;
  }

  if (trigger.type === 'vibe_code') {
    return creators.find((c) => c.vibeCode.toLowerCase() === trigger.value?.toLowerCase()) || null;
  }

  if (trigger.type === 'utm') {
    const [source, campaign] = trigger.value.split(':');
    return (
      creators.find((c) => {
        const matchSource =
          !c.utmRules.source || c.utmRules.source.toLowerCase() === source?.toLowerCase();
        const matchCampaign =
          !c.utmRules.campaign || c.utmRules.campaign.toLowerCase() === campaign?.toLowerCase();
        return matchSource && matchCampaign;
      }) || null
    );
  }

  if (trigger.type === 'referrer') {
    const refVal = trigger.value.toLowerCase();
    return (
      creators.find((c) =>
        c.referrerRules.some((rule) => refVal.includes(rule.toLowerCase()))
      ) || null
    );
  }

  return null;
}
