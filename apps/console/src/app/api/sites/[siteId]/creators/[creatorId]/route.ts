import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { creators } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq, and, ne } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; creatorId: string }> }
) {
  const { siteId, creatorId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const updates: Record<string, any> = {};

  if (body.displayName || body.name) {
    const val = String(body.displayName || body.name).trim();
    updates.displayName = val;
    updates.name = val;
  }

  if (body.slug) {
    const rawSlug = String(body.slug).trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]+$/.test(rawSlug)) {
      return NextResponse.json(
        { error: 'Slug must contain only alphanumeric characters, dashes, or underscores' },
        { status: 400 }
      );
    }
    // Check uniqueness across other creators in this site
    const existing = await db
      .select()
      .from(creators)
      .where(and(eq(creators.siteId, siteId), eq(creators.slug, rawSlug), ne(creators.id, creatorId)));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Slug "${rawSlug}" is already in use by another creator on this site.` },
        { status: 400 }
      );
    }
    updates.slug = rawSlug;
    updates.vibeCode = rawSlug;
  }

  if (body.themeId !== undefined) updates.themeId = body.themeId;
  if (body.status !== undefined) updates.status = body.status;
  if (body.handle !== undefined) updates.handle = body.handle;
  if (body.niche !== undefined) updates.niche = body.niche;

  if (body.copyOverrides) {
    updates.copyOverrides =
      typeof body.copyOverrides === 'string'
        ? body.copyOverrides
        : JSON.stringify(body.copyOverrides);
  }

  await db
    .update(creators)
    .set(updates)
    .where(and(eq(creators.id, creatorId), eq(creators.siteId, siteId)));

  const updated = (
    await db
      .select()
      .from(creators)
      .where(and(eq(creators.id, creatorId), eq(creators.siteId, siteId)))
  )[0];

  return NextResponse.json({ creator: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; creatorId: string }> }
) {
  const { siteId, creatorId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  await db
    .delete(creators)
    .where(and(eq(creators.id, creatorId), eq(creators.siteId, siteId)));

  return NextResponse.json({ ok: true, deletedId: creatorId });
}
