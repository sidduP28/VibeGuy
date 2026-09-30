import { NextRequest, NextResponse } from 'next/server';
import { getCachedSiteConfig } from '../../config/route';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-site-key',
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const { searchParams } = new URL(req.url);
  const bypass = searchParams.get('bypass') === '1' || req.headers.get('cache-control') === 'no-cache';

  const start = performance.now();
  const result = await getCachedSiteConfig(siteId, bypass);
  const duration = Math.round(performance.now() - start);

  if (!result || !result.payload) {
    return NextResponse.json({ error: 'site_not_found' }, { status: 404 });
  }

  return NextResponse.json(result.payload, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-site-key',
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      'X-Cache': result.hit ? 'HIT' : 'MISS',
      'X-Cache-Age-Ms': String(result.age),
      'X-Response-Time': `${duration}ms`,
    },
  });
}
