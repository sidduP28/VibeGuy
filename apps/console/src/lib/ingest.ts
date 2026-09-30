import { IngestPayloadSchema } from '@vibe/core';
import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '../db';
import { events, sites } from '../db/schema';

const buckets = new Map<string, { count: number; ts: number }>();

function rateLimited(key: string, limit = 120, windowMs = 60_000) {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now - cur.ts > windowMs) {
    buckets.set(key, { count: 1, ts: now });
    return false;
  }
  cur.count += 1;
  return cur.count > limit;
}

export async function ingestEvents(
  body: unknown,
  origin: string | null
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  await ensureSchema();
  const parsed = IngestPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_payload', status: 400 };
  }
  const db = getDb();
  const siteRows = await db.select().from(sites).where(eq(sites.publicKey, parsed.data.publicKey));
  const site = siteRows[0];
  if (!site) return { ok: false, error: 'unknown_key', status: 401 };

  const allowed = JSON.parse(site.domains) as string[];
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (!allowed.includes(host) && host !== 'localhost' && host !== '127.0.0.1') {
        return { ok: false, error: 'origin_blocked', status: 403 };
      }
    } catch {
      return { ok: false, error: 'origin_blocked', status: 403 };
    }
  }

  if (rateLimited(parsed.data.publicKey)) {
    return { ok: false, error: 'rate_limited', status: 429 };
  }

  const now = Date.now();
  for (const ev of parsed.data.events) {
    await db.insert(events).values({
      id: `ev_${Math.random().toString(36).substring(2, 11)}${now.toString(36)}`,
      visitorId: ev.visitorId,
      siteId: site.id,
      campaignId: ev.campaignId,
      creatorId: ev.creatorId,
      variant: ev.variant,
      type: ev.type,
      orderId: ev.orderId,
      value: ev.value != null ? Math.round(ev.value * 100) : null,
      execMs: ev.metrics?.execMs != null ? Math.round(ev.metrics.execMs) : null,
      hideMs: ev.metrics?.hideMs != null ? Math.round(ev.metrics.hideMs) : null,
      cls: ev.metrics?.cls != null ? Math.round(ev.metrics.cls * 1000) : null,
      lcp: ev.metrics?.lcp != null ? Math.round(ev.metrics.lcp) : null,
      reason: ev.reason,
      simulated: false,
      timestamp: ev.timestamp ?? now,
    });
  }
  return { ok: true };
}
