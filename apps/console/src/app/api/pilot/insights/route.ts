import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '@/db';
import { recommendations } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(recommendations);
  return NextResponse.json({ recommendations: rows });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { id: string; status: string };
  await ensureSchema();
  const db = getDb();
  await db
    .update(recommendations)
    .set({ status: body.status })
    .where(eq(recommendations.id, body.id));
  return NextResponse.json({ ok: true });
}
