import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/collect
 * Analytics event ingestion endpoint for @vibe/sdk.
 * In production this would forward to your VibeGuy pipeline.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate minimal shape
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { event, siteId, creatorId, campaignId, sessionId, ts } = body as {
      event?: string;
      siteId?: string;
      creatorId?: string;
      campaignId?: string;
      sessionId?: string;
      ts?: number;
    };

    // Log to console in dev; forward to real pipeline in production
    if (process.env.NODE_ENV === 'development') {
      console.log('[vibe:collect]', {
        event,
        siteId,
        creatorId,
        campaignId,
        sessionId,
        ts: ts ? new Date(ts).toISOString() : undefined,
      });
    } else {
      // TODO: forward to VibeGuy API
      // await fetch(process.env.VIBE_COLLECT_URL!, { method: 'POST', body: JSON.stringify(body) });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// Allow preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
