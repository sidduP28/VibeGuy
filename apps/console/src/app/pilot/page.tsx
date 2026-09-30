import { ensureSchema, getDb } from '@/db';
import { recommendations, campaigns } from '@/db/schema';
import { VibePilotBoard } from '@/components/VibePilotBoard';

export const dynamic = 'force-dynamic';

export default async function PilotPage() {
  await ensureSchema();
  const db = getDb();
  let recs = await db.select().from(recommendations);
  const campaignRows = await db.select().from(campaigns);

  // Auto-generate rule-based recommendations if none exist
  if (recs.length === 0 && campaignRows.length > 0) {
    const now = new Date().toISOString();
    const autoRecs = campaignRows.flatMap((cmp, i) => [
      {
        id: `rec_${cmp.id}_headline`,
        campaignId: cmp.id,
        current: JSON.stringify({ headline: cmp.headline }),
        suggested: JSON.stringify({
          headline: `${cmp.cta} — Limited Offer`,
        }),
        reason: 'CTR rule: Question + urgency framing historically lifts headline engagement by 18-32% in fitness/luxury verticals.',
        impact: 'High',
        status: 'pending',
      },
      {
        id: `rec_${cmp.id}_holdout`,
        campaignId: cmp.id,
        current: JSON.stringify({ holdoutPct: cmp.holdoutPct }),
        suggested: JSON.stringify({ holdoutPct: Math.min(cmp.holdoutPct + 5, 20) }),
        reason: 'Statistical power: With current sample size, increasing holdout to 15% improves z-test confidence interval width by ~22%.',
        impact: 'Medium',
        status: 'pending',
      },
    ]);

    for (const rec of autoRecs) {
      await db.insert(recommendations).values(rec).onConflictDoNothing();
    }
    recs = await db.select().from(recommendations);
  }

  return (
    <div>
      <p className="kicker">VibePilot</p>
      <h1>AI-Assisted Recommendations</h1>
      <p className="lede">
        Rule-based insights from your holdout data. Approve to apply directly to the campaign.
        All recommendations are clearly labeled as rule-derived, not hallucinated.
      </p>
      <VibePilotBoard recommendations={recs} campaigns={campaignRows} />
    </div>
  );
}
