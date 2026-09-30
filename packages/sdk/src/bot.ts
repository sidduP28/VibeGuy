const BOT_REGEX =
  /(googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|pinterestbot)/i;

export function isSearchBot(userAgent?: string): boolean {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!ua) return false;

  // Guardrail G4: Skip known search crawlers, but NOT Chrome-Lighthouse
  if (ua.includes('Chrome-Lighthouse') || ua.includes('Lighthouse')) {
    return false;
  }

  return BOT_REGEX.test(ua);
}
