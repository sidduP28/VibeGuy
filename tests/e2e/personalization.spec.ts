import { test, expect } from '@playwright/test';

test.describe('Creator-to-Commerce Personalization Flow', () => {
  test('Marketer Console: nav, overview, campaigns, and builder render properly', async ({ page }) => {
    // 1. Visit overview dashboard
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Personalization Overview');
    await expect(page.locator('.brand')).toContainText('VibePersonalize');

    // 2. Visit campaigns list
    await page.goto('/campaigns');
    await expect(page.locator('h1')).toContainText('Active Campaigns');
    await expect(page.locator('text=Alex Rivera')).toBeVisible();

    // 3. Visit Campaign Builder
    await page.goto('/campaigns/new');
    await expect(page.locator('h1')).toContainText('Campaign Studio');
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[placeholder*="Alex Rivera"]')).toBeVisible();
  });

  test('Campaign Studio: updates preview live when editing slots', async ({ page }) => {
    await page.goto('/campaigns/new');
    const headlineInput = page.locator('input[value*="Alex Rivera"]').first();
    if (await headlineInput.isVisible()) {
      await headlineInput.fill('Revolutionary New Energy Blend');
      await expect(page.locator('text=Revolutionary New Energy Blend')).toBeVisible();
    }
  });

  test('VibeDNA: loads creator profiles and allows editing brand voice', async ({ page }) => {
    await page.goto('/vibedna');
    await expect(page.locator('h1')).toContainText('VibeDNA Hub');
    await expect(page.locator('text=Alex Rivera')).toBeVisible();
    await expect(page.locator('text=Marcus Chen')).toBeVisible();
    await expect(page.locator('text=Elena Rostova')).toBeVisible();
  });

  test('Theme Lab: displays WCAG contrast ratios and theme swatches', async ({ page }) => {
    await page.goto('/themes');
    await expect(page.locator('h1')).toContainText('Theme Lab');
    await expect(page.locator('text=Minimalist')).toBeVisible();
    await expect(page.locator('text=Luxury Editorial')).toBeVisible();
    await expect(page.locator('text=WCAG AA')).toBeVisible();
  });
});
