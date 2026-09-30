/**
 * Deterministic FNV-1a 32-bit hash for holdout allocation
 */
export function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Multiply by 32-bit FNV prime with bitwise math
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0; // Return unsigned 32-bit integer
}

export function hashVisitorToBucket(visitorId: string, campaignId: string): number {
  const combined = `${visitorId}:${campaignId}`;
  const hash = fnv1a(combined);
  return hash % 100; // Returns 0 to 99
}

export function isVisitorInHoldout(
  visitorId: string,
  campaignId: string,
  holdoutPct: number
): boolean {
  if (holdoutPct <= 0) return false;
  if (holdoutPct >= 100) return true;

  const bucket = hashVisitorToBucket(visitorId, campaignId);
  return bucket < holdoutPct;
}
