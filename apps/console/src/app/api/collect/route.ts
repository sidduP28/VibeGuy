import { NextRequest, NextResponse } from 'next/server';
import { ingestEvents } from '@/lib/ingest';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const origin = req.headers.get('origin');
  const result = await ingestEvents(body, origin);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
