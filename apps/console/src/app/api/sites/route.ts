import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema } from '@/db';
import { sites, siteDna, creators, campaigns, themes, events } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { computeUpliftForSite } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  await ensureSchema();
  const db = getDb();
  const user = await getAuthUser(req);

  const userSites = await db
    .select()
    .from(sites)
    .where(eq(sites.ownerId, user.id));

  // Compute stats for each site
  const siteList = await Promise.all(
    userSites.map(async (site) => {
      const siteCreators = await db
        .select()
        .from(creators)
        .where(eq(creators.siteId, site.id));

      const activeCampaigns = await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.siteId, site.id), eq(campaigns.status, 'active')));

      let upliftSummary = '+0.0%';
      let isSignificant = false;
      try {
        const uplift = await computeUpliftForSite(site.id);
        upliftSummary = `${uplift.stats.relativeUplift >= 0 ? '+' : ''}${(uplift.stats.relativeUplift * 100).toFixed(1)}%`;
        isSignificant = uplift.stats.isSignificant95;
      } catch {}

      return {
        id: site.id,
        name: site.name,
        domain: site.domain,
        origin: site.domain,
        siteKey: site.siteKey || site.publicKey || site.id,
        defaultThemeId: site.defaultThemeId,
        status: site.status,
        creatorsCount: siteCreators.length,
        activeCampaignsCount: activeCampaigns.length,
        upliftSummary,
        isSignificant,
        createdAt: site.createdAt,
      };
    })
  );

  return NextResponse.json({ sites: siteList });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const db = getDb();
  const user = await getAuthUser(req);
  const body = await req.json().catch(() => ({}));

  const name = (body.name || '').trim();
  const domain = (body.domain || body.origin || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!domain) {
    return NextResponse.json({ error: 'Origin URL / Domain is required' }, { status: 400 });
  }

  const id = `site_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const siteKey = `pk_live_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const defaultThemeId = `theme_${id}_default`;

  // 1. Insert default theme for site
  await db.insert(themes).values({
    id: defaultThemeId,
    siteId: id,
    name: `${name} Default Theme`,
    tokens: JSON.stringify({
      bg: '#ffffff',
      fg: '#0f172a',
      accent: '#2563eb',
      cardBg: '#f8fafc',
      border: '#e2e8f0',
      muted: '#64748b',
      fontHeading: 'system-ui, -apple-system, sans-serif',
      fontBody: 'system-ui, -apple-system, sans-serif',
      radius: '8px',
      space: '16px',
    }),
    isBuiltin: false,
    createdAt: now,
  });

  // 2. Insert site
  await db.insert(sites).values({
    id,
    ownerId: user.id,
    name,
    domain,
    siteKey,
    defaultThemeId,
    status: 'active',
    domains: JSON.stringify([domain.replace(/^https?:\/\//, '')]),
    publicKey: siteKey,
    killSwitch: false,
    createdAt: now,
  });

  // 3. Insert initial site DNA
  await db.insert(siteDna).values({
    id: `dna_${id}`,
    siteId: id,
    brandName: name,
    palette: JSON.stringify(['#0f172a', '#2563eb', '#ffffff']),
    fonts: JSON.stringify(['system-ui']),
    tone: 'Confident, clear, helpful',
    audience: 'General customers',
    notes: 'Primary brand storefront.',
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    id,
    name,
    domain,
    origin: domain,
    siteKey,
    defaultThemeId,
    status: 'active',
    createdAt: now,
  });
}
