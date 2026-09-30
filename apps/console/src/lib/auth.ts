import { headers } from 'next/headers';
import { getDb, ensureSchema } from '@/db';
import { sites } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
}

export async function getAuthUser(req?: Request): Promise<AuthUser> {
  // Support header override for tests & api requests
  if (req) {
    const h = req.headers.get('x-user-id');
    if (h) return { id: h };
    // Cookie support
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/vibe_user_id=([^;]+)/);
    if (match) return { id: decodeURIComponent(match[1]) };
  } else {
    try {
      const hList = await headers();
      const h = hList.get('x-user-id');
      if (h) return { id: h };
      const cookie = hList.get('cookie') || '';
      const match = cookie.match(/vibe_user_id=([^;]+)/);
      if (match) return { id: decodeURIComponent(match[1]) };
    } catch {}
  }
  return { id: 'owner_default' };
}

export async function verifySiteOwner(siteId: string, userId?: string) {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(sites).where(eq(sites.id, siteId));
  const site = rows[0];
  if (!site) {
    return { ok: false, error: 'site_not_found', status: 404, site: null };
  }
  const effectiveUser = userId || (await getAuthUser()).id;
  if (site.ownerId !== effectiveUser) {
    return { ok: false, error: 'forbidden_not_owner', status: 403, site: null };
  }
  return { ok: true, error: null, status: 200, site };
}
