import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { siteDna, themes } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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
  const dnaRows = await db.select().from(siteDna).where(eq(siteDna.siteId, siteId));
  const dna = dnaRows[0];

  const palette: string[] = dna && dna.palette ? JSON.parse(dna.palette) : ['#0f172a', '#2563eb', '#ffffff'];
  const fonts: string[] = dna && dna.fonts ? JSON.parse(dna.fonts) : ['system-ui'];

  const bg = palette[2] || '#ffffff';
  const fg = palette[0] || '#0f172a';
  const accent = palette[1] || '#2563eb';
  const fontHeading = fonts[0] || 'system-ui, sans-serif';
  const fontBody = fonts[1] || fonts[0] || 'system-ui, sans-serif';

  const themeId = `theme_dna_${Date.now()}`;
  const themeName = `${dna?.brandName || auth.site!.name} DNA Theme`;
  const now = new Date().toISOString();

  const tokens = {
    bg,
    fg,
    accent,
    cardBg: bg === '#ffffff' ? '#f8fafc' : bg,
    border: fg === '#ffffff' ? '#334155' : '#e2e8f0',
    muted: '#64748b',
    fontHeading,
    fontBody,
    radius: '6px',
    space: '16px',
    copyDefaults: {
      headline: `${dna?.brandName || 'Brand'} Experience`,
      subheadline: dna?.tone || 'Engineered with deliberate purpose.',
      ctaText: 'Discover More',
    },
  };

  await db.insert(themes).values({
    id: themeId,
    siteId,
    name: themeName,
    tokens: JSON.stringify(tokens),
    isBuiltin: false,
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    theme: {
      id: themeId,
      siteId,
      name: themeName,
      tokens,
      isBuiltin: false,
      createdAt: now,
    },
    message: `Created draft theme "${themeName}" in Theme Lab.`,
  });
}
