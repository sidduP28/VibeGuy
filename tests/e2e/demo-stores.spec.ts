import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

test.describe('Realistic Storefronts Adaptation', () => {
  test('Shopify demo store HTML contains required data-vibe-slot attributes', async () => {
    const shopifyPath = path.resolve(__dirname, '../../demo-stores/shopify/index.html');
    const content = fs.readFileSync(shopifyPath, 'utf-8');
    expect(content).toContain('data-vibe-slot="headline"');
    expect(content).toContain('data-vibe-slot="subheadline"');
    expect(content).toContain('data-vibe-slot="cta"');
    expect(content).toContain('data-vibe-slot="hero-image"');
    expect(content).toContain('data-vibe-slot="offer"');
    expect(content).toContain('data-vibe-slot="testimonial"');
  });

  test('Webflow demo store HTML contains required data-vibe-slot attributes', async () => {
    const webflowPath = path.resolve(__dirname, '../../demo-stores/webflow/index.html');
    const content = fs.readFileSync(webflowPath, 'utf-8');
    expect(content).toContain('data-vibe-slot="headline"');
    expect(content).toContain('data-vibe-slot="subheadline"');
    expect(content).toContain('data-vibe-slot="cta"');
    expect(content).toContain('data-vibe-slot="hero-image"');
  });

  test('Next.js demo store source uses @vibe/react with zero hydration mismatch design', async () => {
    const nextjsPath = path.resolve(__dirname, '../../demo-stores/nextjs/src/app/page.tsx');
    const content = fs.readFileSync(nextjsPath, 'utf-8');
    expect(content).toContain('VibeProvider');
    expect(content).toContain('VibeSlot');
    expect(content).toContain('data-vibe-ssr');
  });
});
