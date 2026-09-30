import { ExtractUrlSchema, sanitizeHttpsUrl, validateUrlForSSRF } from '@vibe/core';

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 5_000;

export async function fetchPublicHtml(rawUrl: string): Promise<string> {
  let targetUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const parsed = ExtractUrlSchema.safeParse({ url: targetUrl });
  if (!parsed.success) throw new Error('invalid_url');
  let safe = sanitizeHttpsUrl(parsed.data.url);
  if (!safe) throw new Error('https_only');
  await validateUrlForSSRF(safe);

  let redirects = 0;
  while (redirects < 4) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res: Response = await fetch(safe, {
        signal: ctrl.signal,
        redirect: 'manual',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) throw new Error('bad_redirect');
        safe = new URL(loc, safe).toString();
        await validateUrlForSSRF(safe);
        redirects++;
        continue;
      }

      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_BYTES) throw new Error('payload_too_large');
      return new TextDecoder().decode(buf);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('too_many_redirects');
}

export function extractProductMeta(html: string, pageUrl: string) {
  const pick = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i'
    );
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      'i'
    );
    return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? '';
  };
  const title =
    pick('og:title') ||
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
    '';
  const image = pick('og:image');
  const description = pick('og:description') || pick('description');
  let jsonLd: Record<string, unknown> | null = null;
  const ld = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (ld?.[1]) {
    try {
      jsonLd = JSON.parse(ld[1]);
    } catch {
      jsonLd = null;
    }
  }
  return { url: pageUrl, title, image, description, jsonLd };
}

export function extractVibe(html: string, pageUrl: string) {
  const colors = new Set<string>();
  const hex = html.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) ?? [];
  hex.slice(0, 24).forEach((c) => colors.add(c.toLowerCase()));
  const fonts = new Set<string>();
  const ff = html.match(/font-family:\s*([^;}{]+)/gi) ?? [];
  ff.slice(0, 8).forEach((line) => {
    const name = line.replace(/font-family:\s*/i, '').split(',')[0]?.replace(/['"]/g, '').trim();
    if (name) fonts.add(name);
  });
  const cta = /border-radius:\s*([0-9.]+px)/i.exec(html)?.[1] ?? '8px';
  const copyTone = html.length > 4000 ? 'long-form editorial' : 'short conversion copy';
  return {
    url: pageUrl,
    palette: [...colors].slice(0, 8),
    fonts: [...fonts].slice(0, 5),
    ctaStyle: { radius: cta },
    copyTone,
  };
}
