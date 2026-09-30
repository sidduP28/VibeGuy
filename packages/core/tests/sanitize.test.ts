import { describe, it, expect } from 'vitest';
import { sanitizeHttpsUrl, buildPersonalizedLink } from '../src/sanitize';

describe('Sanitization & Link Builder', () => {
  it('strictly validates https URLs', () => {
    expect(sanitizeHttpsUrl('https://brand.com/products/creatine')).toBe('https://brand.com/products/creatine');
    expect(sanitizeHttpsUrl('http://insecure.com')).toBeNull();
    expect(sanitizeHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeHttpsUrl('//evil.com/payload')).toBeNull();
    expect(sanitizeHttpsUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('builds canonical-clean creator tracking links with UTM and vibe code', () => {
    const link = buildPersonalizedLink({
      baseUrl: 'https://brand.com/products/energy-drink',
      vibeCode: 'fit2026',
      utmSource: 'instagram',
      utmMedium: 'creator_bio',
      utmCampaign: 'alexfit_spring',
      discountCode: 'ALEX20',
    });

    const parsed = new URL(link);
    expect(parsed.origin).toBe('https://brand.com');
    expect(parsed.pathname).toBe('/products/energy-drink');
    expect(parsed.searchParams.get('vibe')).toBe('fit2026');
    expect(parsed.searchParams.get('utm_source')).toBe('instagram');
    expect(parsed.searchParams.get('utm_medium')).toBe('creator_bio');
    expect(parsed.searchParams.get('utm_campaign')).toBe('alexfit_spring');
    expect(parsed.searchParams.get('discount')).toBe('ALEX20');
  });
});
