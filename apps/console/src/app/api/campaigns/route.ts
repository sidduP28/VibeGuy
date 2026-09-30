import { CreateCampaignSchema } from '@vibe/core';
import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '@/db';
import { campaignVersions, campaigns, sites } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(campaigns);
  return NextResponse.json({ campaigns: rows });
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = CreateCampaignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  const id = `cmp_${Date.now()}`;
  const ts = new Date().toISOString();
  await db.insert(campaigns).values({
    id,
    ...parsed.data,
    testimonialIds: JSON.stringify(parsed.data.testimonialIds),
    version: 1,
    createdAt: ts,
    updatedAt: ts,
  });
  return NextResponse.json({ id });
}

export async function PATCH(req: Request) {
  const json = (await req.json()) as { id: string; status?: string; killSwitch?: boolean };
  await ensureSchema();
  const db = getDb();
  if (json.killSwitch != null) {
    await db.update(sites).set({ killSwitch: json.killSwitch });
    return NextResponse.json({ ok: true });
  }
  if (json.id && json.status) {
    await db.update(campaigns).set({ status: json.status, updatedAt: new Date().toISOString() }).where(eq(campaigns.id, json.id));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'noop' }, { status: 400 });
}
