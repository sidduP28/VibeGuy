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
      <p className="kicker">VibeDNA Hub · VibeGuy</p>
      <h1>Creator Profiles &amp; Vibe Links</h1>
      <p className="lede">
        Each creator has a tone, aesthetic, preferred CTA, and brand voice that seeds all
        personalization. Use the <strong>Vibe Links</strong> tab to copy shareable creator
        URLs — they auto-reskin the Aurora Store at{' '}
        <a href="http://localhost:3002" target="_blank" rel="noopener" style={{ color: 'var(--gold)' }}>
          localhost:3002
        </a>
        .
      </p>
      <VibeDNAEditor creators={creatorRows as any} testimonials={testimonialRows} />
    </div>
  );
}
