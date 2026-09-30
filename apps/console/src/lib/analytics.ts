import { calculateTwoProportionZTest } from '@vibe/core';
import { ensureSchema, getDb } from '../db';
import { events } from '../db/schema';

export async function computeUplift(campaignId?: string) {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(events);
  const scoped = campaignId ? rows.filter((r) => r.campaignId === campaignId) : rows;

  const controlVisitors = new Set(
    scoped.filter((r) => r.variant === 'control' && r.type === 'view').map((r) => r.visitorId)
  ).size;
  const variantVisitors = new Set(
    scoped
      .filter((r) => r.variant === 'personalized' && (r.type === 'view' || r.type === 'slot_applied'))
      .map((r) => r.visitorId)
  ).size;
  const controlConversions = new Set(
    scoped.filter((r) => r.variant === 'control' && r.type === 'purchase').map((r) => r.visitorId)
  ).size;
  const variantConversions = new Set(
    scoped.filter((r) => r.variant === 'personalized' && r.type === 'purchase').map((r) => r.visitorId)
  ).size;

  const stats = calculateTwoProportionZTest({
    controlVisitors: Math.max(controlVisitors, 0),
    controlConversions,
    variantVisitors: Math.max(variantVisitors, 0),
    variantConversions,
  });

  // execMs and cls are now flat columns
  const exec = scoped.map((r) => r.execMs).filter((n): n is number => n != null);
  // cls stored as milliCLS (integer), convert back to float
  const cls = scoped.map((r) => (r.cls != null ? r.cls / 1000 : null)).filter((n): n is number => n != null);
  const p95 = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
  };

  return {
    controlVisitors,
    variantVisitors,
    controlConversions,
    variantConversions,
    stats,
    rum: {
      execMsP95: p95(exec),
      clsP95: p95(cls),
      simulatedShare: scoped.length
        ? scoped.filter((r) => r.simulated).length / scoped.length
        : 0,
    },
    log: scoped.slice(-40).reverse(),
  };
}
