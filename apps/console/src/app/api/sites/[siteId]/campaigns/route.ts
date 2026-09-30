import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { campaigns, creators, themes, campaignVersions } from '@/db/schema';
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
  const siteCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.siteId, siteId));

  const siteCreators = await db
    .select()
    .from(creators);

  const siteThemes = await db
    .select()
    .from(themes);

  const domain = (auth.site?.domain && auth.site.domain.trim()) || 'http://localhost:3002';

  const list = siteCampaigns.map((cmp) => {
    const creator = siteCreators.find((c) => c.id === cmp.creatorId);
    const theme = siteThemes.find((t) => t.id === cmp.themeId);
    const effectiveSlug = (creator?.slug && creator.slug.trim()) || (creator as any)?.vibeCode || (creator?.handle ? creator.handle.replace(/^@/, '') : cmp.creatorId);
    const vibeLink = `${domain}/?vibe=${effectiveSlug}`;

    const productPreviewUrl = cmp.productUrl
      ? (cmp.productUrl.includes('?')
          ? `${cmp.productUrl}&vibe=${effectiveSlug}&preview=1&force_vibe=1${cmp.themeId ? `&theme=${encodeURIComponent(cmp.themeId)}` : ''}`
          : `${cmp.productUrl}?vibe=${effectiveSlug}&preview=1&force_vibe=1${cmp.themeId ? `&theme=${encodeURIComponent(cmp.themeId)}` : ''}`)
      : `${domain}/?vibe=${effectiveSlug}&preview=1&force_vibe=1${cmp.themeId ? `&theme=${encodeURIComponent(cmp.themeId)}` : ''}`;

    return {
      ...cmp,
      creatorName: creator?.displayName || creator?.name || cmp.creatorId,
      creatorHandle: creator?.handle || '',
      creatorSlug: effectiveSlug,
      themeName: theme?.name || cmp.themeId,
      vibeLink,
      previewLink: `${vibeLink}&preview=1&force_vibe=1${cmp.themeId ? `&theme=${encodeURIComponent(cmp.themeId)}` : ''}`,
      productPreviewUrl,
    };
  });

  const formattedThemes = siteThemes.map((t) => ({
    id: t.id,
    name: t.name,
    key: t.id.replace(/^theme_aurora_/, '').replace(/^theme_/, '').replace(/_demo$/, ''),
  }));

  return NextResponse.json({
    campaigns: list,
    themes: formattedThemes,
    site: { id: auth.site!.id, name: auth.site!.name, domain },
  });
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

  const name = String(body.name || '').trim();
  const creatorId = String(body.creatorId || '').trim();
  const themeId = String(body.themeId || auth.site!.defaultThemeId || '').trim();

  if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
  if (!creatorId) return NextResponse.json({ error: 'Creator is required' }, { status: 400 });

  const id = body.id || `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const newCampaign = {
    id,
    siteId,
    creatorId,
    name,
    productUrl: body.productUrl || `${auth.site!.domain}/shop`,
    productTitle: body.productTitle || name,
    productDescription: body.productDescription || '',
    productImage: body.hero || body.productImage || '/images/hero-fitfiona.jpg',
    productPrice: body.productPrice || '$49.00',
    promoCode: body.promoCode || '',
    offer: body.offer || '',
    cta: body.cta || 'Shop Now',
    hero: body.hero || '/images/hero-fitfiona.jpg',
    headline: body.headline || `${name}`,
    subheadline: body.subheadline || '',
    testimonialIds: JSON.stringify(body.testimonialIds || []),
    themeId,
    holdoutPct: Number(body.holdoutPct ?? 10),
    status: body.status || 'active',
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(campaigns).values(newCampaign);
  await db
    .insert(campaignVersions)
    .values({
      id: `${id}_v1`,
      campaignId: id,
      version: 1,
      snapshot: JSON.stringify(newCampaign),
      createdAt: now,
    });

  return NextResponse.json({ ok: true, campaign: newCampaign });
}
