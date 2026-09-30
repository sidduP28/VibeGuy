import { extractProductMeta, fetchPublicHtml } from '@/lib/extract';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url) return NextResponse.json({ error: 'url_required' }, { status: 400 });
  try {
    const html = await fetchPublicHtml(body.url);
    return NextResponse.json(extractProductMeta(html, body.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'extract_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
