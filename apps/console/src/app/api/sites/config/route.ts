import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema } from '@/db';
import { sites, creators, themes } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-site-key',
    },
  });
}

// In-Memory Fast Edge Cache for Site Configs
interface CacheEntry {
  payload: any;
  timestamp: number;
}

const configMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000; // 30 seconds TTL

export function invalidateConfigCache(siteKeyOrId?: string) {
  if (siteKeyOrId) {
    for (const key of configMemoryCache.keys()) {
      if (key.includes(siteKeyOrId)) {
        configMemoryCache.delete(key);
      }
    }
  } else {
    configMemoryCache.clear();
  }
}

export async function getCachedSiteConfig(siteIdentifier: string, bypassCache = false) {
  const now = Date.now();
  const cacheKey = siteIdentifier.trim().toLowerCase() || 'default';

  if (!bypassCache) {
    const cached = configMemoryCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return { payload: cached.payload, hit: true, age: now - cached.timestamp };
    }
  }

  await ensureSchema();
  const db = getDb();

  let site = null;
  if (siteIdentifier) {
    const rows = await db
      .select()
      .from(sites)
      .where(or(eq(sites.siteKey, siteIdentifier), eq(sites.publicKey, siteIdentifier), eq(sites.id, siteIdentifier)));
    site = rows[0];
  }

  // Fallback to Aurora site if none matched
  if (!site) {
    const rows = await db.select().from(sites).where(eq(sites.id, 'site_aurora'));
    site = rows[0] || (await db.select().from(sites))[0];
  }

  if (!site) {
    return null;
  }

  const siteCreators = await db
    .select()
    .from(creators)
    .where(eq(creators.siteId, site.id));

  const siteThemes = await db
    .select()
    .from(themes)
    .where(eq(themes.siteId, site.id));

  const themesMap: Record<string, any> = {};
  for (const t of siteThemes) {
    try {
      const parsed = typeof t.tokens === 'string' ? JSON.parse(t.tokens) : t.tokens;
      const themeKey = t.id.replace(/^theme_aurora_/, '').replace(/^theme_/, '');
      themesMap[t.id] = {
        ...parsed,
        id: t.id,
        name: t.name,
        themeKey,
      };
    } catch {
      themesMap[t.id] = t;
    }
  }

  const baseDefault =
    (site.defaultThemeId && themesMap[site.defaultThemeId]) ||
    themesMap['theme_aurora_default'] ||
    themesMap['theme_aurora_default_demo'] ||
    Object.values(themesMap)[0] || {
      name: 'Default',
      bg: '#ffffff',
      fg: '#0f172a',
      accent: '#2563eb',
      cardBg: '#f8fafc',
      border: '#e2e8f0',
      muted: '#64748b',
      fontHeading: 'system-ui, sans-serif',
      fontBody: 'system-ui, sans-serif',
      radius: '8px',
      space: '16px',
    };

  const defaultTheme = {
    ...baseDefault,
    themeKey: 'default',
  };

  const creatorsMap: Record<string, any> = {};
  const creatorSlugs: string[] = [];

  for (const c of siteCreators) {
    const copyOverrides =
      typeof c.copyOverrides === 'string' ? JSON.parse(c.copyOverrides || '{}') : (c.copyOverrides || {});
    const themeObj = (c.themeId && themesMap[c.themeId]) || defaultTheme;

    const effectiveSlug = (c.slug && c.slug.trim()) || c.vibeCode || (c.handle ? c.handle.replace(/^@/, '') : c.id);

    const profile = {
      id: c.id,
      slug: effectiveSlug,
      name: c.displayName || c.name || effectiveSlug,
      handle: c.handle || `@${effectiveSlug}`,
      niche: c.niche || '',
      themeId: c.themeId,
      theme: themeObj,
      headline: copyOverrides.headline || c.preferredCta || `${c.displayName || c.name || effectiveSlug}'s Edit`,
      subheadline: copyOverrides.subheadline || c.niche || '',
      ctaText: copyOverrides.ctaText || c.preferredCta || 'Shop Collection',
      heroImage: copyOverrides.heroImage || c.heroBanner || '/images/hero-fitfiona.jpg',
      offer: copyOverrides.offer || '',
      bundleText: copyOverrides.bundleText || '',
      discountCode: copyOverrides.discountCode || '',
      discountPercent: copyOverrides.discountPercent || 0,
      testimonials: copyOverrides.testimonials || [],
    };

    creatorsMap[effectiveSlug] = profile;
    if (c.slug && c.slug !== effectiveSlug) creatorsMap[c.slug] = profile;
    if (c.vibeCode && c.vibeCode !== effectiveSlug) creatorsMap[c.vibeCode] = profile;
    if (c.handle) {
      const cleanHandle = c.handle.replace(/^@/, '');
      if (cleanHandle && !creatorsMap[cleanHandle]) creatorsMap[cleanHandle] = profile;
    }

    if (!creatorSlugs.includes(effectiveSlug)) {
      creatorSlugs.push(effectiveSlug);
    }
  }

  const responsePayload = {
    site: {
      id: site.id,
      name: site.name,
      domain: site.domain,
      siteKey: site.siteKey,
      defaultThemeId: site.defaultThemeId,
      status: site.status,
    },
    allowedCreatorSlugs: creatorSlugs,
    creators: creatorsMap,
    themes: themesMap,
    defaultTheme,
    holdout: 10,
    cachedAt: new Date(now).toISOString(),
  };

  // Cache by both siteId and siteKey
  configMemoryCache.set(cacheKey, { payload: responsePayload, timestamp: now });
  if (site.id) configMemoryCache.set(site.id.toLowerCase(), { payload: responsePayload, timestamp: now });
  if (site.siteKey) configMemoryCache.set(site.siteKey.toLowerCase(), { payload: responsePayload, timestamp: now });

  return { payload: responsePayload, hit: false, age: 0 };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get('site_key') || req.headers.get('x-site-key') || '';
  const siteId = searchParams.get('site_id') || '';
  const bypass = searchParams.get('bypass') === '1' || req.headers.get('cache-control') === 'no-cache';

  const identifier = siteKey || siteId || 'site_aurora';
  const start = performance.now();
  const result = await getCachedSiteConfig(identifier, bypass);
  const duration = Math.round(performance.now() - start);

  if (!result || !result.payload) {
    return NextResponse.json({ error: 'site_not_found' }, { status: 404 });
  }

  return NextResponse.json(result.payload, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-site-key',
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      'X-Cache': result.hit ? 'HIT' : 'MISS',
      'X-Cache-Age-Ms': String(result.age),
      'X-Response-Time': `${duration}ms`,
    },
  });
}
