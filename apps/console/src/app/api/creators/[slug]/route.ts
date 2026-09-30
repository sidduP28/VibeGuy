import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/db';
import { creators, testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  await ensureSchema();
  const db = getDb();

  // Try to find creator by vibeCode (slug) first, then by handle
  const allCreators = await db.select().from(creators);
  const creator = allCreators.find(
    (c) => c.vibeCode === slug || c.handle === `@${slug}` || c.handle === slug
  );

  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  const creatorTestimonials = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.creatorId, creator.id));

  return NextResponse.json(
    {
      id: creator.id,
      name: creator.name,
      handle: creator.handle,
      vibeCode: creator.vibeCode,
      niche: creator.niche,
      audience: creator.audience,
      tone: creator.tone,
      aesthetic: creator.aesthetic,
      preferredCta: creator.preferredCta,
      brandVoice: creator.brandVoice,
      heroBanner: creator.heroBanner,
      themeId: creator.themeId,
      testimonials: creatorTestimonials.map((t) => ({
        id: t.id,
        quote: t.quote,
        author: t.author,
        image: t.image,
      })),
    },
    {
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3002',
        'Cache-Control': 'no-store',
      },
    }
  );
}
