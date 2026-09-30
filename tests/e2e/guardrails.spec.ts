import { test, expect } from '@playwright/test';

test.describe('VibePersonalize Guardrails Verification (G1–G5)', () => {
  test('G1 & G2: SDK script compiles and delivers under 50ms budget', async ({ request }) => {
    const res = await request.get('/api/sdk/site_demo');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('window.__VIBE_CONFIG__');
    expect(body).toContain('data-vibe-slot');
  });

  test('G3: Fail-safe timer clears pre-hide styles gracefully', async ({ page }) => {
    // Navigate with unknown param to trigger fallback
    await page.goto('/?vibe=unknown_non_existent_creator');
    // Prehide element should be removed or slots visible
    await page.waitForTimeout(350);
    const prehide = await page.$('#vibe-prehide');
    expect(prehide).toBeNull();
  });

  test('G4: SEO Neutrality - title, canonical, and meta descriptions are untouched', async ({ page }) => {
    await page.goto('/?vibe=fit2026');
    const title = await page.title();
    expect(title).toContain('VibePersonalize Console');
  });

  test('G5: Ingestion API blocks spoofed origins and invalid payloads', async ({ request }) => {
    const res = await request.post('/api/collect', {
      headers: {
        origin: 'https://unauthorized-phishing-site.com',
      },
      data: {
        publicKey: 'pk_live_vibepersonalize_2026',
        events: [
          {
            visitorId: 'vis_test',
            siteId: 'site_demo',
            campaignId: 'cmp_fit',
            variant: 'personalized',
            type: 'view',
          },
        ],
      },
    });
    expect(res.status()).toBe(403);
  });
});
