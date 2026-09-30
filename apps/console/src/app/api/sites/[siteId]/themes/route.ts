import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { themes } from '@/db/schema';
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
  const themeRows = await db.select().from(themes).where(eq(themes.siteId, siteId));

  const list = themeRows.map((t) => {
    let parsedTokens = {};
    try {
      parsedTokens = typeof t.tokens === 'string' ? JSON.parse(t.tokens) : t.tokens;
    } catch {}
    return {
      id: t.id,
      siteId: t.siteId,
      name: t.name,
      tokens: parsedTokens,
      isBuiltin: t.isBuiltin,
      isDefault: auth.site!.defaultThemeId === t.id,
      createdAt: t.createdAt,
    };
  });

  return NextResponse.json({ themes: list, defaultThemeId: auth.site!.defaultThemeId });
}

export async function POST(
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
  const name = String(body.name || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });
  }

  const tokens = body.tokens || {
    bg: '#ffffff',
    fg: '#0f172a',
    accent: '#2563eb',
    fontHeading: 'system-ui, sans-serif',
    fontBody: 'system-ui, sans-serif',
    radius: '8px',
    space: '16px',
  };

  const id = body.id || `theme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  await db.insert(themes).values({
    id,
    siteId,
    name,
    tokens: typeof tokens === 'string' ? tokens : JSON.stringify(tokens),
    isBuiltin: false,
    createdAt: now,
  });

  return NextResponse.json({
    theme: {
      id,
      siteId,
      name,
      tokens,
      isBuiltin: false,
      createdAt: now,
    },
  });
}
