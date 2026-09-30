import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { creators, themes } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const siteCreators = await db
    .select()
    .from(creators)
    .where(eq(creators.siteId, siteId));

  const siteThemes = await db
    .select()
    .from(themes)
    .where(eq(themes.siteId, siteId));

  const list = siteCreators.map((c) => {
    let copyOverrides = {};
    try {
      copyOverrides = typeof c.copyOverrides === 'string' ? JSON.parse(c.copyOverrides) : (c.copyOverrides || {});
    } catch {}

    const linkedTheme = siteThemes.find((t) => t.id === c.themeId);

    const effectiveSlug = (c.slug && c.slug.trim()) || c.vibeCode || (c.handle ? c.handle.replace(/^@/, '') : c.id);
    const domain = (auth.site?.domain && auth.site.domain.trim()) || 'http://localhost:3002';
    const vibeLink = `${domain}/?vibe=${effectiveSlug}`;

    return {
      id: c.id,
      siteId: c.siteId,
      slug: effectiveSlug,
      vibeCode: c.vibeCode || effectiveSlug,
      displayName: c.displayName || c.name || effectiveSlug,
      name: c.name || c.displayName || effectiveSlug,
      handle: c.handle || `@${effectiveSlug}`,
      niche: c.niche,
      themeId: c.themeId,
      themeName: linkedTheme?.name || 'Site Default Theme',
      copyOverrides,
      status: c.status,
      vibeLink,
      previewLink: `${vibeLink}&preview=1&force_vibe=1`,
      createdAt: c.createdAt,
    };
  });

  const formattedThemes = siteThemes.map((t) => ({
    id: t.id,
    name: t.name,
    key: t.id.replace(/^theme_aurora_/, '').replace(/^theme_/, '').replace(/_demo$/, ''),
  }));

  return NextResponse.json({ creators: list, themes: formattedThemes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));

  const displayName = String(body.displayName || body.name || '').trim();
  const rawSlug = String(body.slug || '').trim().toLowerCase();

  if (!displayName) {
    return NextResponse.json({ error: 'Creator name is required' }, { status: 400 });
  }
  if (!rawSlug) {
    return NextResponse.json({ error: 'Creator slug is required' }, { status: 400 });
  }

  // Slug validation: alphanumeric, hyphens, underscores only
  if (!/^[a-zA-Z0-9_-]+$/.test(rawSlug)) {
    return NextResponse.json(
      { error: 'Slug must contain only alphanumeric characters, dashes, or underscores' },
      { status: 400 }
    );
  }

  // Slug must be unique within this site
  const existing = await db
    .select()
    .from(creators)
    .where(and(eq(creators.siteId, siteId), eq(creators.slug, rawSlug)));

  if (existing.length > 0) {
    return NextResponse.json(
      { error: `Slug "${rawSlug}" is already in use by another creator on this site.` },
      { status: 400 }
    );
  }

  const id = `cr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const themeId = body.themeId || auth.site!.defaultThemeId || null;
  const copyOverrides = body.copyOverrides || {
    headline: body.headline || `${displayName}'s Exclusive Edit`,
    subheadline: body.subheadline || '',
    ctaText: body.ctaText || 'Shop Collection',
    heroImage: body.heroImage || '/images/hero-fitfiona.jpg',
    offer: body.offer || '',
    bundleText: body.bundleText || '',
  };

  const newCreator = {
    id,
    siteId,
    slug: rawSlug,
    displayName,
    name: displayName,
    handle: body.handle || `@${rawSlug}`,
    niche: body.niche || 'Curator',
    audience: body.audience || 'Target shoppers',
    interests: JSON.stringify(body.interests || []),
    tone: body.tone || 'Authentic, curated',
    aesthetic: '', // Deprecated in favor of themeId
    themeId,
    copyOverrides: typeof copyOverrides === 'string' ? copyOverrides : JSON.stringify(copyOverrides),
    status: body.status || 'active',
    vibeCode: rawSlug,
    utmSource: body.utmSource || rawSlug,
    utmCampaign: body.utmCampaign || `${rawSlug}_drop`,
    referrerRules: JSON.stringify(body.referrerRules || []),
    preferredCta: copyOverrides.ctaText || 'Shop Collection',
    brandVoice: body.brandVoice || '',
    heroBanner: copyOverrides.heroImage || '/images/hero-fitfiona.jpg',
    createdAt: now,
  };

  await db.insert(creators).values(newCreator);

  return NextResponse.json({
    ok: true,
    creator: {
      ...newCreator,
      copyOverrides,
      vibeLink: `${auth.site!.domain}/?vibe=${rawSlug}`,
    },
  });
}
