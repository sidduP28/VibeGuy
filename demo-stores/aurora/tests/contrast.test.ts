import { describe, it, expect } from 'vitest';
import { CREATORS, DEFAULT_THEME } from '../src/data/creators';

function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('WCAG AA Contrast Compliance for All Aurora Themes', () => {
  const themes = [
    { name: 'default', theme: DEFAULT_THEME },
    ...Object.values(CREATORS).map((c) => ({ name: c.slug, theme: c.theme })),
  ];

  themes.forEach(({ name, theme }) => {
    it(`theme [${name}] text (fg on bg) meets WCAG AA body text contrast >= 4.5:1`, () => {
      const ratio = getContrastRatio(theme.fg, theme.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it(`theme [${name}] accent on bg meets WCAG UI / large text contrast >= 3.0:1`, () => {
      const ratio = getContrastRatio(theme.accent, theme.bg);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });
});
