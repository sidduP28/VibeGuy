import { ensureSchema, getDb } from '@/db';
import { creators, testimonials } from '@/db/schema';
import { VibeDNAEditor } from '@/components/VibeDNAEditor';

export const dynamic = 'force-dynamic';

export default async function VibeDNAPage() {
  await ensureSchema();
  const db = getDb();
  const creatorRows = await db.select().from(creators);
  const testimonialRows = await db.select().from(testimonials);

  return (
    <div>
      <p className="kicker">VibeDNA Hub</p>
      <h1>Creator Profiles</h1>
      <p className="lede">
        Each creator has a tone, aesthetic, preferred CTA, and brand voice that seeds all personalization.
        Edit below and re-generate the SDK bundle from Installer.
      </p>
      <VibeDNAEditor creators={creatorRows} testimonials={testimonialRows} />
    </div>
  );
}
