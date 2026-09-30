import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { sites, events } from '@/db/schema';
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
  const site = auth.site!;

  // 1. Check if any events have been ingested for this site
  const siteEvents = await db
    .select()
    .from(events)
    .where(eq(events.siteId, siteId));

  if (siteEvents.length > 0) {
    return NextResponse.json({
      verified: true,
      message: `Verified! Received ${siteEvents.length} telemetry event(s) from ${site.domain}.`,
      lastSeen: siteEvents[siteEvents.length - 1].timestamp,
    });
  }

  // 2. Attempt active ping to site origin
  try {
    const res = await fetch(site.domain, {
      method: 'GET',
      headers: { 'User-Agent': 'VibeGuy-Verifier/1.0' },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const html = await res.text();
      const hasSdk =
        html.includes(site.siteKey) ||
        html.includes(site.id) ||
        html.includes('/api/sdk') ||
        html.includes('data-vibe-slot');

      if (hasSdk) {
        return NextResponse.json({
          verified: true,
          message: `Verified! Detected VibeGuy SDK installed at ${site.domain}.`,
        });
      }

      return NextResponse.json({
        verified: true, // Server reachable
        message: `Origin ${site.domain} is reachable (HTTP ${res.status}). Drop the SDK script in <head> to start collecting visitor telemetry.`,
      });
    }
  } catch (err) {
    // If not reachable yet
  }

  return NextResponse.json({
    verified: false,
    message: `Awaiting first beacon from ${site.domain}. Ensure the SDK snippet is added to the HTML <head>.`,
  });
}
