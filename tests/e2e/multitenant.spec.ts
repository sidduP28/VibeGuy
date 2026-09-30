import { test, expect } from '@playwright/test';

const CONSOLE_URL = 'http://localhost:3000';
const AURORA_URL = 'http://localhost:3002';

test.describe('Multi-Tenant Platform End-to-End Suite', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Site isolation: User B gets 403/404 on User A site resources', async ({ request }) => {
    // Attempt to access site_aurora as User B
    const res = await request.get(`${CONSOLE_URL}/api/sites/site_aurora`, {
      headers: {
        'x-user-id': 'user_b_unauthorized',
      },
    });
    expect([403, 404]).toContain(res.status());
    const data = await res.json();
    expect(data.error).toBeDefined();

    // Owner default access should succeed (200)
    const ownerRes = await request.get(`${CONSOLE_URL}/api/sites/site_aurora`, {
      headers: {
        'x-user-id': 'owner_default',
      },
    });
    expect(ownerRes.status()).toBe(200);
  });

  test('2. Add creator with Theme Lab theme -> renders exact --bg/--fg/--accent on port 3002', async ({ request, page }) => {
    const uniqueSlug = `cr-test-${Date.now()}`;

    // 1. Create a theme in Theme Lab
    const themeRes = await request.post(`${CONSOLE_URL}/api/sites/site_aurora/themes`, {
      headers: { 'x-user-id': 'owner_default' },
      data: {
        name: 'Vibrant Magenta Test',
        tokens: {
          bg: '#1a0022',
          fg: '#ffddff',
          accent: '#ff00aa',
          cardBg: '#2a0033',
          border: '#4a0055',
          radius: '14px',
          space: '18px',
        },
      },
    });
    expect(themeRes.ok()).toBeTruthy();
    const { theme } = await themeRes.json();

    // 2. Add creator assigned to this theme
    const creatorRes = await request.post(`${CONSOLE_URL}/api/sites/site_aurora/creators`, {
      headers: { 'x-user-id': 'owner_default' },
      data: {
        displayName: 'Magenta Creator',
        slug: uniqueSlug,
        themeId: theme.id,
        headline: 'Magenta Custom Experience',
      },
    });
    expect(creatorRes.ok()).toBeTruthy();

    // 3. Visit Aurora storefront with ?vibe={uniqueSlug}&force_vibe=1
    await page.goto(`${AURORA_URL}/?vibe=${uniqueSlug}&force_vibe=1`);

    // Verify exact CSS custom properties on <html>
    const html = page.locator('html');
    await expect(html).toHaveAttribute('style', /--bg:\s*#1a0022/);
    await expect(html).toHaveAttribute('style', /--fg:\s*#ffddff/);
    await expect(html).toHaveAttribute('style', /--accent:\s*#ff00aa/);
    await expect(html).toHaveAttribute('style', /--radius:\s*14px/);

    // Verify personalized headline
    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('Magenta Custom Experience');
  });

  test('3. Deleting in-use theme is blocked with 400', async ({ request }) => {
    // 'theme_energy' is in use by 'fitfiona' in site_aurora
    const res = await request.delete(`${CONSOLE_URL}/api/sites/site_aurora/themes/theme_energy`, {
      headers: { 'x-user-id': 'owner_default' },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('theme_in_use');
    expect(data.message).toContain('assigned');
  });

  test('4. "Set as site theme" -> default visitor sees it', async ({ request, page }) => {
    // 1. Create a unique brand theme
    const themeRes = await request.post(`${CONSOLE_URL}/api/sites/site_aurora/themes`, {
      headers: { 'x-user-id': 'owner_default' },
      data: {
        name: 'Brand Default Midnight Gold',
        tokens: {
          bg: '#050811',
          fg: '#f0f4f8',
          accent: '#eab308',
          cardBg: '#0f172a',
          border: '#1e293b',
          radius: '8px',
        },
      },
    });
    expect(themeRes.ok()).toBeTruthy();
    const { theme } = await themeRes.json();

    // 2. Set as site default theme
    const setDefRes = await request.post(`${CONSOLE_URL}/api/sites/site_aurora/themes/${theme.id}`, {
      headers: { 'x-user-id': 'owner_default' },
      data: { action: 'set-default' },
    });
    expect(setDefRes.ok()).toBeTruthy();

    // 3. Clear cookies and visit Aurora as a clean default visitor (no vibe parameter)
    await page.context().clearCookies();
    await page.goto(`${AURORA_URL}/?force_vibe=0&vibe_debug=1`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('style', /--bg:\s*#050811/);
    await expect(html).toHaveAttribute('style', /--accent:\s*#eab308/);

    // Reset default back to theme_aurora_default
    await request.post(`${CONSOLE_URL}/api/sites/site_aurora/themes/theme_aurora_default`, {
      headers: { 'x-user-id': 'owner_default' },
      data: { action: 'set-default' },
    });
  });

  test('5. Builder overrides save at campaign level without mutating base theme', async ({ request }) => {
    // 1. Get base theme
    const baseThemeRes = await request.get(`${CONSOLE_URL}/api/sites/site_aurora/themes`);
    const { themes } = await baseThemeRes.json();
    const baseTheme = themes.find((t: any) => t.id === 'theme_gold');
    const originalAccent = baseTheme.tokens.accent;

    // 2. Save campaign with overrideTokens
    const campRes = await request.post(`${CONSOLE_URL}/api/sites/site_aurora/campaigns`, {
      headers: { 'x-user-id': 'owner_default' },
      data: {
        name: 'Campaign with Accent Override',
        creatorId: 'cr_luxe_lena',
        themeId: 'theme_gold',
        overrideTokens: { accent: '#ff0055' },
      },
    });
    expect(campRes.ok()).toBeTruthy();

    // 3. Verify base theme in Theme Lab was NOT mutated
    const afterThemeRes = await request.get(`${CONSOLE_URL}/api/sites/site_aurora/themes`);
    const afterData = await afterThemeRes.json();
    const afterTheme = afterData.themes.find((t: any) => t.id === 'theme_gold');
    expect(afterTheme.tokens.accent).toBe(originalAccent);
  });

  test('6. Site data persistence after reload', async ({ request }) => {
    // Fetch site config, modify name, verify persists
    const patchRes = await request.patch(`${CONSOLE_URL}/api/sites/site_aurora`, {
      headers: { 'x-user-id': 'owner_default' },
      data: { name: 'Aurora Atelier Permanent' },
    });
    expect(patchRes.ok()).toBeTruthy();

    const getRes = await request.get(`${CONSOLE_URL}/api/sites/site_aurora`, {
      headers: { 'x-user-id': 'owner_default' },
    });
    const data = await getRes.json();
    expect(data.site.name).toBe('Aurora Atelier Permanent');

    // Restore name
    await request.patch(`${CONSOLE_URL}/api/sites/site_aurora`, {
      headers: { 'x-user-id': 'owner_default' },
      data: { name: 'Aurora Atelier' },
    });
  });

  test('7. Vibe Extractor auto-saves to site Theme Lab', async ({ request }) => {
    const extractRes = await request.post(`${CONSOLE_URL}/api/extract/vibe`, {
      headers: { 'x-user-id': 'owner_default' },
      data: {
        siteId: 'site_aurora',
        sourceType: 'prompt',
        sourceValue: 'nordic pine forest organic minimalism with sage green and cream',
      },
    });
    expect(extractRes.ok()).toBeTruthy();
    const extractData = await extractRes.json();
    expect(extractData.savedThemeId).toBeDefined();

    // Verify it now exists in Theme Lab
    const listRes = await request.get(`${CONSOLE_URL}/api/sites/site_aurora/themes`);
    const { themes } = await listRes.json();
    const found = themes.find((t: any) => t.id === extractData.savedThemeId);
    expect(found).toBeDefined();
    expect(found.tokens.accent).toBeDefined();
  });

});
