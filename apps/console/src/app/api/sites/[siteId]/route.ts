import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { sites, creators, campaigns, events } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { computeUpliftForSite } from '@/lib/analytics';

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
  const site = auth.site!;

  const siteCreators = await db
    .select()
    .from(creators)
    .where(eq(creators.siteId, siteId));

  const siteCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.siteId, siteId));

  const siteEvents = await db
    .select()
    .from(events)
    .where(eq(events.siteId, siteId));

  const totalImpressions = siteEvents.filter((e) => e.type === 'view' || e.type === 'slot_applied').length;
  const totalConversions = siteEvents.filter((e) => e.type === 'purchase').length;
  const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;

  const uplift = await computeUpliftForSite(siteId);

  return NextResponse.json({
    site: {
      id: site.id,
      name: site.name,
      domain: site.domain,
      origin: site.domain,
      siteKey: site.siteKey,
      defaultThemeId: site.defaultThemeId,
      status: site.status,
      createdAt: site.createdAt,
    },
    metrics: {
      totalImpressions,
      totalConversions,
      conversionRate: Number(conversionRate.toFixed(2)),
      relativeUplift: Number((uplift.stats.relativeUplift * 100).toFixed(1)),
      isSignificant: uplift.stats.isSignificant95,
      zScore: Number(uplift.stats.zScore.toFixed(2)),
      execMsP95: uplift.rum.execMsP95,
      clsP95: uplift.rum.clsP95,
      creatorsCount: siteCreators.length,
      activeCampaignsCount: siteCampaigns.filter((c) => c.status === 'active').length,
    },
    recentEvents: siteEvents.slice(-20).reverse(),
  });
}

export async function PATCH(
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
  const updates: Record<string, any> = {};

  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.domain !== undefined || body.origin !== undefined) {
    const d = String(body.domain || body.origin).trim();
    updates.domain = d;
    updates.domains = JSON.stringify([d.replace(/^https?:\/\//, '')]);
  }
  if (body.defaultThemeId !== undefined) updates.defaultThemeId = body.defaultThemeId;
  if (body.status !== undefined) updates.status = body.status;

  await db.update(sites).set(updates).where(eq(sites.id, siteId));

  const updated = (await db.select().from(sites).where(eq(sites.id, siteId)))[0];
  return NextResponse.json({ site: updated });
}

export async function DELETE(
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
  await db.delete(sites).where(eq(sites.id, siteId));
  return NextResponse.json({ ok: true });
}
