import { test, expect } from '@playwright/test';

const AURORA_URL = 'http://localhost:3002';

test.describe('Aurora Storefront E2E Suite', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies for clean testing state
    await context.clearCookies();
  });

  // 1. Creator Reskinning across all 4 creators
  test('fitfiona reskins headline, hero, offer, and theme', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=fitfiona&force_vibe=1`);

    // Verify SSR markers and theme
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-vibe-ssr', '1');
    await expect(html).toHaveAttribute('data-theme', 'energy');

    // Verify headline slot
    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('High-Impact Performance Gear Curated by Fiona');

    // Verify offer slot
    const offer = page.locator('[data-vibe-slot="offer"]');
    await expect(offer).toContainText('Save 20% on Fiona’s Athletic Picks with code FIT20');

    // Verify hero image slot
    const heroImg = page.locator('[data-vibe-slot="hero-image"] img');
    await expect(heroImg).toHaveAttribute('src', '/images/hero-fitfiona.jpg');

    // Verify testimonial slot
    const testimonial = page.locator('[data-vibe-slot="testimonial"]');
    await expect(testimonial).toContainText('These bands and the shaker survived daily abuse');
  });

  test('minimal-max reskins headline, hero, offer, and theme', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=minimal-max&force_vibe=1`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'calm');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('Essential Living Space Edit by Max');

    const offer = page.locator('[data-vibe-slot="offer"]');
    await expect(offer).toContainText('CALM15');

    const heroImg = page.locator('[data-vibe-slot="hero-image"] img');
    await expect(heroImg).toHaveAttribute('src', '/images/hero-minimal-max.jpg');
  });

  test('luxe-lena reskins headline, hero, offer, and theme', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=luxe-lena&force_vibe=1`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'gold');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('The Haute Beauty Sanctuary Curated by Lena');

    const offer = page.locator('[data-vibe-slot="offer"]');
    await expect(offer).toContainText('LUXE25');

    const heroImg = page.locator('[data-vibe-slot="hero-image"] img');
    await expect(heroImg).toHaveAttribute('src', '/images/hero-luxe-lena.jpg');
  });

  test('techtom reskins headline, hero, offer, and theme', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=techtom&force_vibe=1`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'cyber');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('High-Density Desk & Travel Gear by Tom');

    const offer = page.locator('[data-vibe-slot="offer"]');
    await expect(offer).toContainText('TECH10');

    const heroImg = page.locator('[data-vibe-slot="hero-image"] img');
    await expect(heroImg).toHaveAttribute('src', '/images/hero-techtom.jpg');
  });

  // 2. Both ?ref and ?vibe query parameters work
  test('supports ?ref=luxe-lena as an alias for creator code', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?ref=luxe-lena&force_vibe=1`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'gold');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('The Haute Beauty Sanctuary Curated by Lena');
  });

  // 3. Creator persists across page navigation via cookies
  test('creator persists across multi-page navigation', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=fitfiona&force_vibe=1`);

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('Curated by Fiona');

    // Navigate to /shop
    await page.click('nav a[href="/shop"]');
    await expect(page).toHaveURL(`${AURORA_URL}/shop`);

    // Verify theme still active
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'energy');

    // Return to home page without query parameter
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL(`${AURORA_URL}/`);

    // Creator skin must still be persisted via cookie
    const homeHeadline = page.locator('[data-vibe-slot="headline"]');
    await expect(homeHeadline).toContainText('Curated by Fiona');
  });

  // 4. Bad or unknown param leaves the default store
  test('unknown creator param cleanly falls back to default store', async ({ page }) => {
    await page.goto(`${AURORA_URL}/?vibe=does-not-exist`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'default');
    await expect(html).not.toHaveAttribute('data-vibe-ssr', '1');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('Deliberate Objects Engineered for Precision Living');
  });

  // 5. Malicious XSS param runs no script and falls back safely
  test('malicious script tag parameter runs no script and falls back cleanly', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', () => {
      dialogTriggered = true;
    });

    await page.goto(`${AURORA_URL}/?vibe=%3Cscript%3Ealert(1)%3C/script%3E`);

    expect(dialogTriggered).toBe(false);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'default');
  });

  // 6. Cumulative Layout Shift (CLS) = 0 on all creators
  test('maintains CLS < 0.01 across creator reskinning', async ({ page }) => {
    const creators = ['fitfiona', 'minimal-max', 'luxe-lena', 'techtom'];

    for (const slug of creators) {
      await page.goto(`${AURORA_URL}/?vibe=${slug}&vibe_debug=1&force_vibe=1`);

      // Evaluate CLS in browser
      const clsValue = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let score = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  score += (entry as any).value;
                }
              }
            });
            observer.observe({ type: 'layout-shift', buffered: true });
            setTimeout(() => {
              observer.disconnect();
              resolve(score);
            }, 300);
          } catch {
            resolve(0);
          }
        });
      });

      expect(clsValue).toBeLessThanOrEqual(0.01);
    }
  });

  // 7. Shopper login works
  test('shopper login works with 1-click demo button and authenticates', async ({ page }) => {
    await page.goto(`${AURORA_URL}/login`);

    // Use 1-click quick demo login for Asha Patel
    const ashaBtn = page.locator('#quick-login-user_asha');
    await expect(ashaBtn).toBeVisible();
    await ashaBtn.click();

    // Must redirect to /account
    await expect(page).toHaveURL(`${AURORA_URL}/account`);

    const userName = page.locator('#account-user-name');
    await expect(userName).toHaveText('Asha Patel');

    const orders = page.locator('#account-orders-list');
    await expect(orders).toBeVisible();
  });

  // 8. Discount code validation at checkout
  test('discount codes validate against config, apply discounts, and reject bad codes', async ({ page }) => {
    // Add product to cart
    await page.goto(`${AURORA_URL}/shop`);
    const addBtn = page.locator('#add-to-cart-fit-bands');
    await addBtn.click();

    // Go to checkout
    await page.goto(`${AURORA_URL}/checkout`);

    // Test invalid code
    const couponInput = page.locator('#checkout-coupon-input');
    const applyBtn = page.locator('#checkout-apply-coupon-btn');

    await couponInput.fill('BADCODE99');
    await applyBtn.click();

    const errorMsg = page.locator('#checkout-coupon-error');
    await expect(errorMsg).toContainText('not recognized');

    // Test valid code FIT20
    await couponInput.fill('FIT20');
    await applyBtn.click();

    const successMsg = page.locator('#checkout-coupon-success');
    await expect(successMsg).toContainText('FIT20 verified: 20% discount applied');

    // Verify discount calculated in total (34 * 0.8 = 27.20)
    const finalTotal = page.locator('#checkout-final-total');
    await expect(finalTotal).toHaveText('$27.20');

    // Submit order
    const placeOrderBtn = page.locator('#place-order-btn');
    await placeOrderBtn.click();

    await expect(page).toHaveURL(/.*order-success.*/);
    const orderIdDisplay = page.locator('#order-id-display');
    await expect(orderIdDisplay).toBeVisible();
  });

  // 9. Holdout visitor sees default store
  test('holdout group visitor always sees default store', async ({ page, context }) => {
    // Set holdout cookie directly
    await context.addCookies([
      {
        name: 'aurora_group',
        value: 'holdout',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto(`${AURORA_URL}/?vibe=fitfiona`);

    // Because visitor is in holdout group, personalizer falls back to default store
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'default');

    const headline = page.locator('[data-vibe-slot="headline"]');
    await expect(headline).toContainText('Deliberate Objects Engineered for Precision Living');
  });
});
