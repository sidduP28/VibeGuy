import { compileSdkBundle } from '@/lib/compile-sdk';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const bundle = await compileSdkBundle(siteId);
  if (!bundle) {
    return new NextResponse('// unknown site', { status: 404 });
  }
  return new NextResponse(bundle, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
    },
  });
}
