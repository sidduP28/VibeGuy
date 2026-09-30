import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { campaigns, events } from '@/db/schema';
import { verifySiteOwner, getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { computeUpliftForSite } from '@/lib/analytics';

const MIN_SAMPLE_SIZE = 30; // Minimum total visitors gate for statistical significance reporting

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const user = await getAuthUser(req);
  const auth = await verifySiteOwner(siteId, user.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId') || undefined;

  const uplift = await computeUpliftForSite(siteId, campaignId);
  const totalVisitors = uplift.controlVisitors + uplift.variantVisitors;
  const sampleGated = totalVisitors >= MIN_SAMPLE_SIZE;

  const db = getDb();
  const siteCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.siteId, siteId));

  // Also compute per-campaign breakdown
  const perCampaign = await Promise.all(
    siteCampaigns.map(async (cmp) => {
      const cmpUplift = await computeUpliftForSite(siteId, cmp.id);
      return {
        campaignId: cmp.id,
        campaignName: cmp.name,
        controlVisitors: cmpUplift.controlVisitors,
        variantVisitors: cmpUplift.variantVisitors,
        controlConversions: cmpUplift.controlConversions,
        variantConversions: cmpUplift.variantConversions,
        relativeUplift: cmpUplift.stats.relativeUplift,
        isSignificant: cmpUplift.stats.isSignificant95,
        totalSample: cmpUplift.controlVisitors + cmpUplift.variantVisitors,
        sampleGated: (cmpUplift.controlVisitors + cmpUplift.variantVisitors) >= MIN_SAMPLE_SIZE,
      };
    })
  );

  return NextResponse.json({
    siteId,
    totalVisitors,
    sampleGated,
    minSampleSize: MIN_SAMPLE_SIZE,
    uplift,
    perCampaign,
  });
}
