import { extractVibe, fetchPublicHtml } from '@/lib/extract';
import { ensureSchema, getDb } from '@/db';
import { referenceSites } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url) return NextResponse.json({ error: 'url_required' }, { status: 400 });
  try {
    const html = await fetchPublicHtml(body.url);
    const vibe = extractVibe(html, body.url);
    await ensureSchema();
    const db = getDb();
    await db.insert(referenceSites).values({
      id: `ref_${Date.now()}`,
      url: body.url,
      palette: JSON.stringify(vibe.palette),
      fonts: JSON.stringify(vibe.fonts),
      ctaStyle: JSON.stringify(vibe.ctaStyle),
      copyTone: vibe.copyTone,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(vibe);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'extract_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
