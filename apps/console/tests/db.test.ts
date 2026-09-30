import { describe, it, expect, beforeAll } from 'vitest';
import { ensureSchema, getDb } from '../src/db';
import { sites, creators, campaigns, events, testimonials, themes } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Console Database Layer', () => {
  beforeAll(async () => {
    await ensureSchema();
  });

  it('initializes and seeds demo site', async () => {
    const db = getDb();
    const site = (await db.select().from(sites).where(eq(sites.id, 'site_demo')))[0];
    expect(site).toBeDefined();
    expect(site?.publicKey).toBe('pk_live_vibepersonalize_2026');
    expect(site?.killSwitch).toBe(false);
  });

  it('has 3 pre-seeded creator profiles with unique vibeCodes', async () => {
    const db = getDb();
    const allCreators = await db.select().from(creators);
    expect(allCreators.length).toBeGreaterThanOrEqual(3);

    const codes = allCreators.map((c) => c.vibeCode);
    expect(codes).toContain('fit2026');
    expect(codes).toContain('minimal2026');
    expect(codes).toContain('lux2026');
  });

  it('has pre-seeded campaigns linked to creators', async () => {
    const db = getDb();
    const allCampaigns = await db.select().from(campaigns);
    expect(allCampaigns.length).toBeGreaterThanOrEqual(3);

    const fitCampaign = allCampaigns.find((c) => c.id === 'cmp_fit');
    expect(fitCampaign).toBeDefined();
    expect(fitCampaign?.creatorId).toBe('cr_fit');
    expect(fitCampaign?.status).toBe('active');
  });

  it('has builtin themes seeded', async () => {
    const db = getDb();
    const allThemes = await db.select().from(themes);
    expect(allThemes.length).toBeGreaterThanOrEqual(8);
  });

  it('can insert and query events', async () => {
    const db = getDb();
    const testId = `test_evt_${Date.now()}`;
    await db.insert(events).values({
      id: testId,
      visitorId: 'vis_test_123',
      siteId: 'site_demo',
      campaignId: 'cmp_fit',
      creatorId: 'cr_fit',
      variant: 'personalized',
      type: 'impression',
      execMs: 12,
      hideMs: 8,
      cls: 0,
      lcp: 420,
      simulated: true,
      timestamp: Date.now(),
    });

    const evt = (await db.select().from(events).where(eq(events.id, testId)))[0];
    expect(evt).toBeDefined();
    expect(evt?.variant).toBe('personalized');
    expect(evt?.execMs).toBe(12);
  });
});
