import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '@/db';
import { creators } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(creators);
  return NextResponse.json({ creators: rows });
}

export async function PUT(req: Request) {
  const body = await req.json();
  await ensureSchema();
  const db = getDb();
  const update: Partial<typeof creators.$inferInsert> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.tone !== undefined) update.tone = body.tone;
  if (body.aesthetic !== undefined) update.aesthetic = body.aesthetic;
  if (body.brandVoice !== undefined) update.brandVoice = body.brandVoice;
  if (body.preferredCta !== undefined) update.preferredCta = body.preferredCta;
  if (body.heroBanner !== undefined) update.heroBanner = body.heroBanner;
  await db.update(creators).set(update).where(eq(creators.id, body.id));
  return NextResponse.json({ ok: true });
}
