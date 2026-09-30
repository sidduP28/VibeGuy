const BOT_REGEX =
  /(googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|pinterestbot)/i;

export interface EdgeRewriteOptions {
  html: string;
  url: string;
  userAgent?: string;
  referer?: string;
  campaigns: Array<{
    id: string;
    creatorId: string;
    vibeCode: string;
    utmRules?: { source?: string; campaign?: string };
    referrerRules?: string[];
    slots: Record<string, string>;
    themeTokens?: Record<string, string>;
  }>;
}

export interface EdgeRewriteResult {
  html: string;
  wasPersonalized: boolean;
  campaignId?: string;
  creatorId?: string;
}

export async function rewriteHtmlAtEdge(options: EdgeRewriteOptions): Promise<EdgeRewriteResult> {
  const { html, url, userAgent = '', referer = '', campaigns } = options;

  // G4: Bypasses search crawlers, permits Lighthouse
  if (BOT_REGEX.test(userAgent) && !userAgent.includes('Lighthouse')) {
    return { html, wasPersonalized: false };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { html, wasPersonalized: false };
  }

  const vibeCode = parsedUrl.searchParams.get('vibe')?.trim().toLowerCase();
  const utmSource = parsedUrl.searchParams.get('utm_source')?.trim().toLowerCase();
  const utmCampaign = parsedUrl.searchParams.get('utm_campaign')?.trim().toLowerCase();
  const refHost = referer ? new URL(referer).hostname.toLowerCase() : '';

  // Match campaign
  let matchedCampaign: (typeof campaigns)[0] | null = null;
  for (const cmp of campaigns) {
    if (vibeCode && cmp.vibeCode.toLowerCase() === vibeCode) {
      matchedCampaign = cmp;
      break;
    }
    if (
      utmSource &&
      cmp.utmRules?.source?.toLowerCase() === utmSource &&
      (!cmp.utmRules.campaign || cmp.utmRules.campaign.toLowerCase() === utmCampaign)
    ) {
      matchedCampaign = cmp;
      break;
    }
    if (
      refHost &&
      cmp.referrerRules &&
      cmp.referrerRules.some((r) => refHost.includes(r.toLowerCase()))
    ) {
      matchedCampaign = cmp;
      break;
    }
  }

  if (!matchedCampaign) {
    return { html, wasPersonalized: false };
  }

  let transformed = html;

  // Tag <html> element with data-vibe-ssr="1" so client SDK skips DOM operations
  if (/<html\b/i.test(transformed)) {
    transformed = transformed.replace(/<html\b([^>]*)>/i, '<html$1 data-vibe-ssr="1">');
  }

  // Rewrite slots
  for (const [slotName, slotContent] of Object.entries(matchedCampaign.slots)) {
    if (!slotContent) continue;

    // 1. Image slots: replace src attribute on <img ... data-vibe-slot="..." ...>
    const imgSlotRegex = new RegExp(
      `(<img\\b[^>]*data-vibe-slot=["']${slotName}["'][^>]*\\bsrc=["'])[^"']*(["'][^>]*>)`,
      'gi'
    );
    transformed = transformed.replace(imgSlotRegex, `$1${slotContent}$2`);

    // Reverse attribute order check for img: <img ... src="..." ... data-vibe-slot="...">
    const imgSlotRegexRev = new RegExp(
      `(<img\\b[^>]*\\bsrc=["'])[^"']*(["'][^>]*data-vibe-slot=["']${slotName}["'][^>]*>)`,
      'gi'
    );
    transformed = transformed.replace(imgSlotRegexRev, `$1${slotContent}$2`);

    // 2. Container and text slots: replace inner content
    const tagRegex = new RegExp(
      `(<([a-z0-9]+)\\b[^>]*data-vibe-slot=["']${slotName}["'][^>]*>)([\\s\\S]*?)(<\\/\\2>)`,
      'gi'
    );
    transformed = transformed.replace(tagRegex, `$1${slotContent}$4`);
  }

  return {
    html: transformed,
    wasPersonalized: true,
    campaignId: matchedCampaign.id,
    creatorId: matchedCampaign.creatorId,
  };
}
