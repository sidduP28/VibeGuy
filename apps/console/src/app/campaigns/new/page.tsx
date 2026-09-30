import { ensureSchema, getDb } from '@/db';
import { creators, campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CampaignBuilder } from '@/components/CampaignBuilder';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await ensureSchema();
  const db = getDb();
  const { id } = await searchParams;
  const creatorRows = await db.select().from(creators);
  let initial;
  if (id) {
    const rows = await db.select().from(campaigns).where(eq(campaigns.id, id));
    initial = rows[0];
  }

  const creatorsForClient = creatorRows.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    vibeCode: c.vibeCode,
    utmSource: c.utmSource,
    utmCampaign: c.utmCampaign,
    themeId: c.themeId,
  }));

  return (
    <div>
      <p className="kicker">Campaign Builder</p>
      <h1>{initial ? `Edit: ${initial.name}` : 'New campaign'}</h1>
      <p className="lede">
        Map a creator to a product. Configure slots. Live-preview the split. Copy the vibe link.
      </p>
      <CampaignBuilder creators={creatorsForClient} initial={initial as any} />
    </div>
  );
}
