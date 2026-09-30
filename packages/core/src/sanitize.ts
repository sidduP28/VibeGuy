export function sanitizeHttpsUrl(urlStr: string): string | null {
  if (!urlStr || typeof urlStr !== 'string') return null;

  try {
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('https://')) {
      return null;
    }
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export interface BuildLinkOptions {
  baseUrl: string;
  vibeCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  discountCode?: string;
}

export function buildPersonalizedLink(options: BuildLinkOptions): string {
  const { baseUrl, vibeCode, utmSource, utmMedium, utmCampaign, discountCode } = options;
  const parsed = new URL(baseUrl);

  if (vibeCode) {
    parsed.searchParams.set('vibe', vibeCode);
  }
  if (utmSource) {
    parsed.searchParams.set('utm_source', utmSource);
  }
  if (utmMedium) {
    parsed.searchParams.set('utm_medium', utmMedium);
  }
  if (utmCampaign) {
    parsed.searchParams.set('utm_campaign', utmCampaign);
  }
  if (discountCode) {
    parsed.searchParams.set('discount', discountCode);
  }

  return parsed.toString();
}
