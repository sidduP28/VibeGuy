import { describe, it, expect } from 'vitest';
import { rewriteHtmlAtEdge } from '../src/rewriter';

describe('Edge HTMLRewriter Transformation (Cloudflare & Fastly)', () => {
  const sampleHtml = `
<!DOCTYPE html>
<html>
<head><title>Apex Store</title></head>
<body>
  <h1 data-vibe-slot="headline">Default Store Headline</h1>
  <p data-vibe-slot="subheadline">Default Subheadline</p>
  <img data-vibe-slot="hero-image" src="https://images.example.com/default-hero.jpg" alt="Hero">
</body>
</html>
  `.trim();

  it('bypasses rewrite for search bots (G4 SEO Neutrality)', async () => {
    const googleBotUa = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    const result = await rewriteHtmlAtEdge({
      html: sampleHtml,
      url: 'https://store.example.com/?vibe=fit2026',
      userAgent: googleBotUa,
      campaigns: [
        {
          id: 'cmp_fit',
          creatorId: 'alexfit',
          vibeCode: 'fit2026',
          slots: { headline: 'Alex Rivera Fitness Headline' },
        },
      ],
    });

    expect(result.wasPersonalized).toBe(false);
    expect(result.html).toContain('Default Store Headline');
    expect(result.html).not.toContain('data-vibe-ssr="1"');
  });

  it('rewrites slots server-side and tags <html data-vibe-ssr="1">', async () => {
    const consumerUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
    const result = await rewriteHtmlAtEdge({
      html: sampleHtml,
      url: 'https://store.example.com/?vibe=fit2026',
      userAgent: consumerUa,
      campaigns: [
        {
          id: 'cmp_fit',
          creatorId: 'alexfit',
          vibeCode: 'fit2026',
          slots: {
            headline: 'Alex Rivera: Unleash The Beast',
            subheadline: 'Custom formulated for champions',
            'hero-image': 'https://images.example.com/alex-hero.jpg',
          },
        },
      ],
    });

    expect(result.wasPersonalized).toBe(true);
    expect(result.html).toContain('data-vibe-ssr="1"');
    expect(result.html).toContain('Alex Rivera: Unleash The Beast');
    expect(result.html).toContain('Custom formulated for champions');
    expect(result.html).toContain('https://images.example.com/alex-hero.jpg');
    expect(result.html).not.toContain('Default Store Headline');
  });
});
