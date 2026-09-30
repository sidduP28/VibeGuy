import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { siteDna } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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
  const rows = await db.select().from(siteDna).where(eq(siteDna.siteId, siteId));
  const dna = rows[0] || {
    id: `dna_${siteId}`,
    siteId,
    brandName: auth.site!.name,
    palette: JSON.stringify(['#0f172a', '#2563eb', '#ffffff']),
    fonts: JSON.stringify(['system-ui']),
    tone: 'Confident, modern',
    audience: 'Target customers',
    notes: '',
  };

  return NextResponse.json({
    dna: {
      ...dna,
      palette: typeof dna.palette === 'string' ? JSON.parse(dna.palette) : dna.palette,
      fonts: typeof dna.fonts === 'string' ? JSON.parse(dna.fonts) : dna.fonts,
    },
  });
}

export async function PUT(
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
  const now = new Date().toISOString();

  const brandName = String(body.brandName || '').trim();
  const palette = JSON.stringify(Array.isArray(body.palette) ? body.palette : ['#0f172a', '#2563eb', '#ffffff']);
  const fonts = JSON.stringify(Array.isArray(body.fonts) ? body.fonts : ['system-ui']);
  const tone = String(body.tone || '').trim();
  const audience = String(body.audience || '').trim();
  const notes = String(body.notes || '').trim();

  const existing = (await db.select().from(siteDna).where(eq(siteDna.siteId, siteId)))[0];

  if (existing) {
    await db
      .update(siteDna)
      .set({
        brandName,
        palette,
        fonts,
        tone,
        audience,
        notes,
        updatedAt: now,
      })
      .where(eq(siteDna.siteId, siteId));
  } else {
    await db.insert(siteDna).values({
      id: `dna_${siteId}`,
      siteId,
      brandName,
      palette,
      fonts,
      tone,
      audience,
      notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  return NextResponse.json({ ok: true, message: 'Brand DNA updated' });
}
