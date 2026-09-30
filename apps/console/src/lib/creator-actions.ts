'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { creators } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface CreatorUpdatePayload {
  name: string;
  handle: string;
  niche: string;
  audience: string;
  tone: string;
  aesthetic: string;
  preferredCta: string;
  brandVoice: string;
  heroBanner: string;
}

export async function updateCreator(id: string, payload: CreatorUpdatePayload) {
  const db = getDb();
  await db
    .update(creators)
    .set({
      name: payload.name,
      handle: payload.handle,
      niche: payload.niche,
      audience: payload.audience,
      tone: payload.tone,
      aesthetic: payload.aesthetic,
      preferredCta: payload.preferredCta,
      brandVoice: payload.brandVoice,
      heroBanner: payload.heroBanner,
    })
    .where(eq(creators.id, id));

  revalidatePath('/creators');
  revalidatePath('/');
}
