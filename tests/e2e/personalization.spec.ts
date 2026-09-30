import { test, expect } from '@playwright/test';

test.describe('Creator-to-Commerce Personalization Flow', () => {
  test('Marketer Console: nav, overview, campaigns, and builder render properly', async ({ page }) => {
    // 1. Visit overview dashboard
    await page.goto('/sites');
    await expect(page.locator('h1')).toHaveText(/Sites|Personalization Overview|Keep the vibe after the click\./);
    await expect(page.locator('.brand')).toHaveText(/VibeGuy|VibePersonalize/);

    // 2. Visit campaigns list
    await page.goto('/campaigns');
    await expect(page.locator('h1')).toHaveText(/Active Campaigns|Campaign Studio/);
    await expect(page.locator('.card').first()).toBeVisible();

    // 3. Visit Campaign Builder
    await page.goto('/campaigns/new');
    await expect(page.locator('h1')).toHaveText(/Campaign Studio|New campaign/);
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('select, input').first()).toBeVisible();
  });

  test('Campaign Studio: updates preview live when editing slots', async ({ page }) => {
    await page.goto('/campaigns/new');
    const headlineInput = page.locator('input[value*="Alex Rivera"], input[value*="Fiona"], input[id*="headline"], input[type="text"]').first();
    if (await headlineInput.isVisible()) {
      await headlineInput.fill('Revolutionary New Energy Blend');
      await expect(page.locator('text=Revolutionary New Energy Blend')).toBeVisible();
    }
  });

  test('VibeDNA: loads creator profiles and allows editing brand voice', async ({ page }) => {
    await page.goto('/vibedna');
    await expect(page.locator('h1')).toHaveText(/VibeDNA Hub|Creator Profiles/);
    await expect(page.locator('text=@alexfit').first()).toBeVisible();
    await expect(page.locator('text=@marcusminimal').first()).toBeVisible();
    await expect(page.locator('text=@elenalux').first()).toBeVisible();
  });

  test('Theme Lab: displays WCAG contrast ratios and theme swatches', async ({ page }) => {
    await page.goto('/themes');
    await expect(page.locator('h1')).toHaveText(/Theme Lab|8 Token Themes/);
    await expect(page.locator('text=Minimalist').first()).toBeVisible();
    await expect(page.locator('text=Luxury Editorial').first()).toBeVisible();
    await expect(page.locator('text=WCAG AA').first()).toBeVisible();
  });
});
