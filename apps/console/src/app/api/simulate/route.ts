import { ensureSchema, getDb } from '@/db';
import { events } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST() {
  await ensureSchema();
  const db = getDb();
  const now = Date.now();
  const campaignIds = ['cmp_fit', 'cmp_min', 'cmp_lux'] as const;
  const creatorIds = ['cr_fit', 'cr_min', 'cr_lux'] as const;
  const inserted: string[] = [];

  for (let i = 0; i < 90; i++) {
    const idx = i % 3;
    const variant = i % 10 === 0 ? 'control' : 'personalized';
    const purchased = variant === 'personalized' ? i % 7 === 0 : i % 15 === 0;
    const type = purchased ? 'purchase' : i % 3 === 0 ? 'slot_applied' : 'view';
    const id = `sim_${now}_${i}`;
    inserted.push(id);
    await db.insert(events).values({
      id,
      visitorId: `sim_v_${now}_${i}`,
      siteId: 'site_demo',
      campaignId: campaignIds[idx],
      creatorId: creatorIds[idx],
      variant,
      type,
      value: purchased ? 4900 + (i % 5) * 1000 : null,
      execMs: 8 + (i % 12),
      hideMs: 6 + (i % 10),
      cls: 0,
      lcp: 1100 + (i % 400),
      simulated: true,
      timestamp: now - i * 2000,
    });
  }

  return NextResponse.json({
    ok: true,
    inserted: inserted.length,
    label: 'simulated — not real user data',
  });
}
