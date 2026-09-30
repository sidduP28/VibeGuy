import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { themes, creators, campaigns, sites } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; themeId: string }> }
) {
  const { siteId, themeId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const updates: Record<string, any> = {};

  if (body.name) updates.name = String(body.name).trim();
  if (body.tokens) {
    updates.tokens = typeof body.tokens === 'string' ? body.tokens : JSON.stringify(body.tokens);
  }

  await db
    .update(themes)
    .set(updates)
    .where(and(eq(themes.id, themeId), eq(themes.siteId, siteId)));

  const updated = (await db.select().from(themes).where(eq(themes.id, themeId)))[0];
  return NextResponse.json({ theme: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; themeId: string }> }
) {
  const { siteId, themeId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const site = auth.site!;

  // 1. Check if theme is the site's default theme
  if (site.defaultThemeId === themeId) {
    return NextResponse.json(
      {
        error: 'theme_in_use',
        message: 'Cannot delete the site default theme. Please assign another theme as default first.',
      },
      { status: 400 }
    );
  }

  // 2. Check if theme is in use by any creator on this site
  const linkedCreators = await db
    .select()
    .from(creators)
    .where(and(eq(creators.siteId, siteId), eq(creators.themeId, themeId)));

  if (linkedCreators.length > 0) {
    return NextResponse.json(
      {
        error: 'theme_in_use',
        message: `Cannot delete theme because it is assigned to ${linkedCreators.length} creator(s): ${linkedCreators.map((c) => c.displayName || c.slug).join(', ')}. Please reassign them first.`,
      },
      { status: 400 }
    );
  }

  // 3. Check if theme is in use by any campaign on this site
  const linkedCampaigns = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.siteId, siteId), eq(campaigns.themeId, themeId)));

  if (linkedCampaigns.length > 0) {
    return NextResponse.json(
      {
        error: 'theme_in_use',
        message: `Cannot delete theme because it is assigned to ${linkedCampaigns.length} campaign(s). Please reassign them first.`,
      },
      { status: 400 }
    );
  }

  // Safe to delete
  await db.delete(themes).where(and(eq(themes.id, themeId), eq(themes.siteId, siteId)));
  return NextResponse.json({ ok: true, deletedId: themeId });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; themeId: string }> }
) {
  const { siteId, themeId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const action = body.action || '';

  const themeRows = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.siteId, siteId)));

  const sourceTheme = themeRows[0];
  if (!sourceTheme) {
    return NextResponse.json({ error: 'theme_not_found' }, { status: 404 });
  }

  if (action === 'set-default') {
    await db.update(sites).set({ defaultThemeId: themeId }).where(eq(sites.id, siteId));
    return NextResponse.json({
      ok: true,
      message: `Theme "${sourceTheme.name}" is now the default site theme.`,
      defaultThemeId: themeId,
    });
  }

  if (action === 'duplicate') {
    const newId = `theme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newName = `${sourceTheme.name} (Copy)`;
    const now = new Date().toISOString();

    await db.insert(themes).values({
      id: newId,
      siteId,
      name: newName,
      tokens: sourceTheme.tokens,
      isBuiltin: false,
      createdAt: now,
    });

    return NextResponse.json({
      ok: true,
      theme: {
        id: newId,
        siteId,
        name: newName,
        tokens: typeof sourceTheme.tokens === 'string' ? JSON.parse(sourceTheme.tokens) : sourceTheme.tokens,
        isBuiltin: false,
        createdAt: now,
      },
    });
  }

  return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
}
