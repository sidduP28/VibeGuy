import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '@/db';
import { campaignVersions, campaigns } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = (await req.json()) as { action: 'rollback' | 'snapshot' };
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(campaigns).where(eq(campaigns.id, id));
  const campaign = rows[0];
  if (!campaign) return NextResponse.json({ error: 'missing' }, { status: 404 });

  if (action === 'snapshot') {
    await db.insert(campaignVersions).values({
      id: `ver_${Date.now()}`,
      campaignId: id,
      version: campaign.version,
      snapshot: JSON.stringify(campaign),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  }

  const versions = await db.select().from(campaignVersions).where(eq(campaignVersions.campaignId, id));
  const last = versions.sort((a, b) => b.version - a.version)[0];
  if (!last) return NextResponse.json({ error: 'no_version' }, { status: 400 });
  const snap = JSON.parse(last.snapshot) as typeof campaign;
  await db
    .update(campaigns)
    .set({
      headline: snap.headline,
      subheadline: snap.subheadline,
      cta: snap.cta,
      offer: snap.offer,
      hero: snap.hero,
      version: campaign.version + 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(campaigns.id, id));
  return NextResponse.json({ ok: true, version: campaign.version + 1 });
}
